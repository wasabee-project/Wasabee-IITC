import { WDialog } from "../leafletClasses";
import WasabeeAgent from "../model/agent";
import WasabeeLink from "../model/link";
import WasabeeMarker from "../model/marker";
import Sortable from "../sortable";
import AssignDialog from "./assignDialog";
import StateDialog from "./stateDialog";
import SetCommentDialog from "./setCommentDialog";
import MarkerChangeDialog from "./markerChangeDialog";
import {
  listenForAddedPortals,
  listenForPortalDetails,
  loadFaked,
  setMarkersToZones,
  setLinksToZones,
} from "../uiCommands";
import { getSelectedOperation } from "../selectedOp";
import wX from "../wX";

import PortalUI from "../ui/portal";
import LinkUI from "../ui/link";
import { displayInfo, displayWarning } from "../error";

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
    buttons[wX("SET_MARKERS_ZONES")] = () => {
      setMarkersToZones();
    };
    buttons[wX("SET_LINKS_ZONES")] = () => {
      setLinksToZones();
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
    if (!this.sortable) return;
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
    const canWrite = operation.canWrite();
    const columns = [
      {
        name: this._smallScreen ? "#" : wX("ORDER"),
        value: (thing) => thing.order,
        // sort: (a, b) => a - b,
        format: (cell, value, thing) => {
          const oif = L.DomUtil.create("input");
          oif.value = value;
          oif.size = 3;
          oif.disabled = !canWrite;
          L.DomEvent.on(oif, "change", (ev) => {
            L.DomEvent.stop(ev);
            if (thing instanceof WasabeeLink) {
              operation.setLinkOrder(thing.ID, +oif.value);
            } else {
              operation.setMarkerOrder(thing.ID, +oif.value);
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
            cell.appendChild(LinkUI.displayFormat(thing, operation));
            if (this._smallScreen) cell.colSpan = 2;
          } else {
            cell.appendChild(
              PortalUI.displayFormat(operation.getPortal(thing.portalId))
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
          } else if (thing instanceof WasabeeMarker && canWrite) {
            L.DomEvent.on(cell, "click", (ev) => {
              L.DomEvent.stop(ev);
              const ch = new MarkerChangeDialog({ marker: thing });
              ch.enable();
            });
          }
        },
      },
      {
        name: wX("ZONE"),
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
          z.disabled = !canWrite;
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
          if (canWrite) {
            L.DomEvent.on(cell, "click", (ev) => {
              L.DomEvent.stop(ev);
              const scd = new SetCommentDialog({
                target: thing,
                operation: operation,
              });
              scd.enable();
            });
          }
        },
        smallScreenHide: true,
      },
      {
        name: wX("ASS_TO"),
        value: async (thing) => {
          if (thing.assignedTo != null && thing.assignedTo != "") {
            const agent = await WasabeeAgent.get(thing.assignedTo);
            if (agent != null) return agent.getName();
            return "GID: [" + thing.assignedTo + "]";
          }
          return ". . .";
        },
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, thing) => {
          const assigned = L.DomUtil.create("a", null, cell);
          assigned.textContent = value;
          // do not use agent.formatDisplay since that links and overwrites the assign event
          if (operation.canWriteServer()) {
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
          // XXX: should be possible with atomic api call
          if (canWrite) {
            L.DomEvent.on(cell, "click", (ev) => {
              L.DomEvent.stop(ev);
              const sd = new StateDialog({
                target: thing,
                opID: operation.ID,
              });
              sd.enable();
            });
          }
        },
        smallScreenHide: true,
      },
    ];
    if (canWrite)
      columns.push({
        name: this._smallScreen
          ? wX("dialog.common.commands_short")
          : wX("dialog.common.commands"),
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
      });
    return columns;
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
    const {
      fieldCount,
      emptyCount,
      emptyFieldLinks,
      linksFromInner,
      coveredPortals,
    } = operation.getOrderInfo();

    if (doAlert) {
      const container = L.DomUtil.create("div", "field-count");
      if (emptyFieldLinks.length) {
        const header = L.DomUtil.create("div", null, container);
        header.textContent = wX("dialog.checklist.field_count_with_empty", {
          fieldCount: fieldCount,
          emptyCount: emptyCount,
          linkCount: emptyFieldLinks,
        });
        const content = L.DomUtil.create("ul", null, container);
        for (const [link, c] of emptyFieldLinks) {
          const li = L.DomUtil.create("li", "empty-field-link", content);
          li.textContent = c;
          li.appendChild(LinkUI.displayFormat(link, operation));
        }
      } else {
        const header = L.DomUtil.create("div", null, container);
        header.textContent = wX("dialog.checklist.field_count", {
          fieldCount: fieldCount,
        });
      }
      if (linksFromInner.length) {
        const header = L.DomUtil.create("div", null, container);
        header.textContent = wX("dialog.checklist.link_from_inside", {
          count: linksFromInner.length,
        });
        const content = L.DomUtil.create("ul", null, container);
        for (const link of linksFromInner) {
          const cl = coveredPortals.get(link.fromPortalId);
          const li = L.DomUtil.create("li", "inner-link", content);
          li.append(`${link.order}: `);
          li.appendChild(LinkUI.displayFormat(link, operation));
          li.append(
            wX("dialog.checklist.link_from_inside.covered_at_order", {
              order: cl.order,
            })
          );
          li.appendChild(LinkUI.displayFormat(cl, operation));
        }
      }
      if (emptyFieldLinks.length || linksFromInner.length) {
        displayWarning(container, true);
      } else {
        displayInfo(container, true);
      }
    }
  },
});

export default OperationChecklistDialog;
