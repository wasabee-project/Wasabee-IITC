// import UiHelper from "./uiHelper.js";
import { Feature } from "./leafletDrawImports";
import WasabeeMe from "./me";

const strings = {
  wasabeeButton: {
    actions: {
      login: {
        title: "login",
        text: "login"
      }
    },
    tooltip: {
      login: "authenticate with the wasabee server.",
      dialog: "display wasabee agent info."
    }
  }
};

const WasabeeButtonControl = Feature.extend({
  statics: {
    TYPE: "wasabeeButton"
  },

  options: {
    outIcon: new L.Icon({
      iconSize: new L.Point(16, 16),
      iconAnchor: new L.Point(0, 0),
      iconUrl: window.plugin.Wasabee.static.images.wasabee_button_out
    }),
    inIcon: new L.Icon({
      iconSize: new L.Point(16, 16),
      iconAnchor: new L.Point(0, 0),
      iconUrl: window.plugin.Wasabee.static.images.wasabee_button_in
    })
  },

  initialize: function(map, options) {
    this.type = WasabeeButtonControl.TYPE;
    Feature.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    Feature.prototype.addHooks.call(this);
    if (!this._map) return;
    this._displayDialog();
  },

  _displayDialog: function() {
    if (!this.me) {
      this.me = WasabeeMe.get();
    }
    // this._tooltip.updateContent(this._getTooltipText());
    if (!this.me || this.me.GoogleID != undefined) {
      var content = document.createElement("div");
      var title = content.appendChild(document.createElement("div"));
      title.className = "desc";
      title.innerHTML = "Current User Information";
      var info = content.appendChild(document.createElement("div"));
      info.className = "desc";
      title.innerHTML =
        "Google ID:" + this.me.GoogleID + "<br/><br/>Teams:<br/>";
      this.me.Teams.forEach(function(team) {
        title.innerHTML += team.Name + " (" + team.State + ")</br>";
      });
      this._dialog = window.dialog({
        title: "Current User Information",
        width: "auto",
        height: "auto",
        html: content,
        dialogClass: "wasabee-dialog-mustauth",
        closeCallback: this._dialogCloseCallback
      });
    } else {
      this._dialog = window.plugin.wasabee.showMustAuthAlert();
    }
  },

  _dialogCloseCallback: function() {
    console.log("wasabeeButton dialogCloseCallback");
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);

    delete this.me;
  },

  _updateTooltip: function(latLng) {
    if (latLng) {
      this._tooltip.updatePosition(latLng);
    }
  },

  _getTooltipText: function() {
    if (!this.me) return { text: strings.wasabeeButton.tooltip.login };
    return { text: strings.wasabeeButton.tooltip.dialog };
  }
});

export default WasabeeButtonControl;
