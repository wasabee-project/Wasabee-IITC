import { WDialog } from "../leafletClasses";
import Sortable from "../sortable";
import wX from "../wX";

import * as AgentUI from "../ui/agent";
import { displayError } from "../error";

import { getTeam } from "../model/cache";

const TeamMembershipList = WDialog.extend({
  statics: {
    TYPE: "teamMembershipList",
  },

  options: {
    // teamID
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    window.map.on("wasabee:team:update", this.update, this);
    window.map.on("wasabee:logout", this.closeDialog, this);
    this._displayDialog().catch((e) => {
      console.error(e);
      displayError(e);
    });
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.map.off("wasabee:team:update", this.update, this);
    window.map.off("wasabee:logout", this.closeDialog, this);
  },

  _displayDialog: async function () {
    this._table = this._setupTable();

    const team = await getTeam(this.options.teamID, 10); // max cache age of 10 seconds
    this._table.items = team.agents;

    const buttons = {};
    buttons[wX("CLOSE")] = () => {
      this.closeDialog();
    };

    this.createDialog({
      title: team.name,
      html: this._table.table,
      width: "auto",
      dialogClass: "teamlist",
      buttons: buttons,
    });
  },

  update: async function () {
    const team = await getTeam(this.options.teamID, 10);
    this._table.items = team.agents;
    this.setTitle(team.name);
  },

  _setupTable: function () {
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
        name: wX("COMMENT"),
        value: (agent) => agent.comment,
        sort: (a, b) => a.localeCompare(b),
      },
      {
        name: wX("dialog.team_members.location"),
        value: (agent) => agent.shareLocation,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value) => {
          if (value) cell.textContent = "✅";
        },
      },
      {
        name: wX("dialog.team_members.wd_keys"),
        value: (agent) => agent.shareWDKeys,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value) => {
          if (value) cell.textContent = "✅";
        },
      },
    ];
    table.sortBy = 0;

    return table;
  },
});

export default TeamMembershipList;
