import { WasabeeOp } from "../model";
import ImportDialog from "./importDialog";
import PromptDialog from "./promptDialog";
import { makeSelectedOperation } from "../selectedOp";
import wX from "../wX";
import { displayError } from "../error";

const NewopDialog = PromptDialog.extend({
  statics: {
    TYPE: "newopButton",
  },

  _displayDialog: function () {
    const buttons = {};
    buttons[wX("OK")] = () => {
      this._submit();
    };
    buttons[wX("IMPORT_OP")] = () => {
      this.closeDialog();
      const id = new ImportDialog(null);
      id.enable();
    };
    buttons[wX("CANCEL")] = () => {
      if (this.options.cancelCallback) this.options.cancelCallback();
      // cancelCallback must fire appropriate ui update events
      this.closeDialog();
    };

    L.setOptions(this, {
      title: wX("NEW_OP"),
      label: wX("SET_NEW_OP"),
      callback: async () => {
        if (this.inputField.value) {
          const newop = new WasabeeOp({
            creator: PLAYER.nickname,
            name: this.inputField.value,
          });
          await newop.store();
          await makeSelectedOperation(newop.ID);
        } else {
          displayError(wX("OP_NAME_UNSET"));
        }
      },
      placeholder: wX("MUST_NOT_BE_EMPTY"),
      nonEmpty: true,
    });

    this.createDialog({
      title: this.options.title,
      html: this._buildContent(),
      width: "auto",
      dialogClass: "prompt",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.newopButton,
      autofocus: true,
    });
  },
});

export default NewopDialog;
