import { WDialog } from "../leafletClasses";
import Sortable from "../sortable";
import { getSelectedOperation } from "../selectedOp";
import {
  listenForAddedPortals,
  listenForPortalDetails,
  loadFaked,
  blockerAutomark,
} from "../uiCommands";
import wX from "../wX";
import TrawlDialog from "./trawl";

const BlockerList = WDialog.extend({
  statics: {
    TYPE: "blockerList",
  },

  options: {
    usePane: true,
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    window.map.on("wasabeeUIUpdate", this.blockerlistUpdate, this);
    window.map.on("wasabeeCrosslinksDone", this.blockerlistUpdate, this);

    window.addHook("portalAdded", listenForAddedPortals);
    window.addHook("portalDetailLoaded", listenForPortalDetails);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.map.off("wasabeeUIUpdate", this.blockerlistUpdate, this);
    window.map.off("wasabeeCrosslinksDone", this.blockerlistUpdate, this);

    window.removeHook("portalAdded", listenForAddedPortals);
    window.removeHook("portalDetailLoaded", listenForPortalDetails);
  },

  _displayDialog: function () {
    const operation = getSelectedOperation();
    this.sortable = this._getListDialogContent(0, false); // defaults to sorting by op order
    loadFaked(operation);
    const buttons = {};
    buttons[wX("OK")] = () => {
      this.closeDialog();
      window.map.fire("wasabeeUIUpdate", { reason: "blockerlist" }, false);
    };
    buttons[wX("AUTOMARK")] = () => {
      blockerAutomark(operation);
    };
    buttons[wX("RESET")] = () => {
      operation.blockers = new Array();
      this.blockerlistUpdate();
      operation.update(false); // blockers do not need to be sent to server
      window.map.fire("wasabeeCrosslinks", { reason: "blockerlist" }, false);
    };
    buttons[wX("LOAD PORTALS")] = () => {
      loadFaked(operation, true); // force
    };
    buttons[wX("TRAWL TITLE")] = () => {
      const td = new TrawlDialog();
      td.enable();
    };
    buttons["Clear Automark"] = () => {
      const operation = getSelectedOperation();
      for (const m of operation.markers) {
        if (m.comment == "auto-marked") operation.removeMarker(m);
      }
    };

    this.createDialog({
      title: wX("KNOWN_BLOCK", operation.name),
      html: this.sortable.table,
      width: "auto",
      dialogClass: "blockerlist",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.blockerList,
    });
  },

  // when the wasabeeUIUpdate hook is called from anywhere, update the display data here
  blockerlistUpdate: function () {
    const operation = getSelectedOperation();
    if (!this._enabled) return;
    this.sortable = this._getListDialogContent(
      this.sortable.sortBy,
      this.sortable.sortAsc
    );
    this.setContent(this.sortable.table);
    this.setTitle(wX("KNOWN_BLOCK", operation.name));
  },

  // because the sortable values depend on the operation, we can't have it created at addHooks unless we want a lot of getSelectedOperations embedded here
  _getListDialogContent(sortBy, sortAsc) {
    const operation = getSelectedOperation();
    const content = new Sortable();
    content.fields = [
      {
        name: wX("FROM_PORT"),
        value: (blocker) => {
          return operation.getPortal(blocker.fromPortalId).name;
        },
        sort: (a, b) => a.localeCompare(b),
        format: (row, value, blocker) => {
          const p = operation.getPortal(blocker.fromPortalId);
          row.appendChild(p.displayFormat());
        },
      },
      {
        name: this._smallScreen ? "#" : wX("COUNT"),
        value: (blocker) => {
          const c = operation.blockers.filter(
            (b) =>
              b.fromPortalId == blocker.fromPortalId ||
              b.toPortalID == blocker.fromPortalId
          );
          return c.length;
        },
        format: (row, value) => (row.textContent = value),
      },
      {
        name: wX("TO_PORT"),
        value: (blocker) => {
          return operation.getPortal(blocker.toPortalId).name;
        },
        sort: (a, b) => a.localeCompare(b),
        format: (row, value, blocker) => {
          const p = operation.getPortal(blocker.toPortalId);
          row.appendChild(p.displayFormat());
        },
      },
      {
        name: this._smallScreen ? "#" : wX("COUNT"),
        value: (blocker) => {
          const c = operation.blockers.filter(
            (b) =>
              b.fromPortalId == blocker.toPortalId ||
              b.toPortalId == blocker.toPortalId
          );
          return c.length;
        },
        format: (row, value) => (row.textContent = value),
      },
    ];
    content.sortBy = sortBy;
    content.sortAsc = sortAsc;
    content.items = operation.blockers;
    return content;
  },
});

export default BlockerList;
