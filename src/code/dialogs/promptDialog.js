import { WDialog } from "../leafletClasses";
import { getSelectedOperation } from "../selectedOp";
import wX from "../wX";

// generic prompt screen

const PromptDialog = WDialog.extend({
  statics: {
    TYPE: "promptDialog"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = PromptDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
    this._title = wX("NO_TITLE"); // should never be displayed
    this._label = wX("NO_LABEL"); // should never be displayed
    this.placeholder = "";
    this.current = "";
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
      title: this._title,
      width: "auto",
      height: "auto",
      html: this._buildContent(),
      dialogClass: "wasabee-dialog wasabee-dialog-prompt",
      buttons: {
        OK: () => {
          if (this._callback) this._callback();
          this._dialog.dialog("close");
        },
        Cancel: () => {
          if (this._cancelCallback) this._cancelCallback();
          this._dialog.dialog("close");
        }
      },
      closeCallback: () => {
        window.runHooks("wasabeeUIUpdate", getSelectedOperation());
        this.disable();
        delete this._dialog;
      }
      // id: window.plugin.wasabee.static.dialogNames.XXX
    });
  },

  setup: function(title, label, callback, cancelCallback) {
    this._title = title;
    this._label = label;
    if (callback) this._callback = callback;
    if (cancelCallback) this._cancelCallback = cancelCallback;
  },

  _buildContent: function() {
    const content = L.DomUtil.create("div", "container");
    if (typeof this._label == "string") {
      const label = L.DomUtil.create("label", null, content);
      label.textContent = this._label;
    } else {
      content.appendChild(this._label);
    }
    this.inputField = L.DomUtil.create("input", null, content);
    this.inputField.id = "inputField";
    this.inputField.placeholder = this.placeholder;
    this.inputField.value = this.current;
    return content;
  }
});

export default PromptDialog;
