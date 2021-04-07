import { WDialog } from "../leafletClasses";
import Sortable from "../sortable";
import { opKeyPromise } from "../server";
import WasabeeMe from "../me";
import KeyListPortal from "./keyListPortal";
import { getSelectedOperation } from "../selectedOp";
import wX from "../wX";

const KeysList = WDialog.extend({
  statics: {
    TYPE: "keysList",
  },

  addHooks: async function () {
    WDialog.prototype.addHooks.call(this);
    const operation = getSelectedOperation();
    this._opID = operation.ID;
    window.map.on("wasabeeUIUpdate", this.update, this);
    if (WasabeeMe.isLoggedIn()) {
      this._me = await WasabeeMe.waitGet();
    } else {
      this._me = null;
    }
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.map.off("wasabeeUIUpdate", this.update, this);
  },

  _displayDialog: function () {
    const operation = getSelectedOperation();
    const buttons = {};
    buttons[wX("OK")] = () => {
      this.closeDialog();
    };

    this.createDialog({
      title: wX("KEY_LIST2", operation.name),
      html: this.getListDialogContent(operation).table,
      width: "auto",
      dialogClass: "keyslist",
      buttons: buttons,
      closeCallback: () => {
        delete this._dialog;
        this.disable();
      },
      id: window.plugin.wasabee.static.dialogNames.keysList,
    });
  },

  update: async function () {
    const operation = getSelectedOperation();
    if (operation.ID != this._opID) console.log("operation changed");

    // update me if needed
    if (WasabeeMe.isLoggedIn()) this._me = await WasabeeMe.waitGet();
    else this._me = null;

    this._dialog.dialog("option", "title", wX("KEY_LIST", operation.name));
    const table = this.getListDialogContent(operation).table;
    this._dialog.html(table);
  },

  getListDialogContent: function (operation) {
    const sortable = new Sortable();
    const always = [
      {
        name: wX("PORTAL"),
        value: (key) => operation.getPortal(key.id).name,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, key) => {
          cell.appendChild(
            operation.getPortal(key.id).displayFormat(this._smallScreen)
          );
        },
      },
      {
        name: wX("REQUIRED"),
        value: (key) => key.Required,
        // sort: (a, b) => a - b,
        format: (cell, value, key) => {
          cell.textContent = value;
          const oh = parseInt(key.onHand, 10);
          const req = parseInt(key.Required, 10);
          if (oh >= req) {
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
      gid = this._me.GoogleID;
      sortable.fields = always.concat([
        {
          name: wX("MY_COUNT"),
          value: (key) => parseInt(key.iHave, 10),
          // sort: (a, b) => a - b,
          format: (cell, value, key) => {
            const oif = L.DomUtil.create("input");
            oif.value = value;
            oif.size = 3;
            L.DomEvent.on(oif, "change", () => {
              if (operation.IsServerOp() && operation.IsOnCurrentServer())
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
              if (operation.IsServerOp() && operation.IsOnCurrentServer())
                opKeyPromise(operation.ID, key.id, key.iHave, oif.value);
              operation.keyOnHand(key.id, gid, key.iHave, oif.value);
            });
            cell.appendChild(oif);
          },
        },
      ]);
    } else {
      sortable.fields = always;
    }

    const keys = new Array();

    for (const a of operation.anchors) {
      const k = {};
      const links = operation.links.filter(function (listLink) {
        return listLink.toPortalId == a;
      });

      k.id = a;
      k.Required = links.length;
      k.onHand = 0;
      k.iHave = 0;
      k.capsule = "";
      // if (k.Required == 0) continue;

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
        marker.type == window.plugin.wasabee.static.constants.MARKER_TYPE_KEY
      );
    })) {
      const k = {};
      k.id = p.portalId;
      k.Required = wX("OPEN_REQUEST");
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

    sortable.sortBy = 0;
    sortable.items = keys;
    return sortable;
  },

  showKeyByPortal: function (e) {
    const klp = new KeyListPortal({ portalID: e.srcElement.name });
    klp.enable();
  },
});

export default KeysList;
