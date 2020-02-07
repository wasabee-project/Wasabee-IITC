import { Feature } from "./leafletDrawImports";
import WasabeeMe from "./me";
import Sortable from "./sortable";
import store from "../lib/store";
import { GetWasabeeServer, SetTeamState } from "./server";
import PromptDialog from "./promptDialog";

const WasabeeButtonControl = Feature.extend({
  statics: {
    TYPE: "wasabeeButton"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = WasabeeButtonControl.TYPE;
    Feature.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    if (!this._map) return;
    Feature.prototype.addHooks.call(this);
    this._displayDialog();
  },

  _displayDialog: function() {
    const me = WasabeeMe.get(true);
    const teamlist = new Sortable();
    teamlist.fields = [
      {
        name: "Team Name",
        value: team => team.Name,
        sort: (a, b) => a.localeCompare(b),
        format: (row, value, team) => {
          const link = document.createElement("a");
          link.href =
            GetWasabeeServer() + "/api/v1/team/" + team.ID + "?json=n";
          link.innerHTML = value;
          link.target = "_blank";
          row.appendChild(link);
        }
      },
      {
        name: "State",
        value: team => team.State,
        sort: (a, b) => a.localeCompare(b),
        format: (row, value, obj) => {
          const link = document.createElement("a");
          let curstate = obj.State;
          link.innerHTML = curstate;
          link.onclick = () => {
            curstate = this.toggleTeam(obj.ID, curstate);
            link.innerHTML = curstate;
          };
          row.appendChild(link);
        }
      }
    ];
    teamlist.sortBy = 0;

    const html = document.createElement("div");
    this.serverInfo = html.appendChild(document.createElement("div"));
    this.serverInfo.innerHTML = "Server: " + GetWasabeeServer() + "<br/><br/>";
    this.serverInfo.addEventListener("click", this.setServer);
    html.appendChild(teamlist.table);

    if (me !== null && me instanceof WasabeeMe) {
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

  toggleTeam: function(teamID, currentState) {
    let newState = "Off";
    if (currentState == "Off") newState = "On";

    SetTeamState(teamID, newState);
    return newState;
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
    const serverDialog = new PromptDialog(window.map);
    serverDialog.setup("Change Wasabee Server", "New Waasbee Server", () => {
      if (serverDialog.inputField.value) {
        store.set(
          window.plugin.Wasabee.Constants.SERVER_BASE_KEY,
          serverDialog.inputField.value
        );
        store.remove(window.plugin.Wasabee.Constants.AGENT_INFO_KEY);
      }
    });
    serverDialog.current = GetWasabeeServer();
    serverDialog.placeholder = "https://server.wasabee.rocks/";
    serverDialog.enable();
  }
});

export default WasabeeButtonControl;
