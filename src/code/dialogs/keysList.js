import { Feature } from "../leafletDrawImports";
import Sortable from "../../lib/sortable";
import { opKeyPromise } from "../server";
import WasabeeMe from "../me";
import KeyListPortal from "./keyListPortal";
import { getSelectedOperation } from "./selectedOp";

const KeysList = Feature.extend({
  statics: {
    TYPE: "keysList"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = KeysList.TYPE;
    Feature.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    if (!this._map) return;
    Feature.prototype.addHooks.call(this);
    this._operation = getSelectedOperation();
    const context = this;
    this._UIUpdateHook = newOpData => {
      context.keyListUpdate(newOpData);
    };
    window.addHook("wasabeeUIUpdate", this._UIUpdateHook);
    this._displayDialog();
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
    window.removeHook("wasabeeUIUpdate", this._UIUpdateHook);
  },

  _displayDialog: function() {
    this._listDialog = window.dialog({
      title: "Key List",
      width: "auto",
      height: "auto",
      position: {
        my: "center top",
        at: "center center"
      },
      html: getListDialogContent(this._operation).table,
      dialogClass: "wasabee-dialog-alerts",
      closeCallback: () => {
        delete this._listDialog;
        this.disable();
      },
      id: window.plugin.Wasabee.static.dialogNames.keysList
    });
  },

  keyListUpdate: function(operation) {
    const id = "dialog-" + window.plugin.Wasabee.static.dialogNames.keysList;
    if (window.DIALOGS[id]) {
      const table = getListDialogContent(operation).table;
      window.DIALOGS[id].replaceChild(table, window.DIALOGS[id].childNodes[0]);
    }
  }
});

export default KeysList;

const getListDialogContent = operation => {
  const me = WasabeeMe.get();

  const sortable = new Sortable();
  const always = [
    {
      name: "Portal",
      value: key => operation.getPortal(key.id).name,
      sort: (a, b) => a.localeCompare(b),
      format: (cell, value, key) => {
        cell.appendChild(operation.getPortal(key.id).displayFormat(operation));
      }
    },
    {
      name: "Required",
      value: key => key.Required,
      sort: (a, b) => a.localeCompare(b),
      format: (cell, value) => {
        cell.textContent = value;
      }
    },
    {
      name: "On Hand",
      value: key => parseInt(key.onHand),
      sort: (a, b) => a - b,
      format: (cell, value, key) => {
        const a = L.DomUtil.create("a", "");
        a.name = key.id;
        L.DomEvent.on(a, "click", L.DomEvent.stopPropagation)
          .on(a, "mousedown", L.DomEvent.stopPropagation)
          .on(a, "dblclick", L.DomEvent.stopPropagation)
          .on(a, "click", L.DomEvent.preventDefault)
          .on(a, "click", showKeyByPortal, key);

        a.innerHTML = value;
        cell.appendChild(a);
      }
    }
  ];

  let gid = "no-user";
  if (me) {
    gid = me.GoogleID;
    sortable.fields = always.concat([
      {
        name: "My Count",
        value: key => parseInt(key.iHave),
        sort: (a, b) => a - b,
        format: (cell, value, key) => {
          const oif = document.createElement("input");
          oif.value = value;
          oif.size = 3;
          oif.addEventListener(
            "change",
            () => {
              opKeyPromise(operation.ID, key.id, oif.value, key.capsule);
              operation.keyOnHand(key.id, gid, oif.value, key.capsule);
            },
            false
          );
          cell.appendChild(oif);
        }
      },
      {
        name: "My Capsule ID",
        value: key => key.capsule,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, key) => {
          const oif = document.createElement("input");
          oif.value = value;
          oif.size = 8;
          oif.addEventListener(
            "change",
            () => {
              opKeyPromise(operation.ID, key.id, key.iHave, oif.value);
              operation.keyOnHand(key.id, gid, key.iHave, oif.value);
            },
            false
          );
          cell.appendChild(oif);
        }
      }
    ]);
  } else {
    sortable.fields = always;
  }

  const keys = new Array();

  for (const a of operation.anchors) {
    const k = {};
    const links = operation.links.filter(function(listLink) {
      return listLink.toPortalId == a;
    });

    k.id = a;
    k.Required = links.length;
    k.onHand = 0;
    k.iHave = 0;
    k.capsule = "";
    if (k.Required == 0) continue;

    const thesekeys = operation.keysonhand.filter(function(keys) {
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

  for (const p of operation.markers.filter(function(marker) {
    return marker.type == window.plugin.wasabee.Constants.MARKER_TYPE_KEY;
  })) {
    const k = {};
    k.id = p.portalId;
    k.Required = "[open request]";
    k.onHand = 0;
    k.iHave = 0;
    k.capsule = "";

    const thesekeys = operation.keysonhand.filter(function(keys) {
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
};

const showKeyByPortal = e => {
  const klp = new KeyListPortal();
  klp.setup(e.srcElement.name);
  klp.enable();
};
