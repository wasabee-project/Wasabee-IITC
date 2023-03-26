import { WDialog } from "../leafletClasses";
import { WasabeeMe } from "../model";
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
import { getMe } from "../model/cache";
import statics from "../static";

const TeamListDialog = WDialog.extend({
  statics: {
    TYPE: "wasabeeButton",
  },

  addHooks: async function () {
    WDialog.prototype.addHooks.call(this);
    this._me = await getMe(true, true); // no cache unless server error
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
          link.textContent = value
            ? wX("dialog.common.on")
            : wX("dialog.common.off");
          if (value) L.DomUtil.addClass(link, "enl");
          link.onclick = async () => {
            await this.toggleTeam(obj.ID, value);
            this.update();
          };
        },
      },
      {
        name: wX("dialog.team_list.share_wd_keys"),
        value: (team) => team.ShareWD,
        format: (row, value, obj) => {
          const link = L.DomUtil.create("a", null, row);
          link.textContent = value
            ? wX("dialog.common.on")
            : wX("dialog.common.off");
          if (value) L.DomUtil.addClass(link, "enl");
          link.onclick = async () => {
            await this.toggleShareWD(obj.ID, value);
            this.update();
            window.map.fire("wasabee:defensivekeys");
          };
        },
      },
      {
        name: wX("dialog.team_list.load_wd_keys"),
        value: (team) => team.LoadWD,
        format: (row, value, obj) => {
          const link = L.DomUtil.create("a", null, row);
          link.textContent = value
            ? wX("dialog.common.on")
            : wX("dialog.common.off");
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
                label: wX("dialog.leave_team.text", { teamName: obj.Name }),
                type: "team",
                callback: async () => {
                  try {
                    await leaveTeamPromise(obj.ID);
                    this._me = await getMe(true);
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
    buttons[wX("CLOSE")] = () => {
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
            this._me = await getMe(true);
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
      id: statics.dialogNames.wasabeeButton,
    });
  },

  toggleTeam: async function (teamID, currentState) {
    const newState = currentState ? "Off" : "On";
    try {
      await SetTeamState(teamID, newState);
      this._me = await getMe(true);
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
      await getMe(true);
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
      await getMe(true);
    } catch (e) {
      console.error(e);
      displayError(e);
    }
    return newState;
  },
});

export default TeamListDialog;
