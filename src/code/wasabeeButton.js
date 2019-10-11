import { Feature } from "./leafletDrawImports";
import WasabeeMe from "./me";
import Sortable from "./sortable";
import store from "../lib/store";

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

    const html = document.createElement("div");
    this.serverInfo = html.appendChild(document.createElement("div"));
    this.serverInfo.innerHTML =
      "Server: " +
      store.get(window.plugin.Wasabee.Constants.SERVER_BASE_KEY) +
      "<br/><br/>";
    this.serverInfo.addEventListener("click", this.setServer);
    html.appendChild(teamlist.table);

    let me = WasabeeMe.get(true); // don't cache this, use up-to-date
    if (me != null && me.GoogleID != undefined) {
      teamlist.items = me.Teams;
      const wbHandler = this;
      this._dialog = window.dialog({
        title: "Current User Information",
        width: "auto",
        height: "auto",
        html: html,
        dialogClass: "wasabee-dialog-mustauth",
        closeCallback: function() {
          window.runHooks(
            "wasabeeUIUpdate",
            window.plugin.wasabee.getSelectedOperation()
          );
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

  getIcon: function() {
    if (WasabeeMe.isLoggedIn()) {
      return window.plugin.Wasabee.static.images.toolbar_wasabeebutton_in;
    }
    return window.plugin.Wasabee.static.images.toolbar_wasabeebutton_out;
  },

  // unused, here just in case we want to be able to close individual dialogs
  _closeDialog: function() {
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
  },

  setServer: function() {
    const promptAction = prompt(
      "Change WASABEE server",
      store.get(window.plugin.Wasabee.Constants.SERVER_BASE_KEY)
    );
    if (promptAction !== null && promptAction !== "") {
      // do we need sanity checking here?
      store.set(window.plugin.Wasabee.Constants.SERVER_BASE_KEY, promptAction);
      store.remove(window.plugin.Wasabee.Constants.AGENT_INFO_KEY);
      this.innerHTML =
        "Server: " +
        store.get(window.plugin.Wasabee.Constants.SERVER_BASE_KEY) +
        "<br/><br/>";
    }
  }
});

export default WasabeeButtonControl;
