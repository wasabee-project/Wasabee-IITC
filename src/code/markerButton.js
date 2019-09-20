import { Feature } from "./leafletDrawImports";
import UiHelper from "./uiHelper";
import Sortable from "./sortable";

const MarkerButtonControl = Feature.extend({
  statics: {
    TYPE: "markerButton"
  },

  initialize: function(map, options) {
    this.type = MarkerButtonControl.TYPE;
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
  },

  _addMarker: function(selectedType, operation, comment) {
    operation.addMarker(selectedType, UiHelper.getSelectedPortal(), comment);
  },

  _getListDialogContent: function(operation) {
    const content = new Sortable();
    content.fields = [
      {
        name: "Portal Name",
        value: marker => operation.getPortal(marker.portalId).name,
        sort: (a, b) => a.localeCompare(b),
        format: (a, m) => {
          // XXX get portal link...
          // const p = operation.getPortal(marker.portalId);
          // getPortalLink(p);
          a.textContent = m;
        }
      },
      {
        name: "Marker Type",
        value: marker =>
          window.plugin.Wasabee.markerTypes.get(marker.type).label || "unknown",
        sort: (a, b) => a.localeCompare(b),
        format: (a, m) => {
          a.textContent = m;
        }
      },
      {
        name: "State",
        value: marker => marker.state,
        sort: (a, b) => a.localeCompare(b),
        format: (a, m) => {
          a.textContent = m;
        }
      },
      {
        name: "Comment",
        value: marker => marker.comment,
        sort: (a, b) => a.localeCompare(b),
        format: (a, m) => {
          a.textContent = m;
        }
      },
      {
        name: "Assigned To",
        value: marker => marker.assignedNickname,
        sort: (a, b) => a.localeCompare(b),
        format: (a, m) => {
          a.textContent = m;
        }
      },
      {
        name: "Completed By",
        value: marker => marker.complatedBy,
        sort: (a, b) => a.localeCompare(b),
        format: (a, m) => {
          a.textContent = m;
        }
      }
    ];
    content.sortBy = 0;
    content.items = operation.markers;
    this._listDialogContent = content;
  },

  _update: function() {
    this._getListDialogContent(this._operation);
    // XXX figure out how to refresh the html option
    console.log(this._listDialogData);
  },

  _listDialog: function(operation) {
    this._getListDialogContent(operation);

    window.addHook("wasabeeUIUpdate", this._update());

    this._listDialogData = window.dialog({
      title: "Marker List: " + operation.name,
      width: "auto",
      height: "auto",
      position: {
        my: "center top",
        at: "center center"
      },
      html: this._listDialogContent.table,
      dialogClass: "wasabee-dialog-alerts",
      closeCallback: function() {
        window.removeHook("wasabeeUIUpdate", this._update());
      },
      id: window.plugin.Wasabee.static.dialogNames.markerList
    });
  }
});

export default MarkerButtonControl;
