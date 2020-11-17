import { WDialog } from "../leafletClasses";
import WasabeeOp from "../operation";
import ImportDialog from "./importDialog";
import PromptDialog from "./promptDialog";
import { makeSelectedOperation } from "../selectedOp";
import wX from "../wX";

const NewopDialog = WDialog.extend({
  statics: {
    TYPE: "newopButton",
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    this._displayDialog(this);
  },

  _displayDialog: function (noHandler) {
    const content = L.DomUtil.create("div", null);
    const buttonSet = L.DomUtil.create("div", "buttonset", content);
    const addButton = L.DomUtil.create("button", null, buttonSet);
    addButton.textContent = wX("ADD_NEW_OP");

    const importButton = L.DomUtil.create("button", null, buttonSet);
    importButton.textContent = wX("IMPORT_OP");
    L.DomEvent.on(importButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      noHandler._dialog.dialog("close");
      const id = new ImportDialog(null);
      id.enable();
    });

    L.DomEvent.on(addButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      noHandler._dialog.dialog("close");
      const addDialog = new PromptDialog({
        title: wX("NEW_OP"),
        label: wX("SET_NEW_OP"),
        callback: () => {
          if (addDialog.inputField.value) {
            const newop = new WasabeeOp({
              creator: PLAYER.nickname,
              name: addDialog.inputField.value,
            });
            newop.store();
            makeSelectedOperation(newop.ID);
            window.map.fire(
              "wasabeeUIUpdate",
              { reason: "NewopDialog" },
              false
            );
            window.map.fire(
              "wasabeeCrosslinks",
              { reason: "NewopDialog" },
              false
            );
          } else {
            alert(wX("OP_NAME_UNSET"));
          }
        },
        placeholder: wX("MUST_NOT_BE_EMPTY"),
      });
      addDialog.enable();
    });

    const buttons = {};
    buttons[wX("OK")] = () => {
      this._dialog.dialog("close");
    };

    this._dialog = window.dialog({
      title: wX("NEW_OP"),
      html: content,
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-newop",
      closeCallback: function () {
        noHandler.disable();
        delete noHandler._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.newopButton,
    });
    this._dialog.dialog("option", "buttons", buttons);
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
  },
});

export default NewopDialog;
