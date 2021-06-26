import { WTooltip, WButton } from "../leafletClasses";
import wX from "../wX";
import WasabeePortal from "../model/portal";
import { getSelectedOperation } from "../selectedOp";
import { postToFirebase } from "../firebaseSupport";

const QuickdrawButton = WButton.extend({
  statics: {
    TYPE: "QuickdrawButton",
  },

  needWritePermission: true,

  initialize: function (container) {
    this.title = wX("QD TITLE");
    this.handler = new QuickDrawControl({ button: this });
    this._container = container;
    this.type = QuickdrawButton.TYPE;

    this.button = this._createButton({
      title: this.title,
      container: container,
      className: "wasabee-toolbar-quickdraw",
      callback: this.handler.enable,
      context: this.handler,
    });

    this.picker = L.DomUtil.create("input", "hidden-color-picker");
    this.picker.type = "color";
    this.picker.value = "#000000"; // just need a default value that is not in the displayed list
    this.picker.setAttribute("list", "wasabee-colors-datalist");

    L.DomEvent.on(this.picker, "change", (ev) => {
      this.handler._nextDrawnLinksColor = ev.target.value;
    });

    this.actionsContainer = this._createSubActions(this.getSubActions());

    this._container.appendChild(this.actionsContainer);

    window.map.on("wasabee:ui:skin wasabee:ui:lang", () => {
      this.button.title = wX("QD TITLE");
      const newSubActions = this._createSubActions(this.getSubActions());
      this._container.replaceChild(newSubActions, this.actionsContainer);
      newSubActions.style.display = this.actionsContainer.style.display;
      this.actionsContainer = newSubActions;

      if (this.handler._enabled)
        this.handler._tooltip.updateContent(this.handler._getTooltipText());
    });

    this.update();
  },

  getSubActions: function () {
    this._changeColorSubAction = {
      title: wX("QD BUTTON CHANGE COLOR"),
      text: wX("QD CHANGE COLOR"),
      html: this.picker,
      callback: () => {
        this.picker.click();
      },
      context: null,
    };

    this._toggleModeSubAction = {
      title: wX("QD BUTTON TOGGLE MODE"),
      text: wX("QD TOGGLE MODE"),
      callback: () => {
        this.handler._toggleMode();
      },
      context: null,
    };

    this._endSubAction = {
      title: wX("QD BUTTON END"),
      text: wX("QD END"),
      callback: this.handler.disable,
      context: this.handler,
    };

    return [
      this._toggleModeSubAction,
      this._changeColorSubAction,
      this._endSubAction,
    ];
  },

  enable: function () {
    WButton.prototype.enable.call(this);
    this.button.classList.add("active");
  },

  disable: function () {
    WButton.prototype.disable.call(this);
    if (this.handler._enabled) this.handler.disable.call(this.handler);
    this.button.classList.remove("active");
  },
});

