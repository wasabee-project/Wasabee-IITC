import { Feature } from "../leafletDrawImports";
import Sortable from "../../lib/sortable";
import { getSelectedOperation } from "../selectedOp";

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
    window.addHook("portalAdded", listenForAddedPortals);
    this._displayDialog();
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
    window.removeHook("wasabeeUIUpdate", this._UIUpdateHook);
    window.removeHook("portalAdded", listenForAddedPortals);
  },

  _displayDialog: function() {
    if (!this._map) return;
    const blockerList = this;

    this.sortable = getListDialogContent(this._operation, 0, false); // defaults to sorting by op order

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
          alert(
            "Auto-Mark does not work yet... but how awesome will it be to have it?!"
          );
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
    if (!this._enabled) return;
    const id = "dialog-" + window.plugin.wasabee.static.dialogNames.blockerList;
    if (window.DIALOGS[id]) {
      this.sortable = getListDialogContent(
        newOpData,
        this.sortable.sortBy,
        this.sortable.sortAsc
      );
      window.DIALOGS[id].replaceChild(
        this.sortable.table,
        window.DIALOGS[id].childNodes[0]
      );
    }
  }
});

export default BlockerList;

const getListDialogContent = (operation, sortBy, sortAsc) => {
  const content = new Sortable();
  content.fields = [
    {
      name: "From Portal",
      value: blocker => {
        return operation.getPortal(blocker.fromPortalId).name;
      },
      sort: (a, b) => a.localeCompare(b),
      format: (row, value, blocker) => {
        const p = operation.getPortal(blocker.fromPortalId);
        row.appendChild(p.displayFormat(operation));
      }
    },
    {
      name: "Count",
      value: blocker => {
        const c = operation.blockers.filter(
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
        return operation.getPortal(blocker.toPortalId).name;
      },
      sort: (a, b) => a.localeCompare(b),
      format: (row, value, blocker) => {
        const p = operation.getPortal(blocker.toPortalId);
        row.appendChild(p.displayFormat(operation));
      }
    },
    {
      name: "Count",
      value: blocker => {
        const c = operation.blockers.filter(
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
  content.items = operation.blockers;
  return content;
};

// yes, one per dialog type otherwise closing removes callback registration
const listenForAddedPortals = newPortal => {
  if (!newPortal.portal.options.data.title) return;

  const op = getSelectedOperation();

  for (const faked of op.fakedPortals) {
    if (faked.id == newPortal.portal.options.guid) {
      faked.name = newPortal.portal.options.data.title;
      op.update(true);
    }
  }
};
