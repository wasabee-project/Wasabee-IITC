import { WDialog } from "../leafletClasses";
import WasabeeLink from "../link";
import Sortable from "../../lib/sortable";
import AssignDialog from "./assignDialog";
import SetCommentDialog from "./setCommentDialog";
import { getAgent } from "../server";
import { listenForAddedPortals, listenForPortalDetails } from "../uiCommands";
import { getSelectedOperation } from "../selectedOp";
import WasabeeMe from "../me";
import wX from "../wX";

const OperationChecklistDialog = WDialog.extend({
  statics: {
    TYPE: "operationChecklist"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = OperationChecklistDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    const context = this;
    this._operation = getSelectedOperation();
    // magic context incantation to make "this" work...
    this._UIUpdateHook = newOpData => {
      context.checklistUpdate(newOpData);
    };
    window.addHook("wasabeeUIUpdate", this._UIUpdateHook);
    window.addHook("portalAdded", listenForAddedPortals);
    window.addHook("portalDetailsLoaded", listenForPortalDetails);

    for (const f of this._operation.fakedPortals) {
      window.portalDetail.request(f.id);
    }

    this._displayDialog();
  },

  removeHooks: function() {
    WDialog.prototype.removeHooks.call(this);
    window.removeHook("wasabeeUIUpdate", this._UIUpdateHook);
    window.removeHook("portalAdded", listenForAddedPortals);
    window.removeHook("portalDetailsLoaded", listenForPortalDetails);
  },

  _displayDialog: function() {
    this.sortable = this.getListDialogContent(this._operation, 0, false); // defaults to sorting by op order

    this._dialog = window.dialog({
      title: wX("OP_CHECKLIST", this._operation.name),
      width: "auto",
      height: "auto",
      html: this.sortable.table,
      dialogClass: "ui-resizable wasabee-dialog wasabee-dialog-checklist",
      closeCallback: () => {
        this.disable();
        delete this._listDialogData;
      },
      resizable: true,
      id: window.plugin.wasabee.static.dialogNames.operationChecklist
    });
  },

  checklistUpdate: function(newOpData) {
    this._operation = newOpData;
    this._dialog.dialog(
      wX("OPTION"),
      wX("TITLE"),
      wX("OP_CHECKLIST", newOpData.name)
    );
    this.sortable = this.getListDialogContent(
      newOpData,
      this.sortable.sortBy,
      this.sortable.sortAsc
    );
    this._dialog.html(this.sortable.table);
  },

  getListDialogContent: function(operation, sortBy, sortAsc) {
    // collapse markers and links into one array.
    const allThings = operation.links.concat(operation.markers);

    const content = new Sortable();
    content.fields = [
      {
        name: wX("ORDER"),
        value: thing => thing.opOrder,
        // sort: (a, b) => a - b,
        format: (row, value, thing) => {
          const oif = L.DomUtil.create("input", "");
          oif.value = value;
          oif.size = 3;
          L.DomEvent.on(oif, "change", ev => {
            L.DomEvent.stop(ev);
            thing.opOrder = oif.value;
            // since we are changing the values in the (thing)
            // let the op know it has changed (save/redraw);
            operation.update(); // OK - necessary
          });
          row.appendChild(oif);
        }
      },
      {
        name: wX("PORTAL"),
        value: thing => {
          return operation.getPortal(thing.portalId).name;
        },
        sort: (a, b) => a.localeCompare(b),
        format: (row, value, thing) => {
          if (thing instanceof WasabeeLink) {
            row.appendChild(thing.displayFormat(operation, this._smallScreen));
          } else {
            row.appendChild(
              operation
                .getPortal(thing.portalId)
                .displayFormat(operation, this._smallScreen)
            );
          }
        }
      },
      {
        name: wX("TYPE"),
        value: thing => {
          if (thing instanceof WasabeeLink) {
            return "link";
          } else {
            // push this shit in to the marker class
            return (
              window.plugin.wasabee.static.markerTypes.get(thing.type).label ||
              "unknown"
            );
          }
        },
        sort: (a, b) => a.localeCompare(b),
        format: (row, value) => {
          row.textContent = value;
        }
      },
      {
        name: wX("COMMENT"),
        value: thing => thing.comment,
        sort: (a, b) => a.localeCompare(b),
        format: (row, value, thing) => {
          const comment = L.DomUtil.create("a", "", row);
          comment.textContent = value;
          L.DomEvent.on(row, "click", ev => {
            L.DomEvent.stop(ev);
            const scd = new SetCommentDialog(window.map);
            scd.setup(thing, operation);
            scd.enable();
          });
        },
        smallScreenHide: true
      },
      {
        name: wX("ASS_TO"),
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
          const assigned = L.DomUtil.create("a", "", row);
          assigned.textContent = value;
          // assigned.appendChild(agent.displayFormat());
          if (WasabeeMe.isLoggedIn()) {
            // XXX should be writable op
            L.DomEvent.on(row, "click", ev => {
              L.DomEvent.stop(ev);
              const ad = new AssignDialog();
              ad.setup(agent, operation);
              ad.enable();
            });
          }
        },
        smallScreenHide: true
      },
      {
        name: wX("STATE"),
        value: thing => thing.state,
        sort: (a, b) => a.localeCompare(b),
        format: (row, value) => {
          row.textContent = value;
        },
        smallScreenHide: true
      }
    ];
    content.sortBy = sortBy;
    content.sortAsc = !sortAsc; // I don't know why this flips
    content.items = allThings;
    return content;
  }
});

export default OperationChecklistDialog;
