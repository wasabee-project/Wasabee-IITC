import { WDialog } from "../leafletClasses";
import { getSelectedOperation } from "../selectedOp";
import { convertColorToHex } from "../auxiliar";
import wX from "../wX";

// export screen
const ExportDialog = WDialog.extend({
  statics: {
    TYPE: "exportDialog",
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  _displayDialog: function () {
    const operation = getSelectedOperation();
    const buttons = {};
    buttons[wX("OK")] = () => {
      this.closeDialog();
    };
    buttons[wX("DRAW TOOLS FORMAT")] = () => {
      this._drawToolsFormat(operation);
    };
    buttons[wX("ANCHORS_AS_BOOKMARKS")] = () => {
      this._bookmarkFormat(operation);
    };

    this.createDialog({
      title: wX("EXPORT") + operation.name,
      html: this._buildContent(operation),
      width: "auto",
      dialogClass: "export",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.exportDialog,
    });
  },

  _buildContent: function (operation) {
    const mainContent = L.DomUtil.create("div", null);
    const textArea = L.DomUtil.create("textarea", null, mainContent);
    textArea.id = "wasabee-dialog-export-textarea";
    operation.cleanAll();
    textArea.value = operation.toExport();
    return mainContent;
  },

  _drawToolsFormat: function (operation) {
    const ta = document.getElementById("wasabee-dialog-export-textarea");
    const output = new Array();
    for (const link of operation.links) {
      const l = {};
      l.type = "polyline";
      l.color = convertColorToHex(link.getColor(operation));
      l.latLngs = link.getLatLngs(operation);
      output.push(l);
    }

    ta.value = JSON.stringify(output);
  },

  _bookmarkFormat: function (operation) {
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

    for (const a of operation.anchors) {
      const id = "id" + a.substring(0, 16);
      const p = operation._idToOpportals.get(a);
      output.portals.idOthers.bkmrk[id] = {};
      output.portals.idOthers.bkmrk[id].guid = a;
      output.portals.idOthers.bkmrk[id].latlng = `${p.lat},${p.lng}`;
      output.portals.idOthers.bkmrk[id].label = p.name;
    }
    ta.value = JSON.stringify(output);
  },
});

export default ExportDialog;
