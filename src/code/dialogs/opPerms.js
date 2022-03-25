import { WDialog } from "../leafletClasses";
import Sortable from "../sortable";
import { getSelectedOperation } from "../selectedOp";
import WasabeeTeam from "../model/team";
import WasabeeMe from "../model/me";
import { addPermPromise, delPermPromise } from "../server";
import wX from "../wX";
import { displayError } from "../error";

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

    if (!operation.isServerOp()) this.closeDialog();

    this.setContent(this.buildHTML(operation));
    this.setTitle(wX("PERMS", { opName: operation.name }));
  },

  _displayDialog: function () {
    const operation = getSelectedOperation();

    const html = this.buildHTML(operation);

    const buttons = {};
    buttons[wX("OK")] = () => {
      this.closeDialog();
    };

    this.createDialog({
      title: wX("PERMS", { opName: operation.name }),
      html: html,
      width: "auto",
      height: "auto",
      dialogClass: "perms",
      buttons: buttons,
    });
  },

  buildHTML: function (operation) {
    const isOwner =
      this._me && operation.isOwnedOp() && operation.isOnCurrentServer();
    const sortable = new Sortable();
    const fields = [
      {
        name: wX("TEAM"),
        value: async (perm) => {
          if (this._me && operation.isOnCurrentServer()) {
            // try the team cache first
            const t = await WasabeeTeam.get(perm.teamid);
            if (t) return t.name;
            // check the "me" list
            if (this._me) {
              for (const mt of this._me.Teams) {
                if (mt.ID == perm.teamid) return mt.Name;
              }
            }
          }
          // default to the id
          return "[" + perm.teamid + "]";
        },
        sort: (a, b) => a.localeCompare(b),
        // , format: (cell, value) => (cell.textContent = value)
        foot: (cell) => {
          this.teamMenu = L.DomUtil.create("select", null, cell);
          for (const t of this._me.Teams) {
            const o = L.DomUtil.create("option", null, this.teamMenu);
            o.value = t.ID;
            o.textContent = t.Name;
          }
        },
      },
      {
        name: wX("ROLE"),
        value: (perm) => perm.role,
        sort: (a, b) => a.localeCompare(b),
        // , format: (cell, value) => (cell.textContent = value)
        foot: (cell) => {
          this.permMenu = L.DomUtil.create("select", null, cell);
          const read = L.DomUtil.create("option", null, this.permMenu);
          read.value = "read";
          read.textContent = wX("READ");
          const write = L.DomUtil.create("option", null, this.permMenu);
          write.value = "write";
          write.textContent = wX("WRITE");
          const ao = L.DomUtil.create("option", null, this.permMenu);
          ao.value = "assignedonly";
          ao.textContent = wX("ASSIGNED_ONLY");
        },
      },
      {
        name: wX("ZONE"),
        value: (perm) => {
          if (perm.zone === 0) return wX("dialog.common.zone_all");
          return operation.zoneName(perm.zone);
        },
        sort: (a, b) => a.localeCompare(b),
        // , format: (cell, value) => (cell.textContent = value)
        foot: (cell) => {
          this.zoneMenu = L.DomUtil.create("select", null, cell);
          const zoneAll = L.DomUtil.create("option", null, this.zoneMenu);
          zoneAll.value = "0";
          zoneAll.textContent = wX("dialog.common.zone_all");
          for (const oz of operation.zones) {
            const z = L.DomUtil.create("option", null, this.zoneMenu);
            z.value = oz.id;
            z.textContent = oz.name;
          }
        },
      },
    ];

    if (!isOwner) {
      for (const field of fields) delete field.foot;
    } else {
      fields.push({
        name: wX("dialog.common.commands"),
        value: () => wX("REMOVE"),
        format: (cell, value, obj) => {
          const link = L.DomUtil.create("a", null, cell);
          link.href = "#";
          link.textContent = value;
          L.DomEvent.on(link, "click", (ev) => {
            L.DomEvent.stop(ev);
            this.delPerm(obj); // calls wasabee:op:change -- async but no need to await
          });
        },
        foot: (cell) => {
          const link = L.DomUtil.create("a", null, cell);
          link.href = "#";
          link.textContent = wX("ADD");
          L.DomEvent.on(link, "click", (ev) => {
            L.DomEvent.stop(ev);
            this.addPerm(
              this.teamMenu.value,
              this.permMenu.value,
              +this.zoneMenu.value
            );
          });
        },
      });
    }

    sortable.fields = fields;
    sortable.sortBy = 0;
    sortable.items = operation.teamlist;

    return sortable.table;
  },

  addPerm: async function (teamID, role, zone) {
    if (!WasabeeMe.isLoggedIn()) {
      displayError(wX("NOT LOGGED IN SHORT"));
      return;
    }
    const operation = getSelectedOperation();
    if (!operation.isOwnedOp()) return;

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
      window.map.fire("wasabee:op:change");
    } catch (e) {
      console.error(e);
      displayError(e);
    }
  },

  delPerm: async function (obj) {
    if (!WasabeeMe.isLoggedIn()) {
      displayError(wX("NOT LOGGED IN SHORT"));
      return;
    }
    const operation = getSelectedOperation();
    if (!operation.isOwnedOp()) return;

    try {
      await delPermPromise(operation.ID, obj.teamid, obj.role, obj.zone);
      const n = new Array();
      for (const p of operation.teamlist) {
        if (p.teamid != obj.teamid || p.role != obj.role || p.zone != obj.zone)
          n.push(p);
      }
      operation.teamlist = n;
      await operation.store();
      window.map.fire("wasabee:op:change");
    } catch (e) {
      console.error(e);
      displayError(e);
    }
  },
});

export default OpPermList;
