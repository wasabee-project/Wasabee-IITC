import { WDialog } from "../leafletClasses";
import Sortable from "../../lib/sortable";
import WasabeeTeam from "../team";
import wX from "../wX";

const TeamMembershipList = WDialog.extend({
  statics: {
    TYPE: "teamMembershipList",
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
  },

  _displayDialog: async function () {
    await this._setup();
    // sometimes we are too quick, try again
    if (!this._team)
      this._team = window.plugin.wasabee.teams.get(this.options.teamID);

    const buttons = {};
    buttons[wX("OK")] = () => {
      this._dialog.dialog("close");
    };

    this._dialog = window.dialog({
      title: this._team.name,
      html: this._table.table,
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-teamlist",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.linkList,
    });
    this._dialog.dialog("option", "buttons", buttons);
  },

  _setup: async function () {
    try {
      this._team = await WasabeeTeam.waitGet(this.options.teamID, 2);
    } catch (e) {
      console.error(e);
      alert(e.toString());
      return;
    }
    if (!this._team.name) {
      alert(wX("NOT_LOADED"));
    }

    this._table = new Sortable();
    this._table.fields = [
      {
        name: wX("AGENT"),
        value: (agent) => agent.name,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, agent) =>
          cell.appendChild(agent.formatDisplay(this.options.teamID)),
      },
      {
        name: wX("SQUAD"),
        value: (agent) => agent.squad,
        sort: (a, b) => a.localeCompare(b),
        // , format: (cell, value) => (cell.textContent = value)
      },
      {
        name: "Sharing Location",
        value: (agent) => agent.state,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value) => {
          if (value) cell.textContent = "✅";
        },
      },
      {
        name: "Sharing W-D Keys",
        value: (agent) => agent.ShareWD,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value) => {
          if (value) cell.textContent = "✅";
        },
      },
    ];
    this._table.sortBy = 0;
    this._table.items = this._team.agents;
  },
});

export default TeamMembershipList;
