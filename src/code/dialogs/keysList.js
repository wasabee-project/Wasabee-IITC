import { WDialog } from "../leafletClasses";
import Sortable from "../sortable";
import { opKeyPromise } from "../server";
import { WasabeeMe, WasabeeMarker } from "../model";
import KeyListPortal from "./keyListPortal";
import { getSelectedOperation } from "../selectedOp";
import wX from "../wX";

import * as PortalUI from "../ui/portal";
import { isFiltered } from "../filter";

const KeysList = WDialog.extend({
  statics: {
    TYPE: "keysList",
  },

  options: {
    usePane: true,
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    const operation = getSelectedOperation();
    this._opID = operation.ID;
    window.map.on("wasabee:login wasabee:logout", this.update, this);
    window.map.on("wasabee:op:select wasabee:op:change", this.update, this);
    window.map.on("wasabee:filter", this.update, this);
    if (WasabeeMe.isLoggedIn()) {
      this._me = WasabeeMe.localGet();
    } else {
      this._me = null;
    }
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.map.off("wasabee:login wasabee:logout", this.update, this);
    window.map.off("wasabee:op:select wasabee:op:change", this.update, this);
    window.map.off("wasabee:filter", this.update, this);
  },

  _displayDialog: function () {
    const operation = getSelectedOperation();
    const buttons = {};
    buttons[wX("CLOSE")] = () => {
      this.closeDialog();
    };

    this.createDialog({
      title: wX("KEY_LIST2", { opName: operation.name }),
      html: this.getListDialogContent(operation, 0, true).table,
      width: "auto",
      dialogClass: "keyslist",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.keysList,
    });
  },

  update: function () {
    const operation = getSelectedOperation();
    if (operation.ID != this._opID) console.log("operation changed");

    // update me if needed
    if (WasabeeMe.isLoggedIn()) this._me = WasabeeMe.localGet();
    else this._me = null;

    this.setTitle(wX("KEY_LIST2", { opName: operation.name }));
    const table = this.getListDialogContent(
      operation,
      this.sortable.sortBy,
      this.sortable.sortAsc
    ).table;
    this.setContent(table);
  },

  getListDialogContent: function (operation, sortBy, sortAsc) {
    this.sortable = new Sortable();
    const always = [
      {
        name: wX("PORTAL"),
        value: (key) => operation.getPortal(key.id).name,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, key) => {
          cell.appendChild(PortalUI.displayFormat(operation.getPortal(key.id)));
        },
      },
      {
        name: wX("REQUIRED"),
        value: (key) => key.required,
        // sort: (a, b) => a - b,
        format: (cell, value, key) => {
          if (key.open) {
            cell.textContent = wX("OPEN_REQUEST");
          } else {
            if (key.done) cell.textContent = value - key.done + "/" + value;
            else cell.textContent = value;
          }
          if (key.onHand >= key.value - key.done) {
            L.DomUtil.addClass(cell, "enough");
          } else {
            L.DomUtil.addClass(cell, "notenough");
          }
        },
      },
      {
        name: wX("ON_HAND"),
        value: (key) => parseInt(key.onHand, 10),
        // sort: (a, b) => a - b,
        format: (cell, value, key) => {
          const a = L.DomUtil.create("a");
          a.name = key.id;
          L.DomEvent.on(a, "click", L.DomEvent.stopPropagation)
            .on(a, "mousedown", L.DomEvent.stopPropagation)
            .on(a, "dblclick", L.DomEvent.stopPropagation)
            .on(a, "click", L.DomEvent.preventDefault)
            .on(a, "click", this.showKeyByPortal, key);

          a.textContent = value;
          cell.appendChild(a);
        },
      },
    ];

    let gid = "no-user";
    if (this._me) {
      gid = this._me.id;
      this.sortable.fields = always.concat([
        {
          name: wX("MY_COUNT"),
          value: (key) => parseInt(key.iHave, 10),
          // sort: (a, b) => a - b,
          format: (cell, value, key) => {
            const oif = L.DomUtil.create("input");
            oif.value = value;
            oif.size = 3;
            L.DomEvent.on(oif, "change", () => {
              if (operation.isOnCurrentServer())
                opKeyPromise(operation.ID, key.id, oif.value, key.capsule);
              operation.keyOnHand(key.id, gid, oif.value, key.capsule);
            });
            cell.appendChild(oif);
          },
        },
        {
          name: wX("MY_CAP_ID"),
          value: (key) => key.capsule,
          sort: (a, b) => a.localeCompare(b),
          format: (cell, value, key) => {
            const oif = L.DomUtil.create("input");
            oif.value = value;
            oif.size = 8;
            L.DomEvent.on(oif, "change", () => {
              if (operation.isOnCurrentServer())
                opKeyPromise(operation.ID, key.id, key.iHave, oif.value);
              operation.keyOnHand(key.id, gid, key.iHave, oif.value);
            });
            cell.appendChild(oif);
          },
        },
      ]);
    } else {
      this.sortable.fields = always;
    }

    const keys = new Array();

    for (const a of operation.anchors) {
      const k = {};
      const links = operation.links.filter(function (listLink) {
        return isFiltered(listLink) && listLink.toPortalId == a;
      });

      // skip filtered out anchor
      if (!links.length) continue;

      k.id = a;
      k.required = links.length;
      k.onHand = 0;
      k.iHave = 0;
      k.capsule = "";
      k.done = 0;
      for (const l of links) {
        if (l.completed) {
          k.done++;
        }
      }
      // if (k.required == 0) continue;

      const thesekeys = operation.keysonhand.filter(function (keys) {
        return keys.portalId == a;
      });
      if (thesekeys && thesekeys.length > 0) {
        for (const t of thesekeys) {
          k.onHand += t.onhand;
          if (t.gid == gid) {
            k.iHave = t.onhand;
            k.capsule = t.capsule;
          }
        }
      }
      keys.push(k);
    }

    for (const p of operation.markers.filter(function (marker) {
      return (
        isFiltered(marker) &&
        marker.type == WasabeeMarker.constants.MARKER_TYPE_KEY
      );
    })) {
      const k = {};
      k.id = p.portalId;
      k.open = true;
      k.onHand = 0;
      k.iHave = 0;
      k.capsule = "";

      const thesekeys = operation.keysonhand.filter(function (keys) {
        return keys.portalId == k.id;
      });
      if (thesekeys && thesekeys.length > 0) {
        for (const t of thesekeys) {
          k.onHand += t.onhand;
          if (t.gid == gid) {
            k.iHave = t.onhand;
            k.capsule = t.capsule;
          }
        }
      }
      keys.push(k);
    }

    this.sortable.sortBy = sortBy;
    this.sortable.sortAsc = sortAsc;
    this.sortable.items = keys;
    return this.sortable;
  },

  showKeyByPortal: function (e) {
    const klp = new KeyListPortal({ portalID: e.srcElement.name });
    klp.enable();
  },
});

export default KeysList;
