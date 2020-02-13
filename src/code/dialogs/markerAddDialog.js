import { Feature } from "../leafletDrawImports";
import WasabeePortal from "../portal";
import MarkerList from "./markerList";

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
    this._operation = window.plugin.wasabee.getSelectedOperation();
    this._displayDialog();
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
  },

  _displayDialog: function() {
    this._marker = null;

    const content = document.createElement("div");
    content.className = "temp-op-dialog";
    this._type = content.appendChild(document.createElement("select"));
    window.plugin.Wasabee.markerTypes.forEach((a, k) => {
      const o = this._type.appendChild(document.createElement("option"));
      o.setAttribute("value", k);
      o.innerHTML = a.label;
    });
    this._type.value = window.plugin.Wasabee.Constants.DEFAULT_MARKER_TYPE;
    this._comment = content.appendChild(document.createElement("input"));
    this._comment.setAttribute("placeholder", "comment");
    const addMarkerButton = content.appendChild(document.createElement("a"));
    addMarkerButton.innerHTML = "Add Marker";
    addMarkerButton.addEventListener("click", () =>
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
      id: window.plugin.Wasabee.static.dialogNames.markerButton,
      buttons: {
        "Operation Marker List": () => mHandler._listDialog(mHandler._operation)
      }
    });
    this._dialog.dialog("option", "buttons", {
      "Operation Marker List": () => {
        const ml = new MarkerList();
        ml.enable();
      }
    });
  },

  _addMarker: function(selectedType, operation, comment) {
    operation.addMarker(selectedType, WasabeePortal.getSelected(), comment);
  }
});

export default MarkerAddDialog;
