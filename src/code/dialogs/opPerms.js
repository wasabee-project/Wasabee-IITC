import { WDialog } from "../leafletClasses";
import Sortable from "../../lib/sortable";
import { getSelectedOperation } from "../selectedOp";
import WasabeeTeam from "../team";
import WasabeeMe from "../me";
import { addPermPromise, delPermPromise } from "../server";
import wX from "../wX";

const OpPermList = WDialog.extend({
  statics: {
    TYPE: "opPermList"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = OpPermList.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
  },

  addHooks: async function() {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    this._operation = getSelectedOperation();
    this._me = await WasabeeMe.waitGet();
    const context = this;
    this._UIUpdateHook = newOpData => {
      context.update(newOpData);
    };
    window.addHook("wasabeeUIUpdate", this._UIUpdateHook);

    this._displayDialog();
  },

  removeHooks: function() {
    window.removeHook("wasabeeUIUpdate", this._UIUpdateHook);
    WDialog.prototype.removeHooks.call(this);
  },

  update: function(op) {
    this._operation = op;
    this.setup();
    // the lazy way...
    this._dialog.dialog("close");
    this._displayDialog();
  },

  _displayDialog: function() {
    if (!this._map) return;

    this.setup();

    this._html = L.DomUtil.create("div", null);

    this._drawnTable = this._html.appendChild(this._table.table);
    if (this._operation.IsOwnedOp()) {
      const addArea = L.DomUtil.create("div", null, this._html);
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
      read.textContent = wX("READ");
      const write = L.DomUtil.create("option", null, permMenu);
      write.value = "write";
      write.textContent = wX("WRITE");
      const ao = L.DomUtil.create("option", null, permMenu);
      ao.value = "assignedonly";
      ao.textContent = "assignedonly";
      const ab = L.DomUtil.create("button", null, addArea);
      ab.type = "button";
      ab.name = "Add";
      ab.value = "Add";
      ab.textContent = wX("ADD");

      const context = this;
      L.DomEvent.on(ab, "click", () => {
        context.addPerm(teamMenu.value, permMenu.value);
        context.setup();
        context._drawnTable = this._html.replaceChild(
          context._table.table,
          context._drawnTable
        );
      });
    }

    this._dialog = window.dialog({
      title: wX("PERMS", this._operation.name),
      width: "auto",
      height: "auto",
      html: this._html,
      dialogClass: "wasabee-dialog wasabee-dialog-perms",
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
        name: wX("TEAM"),
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
        name: wX("ROLE"),
        value: perm => perm.role,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value) => (cell.textContent = value)
      },
      {
        name: wX("REMOVE"),
        value: () => wX("REMOVE"),
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

  addPerm: function(teamID, role) {
    for (const p of this._operation.teamlist) {
      if (p.teamid == teamID && p.role == role) {
        console.log("not adding duplicate");
        window.runHooks("wasabeeUIUpdate", this._operation);
        return;
      }
    }
    addPermPromise(this._operation.ID, teamID, role).then(
      () => {
        this._operation.teamlist.push({
          teamid: teamID,
          role: role
        });
        this._operation.store();
        window.runHooks("wasabeeUIUpdate", getSelectedOperation());
      },
      err => {
        console.log(err);
        alert(err);
      }
    );
  },

  delPerm: function(obj) {
    delPermPromise(this._operation.ID, obj.teamid, obj.role).then(
      () => {
        const n = new Array();
        for (const p of this._operation.teamlist) {
          if (p.teamid != obj.teamid || p.role != obj.role) n.push(p);
        }
        this._operation.teamlist = n;
        this._operation.store();
        window.runHooks("wasabeeUIUpdate", getSelectedOperation());
      },
      err => {
        console.log(err);
        alert(err);
      }
    );
  }
});

export default OpPermList;
