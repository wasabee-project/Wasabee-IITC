import { WDialog } from "../leafletClasses";
import WasabeeMe from "../model/me";
import Sortable from "../sortable";
import {
  SetTeamState,
  leaveTeamPromise,
  newTeamPromise,
  SetTeamShareWD,
  SetTeamLoadWD,
} from "../server";
import PromptDialog from "./promptDialog";
import AuthDialog from "./authDialog";
import TeamMembershipList from "./teamMembershipList";
import ConfirmDialog from "./confirmDialog";
import ManageTeamDialog from "./manageTeamDialog";
import wX from "../wX";

const TeamListDialog = WDialog.extend({
  statics: {
    TYPE: "wasabeeButton",
  },

  addHooks: async function () {
    WDialog.prototype.addHooks.call(this);
    this._me = await WasabeeMe.waitGet(true); // no cache
    window.map.on("wasabee:teams", this.update, this);
    window.map.on("wasabee:logout", this.closeDialog, this);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.map.off("wasabee:teams", this.update, this);
    window.map.off("wasabee:logout", this.closeDialog, this);
  },

  update: async function () {
    if (!this._enabled) return;
    this._me = await WasabeeMe.waitGet(); // cache is fine -- this can probably be removed
    this.setContent(this._buildContent());
  },

  _buildContent: function () {
    const teamlist = new Sortable();
    teamlist.fields = [
      {
        name: wX("TEAM_NAME"),
        value: (team) => team.Name,
        sort: (a, b) => a.localeCompare(b),
        format: (row, value, team) => {
          const link = L.DomUtil.create("a", "enl", row);
          link.href = "#";
          link.textContent = value;
          L.DomEvent.on(link, "click", (ev) => {
            L.DomEvent.stop(ev);
            const td = new TeamMembershipList({ teamID: team.ID });
            td.enable();
          });
        },
      },
      {
        name: wX("TEAM STATE"),
        value: (team) => team.State,
        sort: (a, b) => a.localeCompare(b),
        format: (row, value, obj) => {
          const link = L.DomUtil.create("a", null, row);
          let curstate = obj.State;
          link.textContent = curstate;
          if (curstate == "On") L.DomUtil.addClass(link, "enl");
          link.onclick = async () => {
            await this.toggleTeam(obj.ID, curstate);
            this.update();
          };
        },
      },
      {
        name: "Share W-D Keys",
        value: (team) => team.ShareWD,
        sort: (a, b) => a.localeCompare(b),
        format: (row, value, obj) => {
          const link = L.DomUtil.create("a", null, row);
          let curshare = obj.ShareWD;
          link.textContent = curshare;
          if (curshare == "On") L.DomUtil.addClass(link, "enl");
          link.onclick = async () => {
            await this.toggleShareWD(obj.ID, curshare);
            this.update();
            window.map.fire("wasabee:defensivekeys");
          };
        },
      },
      {
        name: "Load W-D Keys",
        value: (team) => team.LoadWD,
        sort: (a, b) => a.localeCompare(b),
        format: (row, value, obj) => {
          const link = L.DomUtil.create("a", null, row);
          let curload = obj.LoadWD;
          link.textContent = curload;
          if (curload == "On") L.DomUtil.addClass(link, "enl");
          link.onclick = async () => {
            await this.toggleLoadWD(obj.ID, curload);
            this.update();
            window.map.fire("wasabee:defensivekeys");
          };
        },
      },
      {
        name: "",
        value: (team) => team.State,
        sort: null,
        format: (row, value, obj) => {
          const link = L.DomUtil.create("a", null, row);
          link.textContent = "";
          if (this._me.GoogleID != obj.Owner) {
            link.textContent = wX("LEAVE");
            L.DomEvent.on(link, "click", (ev) => {
              L.DomEvent.stop(ev);
              const cd = new ConfirmDialog({
                title: `Leave ${obj.Name}?`,
                label: `If you leave ${obj.Name} you cannot rejoin unless the owner re-adds you.`,
                type: "team",
                callback: async () => {
                  try {
                    await leaveTeamPromise(obj.ID);
                    this._me = await WasabeeMe.waitGet(true);
                    window.map.fire("wasabee:teams");
                    window.map.fire("wasabee:defensivekeys");
                  } catch (e) {
                    console.error(e);
                  }
                },
              });
              cd.enable();
            });
          } else {
            const link = L.DomUtil.create("a", "enl", row);
            link.textContent = wX("MANAGE");
            L.DomEvent.on(link, "click", (ev) => {
              L.DomEvent.stop(ev);
              const mtd = new ManageTeamDialog({ team: obj });
              mtd.enable();
            });
          }
        },
      },
    ];
    teamlist.sortBy = 0;

    const container = L.DomUtil.create("div", "container");
    container.appendChild(teamlist.table);
    teamlist.items = this._me.Teams;
    return container;
  },

  _displayDialog: function () {
    if (!this._me) {
      this.disable();
      const ad = new AuthDialog();
      ad.enable();
      return;
    }

    const buttons = {};
    buttons[wX("OK")] = () => {
      this.closeDialog();
    };
    buttons[wX("NEW_TEAM")] = () => {
      const p = new PromptDialog({
        title: wX("CREATE_NEW_TEAM"),
        label: wX("NTNAME"),
        callback: async () => {
          const newname = p.inputField.value;
          if (!newname) {
            alert(wX("NAME_REQ"));
            return;
          }
          try {
            await newTeamPromise(newname);
            alert(wX("TEAM_CREATED", { teamName: newname }));
            this._me = await WasabeeMe.waitGet(true);
          } catch (e) {
            console.error(e);
            alert(e.toString());
          }
          window.map.fire("wasabee:teams");
        },
        current: wX("NEW_TEAM_NAME"),
        placeholder: wX("AMAZ_TEAM_NAME"),
      });
      p.enable();
    };

    this.createDialog({
      title: wX("CUR_USER_INFO"),
      html: this._buildContent(),
      width: "auto",
      dialogClass: "wasabee",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.wasabeeButton,
    });
  },

  toggleTeam: async function (teamID, currentState) {
    let newState = "Off";
    if (currentState == "Off") newState = "On";
    try {
      await SetTeamState(teamID, newState);
      this._me = await WasabeeMe.waitGet(true);
    } catch (e) {
      console.error(e);
      alert(e.toString());
    }
    return newState;
  },

  toggleShareWD: async function (teamID, currentState) {
    let newState = "Off";
    if (currentState == "Off") newState = "On";
    try {
      await SetTeamShareWD(teamID, newState);
      await WasabeeMe.waitGet(true);
    } catch (e) {
      console.error(e);
      alert(e.toString());
    }
    return newState;
  },

  toggleLoadWD: async function (teamID, currentState) {
    let newState = "Off";
    if (currentState == "Off") newState = "On";
    try {
      await SetTeamLoadWD(teamID, newState);
      await WasabeeMe.waitGet(true);
    } catch (e) {
      console.error(e);
      alert(e.toString());
    }
    return newState;
  },
});

export default TeamListDialog;
