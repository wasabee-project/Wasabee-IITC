import { Feature } from "../leafletDrawImports";
import Sortable from "../../lib/sortable";
import AssignDialog from "./assignDialog";
import SetCommentDialog from "./setCommentDialog";
import { getAgent } from "../server";
import { getSelectedOperation } from "../selectedOp";

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
    window.addHook("wasabeeUIUpdate", markerListUpdate);
    window.addHook("portalAdded", listenForAddedPortals);
    this._displayDialog();
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
    window.removeHook("portalAdded", listenForAddedPortals);
    window.removeHook("wasabeeUIUpdate", markerListUpdate);
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
      html: getListDialogContent(this._operation).table,
      dialogClass: "wasabee-dialog-alerts",
      closeCallback: () => {
        this.disable();
        delete this._listDialogData;
      },
      id: window.plugin.Wasabee.static.dialogNames.markerList
    });
  }
});

export default MarkerList;

const markerListUpdate = operation => {
  const id = "dialog-" + window.plugin.Wasabee.static.dialogNames.markerList;
  if (window.DIALOGS[id]) {
    const table = getListDialogContent(operation).table;
    window.DIALOGS[id].replaceChild(table, window.DIALOGS[id].childNodes[0]);
  }
};

const getListDialogContent = operation => {
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
        window.plugin.Wasabee.markerTypes.get(marker.type).label || "unknown",
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
        const comment = a.appendChild(document.createElement("a"));
        comment.innerHTML = m;
        a.addEventListener("click", () => {
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
        const assigned = a.appendChild(document.createElement("a"));
        assigned.innerHTML = m;
        a.addEventListener("click", () => {
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
      format: (o, e) => makeMarkerDialogMenu(o, e)
    }
  ];
  content.sortBy = 0;
  content.items = operation.markers;
  return content;
};

const makeMarkerDialogMenu = (list, data) => {
  const operation = getSelectedOperation();
  const state = new window.plugin.Wasabee.OverflowMenu();
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
};

// yes, one defition per dialog type
const listenForAddedPortals = newPortal => {
  if (!newPortal.portal.options.data.title) return;

  const op = getSelectedOperation();

  for (const faked of op.fakedPortals) {
    if (faked.id == newPortal.portal.options.guid) {
      faked.name = newPortal.portal.options.data.title;
      op.update();
    }
  }
};
