import { Feature } from "../leafletDrawImports";
import {
  teamPromise,
  removeAgentFromTeamPromise,
  setAgentTeamSquadPromise,
  addAgentToTeamPromise,
  renameTeamPromise,
  rocksPromise,
  deleteTeamPromise
} from "../server";
import Sortable from "../../lib/sortable";
import { getSelectedOperation } from "../selectedOp";
import PromptDialog from "./promptDialog";
import wX from "../wX";
import ConfirmDialog from "./confirmDialog";

// The update method here is the best so far, bring all the others up to this one
const ManageTeamDialog = Feature.extend({
  statics: {
    TYPE: "manageTeamDialog"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = ManageTeamDialog.TYPE;
    Feature.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    Feature.prototype.addHooks.call(this);
    const context = this;
    // magic context incantation to make "this" work...
    this._UIUpdateHook = newOpData => {
      context.update(newOpData);
    };
    window.addHook("wasabeeUIUpdate", this._UIUpdateHook);
    this._displayDialog();
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
    window.removeHook("wasabeeUIUpdate", this._UIUpdateHook);
  },

  setup: function(team) {
    this._team = team;
    this._table = new Sortable();
    this._table.fields = [
      {
        name: wX("AGENT"),
        value: agent => agent.name,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, agent) => cell.appendChild(agent.formatDisplay())
      },
      {
        name: "Enabled",
        value: agent => agent.state,
        sort: (a, b) => a && !b,
        format: (cell, value) => (cell.textContent = value)
      },
      {
        name: wX("SQUAD"),
        value: agent => agent.squad,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, obj) => {
          const button = L.DomUtil.create("a", null, cell);
          button.textContent = value;
          L.DomEvent.on(button, "click", () => {
            const squadDialog = new PromptDialog(window.map);
            squadDialog.setup(`Set Squad for ${obj.name}`, "Squad", () => {
              if (squadDialog.inputField.value) {
                setAgentTeamSquadPromise(
                  obj.id,
                  this._team.ID,
                  squadDialog.inputField.value
                ).then(
                  () => {
                    window.runHooks("wasabeeUIUpdate", getSelectedOperation());
                    alert(
                      `squad updated to ${squadDialog.inputField.value} for ${obj.name}`
                    );
                  },
                  reject => {
                    console.log(reject);
                    alert(reject);
                  }
                );
              } else {
                alert(wX("INPUT_SQUAD_NAME"));
              }
            });
            squadDialog.current = value;
            squadDialog.placeholder = "boots";
            squadDialog.enable();
          });
        }
      },
      {
        name: wX("REMOVE"),
        value: agent => agent.id,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value) => {
          const button = L.DomUtil.create("a", null, cell);
          button.textContent = "remove";
          L.DomEvent.on(button, "click", () => {
            removeAgentFromTeamPromise(value, this._team.ID).then(
              () => {
                window.runHooks("wasabeeUIUpdate", getSelectedOperation());
              },
              reject => {
                alert(reject);
                console.log(reject);
              }
            );
          });
        }
      }
    ];
    this._table.sortBy = 0;

    teamPromise(team.ID).then(
      teamdata => {
        if (teamdata.agents && teamdata.agents.length > 0) {
          this._table.items = teamdata.agents;
        }
      },
      reject => {
        console.log(reject);
        alert(reject);
      }
    );
  },

  update: function() {
    this.setup(this._team); // populate the list
    const container = L.DomUtil.create("div", null);
    this._dialogContent(container); // build the UI
    // this is the correct way to change out a dialog's contents, audit the entire codebase making this change
    this._dialog.html(container);
    this._dialog.dialog("option", "title", "MANAGE: " + this._team.Name);
  },

  _dialogContent: function(container) {
    const list = L.DomUtil.create("div", null, container);
    list.appendChild(this._table.table);

    const add = L.DomUtil.create("div", null, container);
    const addlabel = L.DomUtil.create("label", null, add);
    addlabel.textContent = wX("ADD_AGENT");
    const addField = L.DomUtil.create("input", null, addlabel);
    addField.placeholder = wX("INGNAME_GID");
    const addButton = L.DomUtil.create("button", null, addlabel);
    addButton.textContent = wX("ADD");
    L.DomEvent.on(addButton, "click", () => {
      addAgentToTeamPromise(addField.value, this._team.ID).then(
        () => {
          alert(wX("ADD_SUCC_INSTR"));
          window.runHooks("wasabeeUIUpdate", getSelectedOperation());
        },
        reject => {
          console.log(reject);
          alert(reject);
        }
      );
    });

    const rename = L.DomUtil.create("div", null, container);
    const renamelabel = L.DomUtil.create("label", null, rename);
    renamelabel.textContent = wX("RENAME_TEAM");
    const renameField = L.DomUtil.create("input", null, renamelabel);
    renameField.placeholder = wX("BAT_TOAD");
    renameField.value = this._team.Name;
    const renameButton = L.DomUtil.create("button", null, renamelabel);
    renameButton.textContent = wX("RENAME");
    L.DomEvent.on(renameButton, "click", () => {
      renameTeamPromise(this._team.ID, renameField.value).then(
        () => {
          alert(`renamed to ${renameField.value}`);
          this._team.Name = renameField.value; // for display
          window.runHooks("wasabeeUIUpdate", getSelectedOperation());
        },
        reject => {
          console.log(reject);
          alert(reject);
        }
      );
    });

    const rocks = L.DomUtil.create("div", null, container);
    const rockslabel = L.DomUtil.create("label", null, rocks);
    rockslabel.textContent = "enl.rocks community: ";
    const rockscommField = L.DomUtil.create("input", null, rockslabel);
    rockscommField.placeholder = "xxyyzz.com";
    if (this._team.RocksComm) rockscommField.value = this._team.RocksComm;
    const rocksapilabel = L.DomUtil.create("label", null, rocks);
    rocksapilabel.textContent = " api key: ";
    const rocksapiField = L.DomUtil.create("input", null, rocksapilabel);
    rocksapiField.placeholder = "...";
    if (this._team.RocksKey) rocksapiField.value = this._team.RocksKey;
    const rocksButton = L.DomUtil.create("button", null, rocks);
    rocksButton.textContent = "Set";
    L.DomEvent.on(rocksButton, "click", () => {
      rocksPromise(
        this._team.ID,
        rockscommField.value,
        rocksapiField.value
      ).then(
        () => {
          alert(`updated rocks info`);
          this._team.RocksComm = rockscommField.value; // for display
          this._team.RocksKey = rocksapiField.value; // for display
          window.runHooks("wasabeeUIUpdate", getSelectedOperation());
        },
        reject => {
          console.log(reject);
          alert(reject);
        }
      );
    });

    const remove = L.DomUtil.create("div", null, container);
    const removeLabel = L.DomUtil.create("label", null, remove);
    removeLabel.textContent = "Remove Team: ";
    const removeButton = L.DomUtil.create("button", null, removeLabel);
    removeButton.textContent = "Remove";
    L.DomEvent.on(removeButton, "click", () => {
      const cd = new ConfirmDialog();
      cd.setup(
        `Remove Team ${this._team.Name}`,
        `Do you want to permenantly remove ${this._team.Name} from the Wasabee Server?`,
        () => {
          deleteTeamPromise(this._team.ID).then(
            () => {
              alert(`${this._team.Name} removed`);
              window.runHooks("wasabeeUIUpdate", getSelectedOperation());
            },
            reject => {
              console.log(reject);
              alert(reject);
            }
          );
        }
      );
      cd.enable();
    });
  },

  _displayDialog: function() {
    const container = L.DomUtil.create("div", null);
    this._dialogContent(container);

    this._dialog = window.dialog({
      title: wX("MANAGE_TEAM") + this._team.Name,
      width: "auto",
      height: "auto",
      html: container,
      dialogClass: "wasabee-dialog",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      }
      // id: window.plugin.wasabee.static.dialogNames.linkList
    });
  }
});

export default ManageTeamDialog;