const QuickDrawControl = L.Handler.extend({
  initialize: function (options) {
    this._container = window.map._container;

    L.Handler.prototype.initialize.call(this, window.map, options);
    this.options = options;
    // L.Util.extend(this.options, options);

    this.type = "QuickDrawControl";
    this._drawMode = "quickdraw";
  },

  enable: function () {
    if (this._enabled) {
      this.disable();
      return;
    }
    L.Handler.prototype.enable.call(this);
    this.options.button.enable();
    postToFirebase({ id: "analytics", action: "quickdrawStart" });
  },

  disable: function () {
    if (!this._enabled) return;
    L.Handler.prototype.disable.call(this);
    this.options.button.disable();
    postToFirebase({ id: "analytics", action: "quickdrawEnd" });
  },

  addHooks: function () {
    L.DomUtil.disableTextSelection();

    this._tooltip = new WTooltip(this._map);

    this._operation = getSelectedOperation();
    this._nextDrawnLinksColor = this._operation.color;
    this._opID = this._operation.ID;
    this._anchor = null;
    this._anchor1 = null;
    this._anchor2 = null;
    this._previous = null;
    this._tooltip.updateContent(this._getTooltipText());
    this._throwOrder = this._operation.nextOrder;

    window.map.on("wasabee:portal:click", this._portalClicked, this);
    window.map.on("wasabee:op:select", this._opchange, this);
    window.map.on("keyup", this._keyUpListener, this);
    window.map.on("mousemove", this._onMouseMove, this);
  },

  removeHooks: function () {
    if (this._guideLayerGroup) {
      window.removeLayerGroup(this._guideLayerGroup);
      this._guideLayerGroup = null;
    }

    this._anchor = null;
    this._anchor1 = null;
    this._anchor2 = null;
    this._previous = null;
    this._guideA = null;
    this._guideB = null;

    L.DomUtil.enableTextSelection();
    this._tooltip.dispose();
    this._tooltip = null;

    window.map.off("wasabee:portal:click", this._portalClicked, this);
    window.map.off("wasabee:op:select", this._opchange, this);
    window.map.off("keyup", this._keyUpListener, this);
    window.map.off("mousemove", this._onMouseMove, this);
  },

  _opchange: function () {
    postToFirebase({ id: "analytics", action: "quickdrawOpchange" });
    if (!this._enabled) return;

    if (getSelectedOperation().ID != this._opID) {
      console.log("operation changed mid-quickdraw - disabling");
      this.disable();
    }
  },

  _keyUpListener: function (e) {
    if (!this._enabled) return;

    // [esc]
    if (e.originalEvent.keyCode === 27) {
      this.disable();
    }
    if (e.originalEvent.key === "/" || e.originalEvent.key === "g") {
      postToFirebase({ id: "analytics", action: "quickdrawGuides" });
      this._guideLayerToggle();
    }
    if (e.originalEvent.key === "t" || e.originalEvent.key === "m") {
      postToFirebase({ id: "analytics", action: "quickdrawMode" });
      this._toggleMode();
    }
    if (e.originalEvent.key === "X") {
      postToFirebase({ id: "analytics", action: "quickdrawClearAll" });
      this._operation.clearAllLinks();
      window.map.fire("wasabee:crosslinks");
    }
  },

  _onMouseMove: function (e) {
    if (e.latlng) {
      this._tooltip.updatePosition(e.latlng);
      this._guideUpdate(e);
    }
    L.DomEvent.preventDefault(e.originalEvent);
  },

  _guideUpdate: function (e) {
    if (!this._guideLayerGroup) return;
    for (const l of this._guideLayerGroup.getLayers()) {
      l.setLatLngs([l.options.anchorLL, e.latlng]);
    }
  },

  _guideLayerToggle: function () {
    if (!this._guideLayerGroup) {
      this._guideLayerGroup = new L.LayerGroup();
      window.addLayerGroup(
        "Wasabee Quickdraw Guide",
        this._guideLayerGroup,
        true
      );
      if (this._guideA) this._guideA.addTo(this._guideLayerGroup);
      if (this._guideB) this._guideB.addTo(this._guideLayerGroup);
      window.Render.prototype.bringPortalsToFront();
    } else {
      window.removeLayerGroup(this._guideLayerGroup);
      this._guideLayerGroup = null;
    }
  },

  _getTooltipText: function () {
    if (this._drawMode === "quickdraw") {
      if (!this._anchor1) return { text: wX("QDSTART") };
      if (!this._anchor2) return { text: wX("QDNEXT") };
      return { text: wX("QDCONT") };
    }
    if (this._drawMode === "star") {
      // XXX wX this
      if (!this._anchor) return { text: "Select the star anchor" };
      return { text: "Select a portal" };
    }
    // must be in single-link mode
    // XXX wX this
    if (!this._previous) return { text: "Click first portal" };
    return { text: "Click next portal" };
  },

  _portalClicked: function (portal) {
    const selectedPortal = WasabeePortal.fromIITC(portal);
    if (!selectedPortal) {
      // XXX wX this
      this._tooltip.updateContent({
        text: "Portal data not loaded, please try again",
      });
      return;
    }
    if (this._drawMode == "quickdraw") {
      this._portalClickedQD(selectedPortal);
    } else if (this._drawMode == "star") {
      this._portalClickedStar(selectedPortal);
    } else {
      this._portalClickedSingle(selectedPortal);
    }
  },

  _portalClickedQD: function (selectedPortal) {
    const guideStyle =
      window.plugin.wasabee.static.constants.QUICKDRAW_GUIDE_STYLE;
    guideStyle.anchorLL = selectedPortal.latLng;

    if (!this._anchor1) {
      // this._throwOrder = this._operation.nextOrder;
      this._anchor1 = selectedPortal;
      this._tooltip.updateContent(this._getTooltipText());
      localStorage[window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY] =
        JSON.stringify(this._anchor1);

      this._guideA = L.geodesicPolyline(
        [selectedPortal.latLng, selectedPortal.latLng],
        guideStyle
      );
      if (this._guideLayerGroup) this._guideA.addTo(this._guideLayerGroup);
      return;
    }
    if (!this._anchor2) {
      if (selectedPortal.id === this._anchor1.id) return;
      this._anchor2 = selectedPortal;
      this._operation.addLink(this._anchor1, this._anchor2, {
        description: wX("QDBASE"),
        order: this._operation.nextOrder,
        color: this._nextDrawnLinksColor,
      });
      this._tooltip.updateContent(this._getTooltipText());
      localStorage[window.plugin.wasabee.static.constants.ANCHOR_TWO_KEY] =
        JSON.stringify(this._anchor2);
      this._guideB = L.geodesicPolyline(
        [selectedPortal.latLng, selectedPortal.latLng],
        guideStyle
      );
      if (this._guideLayerGroup) this._guideB.addTo(this._guideLayerGroup);
      return;
    }

    this._operation.addLink(selectedPortal, this._anchor1, {
      order: this._operation.nextOrder,
      color: this._nextDrawnLinksColor,
    });
    this._operation.addLink(selectedPortal, this._anchor2, {
      order: this._operation.nextOrder,
      color: this._nextDrawnLinksColor,
    });
    this._tooltip.updateContent(this._getTooltipText());
  },

  _toggleMode: function () {
    // changing mode resets all the things
    this._anchor = null;
    this._anchor1 = null;
    this._anchor2 = null;
    this._previous = null;
    this._guideA = null;
    this._guideB = null;
    if (this._guideLayerGroup) this._guideLayerGroup.clearLayers();

    if (this._drawMode == "quickdraw") {
      console.log("switching to single link");
      this._drawMode = "singlelink";
    } else if (this._drawMode == "singlelink") {
      console.log("switching to star");
      this._drawMode = "star";
    } else {
      console.log("switching to layers");
      this._drawMode = "quickdraw";
    }
    this._tooltip.updateContent(this._getTooltipText());
  },

  _portalClickedSingle: function (selectedPortal) {
    // IITC sending 2 portalClicked for 1 mouse click
    if (this._previous && this._previous.id == selectedPortal.id) {
      return;
    }

    if (this._previous) {
      this._operation.addLink(this._previous, selectedPortal, {
        order: this._throwOrder++,
        color: this._nextDrawnLinksColor,
      });
    }

    // all portals, including the first
    const guideStyle =
      window.plugin.wasabee.static.constants.QUICKDRAW_GUIDE_STYLE;
    guideStyle.anchorLL = selectedPortal.latLng;

    if (this._guideA) this._guideA.remove();
    this._guideA = L.geodesicPolyline(
      [selectedPortal.latLng, selectedPortal.latLng],
      guideStyle
    );
    if (this._guideLayerGroup) this._guideA.addTo(this._guideLayerGroup);
    this._previous = selectedPortal;
    this._tooltip.updateContent(this._getTooltipText());
  },

  _portalClickedStar: function (selectedPortal) {
    // IITC sending 2 portalClicked for 1 mouse click
    if (this._anchor && this._anchor.id == selectedPortal.id) {
      return;
    }

    if (this._anchor) {
      this._operation.addLink(selectedPortal, this._anchor, {
        order: this._throwOrder++,
        color: this._nextDrawnLinksColor,
      });
    } else this._anchor = selectedPortal;

    // all portals, including the first
    const guideStyle =
      window.plugin.wasabee.static.constants.QUICKDRAW_GUIDE_STYLE;
    guideStyle.anchorLL = this._anchor.latLng;

    if (this._guideA) this._guideA.remove();
    this._guideA = L.geodesicPolyline(
      [this._anchor.latLng, selectedPortal.latLng],
      guideStyle
    );
    if (this._guideLayerGroup) this._guideA.addTo(this._guideLayerGroup);
    this._tooltip.updateContent(this._getTooltipText());
  },
});

export default QuickdrawButton;
