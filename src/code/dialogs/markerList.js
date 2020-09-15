import { WDialog } from "../leafletClasses";
import Sortable from "../../lib/sortable";
import AssignDialog from "./assignDialog";
import SetCommentDialog from "./setCommentDialog";
import MarkerChangeDialog from "./markerChangeDialog";
import WasabeeAgent from "../agent";
import { getSelectedOperation } from "../selectedOp";
import {
  listenForAddedPortals,
  listenForPortalDetails,
  loadFaked,
  clearAllMarkers,
} from "../uiCommands";
import wX from "../wX";
import { postToFirebase } from "../firebaseSupport";

const MarkerList = WDialog.extend({
  statics: {
    TYPE: "markerList",
  },

  initialize: function (map = window.map, options) {
    this.type = MarkerList.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
    postToFirebase({ id: "analytics", action: MarkerList.TYPE });
  },

  addHooks: function () {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    const operation = getSelectedOperation();
    this._opID = operation.ID;
    const context = this;
    this._UIUpdateHook = () => {
      context.markerListUpdate();
    };
    window.addHook("wasabeeUIUpdate", this._UIUpdateHook);
    window.addHook("portalAdded", listenForAddedPortals);
    window.addHook("portalDetailLoaded", listenForPortalDetails);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.removeHook("portalAdded", listenForAddedPortals);
    window.removeHook("portalDetailLoaded", listenForPortalDetails);
    window.removeHook("wasabeeUIUpdate", this._UIUpdateHook);
  },

  _displayDialog: function () {
    const operation = getSelectedOperation();
    loadFaked(operation);

    const buttons = {};
    buttons[wX("CLEAR MARKERS")] = () => {
      clearAllMarkers(getSelectedOperation());
    };

    buttons[wX("OK")] = () => {
      this._dialog.dialog("close");
    };

    this._dialog = window.dialog({
      title: wX("MARKER_LIST", operation.name),
      html: this.getListDialogContent(operation).table,
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-markerlist",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.markerList,
    });
    this._dialog.dialog("option", "buttons", buttons);
  },

  markerListUpdate: function () {
    const operation = getSelectedOperation();
    if (operation.ID != this._opID) console.log("op changed");
    const table = this.getListDialogContent(operation).table;
    this._dialog.html(table);
    this._dialog.dialog("option", "title", wX("MARKER_LIST", operation.name));
  },

  getListDialogContent: function (operation) {
    const content = new Sortable();
    content.fields = [
      {
        name: wX("ORDER"),
        value: (marker) => marker.order,
        format: (a, m) => (a.textContent = m),
      },
      {
        name: wX("PORTAL"),
        value: (marker) => operation.getPortal(marker.portalId).name,
        sort: (a, b) => a.localeCompare(b),
        format: (a, m, marker) => {
          a.appendChild(
            operation
              .getPortal(marker.portalId)
              .displayFormat(this._smallScreen)
          );
        },
      },
      {
        name: wX("TYPE"),
        value: (marker) => wX(marker.type),
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, marker) => {
          const d = L.DomUtil.create("span", marker.type, cell);
          d.textContent = value;
          L.DomEvent.on(cell, "click", (ev) => {
            L.DomEvent.stop(ev);
            const ch = new MarkerChangeDialog();
            ch.setup(marker);
            ch.enable();
          });
        },
      },
      {
        name: wX("COMMENT"),
        value: (marker) => marker.comment,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, marker) => {
          const comment = L.DomUtil.create("a", "", cell);
          comment.textContent = value;
          L.DomEvent.on(cell, "click", (ev) => {
            L.DomEvent.stop(ev);
            const scd = new SetCommentDialog(window.map);
            scd.setup(marker, operation);
            scd.enable();
          });
        },
      },
      {
        name: wX("ASS_TO"),
        value: (marker) => {
          if (marker.assignedTo != null && marker.assignedTo != "") {
            const agent = WasabeeAgent.cacheGet(marker.assignedTo);
            if (agent != null) return agent.name;
            // we can't use async here, so just request it now and it should be in cache next time
            WasabeeAgent.waitGet(marker.assignedTo);
            return "looking up: [" + marker.assignedTo + "]";
          }
          return "";
        },
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, agent) => {
          const assigned = L.DomUtil.create("a", "", cell);
          assigned.textContent = value;
          L.DomEvent.on(cell, "click", () => {
            const ad = new AssignDialog();
            ad.setup(agent);
            ad.enable();
          });
        },
      },
      {
        name: wX("DONE"),
        value: (marker) => marker.state,
        sort: (a, b) => a.localeCompare(b),
        format: (a, m) => {
          if (m == "completed") {
            a.textContent = wX("YES");
          } else {
            a.textContent = wX("NO");
          }
        },
      },
      {
        name: wX("DELETE_MARKER"),
        sort: null,
        value: (m) => m,
        format: (cell, data) => {
          const d = L.DomUtil.create("a", null, cell);
          d.href = "#";
          d.textContent = wX("DELETE_MARKER");
          L.DomEvent.on(d, "click", () => {
            operation.removeMarker(data);
          });
        },
      },
    ];
    content.sortBy = 0;
    content.items = operation.markers;
    return content;
  },
});

export default MarkerList;
