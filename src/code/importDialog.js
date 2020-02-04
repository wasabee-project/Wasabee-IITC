import WasabeeOp from "./operation";
import { Feature } from "./leafletDrawImports";

export const ImportDialogControl = Feature.extend({
  statics: {
    TYPE: "importDialog"
  },

  initialize: function(map, options) {
    this.type = ImportDialogControl.TYPE;
    Feature.prototype.initialize.call(this, map, options);
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
    this.idialog = new ImportDialog();
    const idhandler = this;
    this._dialog = window.dialog({
      title: "Import Wasabee Operation",
      width: "auto",
      height: "auto",
      html: this.idialog.container,
      dialogClass: "wasabee-dialog-mustauth",
      closeCallback: () => {
        this.idialog.importTextareaAsOp();
        window.runHooks(
          "wasabeeUIUpdate",
          window.plugin.wasabee.getSelectedOperation()
        );
        idhandler.disable();
        delete idhandler._dialog;
      },
      id: window.plugin.Wasabee.static.dialogNames.importDialog
    });
  }
});

class ImportDialog {
  constructor() {
    this.container = document.createElement("div");

    // Input area
    this.textarea = this.container.appendChild(
      document.createElement("textarea")
    );
    this.textarea.rows = 20;
    this.textarea.cols = 80;
    this.textarea.placeholder =
      "Paste a Wasabee draw export here. Wasabee cannot import stock intel, IITC drawtools, or any other formats.";
  }

  importTextareaAsOp() {
    const string = this.textarea.value;
    try {
      if (
        string.match(
          new RegExp("^(https?://)?(www\\.)?intel.ingress.com/intel.*")
        )
      ) {
        alert("Wasabee doesn't support stock intel draw imports");
      } else {
        const data = JSON.parse(string);
        const importedOp = WasabeeOp.create(data);
        importedOp.store();
        window.plugin.wasabee.makeSelectedOperation(importedOp.ID);
        alert("Imported Operation: " + importedOp.name + " Successfuly.");
      }
    } catch (e) {
      console.warn("WasabeeTools: failed to import data: " + e);
      alert("Import Failed.");
    }
  }
}
