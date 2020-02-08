import { Feature } from "./leafletDrawImports";

// export screen
const ExportDialog = Feature.extend({
  statics: {
    TYPE: "exportDialog"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = ExportDialog.TYPE;
    Feature.prototype.initialize.call(this, map, options);
    this._operation = window.plugin.wasabee.getSelectedOperation();
  },

  addHooks: function() {
    if (!this._map) return;
    Feature.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
  },

  _displayDialog: function() {
    if (!this._map) return;
    const exportDialog = this;
    this._dialog = window.dialog({
      title: "Export: " + this._operation.name,
      width: "auto",
      height: "auto",
      html: this._buildContent(),
      dialogClass: "wasabee-dialog wasabee-dialog-ops",
      buttons: {
        OK: () => {
          this._dialog.dialog("close");
        },
        "Draw Tools Format": () => {
          this._drawToolsFormat();
        }
      },
      closeCallback: () => {
        exportDialog.disable();
        delete exportDialog._dialog;
      },
      id: window.plugin.Wasabee.static.dialogNames.exportDialog
    });
  },

  _buildContent: function() {
    const mainContent = document.createElement("div");
    mainContent.innerHTML = "";
    const textArea = mainContent.appendChild(document.createElement("div"));
    textArea.className = "ui-dialog-wasabee-copy";
    textArea.innerHTML =
      "<p><a onclick=\"$('.ui-dialog-wasabee-copy textarea').select();\">Select all</a> and press CTRL+C to copy it.</p>" +
      '<textarea readonly onclick="$(\'.ui-dialog-wasabee-copy textarea\').select();" id="wasabee-export-dialog-textarea">' +
      JSON.stringify(this._operation) +
      "</textarea>";
    return mainContent;
  },

  _drawToolsFormat: function() {
    const ta = document.getElementById("wasabee-export-dialog-textarea");
    const output = new Array();
    for (const link of this._operation.links) {
      const l = {};
      l.type = "polyline";
      l.color = link.getColorHex();
      l.latLngs = link.getLatLngs(this._operation);
      output.push(l);
    }

    ta.value = JSON.stringify(output);
  }
});

export default ExportDialog;
