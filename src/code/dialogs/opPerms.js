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
    if (WasabeeMe.isLoggedIn()) {
      this._me = await WasabeeMe.waitGet();
    } else {
      this._me = null;
    }
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
    // logged in while dialog open...
    if (!this._me && WasabeeMe.isLoggedIn()) {
      this._me = WasabeeMe.get();
    }

    this._operation = op;
    this.buildTable();
    this._html.firstChild.replaceWith(this._table.table);
  },

  _displayDialog: function() {
    if (!this._map) return;

    this.buildTable();

    this._html = L.DomUtil.create("div", null);

    this._html.appendChild(this._table.table);
    if (this._me && this._operation.IsOwnedOp()) {
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

      L.DomEvent.on(ab, "click", ev => {
        L.DomEvent.stop(ev);
        this.addPerm(teamMenu.value, permMenu.value);
        // addPerm calls wasabeeUIUpdate, which redraws the screen
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

  // needs this._operation.teamlist;
  buildTable: function() {
    this._table = new Sortable();
    this._table.fields = [
      {
        name: wX("TEAM"),
        value: perm => {
          const t = WasabeeTeam.get(perm.teamid);
          if (t) return t.name;
          if (this._me) {
            for (const mt of this._me.Teams) {
              if (mt.ID == perm.teamid) return mt.Name + " (off)";
            }
          }
          return "[" + perm.teamid + "]";
        },
        sort: (a, b) => a.localeCompare(b)
        // , format: (cell, value) => (cell.textContent = value)
      },
      {
        name: wX("ROLE"),
        value: perm => perm.role,
        sort: (a, b) => a.localeCompare(b)
        // , format: (cell, value) => (cell.textContent = value)
      }
    ];

    if (WasabeeMe.isLoggedIn()) {
      this._table.fields.push({
        name: wX("REMOVE"),
        value: () => wX("REMOVE"),
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, obj) => {
          const link = L.DomUtil.create("a", null, cell);
          link.href = "#";
          link.textContent = value;
          L.DomEvent.on(link, "click", ev => {
            L.DomEvent.stop(ev);
            this.delPerm(obj); // calls wasabeeUIUpdate
          });
        }
      });
    }
    this._table.sortBy = 0;
    this._table.items = this._operation.teamlist;
  },

  addPerm: function(teamID, role) {
    if (!WasabeeMe.isLoggedIn()) {
      alert(wX("NOT LOGGED IN SHORT"));
      return;
    }
    for (const p of this._operation.teamlist) {
      if (p.teamid == teamID && p.role == role) {
        console.log("not adding duplicate");
        window.runHooks("wasabeeUIUpdate", this._operation);
        return;
      }
    }
    // send to server
    addPermPromise(this._operation.ID, teamID, role).then(
      () => {
        // then add locally for display
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
    if (!WasabeeMe.isLoggedIn()) {
      alert(wX("NOT LOGGED IN SHORT"));
      return;
    }
    // send change to server
    delPermPromise(this._operation.ID, obj.teamid, obj.role).then(
      () => {
        // then remove locally for display
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
