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

import PortalUI from "../ui/portal";

const BlockerList = WDialog.extend({
  statics: {
    TYPE: "blockerList",
  },

  options: {
    usePane: true,
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    window.map.on("wasabee:op:select wasabee:op:change", this.update, this);
    window.map.on("wasabee:crosslinks:done", this.update, this);

    window.addHook("portalAdded", listenForAddedPortals);
    window.addHook("portalDetailLoaded", listenForPortalDetails);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.map.off("wasabee:op:select wasabee:op:change", this.update, this);
    window.map.off("wasabee:crosslinks:done", this.update, this);

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
    };
    buttons[wX("AUTOMARK")] = () => {
      const operation = getSelectedOperation();
      blockerAutomark(operation);
    };
    buttons[wX("RESET")] = () => {
      const operation = getSelectedOperation();
      operation.blockers = new Array();
      this.update();
      operation.update(false); // blockers do not need to be sent to server
      window.map.fire("wasabee:crosslinks");
    };
    buttons[wX("LOAD PORTALS")] = () => {
      const operation = getSelectedOperation();
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
      title: wX("KNOWN_BLOCK", { opName: operation.name }),
      html: this.sortable.table,
      width: "auto",
      dialogClass: "blockerlist",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.blockerList,
    });
  },

  // when op changed or crosslink ended
  update: function () {
    const operation = getSelectedOperation();
    if (!this._enabled) return;
    this.sortable = this._getListDialogContent(
      this.sortable.sortBy,
      this.sortable.sortAsc
    );
    this.setContent(this.sortable.table);
    this.setTitle(wX("KNOWN_BLOCK", { opName: operation.name }));
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
          row.appendChild(PortalUI.displayFormat(p));
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
          row.appendChild(PortalUI.displayFormat(p));
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
