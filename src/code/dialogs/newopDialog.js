import { Feature } from "../leafletDrawImports";
import WasabeeOp from "../operation";
import ImportDialogControl from "./importDialog";
import PromptDialog from "./promptDialog";
import { makeSelectedOperation } from "../selectedOp";
import wX from "../wX";

const NewopDialog = Feature.extend({
  statics: {
    TYPE: "newopButton"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = NewopDialog.TYPE;
    Feature.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    if (!this._map) return;
    Feature.prototype.addHooks.call(this);
    this._displayDialog(this);
  },

  _displayDialog: function(noHandler) {
    const content = L.DomUtil.create(
      "div",
      "wasabee-dialog wasabee-dialog-ops"
    );
    const buttonSet = L.DomUtil.create("div", "temp-op-dialog", content);
    const addButton = L.DomUtil.create("a", "", buttonSet);
    addButton.textContent = wX("ADD_NEW_OP");

    const importButton = L.DomUtil.create("a", "", buttonSet);
    importButton.textContent = wX("IMPORT_OP");
    L.DomEvent.on(importButton, "click", () => {
      noHandler._dialog.dialog("close");
      const id = new ImportDialogControl(this._map, null);
      id.enable();
    });

    L.DomEvent.on(addButton, "click", () => {
      noHandler._dialog.dialog("close");
      const addDialog = new PromptDialog(this._map);
      addDialog.setup(wX("NEW_OP"), wX("SET_NEW_OP"), () => {
        if (addDialog.inputField.value) {
          const newop = new WasabeeOp(
            PLAYER.nickname,
            addDialog.inputField.value,
            true
          );
          newop.store();
          makeSelectedOperation(newop.ID);
          window.runHooks("wasabeeUIUpdate", newop);
          window.runHooks("wasabeeCrosslinks", newop);
        } else {
          alert(wX("OP_NAME_UNSET"));
        }
      });
      addDialog.placeholder = wX("MUST_NOT_BE_EMPTY");
      addDialog.enable();
    });

    this._dialog = window.dialog({
      title: wX("NEW_OP"),
      width: "auto",
      height: "auto",
      html: content,
      dialogClass: "wasabee-dialog-mustauth",
      closeCallback: function() {
        noHandler.disable();
        delete noHandler._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.newopButton
    });
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
  }
});

export default NewopDialog;
