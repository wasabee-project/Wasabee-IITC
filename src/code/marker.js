import { generateId } from "./auxiliar";
import UiCommands from "./uiCommands.js";
import { agentPromise } from "./server";
import AssignDialog from "./dialogs/assignDialog";

export default class WasabeeMarker {
  constructor(type, portalId, comment) {
    this.ID = generateId();
    this.portalId = portalId;
    this.type = type;
    this.comment = comment;
    this.state = "pending";
    this.completedBy = ""; // should be GID, requires change on the server
    this.assignedTo = "";
    this.order = 0;
  }

  get opOrder() {
    return this.order;
  }

  set opOrder(o) {
    this.order = Number.parseInt(o, 10);
  }

  static create(obj) {
    if (obj instanceof WasabeeMarker) {
      console.log("do not call Marker.create() on a Marker");
      console.log(new Error().stack);
      return obj;
    }

    const marker = new WasabeeMarker(obj.type, obj.portalId, obj.comment);
    marker.state = obj.state ? obj.state : "pending";
    marker.completedBy = obj.completedBy ? obj.completedBy : "";
    marker.assignedTo = obj.assignedTo ? obj.assignedTo : "";
    marker.order = obj.order ? obj.order : 0;
    return marker;
  }

  get icon() {
    if (!window.plugin.wasabee.static.markerTypes.has(this.type)) {
      this.type = window.plugin.wasabee.static.constants.DEFAULT_MARKER_TYPE;
    }
    const marker = window.plugin.wasabee.static.markerTypes.get(this.type);
    let img = marker.markerIcon.default;
    switch (this.state) {
      case "pending":
        img = marker.markerIcon.default;
        break;
      case "assigned":
        img = marker.markerIconAssigned.default;
        break;
      case "completed":
        img = marker.markerIconDone.default;
        break;
      case "acknowledged":
        img = marker.markerIconAcknowledged.default;
        break;
    }
    return img;
  }

  getMarkerPopup(marker, operation) {
    const portal = operation.getPortal(this.portalId);
    marker.className = "wasabee-dialog wasabee-dialog-ops";
    const content = L.DomUtil.create("div", "");
    const title = L.DomUtil.create("div", "desc", content);
    title.innerHTML = this.getPopupBodyWithType(portal);

    const assignment = L.DomUtil.create("div", "", content);
    if (this.state != "completed" && this.assignedTo) {
      agentPromise(this.assignedTo, false).then(
        function(a) {
          assignment.innerHTML = "Assigned To: ";
          assignment.appendChild(a.formatDisplay());
        },
        function(err) {
          console.log(err);
        }
      );
    }
    if (this.state == "completed" && this.completedBy) {
      assignment.innerHTML = "Completed By: " + this.completedBy;
    }

    const buttonSet = L.DomUtil.create("div", "temp-op-dialog", content);
    const deleteButton = L.DomUtil.create("a", "", buttonSet);
    deleteButton.textContent = "Delete";
    L.DomEvent.on(deleteButton, "click", () => {
      UiCommands.deleteMarker(operation, this, portal);
      marker.closePopup();
    });

    if (operation.IsServerOp()) {
      const assignButton = L.DomUtil.create("a", "", buttonSet);
      assignButton.textContent = "Assign";
      L.DomEvent.on(assignButton, "click", () => {
        const ad = new AssignDialog();
        ad.setup(this, operation);
        ad.enable();
        marker.closePopup();
      });
    }

    return content;
  }

  getPopupBodyWithType(portal) {
    // is this paranoia left from ages past?
    if (!window.plugin.wasabee.static.markerTypes.has(this.type)) {
      this.type = window.plugin.wasabee.static.constants.DEFAULT_MARKER_TYPE;
    }
    const type = window.plugin.wasabee.static.markerTypes.get(this.type);
    let title = `${type.label}: ${portal.name}`;
    if (this.comment) title = title + "\n" + this.comment;
    return title;
  }
}
