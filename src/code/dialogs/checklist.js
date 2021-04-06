import { WDialog } from "../leafletClasses";
import WasabeeAgent from "../agent";
import WasabeeLink from "../link";
import WasabeeMarker from "../marker";
import Sortable from "../sortable";
import AssignDialog from "./assignDialog";
import StateDialog from "./stateDialog";
import SetCommentDialog from "./setCommentDialog";
import MarkerChangeDialog from "./markerChangeDialog";
import {
  listenForAddedPortals,
  listenForPortalDetails,
  loadFaked,
} from "../uiCommands";
import { getSelectedOperation } from "../selectedOp";
import WasabeeMe from "../me";
import wX from "../wX";

const OperationChecklistDialog = WDialog.extend({
  statics: {
    TYPE: "operationChecklist",
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    window.map.on("wasabeeUIUpdate", this.checklistUpdate, this);

    window.addHook("portalAdded", listenForAddedPortals);
    window.addHook("portalDetailsLoaded", listenForPortalDetails);

    const operation = getSelectedOperation();
    loadFaked(operation);

    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.map.off("wasabeeUIUpdate", this.checklistUpdate, this);

    window.removeHook("portalAdded", listenForAddedPortals);
    window.removeHook("portalDetailsLoaded", listenForPortalDetails);
  },

  _displayDialog: function () {
    const operation = getSelectedOperation();
    this.sortable = this.getListDialogContent(operation, 0, false); // defaults to sorting by op order

    const buttons = {};
    buttons[wX("OK")] = () => {
      this._dialog.dialog("close");
    };
    buttons[wX("LOAD PORTALS")] = () => {
      loadFaked(operation, true); // force
    };

    this._dialog = window.dialog({
      title: wX("OP_CHECKLIST", operation.name),
      html: this.sortable.table,
      width: "auto",
      dialogClass: "ui-resizable wasabee-dialog wasabee-dialog-checklist",
      closeCallback: () => {
        this.disable();
        delete this._listDialogData;
      },
      id: window.plugin.wasabee.static.dialogNames.operationChecklist,
    });
    this._dialog.dialog("option", "buttons", buttons);
  },

  checklistUpdate: function () {
    const operation = getSelectedOperation();
    this._dialog.dialog("option", "title", wX("OP_CHECKLIST", operation.name));
    this.sortable = this.getListDialogContent(
      operation,
      this.sortable.sortBy,
      this.sortable.sortAsc
    );
    this._dialog.html(this.sortable.table);
  },

  getListDialogContent: function (operation, sortBy, sortAsc) {
    // collapse markers and links into one array.
    const allThings = operation.links.concat(operation.markers);

    const content = new Sortable();
    content.fields = [
      {
        name: this._smallScreen ? "#" : wX("ORDER"),
        value: (thing) => thing.opOrder,
        // sort: (a, b) => a - b,
        format: (cell, value, thing) => {
          const oif = L.DomUtil.create("input");
          oif.value = value;
          oif.size = 3;
          L.DomEvent.on(oif, "change", (ev) => {
            L.DomEvent.stop(ev);
            thing.opOrder = oif.value;
            // since we are changing the values in the (thing)
            // let the op know it has changed (save/redraw);
            operation.update(); // OK - necessary
          });
          cell.appendChild(oif);
        },
      },
      {
        name: wX("PORTAL"),
        value: (thing) => {
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
        },
      },
      {
        name: wX("TYPE"),
        value: (thing) => {
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

          if (thing instanceof WasabeeMarker) {
            L.DomEvent.on(cell, "click", (ev) => {
              L.DomEvent.stop(ev);
              const ch = new MarkerChangeDialog({ marker: thing });
              ch.enable();
            });
          }
        },
      },
      {
        name: "Zone",
        value: (thing) => thing.zone,
        sort: (a, b) => a - b,
        format: (cell, value, thing) => {
          const z = L.DomUtil.create("select", null, cell);
          for (const zone of operation.zones) {
            const o = L.DomUtil.create("option", null, z);
            o.textContent = zone.name;
            o.value = zone.id;
            if (zone.id == thing.zone) o.selected = true;
            L.DomEvent.on(z, "change", (ev) => {
              L.DomEvent.stop(ev);
              operation.setZone(thing, z.value);
            });
          }
        },
        smallScreenHide: true,
      },
      {
        name: wX("COMMENT"),
        value: (thing) => thing.comment,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, thing) => {
          const comment = L.DomUtil.create("a", null, cell);
          if (!value) value = ". . .";
          comment.textContent = value;
          L.DomEvent.on(cell, "click", (ev) => {
            L.DomEvent.stop(ev);
            const scd = new SetCommentDialog({
              target: thing,
              operation: operation,
            });
            scd.enable();
          });
        },
        smallScreenHide: true,
      },
      {
        name: wX("ASS_TO"),
        value: async (thing) => {
          if (thing.assignedTo != null && thing.assignedTo != "") {
            const agent = await WasabeeAgent.get(thing.assignedTo);
            if (agent != null) return agent.name;
            return "GID: [" + thing.assignedTo + "]";
          }
          return ". . .";
        },
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, thing) => {
          const assigned = L.DomUtil.create("a", null, cell);
          assigned.textContent = value;
          // do not use agent.formatDisplay since that links and overwrites the assign event
          if (WasabeeMe.isLoggedIn()) {
            // XXX should be writable op
            L.DomEvent.on(cell, "click", (ev) => {
              L.DomEvent.stop(ev);
              const ad = new AssignDialog({ target: thing });
              ad.enable();
            });
          }
        },
        smallScreenHide: true,
      },
      {
        name: wX("STATE"),
        value: (thing) => thing.state,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, thing) => {
          const a = L.DomUtil.create("a", null, cell);
          a.href = "#";
          a.textContent = wX(value);
          L.DomEvent.on(cell, "click", (ev) => {
            L.DomEvent.stop(ev);
            const sd = new StateDialog({
              target: thing,
              opID: operation.ID,
            });
            sd.enable();
          });
        },
        smallScreenHide: true,
      },
      {
        name: "Commands",
        value: (obj) => typeof obj,
        format: (cell, value, obj) => {
          if (obj instanceof WasabeeLink) {
            const rev = L.DomUtil.create("a", null, cell);
            rev.href = "#";
            rev.textContent = "🔄";
            L.DomEvent.on(rev, "click", (ev) => {
              L.DomEvent.stop(ev);
              operation.reverseLink(obj.fromPortalId, obj.toPortalId);
            });

            const del = L.DomUtil.create("a", null, cell);
            del.href = "#";
            del.textContent = "🗑";
            L.DomEvent.on(del, "click", (ev) => {
              L.DomEvent.stop(ev);
              operation.removeLink(obj.fromPortalId, obj.toPortalId);
            });
          } else {
            const del = L.DomUtil.create("a", null, cell);
            del.href = "#";
            del.textContent = "🗑";
            L.DomEvent.on(del, "click", (ev) => {
              L.DomEvent.stop(ev);
              operation.removeMarker(obj);
            });
          }
        },
      },
    ];
    content.sortBy = sortBy;
    content.sortAsc = sortAsc;
    content.items = allThings;
    return content;
  },
});

export default OperationChecklistDialog;
