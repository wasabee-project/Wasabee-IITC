import { Feature } from "../leafletDrawImports";
import Sortable from "../../lib/sortable";
// import AssignDialog from "./assignDialog";
// import SetCommentDialog from "./setCommentDialog";
// import ConfirmDialog from "./confirmDialog";
import { teamPromise } from "../server";

const TeamMembershipList = Feature.extend({
  statics: {
    TYPE: "teamMembershipList"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = TeamMembershipList.TYPE;
    Feature.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    if (!this._map) return;
    Feature.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
  },

  _displayDialog: function() {
    if (!this._map) return;

    this._dialog = window.dialog({
      title: this._team.name,
      width: "auto",
      height: "auto",
      html: this._table.table,
      dialogClass: "wasabee-dialog wasabee-dialog-linklist",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.linkList
    });
  },

  setup: async function(teamID) {
    this._teamID = teamID;

    if (window.plugin.wasabee.teams.has(teamID)) {
      this._team = window.plugin.wasabee.teams.get(teamID);
    } else {
      try {
        this._team = await teamPromise(teamID);
      } catch (e) {
        alert(e);
        return;
      }
    }
    if (!this._team.name) {
      alert("Not fully loaded, try again.");
    }

    this._table = new Sortable();
    this._table.fields = [
      {
        name: "Agent",
        value: agent => agent.name,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, agent) => cell.appendChild(agent.formatDisplay())
      },
      {
        name: "Location Update",
        value: agent => agent.date,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value) => (cell.textContent = value)
      }
    ];
    this._table.sortBy = 0;
    this._table.items = this._team.agents;
  }
});

export default TeamMembershipList;
