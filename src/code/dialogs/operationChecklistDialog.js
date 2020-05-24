import { WDialog } from "../leafletClasses";
import WasabeeLink from "../link";
import Sortable from "../../lib/sortable";
import AssignDialog from "./assignDialog";
import StateDialog from "./stateDialog";
import SetCommentDialog from "./setCommentDialog";
import { getAgent } from "../server";
import {
  listenForAddedPortals,
  listenForPortalDetails,
  loadFaked
} from "../uiCommands";
import { getSelectedOperation } from "../selectedOp";
import WasabeeMe from "../me";
import wX from "../wX";

const OperationChecklistDialog = WDialog.extend({
  statics: {
    TYPE: "operationChecklist"
  },

  initialize: function(map = window.map, options) {
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
    loadFaked(this._operation);

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

    const buttons = {};
    buttons[wX("OK")] = () => {
      this._dialog.dialog("close");
    };

    this._dialog = window.dialog({
      title: wX("OP_CHECKLIST", this._operation.name),
      html: this.sortable.table,
      width: "auto",
      dialogClass: "ui-resizable wasabee-dialog wasabee-dialog-checklist",
      closeCallback: () => {
        this.disable();
        delete this._listDialogData;
      },
      id: window.plugin.wasabee.static.dialogNames.operationChecklist
    });
    this._dialog.dialog("option", "buttons", buttons);
  },

  checklistUpdate: function(newOpData) {
    this._operation = newOpData;
    this._dialog.dialog("option", "title", wX("OP_CHECKLIST", newOpData.name));
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
        format: (cell, value, thing) => {
          const oif = L.DomUtil.create("input");
          oif.value = value;
          oif.size = 3;
          L.DomEvent.on(oif, "change", ev => {
            L.DomEvent.stop(ev);
            thing.opOrder = oif.value;
            // since we are changing the values in the (thing)
            // let the op know it has changed (save/redraw);
            operation.update(); // OK - necessary
          });
          cell.appendChild(oif);
        }
      },
      {
        name: wX("PORTAL"),
        value: thing => {
          return operation.getPortal(thing.portalId).name;
        },
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, thing) => {
          if (thing instanceof WasabeeLink) {
            cell.appendChild(thing.displayFormat(operation, this._smallScreen));
          } else {
            cell.appendChild(
              operation
                .getPortal(thing.portalId)
                .displayFormat(this._smallScreen)
            );
          }
        }
      },
      {
        name: wX("TYPE"),
        value: thing => {
          if (thing instanceof WasabeeLink) {
            return "Link";
          } else {
            // push this shit in to the marker class
            return wX(thing.type);
          }
        },
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, thing) => {
          const span = L.DomUtil.create("span", null, cell);
          if (thing.type) L.DomUtil.addClass(span, thing.type);
          span.textContent = value;
        }
      },
      {
        name: wX("COMMENT"),
        value: thing => thing.comment,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, thing) => {
          const comment = L.DomUtil.create("a", null, cell);
          comment.textContent = value;
          L.DomEvent.on(cell, "click", ev => {
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
        format: (cell, value, thing) => {
          const assigned = L.DomUtil.create("a", null, cell);
          assigned.textContent = value;
          // do not use agent.formatDisplay since that links and overwrites the assign event
          if (WasabeeMe.isLoggedIn()) {
            // XXX should be writable op
            L.DomEvent.on(cell, "click", ev => {
              L.DomEvent.stop(ev);
              const ad = new AssignDialog();
              ad.setup(thing, operation);
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
        format: (cell, value, thing) => {
          const a = L.DomUtil.create("a", null, cell);
          a.href = "#";
          a.textContent = wX(value);
          L.DomEvent.on(cell, "click", ev => {
            L.DomEvent.stop(ev);
            const sd = new StateDialog();
            sd.setup(thing, operation);
            sd.enable();
          });
        },
        smallScreenHide: true
      },
      {
        name: "Commands",
        value: obj => typeof obj,
        format: (cell, value, obj) => {
          if (obj instanceof WasabeeLink) {
            const rev = L.DomUtil.create("a", null, cell);
            rev.href = "#";
            rev.textContent = "Reverse";
            L.DomEvent.on(rev, "click", ev => {
              L.DomEvent.stop(ev);
              operation.reverseLink(obj.fromPortalId, obj.toPortalId);
            });
          } else {
            cell.textContent = "";
          }
        }
      }
    ];
    content.sortBy = sortBy;
    content.sortAsc = !sortAsc; // I don't know why this flips
    content.items = allThings;
    return content;
  }
});

export default OperationChecklistDialog;
