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
import wX from "../wX";

const OperationChecklistDialog = WDialog.extend({
  statics: {
    TYPE: "operationChecklist",
  },

  options: {
    usePane: true,
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    window.map.on("wasabee:op:select wasabee:op:change", this.update, this);

    window.addHook("portalAdded", listenForAddedPortals);
    window.addHook("portalDetailsLoaded", listenForPortalDetails);

    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.map.off("wasabee:op:select wasabee:op:change", this.update, this);

    window.removeHook("portalAdded", listenForAddedPortals);
    window.removeHook("portalDetailsLoaded", listenForPortalDetails);
  },

  _displayDialog: async function () {
    const operation = getSelectedOperation();
    loadFaked(operation);
    this.sortable = this.getListDialogContent(
      operation,
      operation.links.concat(operation.markers),
      0,
      false
    ); // defaults to sorting by op order

    const buttons = {};
    buttons[wX("OK")] = () => {
      this.closeDialog();
    };
    buttons[wX("LOAD PORTALS")] = () => {
      loadFaked(getSelectedOperation(), true); // force
    };
    buttons["Count fields"] = () => {
      this.countFields(getSelectedOperation(), true);
    };

    await this.sortable.done;

    this.createDialog({
      title: wX("OP_CHECKLIST", { opName: operation.name }),
      html: this.sortable.table,
      width: "auto",
      dialogClass: "ui-resizable wasabee-dialog wasabee-dialog-checklist",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.operationChecklist,
    });
  },

  update: async function () {
    const operation = getSelectedOperation();
    this.setTitle(wX("OP_CHECKLIST", { opName: operation.name }));
    this.sortable = this.getListDialogContent(
      operation,
      operation.links.concat(operation.markers),
      this.sortable.sortBy,
      this.sortable.sortAsc
    );
    await this.sortable.done;
    this.setContent(this.sortable.table);
  },

  getFields: function (operation) {
    return [
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
            if (thing instanceof WasabeeLink) {
              operation.setLinkOrder(thing.ID, oif.value);
            } else {
              operation.setMarkerOrder(thing.ID, oif.value);
            }
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
            cell.appendChild(thing.displayFormat(operation));
            if (this._smallScreen) cell.colSpan = 2;
          } else {
            cell.appendChild(
              operation.getPortal(thing.portalId).displayFormat()
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
            // push this shit into the marker class
            return wX(thing.type);
          }
        },
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, thing) => {
          const span = L.DomUtil.create("span", null, cell);
          if (thing.type) L.DomUtil.addClass(span, thing.type);
          span.textContent = value;

          if (thing instanceof WasabeeLink) {
            if (this._smallScreen) cell.style.display = "none";
          } else if (thing instanceof WasabeeMarker) {
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
          }
          L.DomEvent.on(z, "change", (ev) => {
            L.DomEvent.stop(ev);
            operation.setZone(thing, z.value);
          });
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
          if (operation.IsServerOp() && operation.IsWritableOp()) {
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
        name: this._smallScreen ? "Cmds" : "Commands",
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
  },

  getListDialogContent: function (operation, items, sortBy, sortAsc) {
    const content = new Sortable();
    content.fields = this.getFields(operation);
    content.sortBy = sortBy;
    content.sortAsc = sortAsc;
    content.items = items;
    return content;
  },

  countFields: function (operation, doAlert) {
    const links = Array.from(operation.links);
    links.sort((a, b) => a.opOrder - b.opOrder);

    let fieldCount = 0;
    let emptyCount = 0;

    // maps a portal id to its linked portals
    const portalLinks = new Map();
    const emptyFieldLinks = [];
    for (const link of links) {
      if (!portalLinks.has(link.fromPortalId))
        portalLinks.set(link.fromPortalId, new Set());
      if (!portalLinks.has(link.toPortalId))
        portalLinks.set(link.toPortalId, new Set());
      const a = portalLinks.get(link.fromPortalId);
      const b = portalLinks.get(link.toPortalId);

      // common neighbors portal
      const intersect = new Set();
      for (const p of a) if (b.has(p)) intersect.add(p);

      // update the mapping
      a.add(link.toPortalId);
      b.add(link.fromPortalId);

      // ignore link with order 0
      if (link.opOrder > 0) {
        // the link closes at least one field
        const p1 = operation.getPortal(link.fromPortalId);
        const p2 = operation.getPortal(link.toPortalId);
        const positive = [];
        const negative = [];
        // ignore earth curvature (todo: use it)
        for (const pid of intersect) {
          const p = operation.getPortal(pid);
          const det =
            (p1.lat - p2.lat) * (p.lng - p2.lng) -
            (p1.lng - p2.lng) * (p.lat - p2.lat);
          if (det > 0) positive.push(p);
          else negative.push(p);
        }
        if (positive.length) fieldCount += 1;
        if (negative.length) fieldCount += 1;
        // if the link closes multiple fields on the same side of the link, we have empty fields.
        if (positive.length > 1 || negative.length > 1) {
          let count = 0;
          if (positive.length > 1) count += positive.length - 1;
          if (negative.length > 1) count += negative.length - 1;
          emptyFieldLinks.push([link, count]);
          emptyCount += count;
        }
      }
    }
    if (doAlert) {
      if (emptyFieldLinks.length > 0) {
        const container = L.DomUtil.create("div", "field-count");
        const header = L.DomUtil.create("div", null, container);
        header.textContent = `Found ${fieldCount} fields and ${emptyCount} empty field(s) on ${emptyFieldLinks.length} link(s)`;
        const content = L.DomUtil.create("ul", null, container);
        for (const [link, c] of emptyFieldLinks) {
          const li = L.DomUtil.create("li", "empty-field-link", content);
          li.textContent = c;
          li.appendChild(link.displayFormat(operation));
        }
        alert(container, true);
      } else {
        alert(`Found ${fieldCount} fields and no empty fields.`);
      }
    }
    return { field: fieldCount, empty: emptyCount };
  },
});

export default OperationChecklistDialog;
