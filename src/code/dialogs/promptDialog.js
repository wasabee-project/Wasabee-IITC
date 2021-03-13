import { WDialog } from "../leafletClasses";
import wX from "../wX";

// generic prompt screen

const PromptDialog = WDialog.extend({
  statics: {
    TYPE: "promptDialog",
  },

  options: {
    title: wX("NO_TITLE"), // should never be displayed
    label: wX("NO_LABEL"), // should never be displayed
    placeholder: "",
    current: "",
    suggestions: [],
    // callback
    // cancelCallback
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
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

    this._dialog = window.dialog({
      title: this.options.title,
      html: this._buildContent(),
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-prompt",
      closeCallback: () => {
        window.map.fire(
          "wasabeeUIUpdate",
          { reason: "PromptDialogClose" },
          false
        );
        this.disable();
        delete this._dialog;
      },
    });
    this._dialog.dialog("option", "buttons", buttons);
  },

  _buildContent: function () {
    const content = L.DomUtil.create("div", "container");
    if (typeof this.options.label == "string") {
      const label = L.DomUtil.create("label", null, content);
      label.textContent = this.options.label;
    } else {
      content.appendChild(this.options.label);
    }
    this.inputField = L.DomUtil.create("input", null, content);
    this.inputField.id = "inputField";
    this.inputField.placeholder = this.options.placeholder;
    this.inputField.value = this.options.current;

    if (this.options.suggestions) {
      const datalist = L.DomUtil.create("datalist", null, content);
      datalist.id = "wasabee-prompt-suggestions";
      for (const entry of this.options.suggestions) {
        const option = L.DomUtil.create("option", null, datalist);
        if (typeof entry === "string") {
          option.value = entry;
        } else {
          option.textContent = entry.text;
          option.value = entry.value;
        }
      }
      this.inputField.setAttribute("list", "wasabee-prompt-suggestions");
    }
    return content;
  },
});

export default PromptDialog;
