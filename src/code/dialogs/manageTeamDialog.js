import { WDialog } from "../leafletClasses";
import {
  removeAgentFromTeamPromise,
  setAgentTeamSquadPromise,
  addAgentToTeamPromise,
  renameTeamPromise,
  rocksPromise,
  deleteTeamPromise,
  GetWasabeeServer,
  deleteJoinLinkPromise,
  createJoinLinkPromise,
} from "../server";
import WasabeeMe from "../me";
import WasabeeTeam from "../team";
import Sortable from "../../lib/sortable";
import PromptDialog from "./promptDialog";
import wX from "../wX";
import ConfirmDialog from "./confirmDialog";

// The update method here is the best so far, bring all the others up to this one
const ManageTeamDialog = WDialog.extend({
  statics: {
    TYPE: "manageTeamDialog",
  },

  options: {
    // team
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    window.map.on("wasabeeUIUpdate", this.update, this);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.map.off("wasabeeUIUpdate", this.update, this);
  },

  _setupTable: function () {
    const table = new Sortable();
    table.fields = [
      {
        name: wX("AGENT"),
        value: (agent) => agent.name,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, agent) =>
          cell.appendChild(agent.formatDisplay(this.options.team.id)),
      },
      {
        name: wX("TEAM STATE"),
        value: (agent) => agent.state,
        sort: (a, b) => a && !b,
        // , format: (cell, value) => (cell.textContent = value)
      },
      {
        name: wX("SQUAD"),
        value: (agent) => agent.squad,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, obj) => {
          const button = L.DomUtil.create("a", null, cell);
          button.textContent = value;
          L.DomEvent.on(button, "click", (ev) => {
            L.DomEvent.stop(ev);
            const squadDialog = new PromptDialog({
              title: `Set Squad for ${obj.name}`,
              label: "Squad",
              callback: async () => {
                if (squadDialog.inputField.value) {
                  try {
                    await setAgentTeamSquadPromise(
                      obj.id,
                      this.options.team.ID,
                      squadDialog.inputField.value
                    );
                    window.map.fire(
                      "wasabeeUIUpdate",
                      { reason: "manageTeamDialog" },
                      false
                    );
                    alert(
                      `squad updated to ${squadDialog.inputField.value} for ${obj.name}`
                    );
                  } catch (e) {
                    console.error(e);
                    alert(e.toString());
                  }
                } else {
                  alert(wX("INPUT_SQUAD_NAME"));
                }
              },
              current: value,
              placeholder: "boots",
            });
            squadDialog.enable();
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
              title: `${button.textContent}: ${obj.name}`,
              label: `${button.textContent}: ${obj.name}?`,
              callback: async () => {
                try {
                  await removeAgentFromTeamPromise(value, this.options.team.ID);
                } catch (e) {
                  console.error(e);
                }
                window.map.fire(
                  "wasabeeUIUpdate",
                  { reason: "manageTeamDialog" },
                  false
                );
              },
            });
            con.enable();
          });
        },
      },
    ];
    table.sortBy = 0;

    // async populate
    this._refreshTeam(table);

    return table;
  },

  _refreshTeam: async function (table) {
    try {
      // max 5 seconds cache for this screen
      const teamdata = await WasabeeTeam.waitGet(this.options.team.ID, 5);
      if (teamdata.agents && teamdata.agents.length > 0) {
        table.items = teamdata.agents;
      }
    } catch (e) {
      console.error(e);
    }
  },

  update: function () {
    const container = this._dialogContent(); // build the UI
    // this is the correct way to change out a dialog's contents, audit the entire codebase making this change
    this._dialog.html(container);
    this._dialog.dialog(
      "option",
      "title",
      wX("MANAGE_TEAM", this.options.team.Name)
    );
  },

  _dialogContent: function () {
    const container = L.DomUtil.create("div", "container");
    const list = L.DomUtil.create("div", "list", container);

    const table = this._setupTable();
    list.appendChild(table.table);

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
        alert(wX("ADD_SUCC_INSTR"));
        window.map.fire(
          "wasabeeUIUpdate",
          { reason: "manageTeamDialog" },
          false
        );
      } catch (e) {
        console.error(e);
        alert(e.toString());
      }
    });

    const renamelabel = L.DomUtil.create("label", null, container);
    renamelabel.textContent = wX("RENAME_TEAM");
    const renameField = L.DomUtil.create("input", null, container);
    renameField.placeholder = wX("BAT_TOAD");
    renameField.value = this.options.team.Name;
    const renameButton = L.DomUtil.create("button", null, container);
    renameButton.textContent = wX("RENAME");
    L.DomEvent.on(renameButton, "click", async (ev) => {
      L.DomEvent.stop(ev);
      try {
        await renameTeamPromise(this.options.team.ID, renameField.value);
        alert(`renamed to ${renameField.value}`);
        this.options.team.Name = renameField.value; // for display
        window.map.fire(
          "wasabeeUIUpdate",
          { reason: "manageTeamDialog" },
          false
        );
      } catch (e) {
        console.error(e);
        alert(e.toString());
      }
    });

    const rockslabel = L.DomUtil.create("label", null, container);
    rockslabel.textContent = wX("ROCKS_COM");
    const rockscommField = L.DomUtil.create("input", null, container);
    rockscommField.placeholder = "xxyyzz.com";
    if (this.options.team.RocksComm)
      rockscommField.value = this.options.team.RocksComm;
    const rocksapilabel = L.DomUtil.create("label", null, container);
    rocksapilabel.textContent = wX("API_KEY");
    const rocksapiField = L.DomUtil.create("input", null, container);
    rocksapiField.placeholder = "...";
    if (this.options.team.RocksKey)
      rocksapiField.value = this.options.team.RocksKey;
    const rocksButton = L.DomUtil.create("button", null, container);
    rocksButton.textContent = wX("SET");
    L.DomEvent.on(rocksButton, "click", async (ev) => {
      L.DomEvent.stop(ev);
      try {
        await rocksPromise(
          this.options.team.ID,
          rockscommField.value,
          rocksapiField.value
        );
        alert("updated rocks info");
        this.options.team.RocksComm = rockscommField.value; // for display
        this.options.team.RocksKey = rocksapiField.value; // for display
        window.map.fire(
          "wasabeeUIUpdate",
          { reason: "manageTeamDialog" },
          false
        );
      } catch (e) {
        console.error(e);
        alert(e.toString());
      }
    });

    const joinlinklabel = L.DomUtil.create("label", null, container);
    joinlinklabel.textContent = "Join Link";
    if (this.options.team.JoinLinkToken != "") {
      const joinlink = L.DomUtil.create("a", null, container);
      const server = GetWasabeeServer();
      joinlink.href = `${server}/api/v1/team/${this.options.team.ID}/join/${this.options.team.JoinLinkToken}`;
      joinlink.textContent = joinlink.href;
      const joinlinkdel = L.DomUtil.create("button", null, container);
      joinlinkdel.textContent = "Revoke";
      L.DomEvent.on(joinlinkdel, "click", async (ev) => {
        L.DomEvent.stop(ev);
        await deleteJoinLinkPromise(this.options.team.ID);
        this.options.team.JoinLinkToken = "";
        window.map.fire(
          "wasabeeUIUpdate",
          { reason: "manageTeamDialog" },
          false
        );
      });
    } else {
      L.DomUtil.create("span", null, container).textContent = "not set";
      const joinlinkadd = L.DomUtil.create("button", null, container);
      joinlinkadd.textContent = "Create";
      L.DomEvent.on(joinlinkadd, "click", async (ev) => {
        L.DomEvent.stop(ev);
        const response = await createJoinLinkPromise(this.options.team.ID);
        const j = JSON.parse(response);
        this.options.team.JoinLinkToken = j.Key;
        window.map.fire(
          "wasabeeUIUpdate",
          { reason: "manageTeamDialog" },
          false
        );
      });
    }

    const removeLabel = L.DomUtil.create("label", null, container);
    removeLabel.textContent = wX("REMOVE_TEAM");
    const removeButton = L.DomUtil.create("button", null, container);
    removeButton.textContent = wX("REMOVE");
    L.DomEvent.on(removeButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      const cd = new ConfirmDialog({
        title: wX("REMOVE_TEAM_CONFIRM_TITLE", this.options.team.Name),
        label: wX("REMOVE_TEAM_CONFIRM_LABEL", this.options.team.Name),
        callback: async () => {
          try {
            await deleteTeamPromise(this.options.team.ID);
            alert(`${this.options.team.Name} removed`);
            this._dialog.dialog("close");
            await WasabeeMe.waitGet(true);
          } catch (e) {
            console.error(e);
            alert(e.toString());
          }
        },
      });
      cd.enable();
    });

    if (this.options.team.jkt) {
      const joinLinkLabel = L.DomUtil.create("label", null, container);
      joinLinkLabel.textContent = wX("JOIN_LINK");
      const joinLink = L.DomUtil.create("a", null, container);
      const jl =
        GetWasabeeServer() +
        "/api/v1/team/" +
        this.options.team.ID +
        "/join/" +
        this.options.team.jkt;
      joinLink.href = jl;
      joinLink.textContent = jl;
    }
    return container;
  },

  _displayDialog: function () {
    const container = this._dialogContent();
    const buttons = {};
    buttons[wX("CLOSE")] = () => {
      this._dialog.dialog("close");
    };

    this._dialog = window.dialog({
      title: wX("MANAGE_TEAM", this.options.team.Name),
      width: "auto",
      html: container,
      dialogClass: "wasabee-dialog wasabee-dialog-manageteam",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.manageTeam,
    });
    this._dialog.dialog("option", "buttons", buttons);
  },
});

export default ManageTeamDialog;
