import { WDialog } from "../leafletClasses";
import Sortable from "../sortable";
import { getSelectedOperation } from "../selectedOp";
import {
  listenForAddedPortals,
  listenForPortalDetails,
  loadBlockerFaked,
} from "../ui/portal";
import { blockerAutomark } from "../uiCommands";
import wX from "../wX";
import TrawlDialog from "./trawl";
import { WasabeeBlocker } from "../model";

import * as PortalUI from "../ui/portal";
import statics from "../static";

function getFactionCSS(team) {
  return team === "E" ? "enl" : team === "R" ? "res" : "mac";
}

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
    window.map.on("wasabee:crosslinks:update", this.update, this);
    window.map.on("wasabee:crosslinks:done", this.update, this);

    window.addHook("portalAdded", listenForAddedPortals);
    window.addHook("portalDetailLoaded", listenForPortalDetails);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.map.off("wasabee:op:select wasabee:op:change", this.update, this);
    window.map.off("wasabee:crosslinks:update", this.update, this);
    window.map.off("wasabee:crosslinks:done", this.update, this);

    window.removeHook("portalAdded", listenForAddedPortals);
    window.removeHook("portalDetailLoaded", listenForPortalDetails);
  },

  _displayDialog: async function () {
    const operation = getSelectedOperation();
    this.sortable = await this._getListDialogContent(0, false); // defaults to sorting by op order
    loadBlockerFaked(operation);
    const buttons = {};
    buttons[wX("CLOSE")] = () => {
      this.closeDialog();
    };
    // doesn't support op select event
    if (operation.canWrite()) {
      buttons[wX("AUTOMARK")] = () => {
        const operation = getSelectedOperation();
        blockerAutomark(operation);
      };
    }
    buttons[wX("RESET")] = async () => {
      const operation = getSelectedOperation();
      await WasabeeBlocker.removeBlockers(operation.ID);
      operation.resetBlockedLinks();
      this.update();
      window.map.fire("wasabee:crosslinks");
    };
    buttons[wX("LOAD PORTALS")] = () => {
      const operation = getSelectedOperation();
      loadBlockerFaked(operation, true); // force
    };
    buttons[wX("TRAWL TITLE")] = () => {
      const td = new TrawlDialog();
      td.enable();
    };
    if (operation.canWrite()) {
      buttons[wX("dialog.blockers.clear_automark")] = () => {
        const operation = getSelectedOperation();
        operation.startBatchMode();
        operation.markers = operation.markers.filter(
          (m) => m.comment !== "auto-marked"
        );
        operation.cleanPortalList();
        operation.endBatchMode();
      };
    }

    this.createDialog({
      title: wX("KNOWN_BLOCK", { opName: operation.name }),
      html: this.sortable.table,
      width: "auto",
      dialogClass: "blockerlist",
      buttons: buttons,
      id: statics.dialogNames.blockerList,
    });
  },

  // when op changed or crosslink ended
  update: async function () {
    if (!this._enabled) return;
    if (!this.sortable) return;
    const operation = getSelectedOperation();
    this.sortable = await this._getListDialogContent(
      this.sortable.sortBy,
      this.sortable.sortAsc
    );
    this.setContent(this.sortable.table);
    this.setTitle(wX("KNOWN_BLOCK", { opName: operation.name }));
  },

  // because the sortable values depend on the operation, we can't have it created at addHooks unless we want a lot of getSelectedOperations embedded here
  async _getListDialogContent(sortBy, sortAsc) {
    const operation = getSelectedOperation();
    const content = new Sortable();

    const blockers = await WasabeeBlocker.getAll(operation);

    content.fields = [
      {
        name: wX("FROM_PORT"),
        value: (blocker) =>
          blocker.fromPortal ? blocker.fromPortal.name : blocker.from,
        sort: (a, b) => a.localeCompare(b),
        format: (row, value, blocker) => {
          if (blocker.fromPortal) {
            const a = row.appendChild(
              PortalUI.displayFormat(blocker.fromPortal)
            );
            if (blocker.team) a.classList.add(getFactionCSS(blocker.team));
          } else row.textContent = value;
        },
      },
      {
        name: this._smallScreen ? "#" : wX("COUNT"),
        value: (blocker) => {
          const c = blockers.filter(
            (b) => b.from == blocker.from || b.to == blocker.from
          );
          return c.length;
        },
        format: (row, value) => (row.textContent = value),
      },
      {
        name: wX("TO_PORT"),
        value: (blocker) =>
          blocker.toPortal ? blocker.toPortal.name : blocker.to,
        sort: (a, b) => a.localeCompare(b),
        format: (row, value, blocker) => {
          if (blocker.toPortal) {
            const a = row.appendChild(PortalUI.displayFormat(blocker.toPortal));
            if (blocker.team) a.classList.add(getFactionCSS(blocker.team));
          } else row.textContent = value;
        },
      },
      {
        name: this._smallScreen ? "#" : wX("COUNT"),
        value: (blocker) => {
          const c = blockers.filter(
            (b) => b.from == blocker.to || b.to == blocker.to
          );
          return c.length;
        },
        format: (row, value) => (row.textContent = value),
      },
    ];
    content.sortBy = sortBy;
    content.sortAsc = sortAsc;
    content.items = blockers;
    return content;
  },
});

export default BlockerList;
