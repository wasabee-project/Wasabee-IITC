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
    let me = WasabeeMe.get(); // don't cache this, use up-to-date
    if (me != null && me.GoogleID != undefined) {
      var content = document.createElement("div");
      var title = content.appendChild(document.createElement("div"));
      title.className = "desc";
      title.innerHTML = "Current User Information";
      var info = content.appendChild(document.createElement("div"));
      info.className = "desc";
      title.innerHTML = "Google ID:" + me.GoogleID + "<br/><br/>Teams:<br/>";
      me.Teams.forEach(function(team) {
        title.innerHTML += team.Name + " (" + team.State + ")</br>";
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
        id: "wasabee-user-info"
      });
    } else {
      this._dialog = window.plugin.wasabee.showMustAuthAlert();
    }
  },

  _getIcon() {
    let me = WasabeeMe.get();
    if (me == null) {
      return window.plugin.Wasabee.static.images.toolbar_wasabeebutton_out;
    }
    return window.plugin.Wasabee.static.images.toolbar_wasabeebutton_out;
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
  }
});

export default WasabeeButtonControl;
