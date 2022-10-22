import { WDialog } from "../leafletClasses";
import {
  removeAgentFromTeamPromise,
  setAgentTeamCommentPromise,
  addAgentToTeamPromise,
  renameTeamPromise,
  rocksPromise,
  deleteTeamPromise,
  GetWasabeeServer,
  deleteJoinLinkPromise,
  createJoinLinkPromise,
} from "../server";
import Sortable from "../sortable";
import PromptDialog from "./promptDialog";
import wX from "../wX";
import ConfirmDialog from "./confirmDialog";
import { constants } from "../static";

import * as AgentUI from "../ui/agent";
import { displayError, displayInfo } from "../error";
import { getTeam, getMe } from "../model/cache";

// The update method here is the best so far, bring all the others up to this one
const ManageTeamDialog = WDialog.extend({
  statics: {
    TYPE: "manageTeamDialog",
  },

  options: {
    // team : MeTeam
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    window.map.on("wasabee:team:update", this.update, this);
    window.map.on("wasabee:logout", this.closeDialog, this);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.map.off("wasabee:team:update", this.update, this);
    window.map.off("wasabee:logout", this.closeDialog, this);
  },

  _setupTable: async function () {
    const table = new Sortable();
    table.fields = [
      {
        name: wX("AGENT"),
        value: (agent) => agent.getName(),
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, agent) =>
          cell.appendChild(AgentUI.formatDisplay(agent)),
      },
      {
        name: wX("TEAM STATE"),
        value: (agent) => agent.shareLocation,
        sort: (a, b) => a && !b,
      },
      {
        name: wX("COMMENT"),
        value: (agent) => agent.comment,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, obj) => {
          const button = L.DomUtil.create("a", null, cell);
          button.textContent = value;
          L.DomEvent.on(button, "click", (ev) => {
            L.DomEvent.stop(ev);
            const commentDialog = new PromptDialog({
              title: wX("dialog.agent_comment.title", { agentName: obj.name }),
              label: wX("dialog.agent_comment.text"),
              callback: async () => {
                try {
                  await setAgentTeamCommentPromise(
                    obj.id,
                    this.options.team.ID,
                    commentDialog.inputField.value
                  );
                  // refresh team data
                  await getTeam(this.options.team.ID, 0);
                  window.map.fire("wasabee:team:update");
                } catch (e) {
                  console.error(e);
                  displayError(e);
                }
              },
              current: value,
              placeholder: "boots",
            });
            commentDialog.enable();
          });
        },
      },
      {
        name: wX("REMOVE"),
        value: (agent) => agent.id,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, obj) => {
          const button = L.DomUtil.create("button", null, cell);
          button.textContent = wX("REMOVE");
          L.DomEvent.on(button, "click", (ev) => {
            L.DomEvent.stop(ev);
            const con = new ConfirmDialog({
              title: wX("dialog.remove_agent.title", { agentName: obj.name }),
              label: wX("dialog.remove_agent.text", {
                agentName: obj.name,
                teamName: this.options.team.Name,
              }),
              type: "agent",
              callback: async () => {
                try {
                  await removeAgentFromTeamPromise(value, this.options.team.ID);
                  // refresh team data
                  await getTeam(this.options.team.ID, 0);
                } catch (e) {
                  console.error(e);
                }
                window.map.fire("wasabee:team:update");
              },
            });
            con.enable();
          });
        },
      },
    ];
    table.sortBy = 0;

    await this._refreshTeam(table);

    return table;
  },

  _refreshTeam: async function (table) {
    try {
      // max 5 seconds cache for this screen
      const teamdata = await getTeam(this.options.team.ID, 5);
      const agents = teamdata.agents;
      if (agents && agents.length > 0) {
        table.items = agents;
      }
    } catch (e) {
      console.error(e);
    }
  },

  update: async function () {
    const container = await this._dialogContent(); // build the UI
    // this is the correct way to change out a dialog's contents, audit the entire codebase making this change
    this.setContent(container);
    this.setTitle(wX("MANAGE_TEAM", { teamName: this.options.team.Name }));
  },

  _dialogContent: async function () {
    const container = L.DomUtil.create("div", "container");
    const list = L.DomUtil.create("div", "list", container);

    const table = await this._setupTable();
    list.appendChild(table.table);
    await table.done;

    const team = await getTeam(this.options.team.ID);
    this.options.team.Name = team.name;

    const addlabel = L.DomUtil.create("label", null, container);
    addlabel.textContent = wX("ADD_AGENT");
    const addField = L.DomUtil.create("input", null, container);
    addField.placeholder = wX("INGNAME_GID");
    const addButton = L.DomUtil.create("button", null, container);
    addButton.textContent = wX("ADD");
    L.DomEvent.on(addButton, "click", async (ev) => {
      L.DomEvent.stop(ev);
      try {
        await addAgentToTeamPromise(addField.value, this.options.team.ID);
        // refresh team data
        await getTeam(this.options.team.ID, 0);
        displayInfo(wX("ADD_SUCC_INSTR"));
        window.map.fire("wasabee:team:update");
      } catch (e) {
        console.error(e);
        displayError(e);
      }
    });

    const renamelabel = L.DomUtil.create("label", null, container);
    renamelabel.textContent = wX("RENAME_TEAM");
    const renameField = L.DomUtil.create("input", null, container);
    renameField.placeholder = wX("BAT_TOAD");
    renameField.value = team.name;
    const renameButton = L.DomUtil.create("button", null, container);
    renameButton.textContent = wX("RENAME");
    L.DomEvent.on(renameButton, "click", async (ev) => {
      L.DomEvent.stop(ev);
      try {
        await renameTeamPromise(team.id, renameField.value);
        // refresh team data
        await getTeam(this.options.team.ID, 0);
        window.map.fire("wasabee:team:update");
      } catch (e) {
        console.error(e);
        displayError(e);
      }
    });

    const rockslabel = L.DomUtil.create("label", null, container);
    rockslabel.textContent = wX("ROCKS_COM");
    const rockscommField = L.DomUtil.create("input", null, container);
    rockscommField.placeholder = "xxyyzz.com";
    if (team.rc) rockscommField.value = team.rc;
    const rocksapilabel = L.DomUtil.create("label", null, container);
    rocksapilabel.textContent = wX("API_KEY");
    const rocksapiField = L.DomUtil.create("input", null, container);
    rocksapiField.placeholder = "...";
    if (team.rk) rocksapiField.value = team.rk;
    const rocksButton = L.DomUtil.create("button", null, container);
    rocksButton.textContent = wX("SET");
    L.DomEvent.on(rocksButton, "click", async (ev) => {
      L.DomEvent.stop(ev);
      try {
        await rocksPromise(team.id, rockscommField.value, rocksapiField.value);
        displayInfo("updated rocks info");
        this.update();
      } catch (e) {
        console.error(e);
        displayError(e);
      }
    });

    const joinlinklabel = L.DomUtil.create("label", null, container);
    joinlinklabel.textContent = wX("dialog.team_manage.join_link");
    if (team.jlt) {
      const joinlink = L.DomUtil.create("input", null, container);
      const server = GetWasabeeServer();
      joinlink.value = L.Util.template(constants.JOIN_TEAM_TEMPLATE, {
        server: server,
        teamid: team.id,
        token: team.jlt,
      });
      joinlink.readOnly = true;
      L.DomEvent.on(joinlink, "click", (ev) => ev.target.select());
      const joinlinkdel = L.DomUtil.create("button", null, container);
      joinlinkdel.textContent = wX("dialog.team_manage.join_link.revoke");
      L.DomEvent.on(joinlinkdel, "click", async (ev) => {
        L.DomEvent.stop(ev);
        await deleteJoinLinkPromise(team.id);
        this.update();
      });
    } else {
      L.DomUtil.create("span", null, container).textContent = wX("NOT_SET");
      const joinlinkadd = L.DomUtil.create("button", null, container);
      joinlinkadd.textContent = wX("dialog.team_manage.join_link.create");
      L.DomEvent.on(joinlinkadd, "click", async (ev) => {
        L.DomEvent.stop(ev);
        await createJoinLinkPromise(team.id);
        this.update();
      });
    }

    const removeLabel = L.DomUtil.create("label", null, container);
    removeLabel.textContent = wX("REMOVE_TEAM");
    const removeButton = L.DomUtil.create("button", null, container);
    removeButton.textContent = wX("REMOVE");
    L.DomEvent.on(removeButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      const cd = new ConfirmDialog({
        title: wX("REMOVE_TEAM_CONFIRM_TITLE", {
          teamName: team.name,
        }),
        label: wX("REMOVE_TEAM_CONFIRM_LABEL", {
          teamName: team.name,
        }),
        callback: async () => {
          try {
            await deleteTeamPromise(team.id);
            this.closeDialog();
            await getMe(true);
          } catch (e) {
            console.error(e);
            displayError(e);
          }
          window.map.fire("wasabee:teams");
        },
      });
      cd.enable();
    });

    return container;
  },

  _displayDialog: async function () {
    const container = await this._dialogContent();
    const buttons = {};
    buttons[wX("CLOSE")] = () => {
      this.closeDialog();
    };

    this.createDialog({
      title: wX("MANAGE_TEAM", { teamName: this.options.team.Name }),
      width: "auto",
      html: container,
      dialogClass: "manageteam",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.manageTeam,
    });
  },
});

export default ManageTeamDialog;
