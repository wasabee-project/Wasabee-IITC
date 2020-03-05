import { Feature } from "../leafletDrawImports";

const AboutDialog = Feature.extend({
  statics: {
    TYPE: "about"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = AboutDialog.TYPE;
    Feature.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    Feature.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
  },

  _displayDialog: function() {
    const html = L.DomUtil.create("div", null);
    const support = L.DomUtil.create("div", null, html);
    support.innerHTML =
      "For support, please join the <a href='https://t.me/joinchat/B7_3JE8Qfm_XBgP896sOgQ' target='_new'>The Telegram Channel</a>";

    const about = L.DomUtil.create("div", null, html);
    about.innerHTML =
      "<h3>About Wasabee-IITC</h3><ul><li>0.0-0.12: @Phtiv</li><li>0.13-0.15: @deviousness</li></ul>";

    this._dialog = window.dialog({
      title: "About Wasabee",
      width: "auto",
      height: "auto",
      html: html,
      dialogClass: "wasabee-dialog",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.linkList
    });
  }
});

export default AboutDialog;
