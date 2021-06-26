import { WDialog } from "../leafletClasses";
import Sortable from "../sortable";
import WasabeeAgent from "../model/agent";
import { getSelectedOperation } from "../selectedOp";
import wX from "../wX";

const KeyListPortal = WDialog.extend({
  statics: {
    TYPE: "keyListPortal",
  },

  options: {
    // portalID
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    window.map.on("wasabee:op:select wasabee:op:change", this.update, this);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.map.off("wasabee:op:select wasabee:op:change", this.update, this);
  },

  _displayDialog: function () {
    if (!this.options.portalID) {
      this.disable();
      return;
    }

    this._sortable = this.getSortable();

    const buttons = {};
    buttons[wX("OK")] = () => {
      this.closeDialog();
    };

    const op = getSelectedOperation();
    const portal = op.getPortal(this.options.portalID);

    this.createDialog({
      title: wX("PORTAL KEY LIST", { portalName: portal.displayName }),
      html: this.getListDialogContent(this.options.portalID),
      width: "auto",
      dialogClass: "keylistportal",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.keyListPortal,
    });
  },

  update: function () {
    // handle operation changes gracefully
    const op = getSelectedOperation();
    const portal = op.getPortal(this.options.portalID);
    if (portal == null) {
      // needs wX
      this.setTitle("unknown portal");
      this.setContent("selected operation changed");
      return;
    }

    const table = this.getListDialogContent(this.options.portalID);
    this.setContent(table);
    this.setTitle(wX("PORTAL KEY LIST", { portalName: portal.displayName }));
  },

  getSortable: function () {
    const sortable = new Sortable();
    sortable.fields = [
      {
        name: wX("AGENT"),
        value: (key) => key.gid,
        sort: (a, b) => a.localeCompare(b),
        format: async (cell, value, key) => {
          const agent = await WasabeeAgent.get(key.gid);
          cell.textContent = agent ? agent.name : key.gid;
        },
      },
      {
        name: wX("ON_HAND"),
        value: (key) => key.onhand,
      },
      {
        name: wX("CAPSULE"),
        value: (key) => key.capsule,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value) => {
          cell.textContent = value;
        },
      },
    ];

    sortable.sortBy = 0;
    return sortable;
  },

  getListDialogContent: function (portalID) {
    const operation = getSelectedOperation();
    this._sortable.items = operation.keysonhand.filter(function (k) {
      return k.portalId == portalID;
    });
    return this._sortable.table;
  },
});

export default KeyListPortal;
