import { WDialog } from "../leafletClasses";
import WasabeeMe from "../me";
import Sortable from "../../lib/sortable";
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
    this._me = await WasabeeMe.waitGet(true);
    WDialog.prototype.addHooks.call(this);
    window.map.on("wasabeeUIUpdate", this.update, this);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.map.off("wasabeeUIUpdate", this.update, this);
  },

  update: async function () {
    if (!this._enabled) return;
    this._me = await WasabeeMe.waitGet();
    this._dialog.html(this._buildContent());
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
            const td = new TeamMembershipList(window.map, { teamID: team.ID });
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
          link.onclick = () => {
            this.toggleTeam(obj.ID, curstate);
            window.map.fire(
              "wasabeeDkeys",
              { reason: "teamListDialog" },
              false
            );
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
          link.onclick = () => {
            this.toggleShareWD(obj.ID, curshare);
            window.map.fire(
              "wasabeeDkeys",
              { reason: "teamListDialog" },
              false
            );
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
          link.onclick = () => {
            this.toggleLoadWD(obj.ID, curload);
            window.map.fire(
              "wasabeeDkeys",
              { reason: "teamListDialog" },
              false
            );
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
              const cd = new ConfirmDialog(window.map, {
                title: `Leave ${obj.Name}?`,
                label: `If you leave ${obj.Name} you cannot rejoin unless the owner re-adds you.`,
                callback: async () => {
                  try {
                    await leaveTeamPromise(obj.ID);
                    await WasabeeMe.waitGet(true);
                    window.map.fire(
                      "wasabeeDkeys",
                      { reason: "teamListDialog" },
                      false
                    );
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
              const mtd = new ManageTeamDialog(window.map, { team: obj });
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
      this._dialog.dialog("close");
    };
    buttons[wX("NEW_TEAM")] = () => {
      const p = new PromptDialog(window.map, {
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
            alert(wX("TEAM_CREATED", newname));
            await WasabeeMe.waitGet(true); // triggers UIUpdate
          } catch (e) {
            console.error(e);
            alert(e.toString());
          }
        },
        current: wX("NEW_TEAM_NAME"),
        placeholder: wX("AMAZ_TEAM_NAME"),
      });
      p.enable();
    };

    this._dialog = window.dialog({
      title: wX("CUR_USER_INFO"),
      html: this._buildContent(),
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-wasabee",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.wasabeeButton,
    });
    this._dialog.dialog("option", "buttons", buttons);
  },

  toggleTeam: async function (teamID, currentState) {
    let newState = "Off";
    if (currentState == "Off") newState = "On";
    try {
      await SetTeamState(teamID, newState);
      await WasabeeMe.waitGet(true);
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
