import { WDialog } from "../leafletClasses";
import {
  removeAgentFromTeamPromise,
  setAgentTeamSquadPromise,
  addAgentToTeamPromise,
  renameTeamPromise,
  rocksPromise,
  deleteTeamPromise,
  GetWasabeeServer,
} from "../server";
import WasabeeMe from "../me";
import WasabeeTeam from "../team";
import Sortable from "../../lib/sortable";
import PromptDialog from "./promptDialog";
import wX from "../wX";
import ConfirmDialog from "./confirmDialog";
import { postToFirebase } from "../firebaseSupport";

// The update method here is the best so far, bring all the others up to this one
const ManageTeamDialog = WDialog.extend({
  statics: {
    TYPE: "manageTeamDialog",
  },

  initialize: function (map = window.map, options) {
    this.type = ManageTeamDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
    postToFirebase({ id: "analytics", action: ManageTeamDialog.TYPE });
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    const context = this;
    // magic context incantation to make "this" work...
    this._UIUpdateHook = () => {
      context.update();
    };
    window.addHook("wasabeeUIUpdate", this._UIUpdateHook);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.removeHook("wasabeeUIUpdate", this._UIUpdateHook);
  },

  setup: async function (team) {
    this._team = team;
    this._table = new Sortable();
    this._table.fields = [
      {
        name: wX("AGENT"),
        value: (agent) => agent.name,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, agent) => cell.appendChild(agent.formatDisplay()),
      },
      {
        name: "Enabled",
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
            const squadDialog = new PromptDialog(window.map);
            squadDialog.setup(
              `Set Squad for ${obj.name}`,
              "Squad",
              async () => {
                if (squadDialog.inputField.value) {
                  try {
                    await setAgentTeamSquadPromise(
                      obj.id,
                      this._team.ID,
                      squadDialog.inputField.value
                    );
                    window.runHooks("wasabeeUIUpdate");
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
              }
            );
            squadDialog.current = value;
            squadDialog.placeholder = "boots";
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
            const con = new ConfirmDialog();
            con.setup(
              `${button.textContent}: ${obj.name}`,
              `${button.textContent}: ${obj.name}?`,
              async () => {
                try {
                  await removeAgentFromTeamPromise(value, this._team.ID);
                } catch (e) {
                  console.error(e);
                }
                window.runHooks("wasabeeUIUpdate");
              }
            );
            con.enable();
          });
        },
      },
    ];
    this._table.sortBy = 0;

    try {
      // max 5 seconds cache for this screen
      const teamdata = await WasabeeTeam.waitGet(team.ID, 5);
      if (teamdata.agents && teamdata.agents.length > 0) {
        this._table.items = teamdata.agents;
      }
    } catch (e) {
      console.error(e);
    }
  },

  update: function () {
    this.setup(this._team); // populate the list
    const container = this._dialogContent(); // build the UI
    // this is the correct way to change out a dialog's contents, audit the entire codebase making this change
    this._dialog.html(container);
    this._dialog.dialog("option", "title", wX("MANAGE_TEAM", this._team.Name));
  },

  _dialogContent: function () {
    const container = L.DomUtil.create("div", "container");
    const list = L.DomUtil.create("div", "list", container);
    list.appendChild(this._table.table);

    const addlabel = L.DomUtil.create("label", null, container);
    addlabel.textContent = wX("ADD_AGENT");
    const addField = L.DomUtil.create("input", null, container);
    addField.placeholder = wX("INGNAME_GID");
    const addButton = L.DomUtil.create("button", null, container);
    addButton.textContent = wX("ADD");
    L.DomEvent.on(addButton, "click", async (ev) => {
      L.DomEvent.stop(ev);
      try {
        await addAgentToTeamPromise(addField.value, this._team.ID);
        alert(wX("ADD_SUCC_INSTR"));
        window.runHooks("wasabeeUIUpdate");
      } catch (e) {
        console.error(e);
        alert(e.toString());
      }
    });

    const renamelabel = L.DomUtil.create("label", null, container);
    renamelabel.textContent = wX("RENAME_TEAM");
    const renameField = L.DomUtil.create("input", null, container);
    renameField.placeholder = wX("BAT_TOAD");
    renameField.value = this._team.Name;
    const renameButton = L.DomUtil.create("button", null, container);
    renameButton.textContent = wX("RENAME");
    L.DomEvent.on(renameButton, "click", async (ev) => {
      L.DomEvent.stop(ev);
      try {
        await renameTeamPromise(this._team.ID, renameField.value);
        alert(`renamed to ${renameField.value}`);
        this._team.Name = renameField.value; // for display
        window.runHooks("wasabeeUIUpdate");
      } catch (e) {
        console.error(e);
        alert(e.toString());
      }
    });

    const rockslabel = L.DomUtil.create("label", null, container);
    rockslabel.textContent = wX("ROCKS_COM");
    const rockscommField = L.DomUtil.create("input", null, container);
    rockscommField.placeholder = "xxyyzz.com";
    if (this._team.RocksComm) rockscommField.value = this._team.RocksComm;
    const rocksapilabel = L.DomUtil.create("label", null, container);
    rocksapilabel.textContent = wX("API_KEY");
    const rocksapiField = L.DomUtil.create("input", null, container);
    rocksapiField.placeholder = "...";
    if (this._team.RocksKey) rocksapiField.value = this._team.RocksKey;
    const rocksButton = L.DomUtil.create("button", null, container);
    rocksButton.textContent = wX("SET");
    L.DomEvent.on(rocksButton, "click", async (ev) => {
      L.DomEvent.stop(ev);
      try {
        await rocksPromise(
          this._team.ID,
          rockscommField.value,
          rocksapiField.value
        );
        alert("updated rocks info");
        this._team.RocksComm = rockscommField.value; // for display
        this._team.RocksKey = rocksapiField.value; // for display
        window.runHooks("wasabeeUIUpdate");
      } catch (e) {
        console.error(e);
        alert(e.toString());
      }
    });

    const removeLabel = L.DomUtil.create("label", null, container);
    removeLabel.textContent = wX("REMOVE_TEAM");
    const removeButton = L.DomUtil.create("button", null, container);
    removeButton.textContent = wX("REMOVE");
    L.DomEvent.on(removeButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      const cd = new ConfirmDialog();
      cd.setup(
        wX("REMOVE_TEAM_CONFIRM_TITLE", this._team.Name),
        wX("REMOVE_TEAM_CONFIRM_LABEL", this._team.Name),
        async () => {
          try {
            await deleteTeamPromise(this._team.ID);
            alert(`${this._team.Name} removed`);
            this._dialog.dialog("close");
            await WasabeeMe.waitGet(true);
          } catch (e) {
            console.error(e);
            alert(e.toString());
          }
        }
      );
      cd.enable();
    });

    if (this._team.jkt) {
      const joinLinkLabel = L.DomUtil.create("label", null, container);
      joinLinkLabel.textContent = wX("JOIN_LINK");
      const joinLink = L.DomUtil.create("a", null, container);
      const jl =
        GetWasabeeServer() +
        "/api/v1/team/" +
        this._team.ID +
        "/join/" +
        this._team.jkt;
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
      title: wX("MANAGE_TEAM", this._team.Name),
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
