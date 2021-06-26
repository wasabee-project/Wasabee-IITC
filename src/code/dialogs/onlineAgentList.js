import { WDialog } from "../leafletClasses";
import Sortable from "../sortable";
import WasabeeAgent from "../model/agent";
import wX from "../wX";

const OnlineAgentList = WDialog.extend({
  statics: {
    TYPE: "OnlineAgentList",
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    window.map.on("wasabee:agentlocations", this.update, this);
    window.map.on("wasabee:logout", this.closeDialog, this);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.map.off("wasabee:agentlocations", this.update, this);
    window.map.off("wasabee:logout", this.closeDialog, this);
  },

  _displayDialog: function () {
    const buttons = {};
    buttons[wX("OK")] = () => {
      this.closeDialog();
    };

    this.update();

    this.createDialog({
      title: "Online Agents",
      html: this._table.table,
      width: "auto",
      dialogClass: "teamlist",
      buttons: buttons,
    });
  },

  update: async function () {
    this._table = new Sortable();
    this._table.fields = [
      {
        name: wX("AGENT"),
        value: (agent) => agent.name,
        sort: (a, b) => a.localeCompare(b),
        format: async (cell, value, agent) =>
          cell.appendChild(await agent.formatDisplay(0)),
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
    const tx = window.plugin.wasabee.idb.transaction(["agents"], "readonly");
    const range = IDBKeyRange.lowerBound(this._last_hour());
    let cursor = await tx.store.index("date").openCursor(range);
    while (cursor) {
      a.push(new WasabeeAgent(cursor.value));
      cursor = await cursor.continue();
    }

    this._table.items = a;
  },

  _last_hour: function () {
    const date = new Date(Date.now() - 3600 * 1000); // one hour ago
    const d = date.getUTCDate();
    const m = date.getUTCMonth() + 1;
    const y = date.getUTCFullYear();
    const h = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const s = date.getUTCSeconds();
    const out =
      "" +
      y +
      "-" +
      (m <= 9 ? "0" + m : m) +
      "-" +
      (d <= 9 ? "0" + d : d) +
      " " +
      (h <= 9 ? "0" + h : h) +
      ":" +
      (mm <= 9 ? "0" + mm : mm) +
      ":" +
      (s <= 9 ? "0" + s : s);
    return out;
  },
});

export default OnlineAgentList;
