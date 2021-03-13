import { WDialog } from "../leafletClasses";
import wX from "../wX";

// generic confirmation screen w/ ok and cancel buttons

const ConfirmDialog = WDialog.extend({
  statics: {
    TYPE: "confirmDialog",
  },

  options: {
    title: wX("NO_TITLE"),
    label: wX("NO_LABEL"),
    // callback,
    // cancelCallback
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    if (
      localStorage[window.plugin.wasabee.static.constants.EXPERT_MODE_KEY] ==
      "true"
    ) {
      console.log("expert mode: skipping dialog display");
      if (this.options.callback) this.options.callback();
    } else {
      this._displayDialog();
    }
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.map.fire("wasabeeUIUpdate", { reason: "confirmDialog" }, false);
  },

  _displayDialog: function () {
    const buttons = {};
    buttons[wX("OK")] = () => {
      if (this.options.callback) this.options.callback();
      this._dialog.dialog("close");
    };
    buttons[wX("CANCEL")] = () => {
      if (this.options.cancelCallback) this.options.cancelCallback();
      this._dialog.dialog("close");
    };

    this._dialog = this.createDialog({
      title: this.options.title,
      html: this._buildContent(),
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-confirm",
      buttons: buttons,
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      // id: window.plugin.wasabee.static.dialogNames.XXX
    });
  },

  _buildContent: function () {
    const content = L.DomUtil.create("div", "title");
    if (typeof this.options.label == "string") {
      content.textContent = this.options.label;
    } else {
      content.appendChild(this.options.label);
    }
    return content;
  },
});

export default ConfirmDialog;
