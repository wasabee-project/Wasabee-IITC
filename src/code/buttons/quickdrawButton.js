import { WTooltip, WButton } from "../leafletClasses";
import wX from "../wX";
import WasabeePortal from "../portal";
import { getSelectedOperation } from "../selectedOp";

const QuickdrawButton = WButton.extend({
  statics: {
    TYPE: "quickdrawButton"
  },

  initialize: function(map, container) {
    if (!map) map = window.map;
    this._map = map;

    this.title = wX("QD TITLE");
    this.handler = new QuickDrawControl(map);
    this._container = container;
    this.type = QuickdrawButton.TYPE;

    this.button = this._createButton({
      title: this.title,
      container: container,
      buttonImage:
        window.plugin.wasabee.static.images.toolbar_quickdraw.default,
      callback: this.handler.enable,
      context: this.handler
    });

    this._endSubAction = {
      title: wX("QD BUTTON END"),
      text: wX("QD END"),
      callback: this.handler.disable,
      context: this.handler
    };
    this._qdModeSubAction = {
      title: "QuickDraw Mode",
      text: "Draws one layer per click",
      callback: this.toggleMode,
      context: this
    };
    this._slModeSubAction = {
      title: "Single Link Mode",
      text: "Draws one link per click",
      callback: this.toggleMode,
      context: this
    };

    this.actionsContainer = this._createSubActions([
      this._endSubAction
      // this._qdModeSubAction
    ]);
    // this should be automaticly detected
    this.actionsContainer.style.top = "52px";
    this._container.appendChild(this.actionsContainer);
  },

  toggleMode: function() {
    console.log(this);
    const from = this.handler.drawMode;
    if (from == "quickdraw") {
      console.log("switching to single link");
      this.handler.drawMode = "singlelink";
      this.actionsContainer = this._createSubActions([
        this._endSubAction,
        this._slModeSubAction
      ]);
    } else {
      console.log("switching to layers");
      this.handler.drawMode = "quickdraw";
      this.actionsContainer = this._createSubActions([
        this._endSubAction,
        this._qdModeSubAction
      ]);
    }
  }

  // Wupdate: function(container) { }
});

