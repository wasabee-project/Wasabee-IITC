import { WDialog } from "../leafletClasses";
import { getSelectedOperation } from "../selectedOp";
import wX from "../wX";

// export screen
const ExportDialog = WDialog.extend({
  statics: {
    TYPE: "exportDialog"
  },

  initialize: function(map = window.map, options) {
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
    const buttons = {};
    buttons[wX("OK")] = () => {
      this._dialog.dialog("close");
    };
    buttons[wX("DRAW TOOLS FORMAT")] = () => {
      this._drawToolsFormat();
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
      id: window.plugin.wasabee.static.dialogNames.exportDialog
    });
    this._dialog.dialog("option", "buttons", buttons);
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
