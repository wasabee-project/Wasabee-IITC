import { WDialog } from "../leafletClasses";
import Sortable from "../../lib/sortable";
import WasabeeAgent from "../agent";
import { getSelectedOperation } from "../selectedOp";
import wX from "../wX";
import { postToFirebase } from "../firebaseSupport";

const KeyListPortal = WDialog.extend({
  statics: {
    TYPE: "keyListPortal",
  },

  initialize: function (map = window.map, options) {
    this.type = KeyListPortal.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
    postToFirebase({ id: "analytics", action: KeyListPortal.TYPE });
  },

  addHooks: function () {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    const context = this;
    this._UIUpdateHook = () => {
      context.keyListUpdate();
    };
    window.addHook("wasabeeUIUpdate", this._UIUpdateHook);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.removeHook("wasabeeUIUpdate", this._UIUpdateHook);
  },

  setup: function (portalID) {
    this._portalID = portalID;
    this._sortable = this.getSortable();
  },

  _displayDialog: function () {
    if (!this._portalID) {
      this.disable();
      return;
    }

    const buttons = {};
    buttons[wX("OK")] = () => {
      this._dialog.dialog("close");
    };

    const op = getSelectedOperation();
    const portal = op.getPortal(this._portalID);

    this._dialog = window.dialog({
      title: wX("PORTAL KEY LIST", portal.displayName),
      html: this.getListDialogContent(this._portalID),
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-keylistportal",
      closeCallback: () => {
        delete this._dialog;
        this.disable();
      },
      id: window.plugin.wasabee.static.dialogNames.keyListPortal,
    });
    this._dialog.dialog("option", "buttons", buttons);
  },

  keyListUpdate: function () {
    // handle operation changes gracefully
    const op = getSelectedOperation();
    const portal = op.getPortal(this._portalID);
    if (portal == null) {
      // needs wX
      this._dialog("option", "title", "unknown portal");
      this._dialog.html("selected operation changed");
      return;
    }

    const table = this.getListDialogContent(this._portalID);
    this._dialog.html(table);
    this._dialog("option", "title", wX("PORTAL KEY LIST", portal.displayName));
  },

  getSortable: function () {
    const sortable = new Sortable();
    sortable.fields = [
      {
        name: wX("AGENT"),
        value: (key) => key.gid,
        sort: (a, b) => a.localeCompare(b),
        format: async (cell, value, key) => {
          const agent = await WasabeeAgent.waitGet(key.gid);
          cell.textContent = agent.name;
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
