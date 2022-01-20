import { WDialog } from "../leafletClasses";
import wX from "../wX";

// This file documents the minimum requirements of a dialog in wasabee
const AboutDialog = WDialog.extend({
  // not strictly necessary, but good style
  statics: {
    TYPE: "about",
  },

  // WDialog is a leaflet L.Handler, which takes add/removeHooks
  addHooks: function () {
    // this pulls in the addHooks from the parent class
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  // define our work in _displayDialog
  _displayDialog: function () {
    // use leaflet's DOM object creation, not bare DOM or Jquery
    const html = L.DomUtil.create("div", null);
    const support = L.DomUtil.create("div", null, html);
    // wX is the translation call, it looks up the string in the agent's chosen language
    support.innerHTML = wX("SUPPORT_INSTRUCT");

    if (this._smallScreen) {
      const mobileApp = L.DomUtil.create("div", null, html);
      mobileApp.innerHTML = wX("dialog.about.download_mobile_app");
    }

    const tips = L.DomUtil.create("div", null, html);
    tips.innerHTML =
      "<h3>Show your love</h3><a href='https://www.patreon.com/wasabee' target=\"_blank\">Patreon</a>";
    const about = L.DomUtil.create("div", null, html);
    about.innerHTML =
      "<h3>About Wasabee-IITC</h3>" +
      "Current version: " +
      window.plugin.wasabee.info.version;

    const videos = L.DomUtil.create("div", null, html);
    videos.innerHTML = wX("HOW_TO_VIDS");

    // Since the JqueryUI dialog buttons are hard-coded, we have to override them to translate them
    const buttons = {};
    buttons[wX("OK")] = () => {
      this.closeDialog();
    };

    // create a JQueryUI dialog, store it in _dialog
    // set closeCallback to report that we are done and free up the memory
    // set id if you want only one instance of this dialog to be displayed at a time
    // enable/disable are inherited from L.Handler via WDialog
    this.createDialog({
      title: wX("ABOUT_WASABEE"),
      html: html,
      width: "auto",
      dialogClass: "about",
      buttons: buttons,
    });
  },
});

// this line allows other files to import our dialog
export default AboutDialog;
