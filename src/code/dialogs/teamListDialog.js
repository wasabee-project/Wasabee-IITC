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
import TeamMembershipList from "./teamMembershipList";
import ConfirmDialog from "./confirmDialog";
import ManageTeamDialog from "./manageTeamDialog";
import wX from "../wX";
import { displayError, displayInfo } from "../error";

const TeamListDialog = WDialog.extend({
  statics: {
    TYPE: "wasabeeButton",
  },

  addHooks: async function () {
    WDialog.prototype.addHooks.call(this);
    this._me = await WasabeeMe.waitGet(true, true); // no cache unless server error
    window.map.on("wasabee:teams", this.update, this);
    window.map.on("wasabee:logout", this.closeDialog, this);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.map.off("wasabee:teams", this.update, this);
    window.map.off("wasabee:logout", this.closeDialog, this);
  },

  update: function () {
    if (!this._enabled) return;
    this._me = WasabeeMe.localGet();
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
        format: (row, value, obj) => {
          const link = L.DomUtil.create("a", null, row);
          link.textContent = value ? "On" : "Off";
          if (value) L.DomUtil.addClass(link, "enl");
          link.onclick = async () => {
            await this.toggleTeam(obj.ID, value);
            this.update();
          };
        },
      },
      {
        name: "Share W-D Keys",
        value: (team) => team.ShareWD,
        format: (row, value, obj) => {
          const link = L.DomUtil.create("a", null, row);
          link.textContent = value ? "On" : "Off";
          if (value) L.DomUtil.addClass(link, "enl");
          link.onclick = async () => {
            await this.toggleShareWD(obj.ID, value);
            this.update();
            window.map.fire("wasabee:defensivekeys");
          };
        },
      },
      {
        name: "Load W-D Keys",
        value: (team) => team.LoadWD,
        format: (row, value, obj) => {
          const link = L.DomUtil.create("a", null, row);
          link.textContent = value ? "On" : "Off";
          if (value) L.DomUtil.addClass(link, "enl");
          link.onclick = async () => {
            await this.toggleLoadWD(obj.ID, value);
            this.update();
            window.map.fire("wasabee:defensivekeys");
          };
        },
      },
      {
        name: "",
        value: () => "",
        sort: null,
        format: (row, value, obj) => {
          const link = L.DomUtil.create("a", null, row);
          link.textContent = "";
          if (this._me.id != obj.Owner) {
            link.textContent = wX("LEAVE");
            L.DomEvent.on(link, "click", (ev) => {
              L.DomEvent.stop(ev);
              const cd = new ConfirmDialog({
                title: wX("dialog.leave_team.title", { teamName: obj.Name }),
                label: wX("dialog.leave_team.text"),
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
            displayError(wX("NAME_REQ"));
            return;
          }
          try {
            await newTeamPromise(newname);
            displayInfo(wX("TEAM_CREATED", { teamName: newname }));
            this._me = await WasabeeMe.waitGet(true);
          } catch (e) {
            console.error(e);
            displayError(e);
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
    const newState = currentState ? "Off" : "On";
    try {
      await SetTeamState(teamID, newState);
      this._me = await WasabeeMe.waitGet(true);
    } catch (e) {
      console.error(e);
      displayError(e);
    }
    return newState;
  },

  toggleShareWD: async function (teamID, currentState) {
    const newState = currentState ? "Off" : "On";
    try {
      await SetTeamShareWD(teamID, newState);
      await WasabeeMe.waitGet(true);
    } catch (e) {
      console.error(e);
      displayError(e);
    }
    return newState;
  },

  toggleLoadWD: async function (teamID, currentState) {
    const newState = currentState ? "Off" : "On";
    try {
      await SetTeamLoadWD(teamID, newState);
      await WasabeeMe.waitGet(true);
    } catch (e) {
      console.error(e);
      displayError(e);
    }
    return newState;
  },
});

export default TeamListDialog;
