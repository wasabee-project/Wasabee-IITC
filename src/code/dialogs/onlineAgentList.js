import { WDialog } from "../leafletClasses";
import Sortable from "../../lib/sortable";
// import WasabeeTeam from "../team";
import wX from "../wX";
import { postToFirebase } from "../firebaseSupport";

const OnlineAgentList = WDialog.extend({
  statics: {
    TYPE: "OnlineAgentList",
  },

  initialize: function (map = window.map, options) {
    this.type = OnlineAgentList.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
    postToFirebase({ id: "analytics", action: OnlineAgentList.TYPE });
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

  _displayDialog: function () {
    const buttons = {};
    buttons[wX("OK")] = () => {
      this._dialog.dialog("close");
    };

    this.update();

    this._dialog = window.dialog({
      title: "Online Agents",
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

  update: function () {
    this._table = new Sortable();
    this._table.fields = [
      {
        name: wX("AGENT"),
        value: (agent) => agent.name,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, agent) =>
          cell.appendChild(agent.formatDisplay("all")),
      },
      {
        name: "Last Seen",
        value: (agent) => agent.date,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, agent) => {
          if (agent) cell.textContent = agent.timeSinceformat();
        },
      },
      {
        name: "Actions",
        value: (agent) => agent.id,
        format: (cell, value, agent) => {
          if (value) {
            const sat = L.DomUtil.create("a", null, cell);
            sat.textContent = "🛰";
            sat.href = "#";
            L.DomEvent.on(sat, "click", (ev) => {
              L.DomEvent.stop(ev);
              window.map.setView(agent.latLng, 7);
            });
            const close = L.DomUtil.create("a", null, cell);
            close.textContent = "🚁";
            close.href = "#";
            L.DomEvent.on(close, "click", (ev) => {
              L.DomEvent.stop(ev);
              window.map.setView(agent.latLng, 13);
            });
          }
        },
      },
    ];
    this._table.sortBy = 0;

    const a = new Array();
    for (const k of window.plugin.wasabee.onlineAgents.keys()) {
      a.push(window.plugin.wasabee._agentCache.get(k));
    }
    this._table.items = a;
  },
});

export default OnlineAgentList;
