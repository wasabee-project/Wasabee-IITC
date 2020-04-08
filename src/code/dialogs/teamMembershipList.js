import { WDialog } from "../leafletClasses";
import Sortable from "../../lib/sortable";
// import AssignDialog from "./assignDialog";
// import SetCommentDialog from "./setCommentDialog";
// import ConfirmDialog from "./confirmDialog";
import { teamPromise } from "../server";
import wX from "../wX";

const TeamMembershipList = WDialog.extend({
  statics: {
    TYPE: "teamMembershipList"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = TeamMembershipList.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function() {
    WDialog.prototype.removeHooks.call(this);
  },

  _displayDialog: function() {
    if (!this._map) return;
    // sometimes we are too quick, try again
    if (!this._team) this._team = window.plugin.wasabee.teams.get(this._teamID);

    this._dialog = window.dialog({
      title: this._team.name,
      width: "auto",
      height: "auto",
      html: this._table.table,
      dialogClass: "wasabee-dialog",
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
      alert(wX("NOT_LOADED"));
    }

    this._table = new Sortable();
    this._table.fields = [
      {
        name: wX("AGENT"),
        value: agent => agent.name,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, agent) => cell.appendChild(agent.formatDisplay())
      },
      {
        name: wX("SQUAD"),
        value: agent => agent.squad,
        sort: (a, b) => a.localeCompare(b)
        // , format: (cell, value) => (cell.textContent = value)
      },
      {
        name: wX("LOC_UPDATE"),
        value: agent => agent.date,
        sort: (a, b) => a.localeCompare(b)
        // , format: (cell, value) => (cell.textContent = value)
      }
    ];
    this._table.sortBy = 0;
    // if team owner, don't show non-enabled agents
    const a = this._team.agents.filter(agent => agent.state);
    this._table.items = a;
  }
});

export default TeamMembershipList;
