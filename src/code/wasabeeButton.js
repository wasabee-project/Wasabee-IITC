// import UiHelper from "./uiHelper.js";
import { Feature } from "./leafletDrawImports";
import WasabeeMe from "./me";
import Sortable from "./sortable";

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
    const teamlist = new Sortable();
    teamlist.fields = [
      {
        name: "Team Name",
        value: team => team.Name,
        sort: (a, b) => a.localeCompare(b),
        format: (a, m) => {
          a.textContent = m;
        }
      },
      {
        name: "State",
        value: team => team.State,
        sort: (a, b) => a.localeCompare(b),
        format: (a, m) => {
          a.textContent = m;
        }
      }
    ];
    teamlist.sortBy = 0;

    let me = WasabeeMe.get(true); // don't cache this, use up-to-date
    if (me != null && me.GoogleID != undefined) {
      teamlist.items = me.Teams;
      const wbHandler = this;
      this._dialog = window.dialog({
        title: "Current User Information",
        width: "auto",
        height: "auto",
        html: teamlist.table,
        dialogClass: "wasabee-dialog-mustauth",
        closeCallback: function() {
          wbHandler.disable();
          delete wbHandler._dialog;
        },
        id: window.plugin.Wasabee.static.dialogNames.wasabeeButton
      });
    } else {
      this.disable();
      this._dialog = window.plugin.wasabee.showMustAuthAlert();
    }
  },

  getIcon() {
    if (WasabeeMe.isLoggedIn()) {
      return window.plugin.Wasabee.static.images.toolbar_wasabeebutton_in;
    }
    return window.plugin.Wasabee.static.images.toolbar_wasabeebutton_out;
  },

  // unused, here just in case we want to be able to close individual dialogs
  _closeDialog() {
    let id = "dialog-" + window.plugin.Wasabee.static.dialogNames.wasabeeButton;
    if (window.DIALOGS[id]) {
      try {
        const selector = $(window.DIALOGS[id]);
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
