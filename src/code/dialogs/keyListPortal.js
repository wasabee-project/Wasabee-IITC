import { Feature } from "../leafletDrawImports";
import Sortable from "../../lib/sortable";
import { agentPromise } from "../server";
import { getSelectedOperation } from "../selectedOp";

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

  setup: function(portalID) {
    this._portalID = portalID;
    this._operation = getSelectedOperation();
    this._portal = this._operation.getPortal(portalID);
    this._sortable = this.getSortable();
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
      html: this.getListDialogContent(this._operation, this._portalID),
      dialogClass: "wasabee-dialog-alerts",
      closeCallback: () => {
        delete this._dialog;
        this.disable();
      },
      id: window.plugin.Wasabee.static.dialogNames.keyListPortal
    });
  },

  keyListUpdate: function(operation) {
    const id =
      "dialog-" + window.plugin.Wasabee.static.dialogNames.keyListPortal;
    if (window.DIALOGS[id]) {
      const table = this.getListDialogContent(operation, this._portalID);
      window.DIALOGS[id].replaceChild(table, window.DIALOGS[id].childNodes[0]);
    }
  },

  getSortable: function() {
    const sortable = new Sortable();
    sortable.fields = [
      {
        name: "Agent",
        value: key => key.gid,
        sort: (a, b) => a.localeCompare(b),
        format: async (cell, value, key) => {
          const agent = await agentPromise(key.gid);
          cell.textContent = agent.name;
        }
      },
      {
        name: "On Hand",
        value: key => key.onhand,
        sort: (a, b) => a - b,
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
    return sortable;
  },

  getListDialogContent: function(operation, portalID) {
    this._sortable.items = operation.keysonhand.filter(function(k) {
      return k.portalId == portalID;
    });
    return this._sortable.table;
  }
});

export default KeyListPortal;
