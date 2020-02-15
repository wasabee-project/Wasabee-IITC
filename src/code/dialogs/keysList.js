import { Feature } from "../leafletDrawImports";
import Sortable from "../../lib/sortable";
// import { getAgent } from "../server";

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
    this._operation = window.plugin.wasabee.getSelectedOperation();
    window.addHook("wasabeeUIUpdate", keyListUpdate);
    this._displayDialog();
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
    window.removeHook("wasabeeUIUpdate", keyListUpdate);
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
  }
});

export default KeysList;

const keyListUpdate = operation => {
  console.log("key list updating");
  const id = "dialog-" + window.plugin.Wasabee.static.dialogNames.keysList;
  if (window.DIALOGS[id]) {
    const table = getListDialogContent(operation).table;
    window.DIALOGS[id].replaceChild(table, window.DIALOGS[id].childNodes[0]);
  }
};

const getListDialogContent = operation => {
  const sortable = new Sortable();
  sortable.fields = [
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
      value: key => key.onHand,
      sort: (a, b) => a.localeCompare(b),
      format: (cell, value) => {
        cell.textContent = value;
      }
    }
  ];

  const keys = new Array();

  for (const a of operation.anchors) {
    const k = {};
    const links = operation.links.filter(function(listLink) {
      return listLink.toPortalId == a;
    });

    k.id = a;
    k.Required = links.length;
    k.onHand = 0;
    if (k.Required == 0) continue;

    // the server has been sending this, but plugin hasn't been saving it -- this is for compat until all ops can catch up
    if (!operation.keysonhand) {
      operation.keysonhand = new Array();
    }

    const thesekeys = operation.keysonhand.filter(function(keys) {
      return keys.portalId == a;
    });
    if (thesekeys && thesekeys.length > 0) {
      for (const t of thesekeys) {
        k.onHand += t.onhand;
      }
    }
    keys.push(k);
  }

  sortable.sortBy = 0;
  sortable.items = keys;
  return sortable;
};
