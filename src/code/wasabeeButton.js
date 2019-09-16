// import UiHelper from "./uiHelper.js";
import { Feature } from "./leafletDrawImports";
import WasabeeMe from "./me";

const WasabeeButtonControl = Feature.extend({
  statics: {
    TYPE: "wasabeeButton"
  },

  initialize: function(map, options) {
    this.type = WasabeeButtonControl.TYPE;
    Feature.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    if (!this._map) return;
    Feature.prototype.addHooks.call(this);
    this._displayDialog();
  },

  _displayDialog: function() {
    let me = WasabeeMe.get(true); // don't cache this, use up-to-date
    if (me != null && me.GoogleID != undefined) {
      var content = document.createElement("div");
      var info = content.appendChild(document.createElement("div"));
      info.className = "desc";
      info.innerHTML = "Google ID:" + me.GoogleID + "<br/><br/>Teams:<br/>";
      me.Teams.forEach(function(team) {
        info.innerHTML +=
          "<a href='https://server.wasabee.rocks/api/v1/team/" +
          team.ID +
          "' target='_new'>" +
          team.Name +
          "</a> (" +
          team.State +
          ")</br>";
      });
      var wbHandler = this;
      this._dialog = window.dialog({
        title: "Current User Information",
        width: "auto",
        height: "auto",
        html: content,
        dialogClass: "wasabee-dialog-mustauth",
        closeCallback: function() {
          wbHandler.disable();
          delete wbHandler._dialog;
        },
        id: window.plugin.Wasabee.static.dialogNames.wasabeeButton
      });
    } else {
      this._dialog = window.plugin.wasabee.showMustAuthAlert();
    }
  },

  getIcon() {
    if (WasabeeMe.isLoggedIn()) {
      return window.plugin.Wasabee.static.images.toolbar_wasabeebutton_out;
    }
    return window.plugin.Wasabee.static.images.toolbar_wasabeebutton_out;
  },

  // unused, here just in case we want to be able to close individual dialogs
  _closeDialog() {
    let id = "dialog-" + window.plugin.Wasabee.static.dialogNames.wasabeeButton;
    if (window.DIALOGS[id]) {
      try {
        var selector = $(window.DIALOGS[id]);
        selector.dialog("close");
        selector.remove();
      } catch (err) {
        console.log("wasabeeButton._closeDialog" + err);
      }
    }
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
  }
});

export default WasabeeButtonControl;
