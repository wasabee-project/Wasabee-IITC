import { Feature } from "../leafletDrawImports";
import WasabeeMe from "../me";
import Sortable from "../../lib/sortable";
import store from "../../lib/store";
import { GetWasabeeServer, SetTeamState, locationPromise } from "../server";
import PromptDialog from "./promptDialog";
import AuthDialog from "./authDialog";
import TeamMembershipList from "./teamMembershipList";

const WasabeeDialog = Feature.extend({
  statics: {
    TYPE: "wasabeeButton"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = WasabeeDialog.TYPE;
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
          const link = L.DomUtil.create("a", "", row);
          link.href = "#";
          link.innerHTML = value;
          L.DomEvent.on(link, "click", () => {
            const td = new TeamMembershipList();
            td.setup(team.ID);
            td.enable();
          });
        }
      },
      {
        name: "State",
        value: team => team.State,
        sort: (a, b) => a.localeCompare(b),
        format: (row, value, obj) => {
          const link = L.DomUtil.create("a", "", row);
          let curstate = obj.State;
          link.innerHTML = curstate;
          link.onclick = () => {
            curstate = this.toggleTeam(obj.ID, curstate);
            link.innerHTML = curstate;
          };
        }
      }
    ];
    teamlist.sortBy = 0;

    const html = L.DomUtil.create("div", "temp-op-dialog");
    this.serverInfo = L.DomUtil.create("div", "", html);
    this.serverInfo.innerHTML = "Server: " + GetWasabeeServer() + "<br/><br/>";
    L.DomEvent.on(this.serverInfo, "click", this.setServer);

    const options = L.DomUtil.create("div", "temp-op-dialog", html);
    const locbutton = L.DomUtil.create("a", null, options);
    locbutton.style.align = "center";
    locbutton.textContent = "Send Location";
    L.DomEvent.on(locbutton, "click", () => {
      navigator.geolocation.getCurrentPosition(
        position => {
          locationPromise(
            position.coords.latitude,
            position.coords.longitude
          ).then(
            () => {
              alert("location processed");
            },
            err => {
              console.log(err);
            }
          );
        },
        err => {
          console.log(err);
          console.log("unable to get location");
        }
      );
    });

    html.appendChild(teamlist.table);

    if (me) {
      teamlist.items = me.Teams;
      const wbHandler = this;
      this._dialog = window.dialog({
        title: "Current User Information",
        width: "auto",
        height: "auto",
        html: html,
        dialogClass: "wasabee-dialog-mustauth",
        closeCallback: function() {
          wbHandler.disable();
          delete wbHandler._dialog;
        },
        id: window.plugin.wasabee.static.dialogNames.wasabeeButton
      });
    } else {
      this.disable();
      const ad = new AuthDialog();
      ad.enable();
    }
  },

  toggleTeam: function(teamID, currentState) {
    let newState = "Off";
    if (currentState == "Off") newState = "On";

    SetTeamState(teamID, newState);
    return newState;
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
  },

  setServer: function() {
    const serverDialog = new PromptDialog(window.map);
    serverDialog.setup("Change Wasabee Server", "New Waasbee Server", () => {
      if (serverDialog.inputField.value) {
        store.set(
          window.plugin.wasabee.static.constants.SERVER_BASE_KEY,
          serverDialog.inputField.value
        );
        store.remove(window.plugin.wasabee.static.constants.AGENT_INFO_KEY);
      }
    });
    serverDialog.current = GetWasabeeServer();
    serverDialog.placeholder = "https://server.wasabee.rocks/";
    serverDialog.enable();
  }
});

export default WasabeeDialog;
