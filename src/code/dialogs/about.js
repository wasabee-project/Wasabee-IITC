import { Feature } from "../leafletDrawImports";
import wX from "../wX";

// Is there anything in Feature, or can we just use L.Handler now?
const AboutDialog = Feature.extend({
  // for dialogs, the static TYPE and this.type are unused, remove them in 0.16
  statics: {
    TYPE: "about"
  },

  // use map=window.map both her and in the Feature class
  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = AboutDialog.TYPE;
    Feature.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    // Feature.addHooks doesn't do anything
    // does L.Handler.addHooks exist?
    Feature.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function() {
    // Feature.removeHooks doesn't do anything
    Feature.prototype.removeHooks.call(this);
  },

  _displayDialog: function() {
    const html = L.DomUtil.create("div", null);
    const support = L.DomUtil.create("div", null, html);
    support.innerHTML = wX("SUPPORT_INSTRUCT");

    const about = L.DomUtil.create("div", null, html);
    about.innerHTML =
      "<h3>About Wasabee-IITC</h3><ul><li>0.0-0.12: @Phtiv</li><li>0.13-0.15: @deviousness</li></ul>";

    const videos = L.DomUtil.create("div", null, html);
    videos.innerHTML = wX("HOW_TO_VIDS");

    this._dialog = window.dialog({
      title: wX("ABOUT_WASABEE"),
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