const QuickDrawControl = L.Handler.extend({
  initialize: function(map = window.map, options) {
    this._map = map;
    this._container = map._container;
    this.type = "QuickDrawControl";
    this.buttonName = "quickdrawButton";
    this.drawMode = "quickdraw";
    L.Handler.prototype.initialize.call(this, map, options);
    L.Util.extend(this.options, options);
  },

  enable: function() {
    console.log("qd enable called");
    if (this._enabled) return;
    L.Handler.prototype.enable.call(this);
    window.plugin.wasabee.buttons._modes[this.buttonName].enable();
  },

  disable: function() {
    console.log("qd disable called");
    if (!this._enabled) return;

    if (this._guideLayerGroup) {
      window.removeLayerGroup(this._guideLayerGroup);
      delete this._guideLayerGroup; // = null;
      delete this._guideA; // = null;
      delete this._guideB; // = null;
    }
    L.Handler.prototype.disable.call(this);
    window.plugin.wasabee.buttons._modes[this.buttonName].disable();
  },

  addHooks: function() {
    if (!this._map) return;
    L.DomUtil.disableTextSelection();

    this._tooltip = new WTooltip(this._map);
    L.DomEvent.addListener(this._container, "keyup", this._keyUpListener, this);

    this._operation = getSelectedOperation();
    this._anchor1 = null;
    this._anchor2 = null;
    this._spinePortals = {};
    this._tooltip.updateContent(this._getTooltipText());
    this._throwOrder = this._operation.nextOrder;
    this._portalClickedHook = () => {
      QuickDrawControl.prototype._portalClicked.call(this);
    };
    window.addHook("portalSelected", this._portalClickedHook);
    this._map.on("mousemove", this._onMouseMove, this);
  },

  removeHooks: function() {
    if (!this._map) return;
    delete this._anchor1;
    delete this._anchor2;
    delete this._spinePortals;
    delete this._operation;

    L.DomUtil.enableTextSelection();
    this._tooltip.dispose();
    this._tooltip = null;
    L.DomEvent.removeListener(this._container, "keyup", this._keyUpListener);

    window.removeHook("portalSelected", this._portalClickedHook);
    this._map.off("mousemove", this._onMouseMove, this);
  },

  _keyUpListener: function(e) {
    // [esc]
    if (e.keyCode === 27) {
      this.disable();
    }
    if (e.key === "/") {
      this._guideLayerToggle();
    }
  },

  _onMouseMove: function(e) {
    if (e.latlng) {
      this._tooltip.updatePosition(e.latlng);
      this._guideUpdate(e);
    }
    L.DomEvent.preventDefault(e.originalEvent);
  },

  _guideUpdate: function(e) {
    if (!this._guideLayerGroup) return;
    for (const l of this._guideLayerGroup.getLayers()) {
      l.setLatLngs([l.options.anchorLL, e.latlng]);
    }
  },

  _guideLayerToggle: function() {
    if (!this._guideLayerGroup) {
      this._guideLayerGroup = new L.LayerGroup();
      window.addLayerGroup(
        "Wasabee Quickdraw Guide",
        this._guideLayerGroup,
        true
      );
      if (this._guideA) this._guideA.addTo(this._guideLayerGroup);
      if (this._guideB) this._guideB.addTo(this._guideLayerGroup);
    } else {
      window.removeLayerGroup(this._guideLayerGroup);
      delete this._guideLayerGroup;
      this._guideLayerGroup = null;
    }
  },

  _getTooltipText: function() {
    if (!this._anchor1) return { text: wX("QDSTART") };
    if (!this._anchor2) return { text: wX("QDNEXT") };
    return { text: wX("QDCONT") };
  },

  _portalClicked: function() {
    const selectedPortal = WasabeePortal.getSelected();

    if (!selectedPortal) {
      // XXX wX this
      this._tooltip.updateContent("Portal data not loaded, please try again");
      return;
    }

    // XXX move this to statics.js
    const guideStyle = {
      color: "#0f0",
      dashArray: [8, 2],
      opacity: 0.7,
      weight: 5,
      smoothFactor: 1,
      clickable: false,
      interactive: true,
      anchorLL: selectedPortal.latLng,
      guid: selectedPortal.id
      // renderer: window.map._renderer
    };
    // anchorLL and guid (unnecessary ATM) can be added here

    if (!this._anchor1) {
      this._throwOrder = this._operation.nextOrder;
      this._anchor1 = selectedPortal;
      this._tooltip.updateContent(this._getTooltipText());
      localStorage[
        window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY
      ] = JSON.stringify(this._anchor1);

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
      this._operation.addLink(
        this._anchor1,
        this._anchor2,
        wX("QDBASE"),
        this._throwOrder++
      );
      this._tooltip.updateContent(this._getTooltipText());
      localStorage[
        window.plugin.wasabee.static.constants.ANCHOR_TWO_KEY
      ] = JSON.stringify(this._anchor2);
      this._guideB = L.geodesicPolyline(
        [selectedPortal.latLng, selectedPortal.latLng],
        guideStyle
      );
      if (this._guideLayerGroup) this._guideB.addTo(this._guideLayerGroup);
      return;
    }

    if (selectedPortal.id in this._spinePortals) {
      return; //ignore duplicates
    } else {
      this._spinePortals[selectedPortal.id] = selectedPortal;
      this._operation.addLink(
        selectedPortal,
        this._anchor1,
        null,
        this._throwOrder++
      );
      this._operation.addLink(
        selectedPortal,
        this._anchor2,
        null,
        this._throwOrder++
      );
      this._tooltip.updateContent(this._getTooltipText());
    }
  }
});

export default QuickdrawButton;
