import UiHelper from "./uiHelper.js";
import { Feature } from "./leafletDrawImports";

const strings = {
  quickdraw: {
    actions: {
      cancel: {
        title: "Cancel drawing fields",
        text: "Cancel"
      }
    },
    tooltip: {
      start: "Click the first anchor portal.",
      next: "Click the second anchor portal.",
      cont: "Click a spine portal to draw a field.",
      end: "Click again on the same portal to finish drawing."
    }
  }
};

const QuickDrawControl = Feature.extend({
  statics: {
    TYPE: "quickdraw"
  },

  options: {
    icon: new L.Icon({
      iconSize: new L.Point(16, 16),
      iconAnchor: new L.Point(0, 0),
      iconUrl: window.plugin.Wasabee.static.images.toolbar_quickdraw
    })
  },

  initialize: function(map, options) {
    this.type = QuickDrawControl.TYPE;
    Feature.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    Feature.prototype.addHooks.call(this);
    if (!this._map) return;
    this._operation = window.plugin.wasabee.getSelectedOperation();
    this._anchor1 = null;
    this._anchor2 = null;
    this._spinePortals = {};
    this._tooltip.updateContent(this._getTooltipText());
    let that = this;
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

  _onMouseMove: function(e) {
    var latlng = e.latlng;

    // Save latlng
    this._currentLatLng = latlng;

    this._updateTooltip(latlng);

    // Update the mouse marker position
    //this._mouseMarker.setLatLng(latlng);

    L.DomEvent.preventDefault(e.originalEvent);
  },

  _updateTooltip: function(latLng) {
    if (latLng) {
      this._tooltip.updatePosition(latLng);
    }
  },

  _getTooltipText: function() {
    if (!this._anchor1) return { text: strings.quickdraw.tooltip.start };
    if (!this._anchor2) return { text: strings.quickdraw.tooltip.next };
    return { text: strings.quickdraw.tooltip.cont };
  },

  _portalClicked: function() {
    const selectedPortal = UiHelper.getSelectedPortal();
    if (!selectedPortal) return;
    if (!this._anchor1) {
      this._anchor1 = selectedPortal;
      this._tooltip.updateContent(this._getTooltipText());
      return;
    }
    if (!this._anchor2) {
      if (selectedPortal.id === this._anchor1.id) return;
      this._anchor2 = selectedPortal;
      this._operation.addLink(this._anchor1, this._anchor2, "base link");
      this._operation.update();
      this._tooltip.updateContent(this._getTooltipText());
      return;
    } else {
      if (selectedPortal.id in this._spinePortals) {
        return; //ignore duplicates
      } else {
        this._spinePortals[selectedPortal.id] = selectedPortal;
        this._operation.addLink(selectedPortal, this._anchor1);
        this._operation.addLink(selectedPortal, this._anchor2);
        this._operation.update();
        this._tooltip.updateContent(this._getTooltipText());
      }
    }
  }
});

export default QuickDrawControl;
