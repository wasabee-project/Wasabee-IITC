import WasabeeAgent from "../model/agent";

import AssignDialog from "../dialogs/assignDialog";
import SendTargetDialog from "../dialogs/sendTargetDialog";
import SetCommentDialog from "../dialogs/setCommentDialog";
import MarkerChangeDialog from "../dialogs/markerChangeDialog";
import StateDialog from "../dialogs/stateDialog";
import { getSelectedOperation } from "../selectedOp";
import { deleteMarker } from "../uiCommands";

import AgentUI from "./agent";
import PortalUI from "./portal";

import wX from "../wX";

export default {
  popupContent,
};

async function popupContent(marker, leafletMarker, operation) {
  if (!operation) operation = getSelectedOperation();
  const canWrite = operation.canWrite();

  const portal = operation.getPortal(marker.portalId);
  if (portal == null) {
    console.log("null portal getting marker popup");
    return (L.DomUtil.create("div", "wasabee-marker-popup").textContent =
      "invalid portal");
  }

  const content = L.DomUtil.create("div", "wasabee-marker-popup");
  content.appendChild(
    getPopupBodyWithType(marker, portal, operation, leafletMarker)
  );

  const assignment = L.DomUtil.create(
    "div",
    "wasabee-popup-assignment",
    content
  );
  if (marker.state != "completed" && marker.assignedTo) {
    try {
      const a = await WasabeeAgent.get(marker.assignedTo);
      assignment.textContent = wX("ASS_TO"); // FIXME convert formatDisplay to html and add as value to wX
      if (a) assignment.appendChild(await AgentUI.formatDisplay(a));
      else assignment.textContent += " " + marker.assignedTo;
    } catch (err) {
      console.error(err);
    }
  }
  if (marker.state == "completed" && marker.completedID) {
    try {
      const a = await WasabeeAgent.get(marker.completedID);
      assignment.innerHTML = wX("COMPLETED BY", {
        agentName: a ? a.name : marker.completedID,
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
      deleteMarker(operation, marker, portal);
      leafletMarker.closePopup();
    });
  }
  if (operation.canWriteServer()) {
    const assignButton = L.DomUtil.create("button", null, buttonSet);
    assignButton.textContent = wX("ASSIGN");
    L.DomEvent.on(assignButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      const ad = new AssignDialog({ target: marker });
      ad.enable();
      leafletMarker.closePopup();
    });
  }

  if (canWrite) {
    const stateButton = L.DomUtil.create("button", null, buttonSet);
    stateButton.textContent = wX("MARKER STATE");
    L.DomEvent.on(stateButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      const sd = new StateDialog({ target: marker, opID: operation.ID });
      sd.enable();
      leafletMarker.closePopup();
    });
  }

  if (operation.isOnCurrentServer()) {
    const sendTargetButton = L.DomUtil.create("button", null, buttonSet);
    sendTargetButton.textContent = wX("SEND TARGET");
    L.DomEvent.on(sendTargetButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      const std = new SendTargetDialog({ target: marker });
      std.enable();
      leafletMarker.closePopup();
    });
  }

  const gmapButton = L.DomUtil.create("button", null, buttonSet);
  gmapButton.textContent = wX("ANCHOR_GMAP");
  L.DomEvent.on(gmapButton, "click", (ev) => {
    L.DomEvent.stop(ev);
    leafletMarker.closePopup();
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

function getPopupBodyWithType(marker, portal, operation, leafletMarker) {
  const title = L.DomUtil.create("div", "desc");
  const kind = L.DomUtil.create("span", "wasabee-marker-popup-kind", title);
  L.DomUtil.addClass(kind, marker.type);
  kind.textContent = wX(marker.type);
  title.appendChild(PortalUI.displayFormat(portal));

  kind.href = "#";
  L.DomEvent.on(kind, "click", (ev) => {
    L.DomEvent.stop(ev);
    const ch = new MarkerChangeDialog({ marker: marker });
    ch.enable();
    leafletMarker.closePopup();
  });

  if (marker.comment) {
    const comment = L.DomUtil.create(
      "div",
      "wasabee-marker-popup-comment",
      title
    );
    comment.textContent = marker.comment;
    L.DomEvent.on(comment, "click", (ev) => {
      L.DomEvent.stop(ev);
      const scd = new SetCommentDialog({
        target: marker,
        operation: operation,
      });
      scd.enable();
      leafletMarker.closePopup();
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
    leafletMarker.closePopup();
  });
  if (portal.hardness) {
    const hardness = L.DomUtil.create("div", "wasabee-portal-hardness", title);
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
      leafletMarker.closePopup();
    });
  }
  return title;
}
