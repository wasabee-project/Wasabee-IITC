import { WDialog } from "../leafletClasses";
import Sortable from "../sortable";
import { getSelectedOperation } from "../selectedOp";
import WasabeeTeam from "../team";
import WasabeeMe from "../me";
import { addPermPromise, delPermPromise } from "../server";
import wX from "../wX";

const OpPermList = WDialog.extend({
  statics: {
    TYPE: "opPermList",
  },

  addHooks: async function () {
    WDialog.prototype.addHooks.call(this);
    if (WasabeeMe.isLoggedIn()) {
      this._me = await WasabeeMe.waitGet();
    } else {
      this._me = null;
    }
    window.map.on("wasabee:op:select wasabee:op:change", this.update, this);

    this._displayDialog();
  },

  removeHooks: function () {
    window.map.off("wasabee:op:select wasabee:op:change", this.update, this);
    WDialog.prototype.removeHooks.call(this);
  },

  update: async function () {
    const operation = getSelectedOperation();
    // logged in while dialog open...
    if (!this._me && WasabeeMe.isLoggedIn()) {
      this._me = await WasabeeMe.waitGet();
    }

    this.buildTable(operation);
    this._html.firstChild.replaceWith(this._table.table);
  },

  _displayDialog: function () {
    const operation = getSelectedOperation();

    this.buildTable(operation);
    this._html = L.DomUtil.create("div", null);
    this._html.appendChild(this._table.table);
    if (this._me && operation.IsOwnedOp()) {
      const already = new Set();
      for (const a of operation.teamlist) already.add(a.teamid);

      const addArea = L.DomUtil.create("div", null, this._html);
      const teamMenu = L.DomUtil.create("select", null, addArea);
      for (const t of this._me.Teams) {
        // if (already.has(t.ID)) continue;
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
      ao.textContent = wX("ASSIGNED_ONLY");

      const zoneMenu = L.DomUtil.create("select", null, addArea);
      const zoneAll = L.DomUtil.create("option", null, zoneMenu);
      zoneAll.value = "0";
      zoneAll.textContent = "All";
      for (const oz of operation.zones) {
        const z = L.DomUtil.create("option", null, zoneMenu);
        z.value = oz.id;
        z.textContent = oz.name;
      }

      const ab = L.DomUtil.create("button", null, addArea);
      ab.type = "button";
      ab.name = "Add";
      ab.value = "Add";
      ab.textContent = wX("ADD");

      L.DomEvent.on(ab, "click", (ev) => {
        L.DomEvent.stop(ev);
        this.addPerm(teamMenu.value, permMenu.value, +zoneMenu.value); // async, but no need to await
        // addPerm calls wasabee:uiupdate, which redraws the screen
      });
    }

    const buttons = {};
    buttons[wX("OK")] = () => {
      this.closeDialog();
    };

    this.createDialog({
      title: wX("PERMS", { opName: operation.name }),
      html: this._html,
      height: "auto",
      dialogClass: "perms",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.linkList,
    });
  },

  buildTable: function (operation) {
    this._table = new Sortable();
    this._table.fields = [
      {
        name: wX("TEAM"),
        value: async (perm) => {
          // try the team cache first
          const t = await WasabeeTeam.get(perm.teamid);
          if (t) return t.name;
          // check the "me" list
          if (this._me) {
            for (const mt of this._me.Teams) {
              if (mt.ID == perm.teamid) return mt.Name;
            }
          }
          // default to the id
          return "[" + perm.teamid + "]";
        },
        sort: (a, b) => a.localeCompare(b),
        // , format: (cell, value) => (cell.textContent = value)
      },
      {
        name: wX("ROLE"),
        value: (perm) => perm.role,
        sort: (a, b) => a.localeCompare(b),
        // , format: (cell, value) => (cell.textContent = value)
      },
      {
        name: "Zone",
        value: (perm) => operation.zoneName(perm.zone),
        sort: (a, b) => a.localeCompare(b),
        // , format: (cell, value) => (cell.textContent = value)
      },
    ];

    if (WasabeeMe.isLoggedIn()) {
      this._table.fields.push({
        name: wX("REMOVE"),
        value: () => wX("REMOVE"),
        format: (cell, value, obj) => {
          if (operation.IsOwnedOp()) {
            const link = L.DomUtil.create("a", null, cell);
            link.href = "#";
            link.textContent = value;
            L.DomEvent.on(link, "click", (ev) => {
              L.DomEvent.stop(ev);
              this.delPerm(obj); // calls wasabee:uiupdate -- async but no need to await
            });
          }
        },
      });
    }
    this._table.sortBy = 0;
    this._table.items = operation.teamlist;
  },

  addPerm: async function (teamID, role, zone) {
    if (!WasabeeMe.isLoggedIn()) {
      alert(wX("NOT LOGGED IN SHORT"));
      return;
    }
    const operation = getSelectedOperation();
    if (!operation.IsOwnedOp()) return;

    for (const p of operation.teamlist) {
      if (p.teamid == teamID && p.role == role && p.zone == zone) {
        console.debug("not adding duplicate permission");
        return;
      }
    }

    try {
      await addPermPromise(operation.ID, teamID, role, zone);
      // add locally for display
      operation.teamlist.push({ teamid: teamID, role: role, zone: zone });
      await operation.store();
      window.map.fire("wasabee:uiupdate", { reason: "opPerms" }, false);
    } catch (e) {
      console.error(e);
      alert(e.toString());
    }
  },

  delPerm: async function (obj) {
    if (!WasabeeMe.isLoggedIn()) {
      alert(wX("NOT LOGGED IN SHORT"));
      return;
    }
    const operation = getSelectedOperation();
    if (!operation.IsOwnedOp()) return;

    try {
      await delPermPromise(operation.ID, obj.teamid, obj.role, obj.zone);
      const n = new Array();
      for (const p of operation.teamlist) {
        if (p.teamid != obj.teamid || p.role != obj.role || p.zone != obj.zone)
          n.push(p);
      }
      operation.teamlist = n;
      await operation.store();
      window.map.fire("wasabee:uiupdate", { reason: "opPerms" }, false);
    } catch (e) {
      console.error(e);
      alert(e);
    }
  },
});

export default OpPermList;
