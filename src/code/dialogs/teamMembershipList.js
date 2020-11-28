import { WDialog } from "../leafletClasses";
import Sortable from "../sortable";
import WasabeeTeam from "../team";
import wX from "../wX";

const TeamMembershipList = WDialog.extend({
  statics: {
    TYPE: "teamMembershipList",
  },

  options: {
    // teamID
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    this._displayDialog().catch((e) => {
      console.error(e);
      alert(e.toString());
    });
  },

  _displayDialog: async function () {
    const table = this._setupTable();

    const team = await WasabeeTeam.waitGet(this.options.teamID, 2);
    table.items = team.agents;

    const buttons = {};
    buttons[wX("OK")] = () => {
      this._dialog.dialog("close");
    };

    this._dialog = window.dialog({
      title: team.name,
      html: table.table,
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

  _setupTable: function () {
    const table = new Sortable();
    table.fields = [
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
    table.sortBy = 0;

    return table;
  },
});

export default TeamMembershipList;
