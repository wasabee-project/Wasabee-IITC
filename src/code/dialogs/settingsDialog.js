import { WDialog } from "../leafletClasses";
import wX from "../wX";
import { getSelectedOperation } from "../selectedOp";
import addButtons from "../addButtons";

// This file documents the minimum requirements of a dialog in wasabee
const SettingsDialog = WDialog.extend({
  // not strictly necessary, but good style
  statics: {
    TYPE: "settings"
  },

  // every leaflet class ought to have an initialize,
  // inputs defined by leaflet, window.map is defined by IITC
  // options can extended by callers
  initialize: function(map = window.map, options) {
    // always define type, it is used by the parent classes
    this.type = SettingsDialog.TYPE;
    // call the parent classes initialize as well
    WDialog.prototype.initialize.call(this, map, options);
  },

  // WDialog is a leaflet L.Handler, which takes add/removeHooks
  addHooks: function() {
    // this pulls in the addHooks from the parent class
    WDialog.prototype.addHooks.call(this);
    const context = this;
    this._operation = getSelectedOperation();
    // magic context incantation to make "this" work...
    this._UIUpdateHook = newOpData => {
      context.update(newOpData);
    };
    window.addHook("wasabeeUIUpdate", this._UIUpdateHook);
    // put any per-open setup here
    // this is the call to actually do our work
    if (this._smallScreen) {
      this._displaySmallDialog();
    } else {
      this._displayDialog();
    }
  },

  removeHooks: function() {
    // put any post close teardown here
    window.removeHook("wasabeeUIUpdate", this._UIUpdateHook);
    WDialog.prototype.removeHooks.call(this);
  },

  update: function() {
    const container = this._getContent();
    this._dialog.html(container);
  },

  _getContent: function() {
    // use leaflet's DOM object creation, not bare DOM or Jquery
    const container = L.DomUtil.create("div", "container");
    const langLabel = L.DomUtil.create("label", null, container);
    langLabel.textContent = wX("LANG");
    const langMenu = L.DomUtil.create("select", null, container);

    const current = localStorage["wasabee-default-language"];
    for (const l in window.plugin.wasabee.static.strings) {
      const option = L.DomUtil.create("option", null, langMenu);
      option.value = l;
      option.textContent = l;
      if (l == current) option.selected = true;
    }
    for (const l in window.plugin.wasabee.static.stringsSilly) {
      const option = L.DomUtil.create("option", null, langMenu);
      option.value = l;
      option.textContent = l;
      if (l == current) option.selected = true;
    }
    L.DomEvent.on(langMenu, "change", () => {
      localStorage["wasabee-default-language"] = langMenu.value;
      addButtons(getSelectedOperation());
      window.runHooks("wasabeeUIUpdate", getSelectedOperation());
    });
    return container;
  },

  // define our work in _displayDialog
  _displayDialog: function() {
    const container = this._getContent();

    // create a JQueryUI dialog, store it in _dialog
    // set closeCallback to report that we are done and free up the memory
    // set id if you want only one instance of this dialog to be displayed at a time
    // enable/disable are inherited from L.Handler via WDialog
    this._dialog = window.dialog({
      title: "Settings",
      width: "auto",
      height: "auto",
      html: container,
      dialogClass: "wasabee-dialog wasabee-dialog-settings",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.linkList
    });
  },

  // small-screen versions go in _displaySmallDialog
  _displaySmallDialog: function() {
    // for this dialog, the small screen is the same as the normal
    this._displayDialog();
  }
});

// this line allows other files to import our dialog
export default SettingsDialog;
