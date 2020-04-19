import { WDialog } from "../leafletClasses";
import Sortable from "../../lib/sortable";
import AssignDialog from "./assignDialog";
import SetCommentDialog from "./setCommentDialog";
import { getAgent } from "../server";
import { getSelectedOperation } from "../selectedOp";
import WasabeeMe from "../me";
import { listenForAddedPortals, listenForPortalDetails } from "../uiCommands";
import wX from "../wX";

const MarkerList = WDialog.extend({
  statics: {
    TYPE: "markerList"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = MarkerList.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    this._operation = getSelectedOperation();
    const context = this;
    this._UIUpdateHook = newOpData => {
      context.markerListUpdate(newOpData);
    };
    window.addHook("wasabeeUIUpdate", this._UIUpdateHook);
    window.addHook("portalAdded", listenForAddedPortals);
    window.addHook("portalDetailLoaded", listenForPortalDetails);
    this._displayDialog();
  },

  removeHooks: function() {
    WDialog.prototype.removeHooks.call(this);
    window.removeHook("portalAdded", listenForAddedPortals);
    window.removeHook("portalDetailLoaded", listenForPortalDetails);
    window.removeHook("wasabeeUIUpdate", this._UIUpdateHook);
  },

  _displayDialog: function() {
    for (const f of this._operation.fakedPortals) {
      window.portalDetail.request(f.id);
    }

    this._dialog = window.dialog({
      title: wX("MARKER_LIST", this._operation.name),
      width: "auto",
      height: "auto",
      // position: { my: "center top", at: "center center" },
      html: this.getListDialogContent(this._operation).table,
      dialogClass: "wasabee-dialog wasabee-dialog-markerlist",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.markerList
    });
  },

  markerListUpdate: function(operation) {
    if (operation.ID != this._operation.ID) this._operation = operation;
    const table = this.getListDialogContent(operation).table;
    this._dialog.html(table);
    this._dialog.dialog(
      wX("OPTION"),
      wX("TITLE"),
      wX("MARKER_LIST", operation.name)
    );
  },

  getListDialogContent: function(operation) {
    const content = new Sortable();
    content.fields = [
      {
        name: wX("ORDER"),
        value: marker => marker.order,
        format: (a, m) => (a.textContent = m)
      },
      {
        name: wX("PORTAL"),
        value: marker => operation.getPortal(marker.portalId).name,
        sort: (a, b) => a.localeCompare(b),
        format: (a, m, marker) => {
          a.appendChild(
            operation
              .getPortal(marker.portalId)
              .displayFormat(this._smallScreen)
          );
        }
      },
      {
        name: wX("TYPE"),
        value: marker => wX(marker.type),
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, marker) => {
          const d = L.DomUtil.create("span", marker.type, cell);
          d.textContent = value;
        }
      },
      {
        name: wX("COMMENT"),
        value: marker => marker.comment,
        sort: (a, b) => a.localeCompare(b),
        format: (a, m, marker) => {
          const comment = L.DomUtil.create("a", "", a);
          comment.textContent = m;
          L.DomEvent.on(comment, "click", ev => {
            L.DomEvent.stop(ev);
            const scd = new SetCommentDialog(window.map);
            scd.setup(marker, operation);
            scd.enable();
          });
        }
      },
      {
        name: wX("ASS_TO"),
        value: marker => {
          if (marker.assignedTo != null && marker.assignedTo != "") {
            if (!WasabeeMe.isLoggedIn()) return "not logged in";
            const agent = getAgent(marker.assignedTo);
            if (agent != null) {
              return agent.name;
            } else {
              return "Loading: [" + marker.assignedTo + "]";
            }
          }
          return "";
        },
        sort: (a, b) => a.localeCompare(b),
        format: (a, m, agent) => {
          const assigned = L.DomUtil.create("a", "", a);
          assigned.textContent = m;
          L.DomEvent.on(assigned, "click", () => {
            const ad = new AssignDialog();
            ad.setup(agent, operation);
            ad.enable();
          });
        }
      },
      {
        name: wX("DONE"),
        value: marker => marker.state,
        sort: (a, b) => a.localeCompare(b),
        format: (a, m) => {
          if (m == "completed") {
            a.textContent = wX("YES");
          } else {
            a.textContent = wX("NO");
          }
        }
      },
      {
        name: wX("DELETE_MARKER"),
        sort: null,
        value: m => m,
        format: (cell, data) => {
          const d = L.DomUtil.create("a", null, cell);
          d.href = "#";
          d.textContent = wX("DELETE_MARKER");
          L.DomEvent.on(d, "click", () => {
            operation.removeMarker(data);
          });
        }
      }
    ];
    content.sortBy = 0;
    content.items = operation.markers;
    return content;
  }
});

export default MarkerList;
