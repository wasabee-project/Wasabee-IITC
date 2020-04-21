import { WDialog } from "../leafletClasses";
import wX from "../wX";

// This file documents the minimum requirements of a dialog in wasabee
const AboutDialog = WDialog.extend({
  // not strictly necessary, but good style
  statics: {
    TYPE: "about"
  },

  // every leaflet class ought to have an initialize,
  // inputs defined by leaflet, window.map is defined by IITC
  // options can extended by callers
  initialize: function(map = window.map, options) {
    // always define type, it is used by the parent classes
    this.type = AboutDialog.TYPE;
    // call the parent classes initialize as well
    WDialog.prototype.initialize.call(this, map, options);
  },

  // WDialog is a leaflet L.Handler, which takes add/removeHooks
  addHooks: function() {
    // this pulls in the addHooks from the parent class
    WDialog.prototype.addHooks.call(this);
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
    WDialog.prototype.removeHooks.call(this);
  },

  // define our work in _displayDialog
  _displayDialog: function() {
    // use leaflet's DOM object creation, not bare DOM or Jquery
    const html = L.DomUtil.create("div", null);
    const support = L.DomUtil.create("div", null, html);
    // wX is the translation call, looks for strings in translations.json based
    // on the browser's langauge setting
    support.innerHTML = wX("SUPPORT_INSTRUCT");

    const tips = L.DomUtil.create("div", null, html);
    tips.innerHTML =
      "<h3>Show your love</h3><a href='https://paypal.me/pools/c/8osG170xBE'>Tip Jar@paypal</a>";
    const about = L.DomUtil.create("div", null, html);
    about.innerHTML =
      "<h3>About Wasabee-IITC</h3><ul><li>0.0-0.12: @Phtiv</li><li>0.13-0.17: @deviousness</li></ul>";

    const videos = L.DomUtil.create("div", null, html);
    videos.innerHTML = wX("HOW_TO_VIDS");

    // create a JQueryUI dialog, store it in _dialog
    // set closeCallback to report that we are done and free up the memory
    // set id if you want only one instance of this dialog to be displayed at a time
    // enable/disable are inherited from L.Handler via WDialog
    this._dialog = window.dialog({
      title: wX("ABOUT_WASABEE"),
      width: "auto",
      height: "auto",
      html: html,
      dialogClass: "wasabee-dialog wasabee-dialog-about",
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
export default AboutDialog;
