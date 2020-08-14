import { generateId } from "./auxiliar";
import { deleteMarker } from "./uiCommands.js";
import { agentPromise } from "./server";
import AssignDialog from "./dialogs/assignDialog";
import SendTargetDialog from "./dialogs/sendTargetDialog";
import wX from "./wX";
import SetCommentDialog from "./dialogs/setCommentDialog";
import MarkerChangeDialog from "./dialogs/markerChangeDialog";

export default class WasabeeMarker {
  constructor(obj) {
    this.ID = generateId();
    this.portalId = obj.portalId;
    this.type = obj.type;
    this.comment = obj.comment ? obj.comment : "";
    this.state = obj.state ? obj.state : "pending";
    this.completedBy = obj.completedBy ? obj.completedBy : "";
    this.assignedTo = obj.assignedTo ? obj.assignedTo : "";
    this.order = obj.order ? obj.order : 0;
  }

  toJSON() {
    return {
      ID: this.ID,
      portalId: this.portalId,
      type: this.type,
      comment: this.comment,
      state: this.state,
      completedBy: this.completedBy,
      assignedTo: this.assignedTo,
      order: this.order,
    };
  }

  get opOrder() {
    return this.order;
  }

  set opOrder(o) {
    this.order = Number.parseInt(o, 10);
  }

  get icon() {
    if (!window.plugin.wasabee.skin.markerTypes.has(this.type)) {
      this.type = window.plugin.wasabee.skin.constants.DEFAULT_MARKER_TYPE;
    }
    const marker = window.plugin.wasabee.skin.markerTypes.get(this.type);
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
      default:
        img = marker.markerIcon.default;
    }
    return img;
  }

  async getMarkerPopup(marker, operation) {
    const portal = operation.getPortal(this.portalId);
    const content = L.DomUtil.create("div", "wasabee-marker-popup");
    content.appendChild(this.getPopupBodyWithType(portal, operation, marker));

    const assignment = L.DomUtil.create(
      "div",
      "wasabee-popup-assignment",
      content
    );
    if (this.state != "completed" && this.assignedTo) {
      try {
        const a = await agentPromise(this.assignedTo, false);
        assignment.textContent = wX("ASS_TO"); // FIXME convert formatDisplay to html and add as value to wX
        assignment.appendChild(a.formatDisplay());
      } catch (err) {
        console.log(err);
      }
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
    L.DomEvent.on(deleteButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      deleteMarker(operation, this, portal);
      marker.closePopup();
    });

    if (operation.IsServerOp()) {
      const assignButton = L.DomUtil.create("button", null, buttonSet);
      assignButton.textContent = wX("ASSIGN");
      L.DomEvent.on(assignButton, "click", (ev) => {
        L.DomEvent.stop(ev);
        const ad = new AssignDialog();
        ad.setup(this, operation);
        ad.enable();
        marker.closePopup();
      });

      const sendTargetButton = L.DomUtil.create("button", null, buttonSet);
      sendTargetButton.textContent = wX("SEND TARGET");
      L.DomEvent.on(sendTargetButton, "click", (ev) => {
        L.DomEvent.stop(ev);
        const std = new SendTargetDialog();
        std.setup(this, operation);
        std.enable();
        marker.closePopup();
      });
    }
    const gmapButton = L.DomUtil.create("button", null, buttonSet);
    gmapButton.textContent = wX("ANCHOR_GMAP");
    L.DomEvent.on(gmapButton, "click", (ev) => {
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

    kind.href = "#";
    L.DomEvent.on(kind, "click", (ev) => {
      L.DomEvent.stop(ev);
      const ch = new MarkerChangeDialog();
      ch.setup(this, operation);
      ch.enable();
      marker.closePopup();
    });

    if (this.comment) {
      const comment = L.DomUtil.create(
        "div",
        "wasabee-marker-popup-comment",
        title
      );
      comment.textContent = this.comment;
      L.DomEvent.on(comment, "click", (ev) => {
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
    L.DomEvent.on(cl, "click", (ev) => {
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
      L.DomEvent.on(hl, "click", (ev) => {
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
