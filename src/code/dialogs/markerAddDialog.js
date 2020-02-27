import { Feature } from "../leafletDrawImports";
import WasabeePortal from "../portal";
import { getSelectedOperation } from "../selectedOp";

const MarkerAddDialog = Feature.extend({
  statics: {
    TYPE: "markerButton"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = MarkerAddDialog.TYPE;
    Feature.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    if (!this._map) return;
    Feature.prototype.addHooks.call(this);
    this._operation = getSelectedOperation();
    this._displayDialog();
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
  },

  _displayDialog: function() {
    this._marker = null;

    const content = L.DomUtil.create("div", "temp-op-dialog");
    this._type = L.DomUtil.create("select", "", content);
    for (const [a, k] of window.plugin.wasabee.static.markerTypes) {
      const o = L.DomUtil.create("option", "", this._type);
      o.setAttribute("value", a);
      o.innerHTML = k.label;
    }
    this._type.value =
      window.plugin.wasabee.static.constants.DEFAULT_MARKER_TYPE;
    this._comment = L.DomUtil.create("input", "", content);
    this._comment.setAttribute("placeholder", "comment");
    const addMarkerButton = L.DomUtil.create("a", "", content);
    addMarkerButton.innerHTML = "Add Marker";
    L.DomEvent.on(addMarkerButton, "click", () =>
      this._addMarker(this._type.value, this._operation, this._comment.value)
    );

    var mHandler = this;
    this._dialog = window.dialog({
      title: "Add Marker",
      width: "auto",
      height: "auto",
      position: {
        my: "center top",
        at: "center center+30"
      },
      html: content,
      dialogClass: "wasabee-dialog-alerts",
      closeCallback: function() {
        mHandler.disable();
        delete mHandler._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.markerButton
    });
  },

  _addMarker: function(selectedType, operation, comment) {
    operation.addMarker(selectedType, WasabeePortal.getSelected(), comment);
  }
});

export default MarkerAddDialog;
