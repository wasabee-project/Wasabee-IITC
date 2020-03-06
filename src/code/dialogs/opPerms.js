import { Feature } from "../leafletDrawImports";
import Sortable from "../../lib/sortable";
import { getSelectedOperation } from "../selectedOp";
import WasabeeTeam from "../team";
import WasabeeMe from "../me";
import { addPermPromise } from "../server";
import wX from "../wX";

const OpPermList = Feature.extend({
  statics: {
    TYPE: "opPermList"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = OpPermList.TYPE;
    Feature.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    if (!this._map) return;
    Feature.prototype.addHooks.call(this);
    this._operation = getSelectedOperation();
    this._me = WasabeeMe.get();
    this._displayDialog();
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
  },

  _displayDialog: function() {
    if (!this._map) return;

    this.setup();

    const html = L.DomUtil.create("div", null);

    this._drawnTable = html.appendChild(this._table.table);
    if (this._operation.IsOwnedOp()) {
      const addArea = L.DomUtil.create("div", null, html);
      const teamMenu = L.DomUtil.create("select", null, addArea);
      for (const t of this._me.Teams) {
        if (t.State != "On") continue;
        const o = L.DomUtil.create("option", null, teamMenu);
        o.value = t.ID;
        o.textContent = t.Name;
      }
      const permMenu = L.DomUtil.create("select", null, addArea);
      const read = L.DomUtil.create("option", null, permMenu);
      read.value = "read";
      read.textContent = "read";
      const write = L.DomUtil.create("option", null, permMenu);
      write.value = "write";
      write.textContent = "write";
      const ao = L.DomUtil.create("option", null, permMenu);
      ao.value = "assignedonly";
      ao.textContent = "assignedonly";
      const ab = L.DomUtil.create("button", null, addArea);
      ab.type = "button";
      ab.name = "Add";
      ab.value = "Add";
      ab.textContent = "Add";

      const context = this;
      L.DomEvent.on(ab, "click", () => {
        context.addPerm(context._operation, teamMenu.value, permMenu.value);
        context.setup();
        context._drawnTable = html.replaceChild(
          context._table.table,
          context._drawnTable
        );
      });
    }

    this._dialog = window.dialog({
      title: this._operation.name + " permissions",
      width: "auto",
      height: "auto",
      html: html,
      dialogClass: "wasabee-dialog wasabee-dialog-linklist",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.linkList
    });
  },

  setup: function() {
    this._table = new Sortable();
    this._table.fields = [
      {
        name: "Team",
        value: perm => {
          const t = WasabeeTeam.get(perm.teamid);
          if (t) return t.name;
          for (const mt of this._me.Teams) {
            if (mt.ID == perm.teamid) return mt.Name + " (off)";
          }
          return "[" + perm.teamid + "] denied";
        },
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value) => (cell.textContent = value)
      },
      {
        name: "Role",
        value: perm => perm.role,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value) => (cell.textContent = value)
      },
      {
        name: "Remove",
        value: () => wX("DELETE"),
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, obj) => {
          cell.textContent = value;
          L.DomEvent.on(cell, "click", () => {
            this.delPerm(obj);
          });
        }
      }
    ];
    this._table.sortBy = 0;
    this._table.items = this._operation.teamlist;
  },

  addPerm: function(op, teamID, role) {
    console.log("adding " + teamID + " " + role);
    addPermPromise(op.ID, teamID, role).then(
      () => {
        op.teamlist.push({
          teamid: teamID,
          role: role
        });
      },
      err => {
        console.log(err);
      }
    );
  },

  delPerm: function(obj) {
    console.log(obj);
    alert("will remove :" + obj.teamid + " - " + obj.role);
  }
});

export default OpPermList;
