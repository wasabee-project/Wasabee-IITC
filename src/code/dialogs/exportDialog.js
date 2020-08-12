import { WDialog } from "../leafletClasses";
import { getSelectedOperation } from "../selectedOp";
import wX from "../wX";
import { postToFirebase } from "../firebaseSupport";

// export screen
const ExportDialog = WDialog.extend({
  statics: {
    TYPE: "exportDialog",
  },

  initialize: function (map = window.map, options) {
    this.type = ExportDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
    this._operation = getSelectedOperation();
    postToFirebase({ id: "analytics", action: ExportDialog.TYPE });
  },

  addHooks: function () {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
  },

  _displayDialog: function () {
    const buttons = {};
    buttons[wX("OK")] = () => {
      this._dialog.dialog("close");
    };
    buttons[wX("DRAW TOOLS FORMAT")] = () => {
      this._drawToolsFormat();
    };
    buttons[wX("ANCHORS_AS_BOOKMARKS")] = () => {
      this._bookmarkFormat();
    };

    this._dialog = window.dialog({
      title: wX("EXPORT") + this._operation.name,
      html: this._buildContent(),
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-export",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.exportDialog,
    });
    this._dialog.dialog("option", "buttons", buttons);
  },

  _buildContent: function () {
    const mainContent = L.DomUtil.create("div", null);
    const textArea = L.DomUtil.create("textarea", null, mainContent);
    textArea.id = "wasabee-dialog-export-textarea";
    this._operation.cleanAll();
    textArea.value = JSON.stringify(this._operation);
    return mainContent;
  },

  _drawToolsFormat: function () {
    const ta = document.getElementById("wasabee-dialog-export-textarea");
    const output = new Array();
    for (const link of this._operation.links) {
      const l = {};
      l.type = "polyline";
      l.color = link.getColor();
      l.latLngs = link.getLatLngs(this._operation);
      output.push(l);
    }

    ta.value = JSON.stringify(output);
  },

  _bookmarkFormat: function () {
    const ta = document.getElementById("wasabee-dialog-export-textarea");
    const output = new Object();
    output.maps = {};
    output.maps.idOthers = {};
    output.maps.idOthers.label = "Others";
    output.maps.idOthers.state = 1;
    output.maps.idOthers.bkmrk = {};

    output.portals = {};
    output.portals.idOthers = {};
    output.portals.idOthers.label = "Others";
    output.portals.idOthers.state = 1;
    output.portals.idOthers.bkmrk = {};

    for (const a of this._operation.anchors) {
      const id = "id" + a.substring(0, 16);
      const p = this._operation._idToOpportals.get(a);
      output.portals.idOthers.bkmrk[id] = {};
      output.portals.idOthers.bkmrk[id].guid = a;
      output.portals.idOthers.bkmrk[id].latlng = `${p.lat},${p.lng}`;
      output.portals.idOthers.bkmrk[id].label = p.name;
    }
    ta.value = JSON.stringify(output);
  },
});

export default ExportDialog;
