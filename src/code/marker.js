import { generateId } from "./auxiliar";
import { deleteMarker } from "./uiCommands";
import WasabeeAgent from "./agent";
import AssignDialog from "./dialogs/assignDialog";
import SendTargetDialog from "./dialogs/sendTargetDialog";
import wX from "./wX";
import SetCommentDialog from "./dialogs/setCommentDialog";
import MarkerChangeDialog from "./dialogs/markerChangeDialog";
import { getSelectedOperation } from "./selectedOp";

export default class WasabeeMarker {
  constructor(obj) {
    this.ID = obj.ID ? obj.ID : generateId();
    this.portalId = obj.portalId;
    this.type = obj.type;
    this.comment = obj.comment ? obj.comment : "";
    this.completedBy = obj.completedBy ? obj.completedBy : "";
    this.assignedTo = obj.assignedTo ? obj.assignedTo : "";
    this.order = obj.order ? Number(obj.order) : 0;
    this.zone = obj.zone ? Number(obj.zone) : 1;

    // some constants
    this.STATE_UNASSIGNED = "pending";
    this.STATE_ASSIGNED = "assigned";
    this.STATE_ACKNOWLEDGED = "acknowledged";
    this.STATE_COMPLETED = "completed";

    // validation happens in the setter, setting up this._state
    this.state = obj.state;
  }

  toJSON() {
    return {
      ID: this.ID,
      portalId: this.portalId,
      type: this.type,
      comment: this.comment,
      state: this._state, // no need to validate here
      completedBy: this.completedBy,
      assignedTo: this.assignedTo,
      order: Number(this.order),
      zone: Number(this.zone),
    };
  }

  get opOrder() {
    return this.order;
  }

  set opOrder(o) {
    this.order = Number.parseInt(o, 10);
  }

  assign(gid) {
    if (!gid || gid == "") {
      this._state = this.STATE_UNASSIGNED;
      this.assignedTo = "";
      return;
    }

    this.assignedTo = gid;
    this._state = this.STATE_ASSIGNED;
    return;
  }

  set state(state) {
    // sanitize state
    if (
      state != this.STATE_UNASSIGNED &&
      state != this.STATE_ASSIGNED &&
      state != this.STATE_ACKNOWLEDGED &&
      state != this.STATE_COMPLETED
    )
      state = this.STATE_UNASSIGNED;
    // if setting to "pending", clear assignments
    if (state == this.STATE_UNASSIGNED) this.assignedTo = null;
    // if setting to assigned or acknowledged and there is no assignment, set to "pending". A task _can_ be completed w/o being assigned
    if (
      (state == this.STATE_ASSIGNED || state == this.STATE_ACKNOWLEDGED) &&
      (!this.assignedTo || this.assignedTo == "")
    ) {
      state = this.STATE_UNASSIGNED;
    }
    this._state = state;
  }

  get state() {
    return this._state;
  }

  async popupContent(marker) {
    const operation = getSelectedOperation();
    if (operation == null) {
      console.log("null op in marker?");
    }

    const portal = operation.getPortal(this.portalId);
    if (portal == null) {
      console.log("null portal getting marker popup");
      return (L.DomUtil.create("div", "wasabee-marker-popup").textContent =
        "invalid portal");
    }

    const content = L.DomUtil.create("div", "wasabee-marker-popup");
    content.appendChild(this._getPopupBodyWithType(portal, operation, marker));

    const assignment = L.DomUtil.create(
      "div",
      "wasabee-popup-assignment",
      content
    );
    if (this.state != "completed" && this.assignedTo) {
      try {
        const a = await WasabeeAgent.get(this.assignedTo);
        assignment.textContent = wX("ASS_TO"); // FIXME convert formatDisplay to html and add as value to wX
        assignment.appendChild(a.formatDisplay("all"));
      } catch (err) {
        console.error(err);
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
        const ad = new AssignDialog({ target: this });
        ad.enable();
        marker.closePopup();
      });

      const sendTargetButton = L.DomUtil.create("button", null, buttonSet);
      sendTargetButton.textContent = wX("SEND TARGET");
      L.DomEvent.on(sendTargetButton, "click", (ev) => {
        L.DomEvent.stop(ev);
        const std = new SendTargetDialog({ target: this });
        std.enable();
        marker.closePopup();
      });
    }
    const gmapButton = L.DomUtil.create("button", null, buttonSet);
    gmapButton.textContent = wX("ANCHOR_GMAP");
    L.DomEvent.on(gmapButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      marker.closePopup();
      // use intent on android
      if (
        typeof window.android !== "undefined" &&
        window.android &&
        window.android.intentPosLink
      ) {
        window.android.intentPosLink(
          +portal.lat,
          +portal.lng,
          window.map.getZoom(),
          portal.name,
          true
        );
      } else {
        window.open(
          "https://www.google.com/maps/search/?api=1&query=" +
            portal.lat +
            "," +
            portal.lng
        );
      }
    });

    return content;
  }

  _getPopupBodyWithType(portal, operation, marker) {
    const title = L.DomUtil.create("div", "desc");
    const kind = L.DomUtil.create("span", "wasabee-marker-popup-kind", title);
    L.DomUtil.addClass(kind, this.type);
    kind.textContent = wX(this.type);
    title.appendChild(portal.displayFormat());

    kind.href = "#";
    L.DomEvent.on(kind, "click", (ev) => {
      L.DomEvent.stop(ev);
      const ch = new MarkerChangeDialog({ marker: this });
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
        const scd = new SetCommentDialog({
          target: this,
          operation: operation,
        });
        scd.enable();
        marker.closePopup();
      });
    }
    const comment = L.DomUtil.create("div", "wasabee-portal-comment", title);
    const cl = L.DomUtil.create("a", null, comment);
    cl.textContent = portal.comment || wX("SET_PORTAL_COMMENT");
    cl.href = "#";
    L.DomEvent.on(cl, "click", (ev) => {
      L.DomEvent.stop(ev);
      const scd = new SetCommentDialog({
        target: portal,
        operation: operation,
      });
      scd.enable();
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
        const scd = new SetCommentDialog({
          target: portal,
          operation: operation,
        });
        scd.enable();
        marker.closePopup();
      });
    }
    return title;
  }
}
