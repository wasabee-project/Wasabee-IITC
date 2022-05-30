import { WTooltip } from "../leafletClasses";
import wX from "../wX";
import { getSelectedOperation } from "../selectedOp";

export const ZonedrawHandler = L.Handler.extend({
  initialize: function (map = window.map, options) {
    this.zoneID = 0;
    // this._enabled = false;

    L.Handler.prototype.initialize.call(this, map);
    this._parent = options.parent;
    this.type = "ZonedrawHandler";
  },

  enable: function () {
    if (this._enabled || this.zoneID == 0) {
      this.disable();
      return;
    }
    L.Handler.prototype.enable.call(this);
  },

  addHooks: function () {
    L.DomUtil.disableTextSelection();

    this._tooltip = new WTooltip(window.map);

    this._opID = getSelectedOperation().ID;
    this._tooltip.updateContent(this._getTooltipText());

    window.map.on("click", this._click, this);
    window.map.on("wasabee:op:select", this._opchange, this);
    window.map.on("keyup", this._keyUpListener, this);
  },

  removeHooks: function () {
    L.DomUtil.enableTextSelection();
    this._tooltip.dispose();
    this._tooltip = null;

    window.map.off("click", this._click, this);
    window.map.off("wasabee:op:select", this._opchange, this);
    window.map.off("keyup", this._keyUpListener, this);
  },

  _opchange: function () {
    if (!this._enabled) return;

    if (getSelectedOperation().ID != this._opID) {
      console.log("operation changed mid-zonedraw - disabling");
      this.disable();
    }
  },

  _keyUpListener: function (e) {
    if (!this._enabled) return;

    // [esc]
    if (e.originalEvent.keyCode === 27) {
      this.disable();
      this._parent.update();
    }
  },

  _click: function (e) {
    getSelectedOperation().addZonePoint(this.zoneID, e.latlng);
  },

  _getTooltipText: function () {
    return wX("ZONE_DRAW");
  },
});
