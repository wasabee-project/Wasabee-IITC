import { Feature } from "../leafletDrawImports";
import Sortable from "../../lib/sortable";
import { getSelectedOperation } from "../selectedOp";
import UiCommands from "../uiCommands";
import WasabeePortal from "../portal";

const BlockerList = Feature.extend({
  statics: {
    TYPE: "blockerList"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = BlockerList.TYPE;
    Feature.prototype.initialize.call(this, map, options);
    this._operation = getSelectedOperation();
  },

  addHooks: function() {
    if (!this._map) return;
    Feature.prototype.addHooks.call(this);
    const context = this;
    this._UIUpdateHook = newOpData => {
      context.blockerlistUpdate(newOpData);
    };
    window.addHook("wasabeeUIUpdate", this._UIUpdateHook);
    window.addHook("portalAdded", UiCommands.listenForAddedPortals);
    this._displayDialog();
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
    window.removeHook("wasabeeUIUpdate", this._UIUpdateHook);
    window.removeHook("portalAdded", UiCommands.listenForAddedPortals);
  },

  _displayDialog: function() {
    if (!this._map) return;
    const blockerList = this;

    this.sortable = this._getListDialogContent(0, false); // defaults to sorting by op order

    for (const f of this._operation.fakedPortals) {
      window.portalDetail.request(f.id);
    }

    this._dialog = window.dialog({
      title: "Known Blockers: " + this._operation.name,
      width: "auto",
      height: "auto",
      position: {
        my: "center top",
        at: "center center"
      },
      html: this.sortable.table,
      dialogClass: "wasabee-dialog",
      buttons: {
        OK: () => {
          this._dialog.dialog("close");
          window.runHooks("wasabeeUIUpdate", this._operation);
        },
        "Auto-Mark": () => {
          this.automark();
        },
        Reset: () => {
          this._operation.blockers = new Array();
          this.blockerlistUpdate(this._operation);
          this._operation.update(false); // blockers do not need to be sent to server
          window.runHooks("wasabeeCrosslinks", this._operation);
        }
      },
      closeCallback: () => {
        blockerList.disable();
        delete blockerList._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.blockerList
    });
  },

  // when the wasabeeUIUpdate hook is called from anywhere, update the display data here
  blockerlistUpdate: function(newOpData) {
    this._operation = newOpData;
    if (!this._enabled) return;
    const id = "dialog-" + window.plugin.wasabee.static.dialogNames.blockerList;
    if (window.DIALOGS[id]) {
      window.DIALOGS[id].parentNode.children[0].children[1].innerText =
        "Known Blockers: " + newOpData.name;
      this.sortable = this._getListDialogContent(
        this.sortable.sortBy,
        this.sortable.sortAsc
      );
      window.DIALOGS[id].replaceChild(
        this.sortable.table,
        window.DIALOGS[id].childNodes[0]
      );
    }
  },

  _getListDialogContent(sortBy, sortAsc) {
    const content = new Sortable();
    content.fields = [
      {
        name: "From Portal",
        value: blocker => {
          return this._operation.getPortal(blocker.fromPortalId).name;
        },
        sort: (a, b) => a.localeCompare(b),
        format: (row, value, blocker) => {
          const p = this._operation.getPortal(blocker.fromPortalId);
          row.appendChild(p.displayFormat(this._operation));
        }
      },
      {
        name: "Count",
        value: blocker => {
          const c = this._operation.blockers.filter(
            b =>
              b.fromPortalId == blocker.fromPortalId ||
              b.toPortalID == blocker.fromPortalId
          );
          return c.length;
        },
        sort: (a, b) => a - b,
        format: (row, value) => (row.innerHTML = value)
      },
      {
        name: "To Portal",
        value: blocker => {
          return this._operation.getPortal(blocker.toPortalId).name;
        },
        sort: (a, b) => a.localeCompare(b),
        format: (row, value, blocker) => {
          const p = this._operation.getPortal(blocker.toPortalId);
          row.appendChild(p.displayFormat(this._operation));
        }
      },
      {
        name: "Count",
        value: blocker => {
          const c = this._operation.blockers.filter(
            b =>
              b.fromPortalId == blocker.toPortalId ||
              b.toPortalId == blocker.toPortalId
          );
          return c.length;
        },
        sort: (a, b) => a - b,
        format: (row, value) => (row.innerHTML = value)
      }
    ];
    content.sortBy = sortBy;
    content.sortAsc = !sortAsc; // I don't know why this flips
    content.items = this._operation.blockers;
    return content;
  },

  automark() {
    // build count list
    const portals = new Array();
    for (const b of this._operation.blockers) {
      portals.push(b.fromPortalId);
      portals.push(b.toPortalId);
    }
    const reduced = {};
    for (const p of portals) {
      if (!reduced[p]) reduced[p] = 0;
      reduced[p]++;
    }
    const sorted = Object.entries(reduced).sort((a, b) => b[1] - a[1]);
    console.log(sorted);

    if (sorted.length == 0) return;

    const portalId = sorted[0][0];
    // const count = sorted[0][1];

    // put in some smarts for picking close portals, rather than random ones
    // when the count gets > 3

    // get WasabeePortal for portalId
    let wportal = this._operation.getPortal(portalId);
    if (!wportal) wportal = WasabeePortal.get(portalId);
    if (!wportal) {
      alert("Auto-Mark stopped due to portals not being loaded");
      return;
    }
    console.log(wportal);

    // add marker
    let type = window.plugin.wasabee.static.constants.MARKER_TYPE_DESTROY;
    if (
      window.portals[portalId] &&
      window.portals[portalId].options &&
      window.portals[portalId].options.data &&
      window.portals[portalId].options.data.team == "E"
    ) {
      type = window.plugin.wasabee.static.constants.MARKER_TYPE_VIRUS;
    }
    this._operation.addMarker(type, wportal, "auto-marked");

    // remove nodes from blocker list
    this._operation.blockers = this._operation.blockers.filter(b => {
      if (b.fromPortalId == portalId || b.toPortalId == portalId) return false;
      return true;
    });
    window.runHooks("wasabeeUIUpdate", this._operation);
    this.automark();
  }
});

export default BlockerList;
