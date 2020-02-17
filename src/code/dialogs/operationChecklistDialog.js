import { Feature } from "../leafletDrawImports";
import WasabeeLink from "../link";
import Sortable from "../../lib/sortable";
import AssignDialog from "./assignDialog";
import SetCommentDialog from "./setCommentDialog";
import { getAgent } from "../server";
import UiCommands from "../uiCommands";

const OperationChecklistDialog = Feature.extend({
  statics: {
    TYPE: "operationChecklist"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = OperationChecklistDialog.TYPE;
    Feature.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    if (!this._map) return;
    Feature.prototype.addHooks.call(this);
    const context = this;
    this._operation = window.plugin.wasabee.getSelectedOperation();
    // magic context incantation to make "this" work...
    this._UIUpdateHook = newOpData => {
      context.checklistUpdate(newOpData);
    };
    window.addHook("wasabeeUIUpdate", this._UIUpdateHook);
    window.addHook("portalAdded", UiCommands.listenForAddedPortals);

    for (const f of this._operation.fakedPortals) {
      window.portalDetail.request(f.id);
    }

    this._displayDialog();
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
    window.removeHook("wasabeeUIUpdate", this._UIUpdateHook);
    window.removeHook("portalAdded", UiCommands.listenForAddedPortals);
  },

  _displayDialog: function() {
    this.sortable = getListDialogContent(this._operation, 0, false); // defaults to sorting by op order

    this._listDialogData = window.dialog({
      title: "Operation Checklist",
      width: "auto",
      height: "auto",
      position: {
        my: "center top",
        at: "center center"
      },
      html: this.sortable.table,
      dialogClass: "wasabee-dialog",
      closeCallback: () => {
        this.disable();
        delete this._listDialogData;
      },
      id: window.plugin.Wasabee.static.dialogNames.operationChecklist
    });
  },

  checklistUpdate: function(newOpData) {
    if (!this._enabled) return; // kludge until I can figure out how to remove the hook properly
    const id =
      "dialog-" + window.plugin.Wasabee.static.dialogNames.operationChecklist;
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

export default OperationChecklistDialog;

// this can be moved into the class now
const getListDialogContent = (operation, sortBy, sortAsc) => {
  // collapse markers and links into one array.
  const allThings = operation.links.concat(operation.markers);

  const content = new Sortable();
  content.fields = [
    {
      name: "Order",
      value: thing => thing.opOrder,
      sort: (a, b) => a - b,
      format: (row, value, thing) => {
        const oif = document.createElement("input");
        oif.value = value;
        oif.size = 3;
        oif.addEventListener(
          "change",
          () => {
            thing.opOrder = oif.value;
            // since we are changing the values in the (thing)
            // let the op know it has changed (save/redraw);
            operation.update(); // OK - necessary
          },
          false
        );
        row.appendChild(oif);
      }
    },
    {
      name: "Portal",
      value: thing => {
        return operation.getPortal(thing.portalId).name;
      },
      sort: (a, b) => a.localeCompare(b),
      format: (row, value, thing) => {
        if (thing instanceof WasabeeLink) {
          row.appendChild(thing.displayFormat(operation));
        } else {
          row.appendChild(
            operation.getPortal(thing.portalId).displayFormat(operation)
          );
        }
      }
    },
    {
      name: "Type",
      value: thing => {
        if (thing instanceof WasabeeLink) {
          return "link";
        } else {
          // push this shit in to the marker class
          return (
            window.plugin.Wasabee.markerTypes.get(thing.type).label || "unknown"
          );
        }
      },
      sort: (a, b) => a.localeCompare(b),
      format: (row, value) => {
        row.innerHTML = value;
      }
    },
    {
      name: "Comment",
      value: thing => thing.comment,
      sort: (a, b) => a.localeCompare(b),
      format: (row, value, thing) => {
        const comment = row.appendChild(document.createElement("a"));
        comment.innerHTML = value;
        row.addEventListener("click", () => {
          const scd = new SetCommentDialog(window.map);
          scd.setup(thing, operation);
          scd.enable();
        });
      }
    },
    {
      name: "Assigned To",
      value: thing => {
        if (thing.assignedTo != null && thing.assignedTo != "") {
          const agent = getAgent(thing.assignedTo);
          if (agent) {
            return agent.name;
          } else {
            return "looking up: [" + thing.assignedTo + "]";
          }
        }
        return "";
      },
      sort: (a, b) => a.localeCompare(b),
      format: (row, value, agent) => {
        const assigned = row.appendChild(document.createElement("a"));
        assigned.innerHTML = value;
        row.addEventListener("click", () => {
          const ad = new AssignDialog();
          ad.setup(agent, operation);
          ad.enable();
        });
      }
    },
    {
      name: "State",
      value: thing => thing.state,
      sort: (a, b) => a.localeCompare(b),
      format: (row, value) => {
        row.textContent = value;
      }
    }
  ];
  content.sortBy = sortBy;
  content.sortAsc = !sortAsc; // I don't know why this flips
  content.items = allThings;
  return content;
};
