import { WTooltip, WButton } from "../leafletClasses";
import wX from "../wX";
import { getSelectedOperation } from "../selectedOp";
import { postToFirebase } from "../firebase/logger";
import { constants } from "../static";

import { WasabeePortal } from "../model";
import { MultiLayer } from "./quickdraw/multilayer";
import { SingleLink } from "./quickdraw/singlelink";
import { StarBurst } from "./quickdraw/starburst";
import { Onion } from "./quickdraw/onion";

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

    this.setSubActions(this.getSubActions());

    window.map.on("wasabee:ui:skin wasabee:ui:lang", () => {
      this.button.title = wX("QD TITLE");
      this.setSubActions(this.getSubActions());

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

    this._modes = [MultiLayer, SingleLink, StarBurst, Onion];

    this._tooltip = new WTooltip(this._map);
    this._guideLayerGroup = new L.LayerGroup();
    window.addLayerGroup(
      "Wasabee Quickdraw Guide",
      this._guideLayerGroup,
      false
    );

    this._operation = getSelectedOperation();
    this._nextDrawnLinksColor = this._operation.color;
    this._opID = this._operation.ID;
    this._currentMode = new this._modes[0]();
    this._tooltip.updateContent(this._currentMode.getTooltip());

    window.map.on("wasabee:portal:click", this._portalClicked, this);
    window.map.on("wasabee:op:select", this._opchange, this);
    window.map.on("keyup", this._keyUpListener, this);
    window.map.on("mousemove", this._onMouseMove, this);
  },

  removeHooks: function () {
    window.removeLayerGroup(this._guideLayerGroup);

    L.DomUtil.enableTextSelection();
    this._tooltip.dispose();
    this._tooltip = null;

    window.map.off("wasabee:portal:click", this._portalClicked, this);
    window.map.off("wasabee:op:select", this._opchange, this);
    window.map.off("keyup", this._keyUpListener, this);
    window.map.off("mousemove", this._onMouseMove, this);
  },

  _opchange: function () {
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
      this._guideUpdate(e);
    }
  },

  _guideUpdate: function (e) {
    this._guideLayerGroup.clearLayers();
    for (const lls of this._currentMode.getGuides(e.latlng)) {
      L.polyline(lls, constants.QUICKDRAW_GUIDE_STYLE).addTo(
        this._guideLayerGroup
      );
    }
  },

  _guideLayerToggle: function () {
    if (window.map.hasLayer(this._guideLayerGroup))
      this._guideLayerGroup.remove();
    else {
      this._guideLayerGroup.addTo(window.map);
      window.Render.prototype.bringPortalsToFront();
    }
  },

  _portalClicked: function (ev) {
    const selectedPortal = ev.portal;
    if (!(selectedPortal instanceof WasabeePortal)) {
      this._tooltip.updateContent(wX("toolbar.quick_draw.tooltip.portal_fail"));
      return;
    }
    this._currentMode.onPortalClick(this._operation, selectedPortal, {
      color: this._nextDrawnLinksColor,
    });
    this._tooltip.updateContent(this._currentMode.getTooltip());
  },

  _toggleMode: function () {
    this._modes.push(this._modes.shift());
    this._currentMode = new this._modes[0]();

    this._guideLayerGroup.clearLayers();
    this._tooltip.updateContent(this._currentMode.getTooltip());
  },
});

export default QuickdrawButton;
