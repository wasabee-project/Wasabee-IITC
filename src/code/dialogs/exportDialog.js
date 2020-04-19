import { WDialog } from "../leafletClasses";
import { getSelectedOperation } from "../selectedOp";
import wX from "../wX";

// export screen
const ExportDialog = WDialog.extend({
  statics: {
    TYPE: "exportDialog"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = ExportDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
    this._operation = getSelectedOperation();
  },

  addHooks: function() {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function() {
    WDialog.prototype.removeHooks.call(this);
  },

  _displayDialog: function() {
    if (!this._map) return;
    this._dialog = window.dialog({
      title: wX("EXPORT") + this._operation.name,
      width: "auto",
      height: "auto",
      html: this._buildContent(),
      dialogClass: "wasabee-dialog wasabee-dialog-export",
      buttons: {
        OK: () => {
          this._dialog.dialog("close");
        },
        "Draw Tools Format": () => {
          this._drawToolsFormat();
        }
      },
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.exportDialog
    });
  },

  _buildContent: function() {
    const mainContent = L.DomUtil.create("div", null);
    const textArea = L.DomUtil.create("textarea", null, mainContent);
    textArea.id = "wasabee-dialog-export-textarea";
    this._operation.cleanAll();
    textArea.value = JSON.stringify(this._operation);
    return mainContent;
  },

  _drawToolsFormat: function() {
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
  }
});

export default ExportDialog;
