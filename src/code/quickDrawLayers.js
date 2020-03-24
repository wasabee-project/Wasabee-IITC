import { WTooltip } from "./leafletClasses";
import WasabeePortal from "./portal";
import { getSelectedOperation } from "./selectedOp";
import wX from "./wX";

/*
const strings = {
  quickdraw: {
    actions: {
      cancel: {
        title: wX("QDCANCEL"),
        text: wX("CANCEL")
      }
    },
    tooltip: {
      end: wX("QDEND")
    }
  }
}; */

const QuickDrawControl = L.Handler.extend({
  includes: L.Mixin.Events,

  statics: {
    TYPE: "quickdraw"
  },

  options: {
    icon: new L.Icon({
      iconSize: new L.Point(16, 16),
      iconAnchor: new L.Point(0, 0),
      iconUrl: window.plugin.wasabee.static.images.toolbar_quickdraw
    })
  },

  initialize: function(map = window.map, options) {
    this._map = map;
    this._container = map._container;
    this.type = QuickDrawControl.TYPE;
    L.Handler.prototype.initialize.call(this, map, options);
    L.Util.extend(this.options, options);
  },

  enable: function() {
    if (this._enabled) return;
    L.Handler.prototype.enable.call(this);
    // tell the button to display the "end" option
    this.fire("enabled", { handler: this.type });
  },

  disable: function() {
    if (!this._enabled) return;
    L.Handler.prototype.disable.call(this);
    // revoke button's "end" option
    this.fire("disabled", { handler: this.type });
  },

  addHooks: function() {
    if (!this._map) return;
    L.DomUtil.disableTextSelection();

    this._tooltip = new WTooltip(this._map);
    L.DomEvent.addListener(this._container, "keyup", this._cancelDrawing, this);

    this._operation = getSelectedOperation();
    this._anchor1 = null;
    this._anchor2 = null;
    this._spinePortals = {};
    this._tooltip.updateContent(this._getTooltipText());
    this._throwOrder = this._operation.nextOrder;
    const that = this;
    this._portalClickedHook = function() {
      QuickDrawControl.prototype._portalClicked.call(that);
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
    L.DomEvent.removeListener(this._container, "keyup", this._cancelDrawing);

    window.removeHook("portalSelected", this._portalClickedHook);
    this._map.off("mousemove", this._onMouseMove, this);
  },

  _cancelDrawing: function(e) {
    if (e.keyCode === 27) {
      this.disable();
    }
  },

  _onMouseMove: function(e) {
    if (e.latlng) this._tooltip.updatePosition(e.latlng);
    L.DomEvent.preventDefault(e.originalEvent);
  },

  _getTooltipText: function() {
    if (!this._anchor1) return { text: wX("QDSTART") };
    if (!this._anchor2) return { text: wX("QDNEXT") };
    return { text: wX("QDCONT") };
  },

  _portalClicked: function() {
    const selectedPortal = WasabeePortal.getSelected();
    if (!selectedPortal) return;
    if (!this._anchor1) {
      this._throwOrder = this._operation.nextOrder;
      this._anchor1 = selectedPortal;
      this._tooltip.updateContent(this._getTooltipText());
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

export default QuickDrawControl;
