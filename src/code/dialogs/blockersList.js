import { WDialog } from "../leafletClasses";
import Sortable from "../../lib/sortable";
import { getSelectedOperation } from "../selectedOp";
import {
  listenForAddedPortals,
  listenForPortalDetails,
  loadFaked,
  blockerAutomark,
} from "../uiCommands";
import wX from "../wX";
import TrawlDialog from "./trawl";
import { postToFirebase } from "../firebaseSupport";

const BlockerList = WDialog.extend({
  statics: {
    TYPE: "blockerList",
  },

  initialize: function (map = window.map, options) {
    this.type = BlockerList.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
    this._operation = getSelectedOperation();
    postToFirebase({ id: "analytics", action: BlockerList.TYPE });
  },

  addHooks: function () {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    const context = this;
    this._UIUpdateHook = (newOpData) => {
      context.blockerlistUpdate(newOpData);
    };
    window.addHook("wasabeeUIUpdate", this._UIUpdateHook);
    window.addHook("portalAdded", listenForAddedPortals);
    window.addHook("portalDetailLoaded", listenForPortalDetails);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.removeHook("wasabeeUIUpdate", this._UIUpdateHook);
    window.removeHook("portalAdded", listenForAddedPortals);
    window.removeHook("portalDetailLoaded", listenForPortalDetails);
  },

  _displayDialog: function () {
    if (!this._map) return;

    this.sortable = this._getListDialogContent(0, false); // defaults to sorting by op order
    loadFaked(this._operation);
    const buttons = {};
    buttons[wX("OK")] = () => {
      this._dialog.dialog("close");
      window.runHooks("wasabeeUIUpdate", this._operation);
    };
    buttons[wX("AUTOMARK")] = () => {
      blockerAutomark(this._operation);
    };
    buttons[wX("RESET")] = () => {
      this._operation.blockers = new Array();
      this.blockerlistUpdate(this._operation);
      this._operation.update(false); // blockers do not need to be sent to server
      window.runHooks("wasabeeCrosslinks", this._operation);
    };
    buttons[wX("LOAD PORTALS")] = () => {
      loadFaked(this._operation, true); // force
    };
    buttons[wX("TRAWL TITLE")] = () => {
      const td = new TrawlDialog();
      td.enable();
    };

    this._dialog = window.dialog({
      title: wX("KNOWN_BLOCK", this._operation.name),
      html: this.sortable.table,
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-blockerlist",
      buttons: buttons,
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.blockerList,
    });
  },

  // when the wasabeeUIUpdate hook is called from anywhere, update the display data here
  blockerlistUpdate: function (newOpData) {
    this._operation = newOpData;
    if (!this._enabled) return;
    this.sortable = this._getListDialogContent(
      this.sortable.sortBy,
      this.sortable.sortAsc
    );
    this._dialog.html(this.sortable.table);
    this._dialog.dialog("option", "title", wX("KNOWN_BLOCK", newOpData.name));
  },

  _getListDialogContent(sortBy, sortAsc) {
    const content = new Sortable();
    content.fields = [
      {
        name: wX("FROM_PORT"),
        value: (blocker) => {
          return this._operation.getPortal(blocker.fromPortalId).name;
        },
        sort: (a, b) => a.localeCompare(b),
        format: (row, value, blocker) => {
          const p = this._operation.getPortal(blocker.fromPortalId);
          row.appendChild(p.displayFormat(this._smallScreen));
        },
      },
      {
        name: wX("COUNT"),
        value: (blocker) => {
          const c = this._operation.blockers.filter(
            (b) =>
              b.fromPortalId == blocker.fromPortalId ||
              b.toPortalID == blocker.fromPortalId
          );
          return c.length;
        },
        // sort: (a, b) => a - b,
        format: (row, value) => (row.textContent = value),
      },
      {
        name: wX("TO_PORT"),
        value: (blocker) => {
          return this._operation.getPortal(blocker.toPortalId).name;
        },
        sort: (a, b) => a.localeCompare(b),
        format: (row, value, blocker) => {
          const p = this._operation.getPortal(blocker.toPortalId);
          row.appendChild(p.displayFormat(this._smallScreen));
        },
      },
      {
        name: wX("COUNT"),
        value: (blocker) => {
          const c = this._operation.blockers.filter(
            (b) =>
              b.fromPortalId == blocker.toPortalId ||
              b.toPortalId == blocker.toPortalId
          );
          return c.length;
        },
        // sort: (a, b) => a - b,
        format: (row, value) => (row.textContent = value),
      },
    ];
    content.sortBy = sortBy;
    content.sortAsc = !sortAsc; // I don't know why this flips
    content.items = this._operation.blockers;
    return content;
  },
});

export default BlockerList;
