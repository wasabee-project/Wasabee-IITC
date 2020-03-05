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
    const context = this;
    this._pch = portal => {
      context._portalClickedHook(portal);
    };
    window.addHook("portalSelected", this._pch);

    this._displayDialog();
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
    window.removeHook("portalSelected", this._pch);
  },

  _portalClickedHook: function() {
    this._selectedPortal = WasabeePortal.getSelected();
    if (this._selectedPortal) {
      this._portal.innerHTML = "";
      this._portal.appendChild(this._selectedPortal.displayFormat());
    } else {
      this._portal.innerHTML = "Please select a portal";
    }
  },

  _displayDialog: function() {
    this._marker = null;

    const content = L.DomUtil.create("div", "temp-op-dialog");
    this._portal = L.DomUtil.create("div", null, content);
    this._portalClickedHook();

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

    const context = this;
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
        context.disable();
        delete context._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.markerButton
    });
  },

  _addMarker: function(selectedType, operation, comment) {
    operation.addMarker(selectedType, WasabeePortal.getSelected(), comment);
  }
});

export default MarkerAddDialog;
