import { Feature } from "../leafletDrawImports";
import Sortable from "../../lib/sortable";
import AssignDialog from "./assignDialog";
import SetCommentDialog from "./setCommentDialog";
import { getAgent } from "../server";
import { getSelectedOperation } from "../selectedOp";
import OverflowMenu from "../overflowMenu";
import UiCommands from "../uiCommands";

const MarkerList = Feature.extend({
  statics: {
    TYPE: "markerList"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = MarkerList.TYPE;
    Feature.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    if (!this._map) return;
    Feature.prototype.addHooks.call(this);
    this._operation = getSelectedOperation();
    const context = this;
    this._UIUpdateHook = newOpData => {
      context.markerListUpdate(newOpData);
    };
    window.addHook("wasabeeUIUpdate", this._UIUpdateHook);
    window.addHook("portalAdded", UiCommands.listenForAddedPortals);
    this._displayDialog();
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
    window.removeHook("portalAdded", UiCommands.listenForAddedPortals);
    window.removeHook("wasabeeUIUpdate", this._UIUpdateHook);
  },

  _displayDialog: function() {
    for (const f of this._operation.fakedPortals) {
      window.portalDetail.request(f.id);
    }

    this._listDialogData = window.dialog({
      title: "Marker List: " + this._operation.name,
      width: "auto",
      height: "auto",
      position: {
        my: "center top",
        at: "center center"
      },
      html: this.getListDialogContent(this._operation).table,
      dialogClass: "wasabee-dialog-alerts",
      closeCallback: () => {
        this.disable();
        delete this._listDialogData;
      },
      id: window.plugin.wasabee.static.dialogNames.markerList
    });
  },

  markerListUpdate: function(operation) {
    if (operation.ID != this._operation.ID) this._operation = operation;
    const id = "dialog-" + window.plugin.wasabee.static.dialogNames.markerList;
    if (window.DIALOGS[id]) {
      window.DIALOGS[id].parentNode.children[0].children[1].innerText =
        "Marker List: " + operation.name;
      const table = this.getListDialogContent(operation).table;
      window.DIALOGS[id].replaceChild(table, window.DIALOGS[id].childNodes[0]);
    }
  },

  getListDialogContent: function(operation) {
    const content = new Sortable();
    content.fields = [
      {
        name: "Order",
        value: marker => marker.order,
        // sort: (a, b) => (a < b),
        format: (a, m) => {
          a.textContent = m;
        }
      },
      {
        name: "Portal",
        value: marker => operation.getPortal(marker.portalId).name,
        sort: (a, b) => a.localeCompare(b),
        format: (a, m, marker) => {
          a.appendChild(
            operation.getPortal(marker.portalId).displayFormat(operation)
          );
        }
      },
      {
        name: "Type",
        value: marker =>
          window.plugin.wasabee.static.markerTypes.get(marker.type).label ||
          "unknown",
        sort: (a, b) => a.localeCompare(b),
        format: (a, m) => {
          a.textContent = m;
        }
      },
      {
        name: "Comment",
        value: marker => marker.comment,
        sort: (a, b) => a.localeCompare(b),
        format: (a, m, marker) => {
          const comment = L.DomUtil.create("a", "", a);
          comment.innerHTML = m;
          L.DomEvent.on(comment, "click", () => {
            const scd = new SetCommentDialog(window.map);
            scd.setup(marker, operation);
            scd.enable();
          });
        }
      },
      {
        name: "Assigned To",
        value: marker => {
          if (marker.assignedTo != null && marker.assignedTo != "") {
            const agent = getAgent(marker.assignedTo);
            if (agent != null) {
              return agent.name;
            } else {
              return "looking up: [" + marker.assignedTo + "]";
            }
          }
          return "";
        },
        sort: (a, b) => a.localeCompare(b),
        format: (a, m, agent) => {
          const assigned = L.DomUtil.create("a", "", a);
          assigned.innerHTML = m;
          L.DomEvent.on(assigned, "click", () => {
            const ad = new AssignDialog();
            ad.setup(agent, operation);
            ad.enable();
          });
        }
      },
      {
        name: "Done",
        value: marker => marker.state,
        sort: (a, b) => a.localeCompare(b),
        format: (a, m) => {
          if (m == "completed") {
            a.textContent = "Yes";
          } else {
            a.textContent = "No";
          }
        }
      },
      {
        name: "",
        sort: null,
        value: m => m,
        format: (o, e) => this.makeMarkerDialogMenu(o, e)
      }
    ];
    content.sortBy = 0;
    content.items = operation.markers;
    return content;
  },

  makeMarkerDialogMenu: function(list, data) {
    const operation = getSelectedOperation();
    const state = new OverflowMenu();
    const options = [
      {
        label: "Set Comment",
        onclick: () => {
          const scd = new SetCommentDialog(window.map);
          scd.setup(data, operation);
          scd.enable();
        }
      },
      {
        label: "Delete",
        onclick: () => operation.removeMarker(data)
      }
    ];
    if (operation.IsServerOp()) {
      options.push({
        label: "Assign",
        onclick: () => {
          const ad = new AssignDialog();
          ad.setup(data, operation);
          ad.enable();
        }
      });
    }
    state.items = options;
    list.className = "menu";
    list.appendChild(state.button);
  }
});

export default MarkerList;
