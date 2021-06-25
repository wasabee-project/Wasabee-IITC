import { generateId } from "./auxiliar";
import { deleteMarker } from "./uiCommands";
import WasabeeAgent from "./agent";
import AssignDialog from "./dialogs/assignDialog";
import SendTargetDialog from "./dialogs/sendTargetDialog";
import wX from "./wX";
import SetCommentDialog from "./dialogs/setCommentDialog";
import MarkerChangeDialog from "./dialogs/markerChangeDialog";
import StateDialog from "./dialogs/stateDialog";
import { getSelectedOperation } from "./selectedOp";

const STATE_UNASSIGNED = "pending";
const STATE_ASSIGNED = "assigned";
const STATE_ACKNOWLEDGED = "acknowledged";
const STATE_COMPLETED = "completed";

export default class WasabeeMarker {
  constructor(obj) {
    this.ID = obj.ID ? obj.ID : generateId();
    this.portalId = obj.portalId;
    this.type = obj.type;
    this.comment = obj.comment ? obj.comment : ""; // why "" and not null? This isn't go
    this.completedID = obj.completedID ? obj.completedID : "";
    this.order = obj.order ? Number(obj.order) : 0;
    this.zone = obj.zone ? Number(obj.zone) : 1;

    this.assign(obj.assignedTo); // WAS this.assignedTo = obj.assignedTo ? obj.assignedTo : "";
    // if ._state then it came from indexeddb, otherwise from server/localStorage
    if (obj._state) {
      this.state = obj._state;
    } else this.state = obj.state ? obj.state : null;
  }

  // not called when pushing to indexeddb, but used when sending to server
  toJSON() {
    return {
      ID: this.ID,
      portalId: this.portalId,
      type: this.type,
      comment: this.comment,
      state: this._state, // no need to validate here
      completedID: this.completedBID,
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
      this._state = STATE_UNASSIGNED;
      this.assignedTo = "";
      return;
    }

    this.assignedTo = gid;
    this._state = STATE_ASSIGNED;
    return;
  }

  set state(state) {
    switch (state) {
      case STATE_UNASSIGNED:
        this.assignedTo = null;
        this._state = STATE_UNASSIGNED;
        break;
      case STATE_ASSIGNED: // fall-through
      case STATE_ACKNOWLEDGED:
        if (!this.assignedTo || this.assignedTo == "") {
          this._state = STATE_UNASSIGNED;
          break;
        }
        this._state = state;
        break;
      case STATE_COMPLETED:
        this._state = STATE_COMPLETED;
        break;
      default:
        this._state = STATE_UNASSIGNED;
        break;
    }
  }

  get state() {
    return this._state;
  }

  async popupContent(marker, operation) {
    if (!operation) operation = getSelectedOperation();
    const canWrite = operation.getPermission() === "write";

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
        assignment.appendChild(await a.formatDisplay());
      } catch (err) {
        console.error(err);
      }
    }
    if (this.state == "completed" && this.completedID) {
      try {
        const a = await WasabeeAgent.get(this.completedID);
        assignment.innerHTML = wX("COMPLETED BY", {
          agentName: a.name,
        });
      } catch (e) {
        console.error(e);
      }
    }

    const buttonSet = L.DomUtil.create(
      "div",
      "wasabee-marker-buttonset",
      content
    );
    if (canWrite) {
      const deleteButton = L.DomUtil.create("button", null, buttonSet);
      deleteButton.textContent = wX("DELETE_ANCHOR");
      L.DomEvent.on(deleteButton, "click", (ev) => {
        L.DomEvent.stop(ev);
        deleteMarker(operation, this, portal);
        marker.closePopup();
      });

      if (operation.isServerOp() && operation.isOnCurrentServer()) {
        const assignButton = L.DomUtil.create("button", null, buttonSet);
        assignButton.textContent = wX("ASSIGN");
        L.DomEvent.on(assignButton, "click", (ev) => {
          L.DomEvent.stop(ev);
          const ad = new AssignDialog({ target: this });
          ad.enable();
          marker.closePopup();
        });
      }
    }

    if (operation.isServerOp()) {
      if (operation.isOnCurrentServer()) {
        const sendTargetButton = L.DomUtil.create("button", null, buttonSet);
        sendTargetButton.textContent = wX("SEND TARGET");
        L.DomEvent.on(sendTargetButton, "click", (ev) => {
          L.DomEvent.stop(ev);
          const std = new SendTargetDialog({ target: this });
          std.enable();
          marker.closePopup();
        });
      }

      if (canWrite) {
        const stateButton = L.DomUtil.create("button", null, buttonSet);
        stateButton.textContent = wX("MARKER STATE");
        L.DomEvent.on(stateButton, "click", (ev) => {
          L.DomEvent.stop(ev);
          const sd = new StateDialog({ target: this, opID: operation.ID });
          sd.enable();
          marker.closePopup();
        });
      }
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
