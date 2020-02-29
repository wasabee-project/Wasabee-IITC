import { Feature } from "../leafletDrawImports";
import Sortable from "../../lib/sortable";
import { getSelectedOperation } from "../selectedOp";
import WasabeeTeam from "../team";

const OpPermList = Feature.extend({
  statics: {
    TYPE: "opPermList"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = OpPermList.TYPE;
    Feature.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    if (!this._map) return;
    Feature.prototype.addHooks.call(this);
    this._operation = getSelectedOperation();
    this._displayDialog();
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
  },

  _displayDialog: function() {
    if (!this._map) return;

    this.setup();
    const html = L.DomUtil.create("div", null);
    html.appendChild(this._table.table);
    if (this._operation.IsOwnedOp()) {
      const addArea = L.DomUtil.create("div", null, html);
      addArea.textContent = "add new perm thing will go here";
    }

    this._dialog = window.dialog({
      title: this._operation.name + " permissions",
      width: "auto",
      height: "auto",
      html: html,
      dialogClass: "wasabee-dialog wasabee-dialog-linklist",
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
        name: "Team",
        value: perm => {
          const t = WasabeeTeam.get(perm.teamid);
          if (t) return t.name;
          return "[" + perm.teamid + "] not enabled";
        },
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value) => (cell.textContent = value)
      },
      {
        name: "Role",
        value: perm => perm.role,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value) => (cell.textContent = value)
      }
    ];
    this._table.sortBy = 0;
    this._table.items = this._operation.teamlist;
  }
});

export default OpPermList;
