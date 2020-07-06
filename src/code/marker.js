import { generateId } from "./auxiliar";
import { deleteMarker } from "./uiCommands.js";
import { agentPromise } from "./server";
import AssignDialog from "./dialogs/assignDialog";
import wX from "./wX";
import SetCommentDialog from "./dialogs/setCommentDialog";

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
    if (obj instanceof WasabeeMarker) return obj; // unnecessary now

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
    const content = L.DomUtil.create("div", "wasabee-marker-popup");
    content.appendChild(this.getPopupBodyWithType(portal, operation, marker));

    const assignment = L.DomUtil.create(
      "div",
      "wasabee-popup-assignment",
      content
    );
    if (this.state != "completed" && this.assignedTo) {
      agentPromise(this.assignedTo, false).then(
        function(a) {
          assignment.textContent = wX("ASS_TO"); // FIXME convert formatDisplay to html and add as value to wX
          assignment.appendChild(a.formatDisplay());
        },
        function(err) {
          console.log(err);
        }
      );
    }
    if (this.state == "completed" && this.completedBy) {
      assignment.innerHTML = wX("COMPLETED BY", this.completedBy);
    }

    const buttonSet = L.DomUtil.create(
      "div",
      "wasabee-marker-buttonset",
      content
    );
    const deleteButton = L.DomUtil.create("button", null, buttonSet);
    deleteButton.textContent = wX("DELETE_ANCHOR");
    L.DomEvent.on(deleteButton, "click", ev => {
      L.DomEvent.stop(ev);
      deleteMarker(operation, this, portal);
      marker.closePopup();
    });

    if (operation.IsServerOp()) {
      const assignButton = L.DomUtil.create("button", null, buttonSet);
      assignButton.textContent = wX("ASSIGN");
      L.DomEvent.on(assignButton, "click", ev => {
        L.DomEvent.stop(ev);
        const ad = new AssignDialog();
        ad.setup(this, operation);
        ad.enable();
        marker.closePopup();
      });
    }
    const gmapButton = L.DomUtil.create("button", null, buttonSet);
    gmapButton.textContent = wX("ANCHOR_GMAP");
    L.DomEvent.on(gmapButton, "click", ev => {
      L.DomEvent.stop(ev);
      marker.closePopup();
      window.open(
        "https://www.google.com/maps/search/?api=1&query=" +
          portal.lat +
          "," +
          portal.lng
      );
    });

    return content;
  }

  getPopupBodyWithType(portal, operation, marker) {
    const title = L.DomUtil.create("div", "desc");
    const kind = L.DomUtil.create("span", "wasabee-marker-popup-kind", title);
    L.DomUtil.addClass(kind, this.type);
    kind.textContent = wX(this.type);
    title.appendChild(portal.displayFormat());

    if (this.comment) {
      const comment = L.DomUtil.create(
        "div",
        "wasabee-marker-popup-comment",
        title
      );
      comment.textContent = this.comment;
      L.DomEvent.on(comment, "click", ev => {
        L.DomEvent.stop(ev);
        const com = new SetCommentDialog();
        com.setup(this, operation);
        com.enable();
        marker.closePopup();
      });
    }
    const comment = L.DomUtil.create("div", "wasabee-portal-comment", title);
    const cl = L.DomUtil.create("a", null, comment);
    cl.textContent = portal.comment || wX("SET_PORTAL_COMMENT");
    cl.href = "#";
    L.DomEvent.on(cl, "click", ev => {
      L.DomEvent.stop(ev);
      const cd = new SetCommentDialog();
      cd.setup(portal, operation);
      cd.enable();
      marker.closePopup();
    });
    if (portal.hardness) {
      const hardness = L.DomUtil.create(
        "div",
        "wasabee-portal-hardness",
        title
      );
      const hl = L.DomUtil.create("a", null, hardness);
      hl.textContent = portal.hardness;
      hl.href = "#";
      L.DomEvent.on(hl, "click", ev => {
        L.DomEvent.stop(ev);
        const cd = new SetCommentDialog();
        cd.setup(portal, operation);
        cd.enable();
        marker.closePopup();
      });
    }
    return title;
  }
}
