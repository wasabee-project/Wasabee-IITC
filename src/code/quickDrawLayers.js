import { Feature } from "./leafletDrawImports";
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

const QuickDrawControl = Feature.extend({
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

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = QuickDrawControl.TYPE;
    Feature.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    Feature.prototype.addHooks.call(this);
    if (!this._map) return;
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
    Feature.prototype.removeHooks.call(this);
    delete this._anchor1;
    delete this._anchor2;
    delete this._spinePortals;
    delete this._operation;
    window.removeHook("portalSelected", this._portalClickedHook);
    this._map.off("mousemove", this._onMouseMove, this);
  },

  // would using the "sticky" option on the L.tooltip be better?
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
