import { Feature } from "../leafletDrawImports";
import Sortable from "../../lib/sortable";
import { agentPromise } from "../server";

const KeyListPortal = Feature.extend({
  statics: {
    TYPE: "keyListPortal"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = KeyListPortal.TYPE;
    Feature.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    if (!this._map) return;
    Feature.prototype.addHooks.call(this);
    window.addHook("wasabeeUIUpdate", keyListUpdate);
    this._displayDialog();
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
    window.removeHook("wasabeeUIUpdate", keyListUpdate);
  },

  setup: function(portalID) {
    this._portalID = portalID;
    this._operation = window.plugin.wasabee.getSelectedOperation();
    this._portal = this._operation.getPortal(portalID);
  },

  _displayDialog: function() {
    if (!this._portalID) {
      this.disable();
      return;
    }

    this._dialog = window.dialog({
      title: `Key List for Portal ${this._portal.name}`,
      width: "auto",
      height: "auto",
      position: {
        my: "center top",
        at: "center center"
      },
      html: getListDialogContent(this._operation, this._portalID).table,
      dialogClass: "wasabee-dialog-alerts",
      closeCallback: () => {
        delete this._dialog;
        this.disable();
      },
      id: window.plugin.Wasabee.static.dialogNames.keyListPortal
    });
  }
});

export default KeyListPortal;

const keyListUpdate = operation => {
  console.log("update title please");

  const id = "dialog-" + window.plugin.Wasabee.static.dialogNames.keyListPortal;
  if (window.DIALOGS[id]) {
    const table = getListDialogContent(operation).table;
    window.DIALOGS[id].replaceChild(table, window.DIALOGS[id].childNodes[0]);
  }
};

const getListDialogContent = (operation, portalID) => {
  const sortable = new Sortable();
  if (portalID) {
    sortable._portalID = portalID;
  } else {
    portalID = sortable._portalID;
  }

  sortable.fields = [
    {
      name: "Agent",
      value: key => key.gid,
      sort: (a, b) => a.localeCompare(b),
      format: async (cell, value, key) => {
        const agent = await agentPromise(key.gid);
        console.log(agent);
        cell.textContent = agent.name;
      }
    },
    {
      name: "On Hand",
      value: key => key.onhand,
      sort: (a, b) => a.localeCompare(b),
      format: (cell, value) => {
        cell.textContent = value;
      }
    },
    {
      name: "Capsule",
      value: key => key.capsule,
      sort: (a, b) => a.localeCompare(b),
      format: (cell, value) => {
        cell.textContent = value;
      }
    }
  ];

  sortable.sortBy = 0;
  sortable.items = operation.keysonhand.filter(function(k) {
    return k.portalId == portalID;
  });
  return sortable;
};
