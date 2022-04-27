import ConfirmDialog from "../dialogs/confirmDialog";
import wX from "../wX";
import { displayFormat as displayPortal, getSelected } from "./portal";
import { displayError } from "../error";

import {
  WasabeeOp,
  WasabeeMarker,
  WasabeePortal,
  WasabeeBlocker,
} from "../model";

export function displayFormat(marker: WasabeeMarker, operation: WasabeeOp) {
  const portal = operation.getPortal(marker.portalId);

  if (portal == null) {
    console.log("null portal getting marker popup");
    return (L.DomUtil.create("div", "").textContent = "invalid portal");
  }

  const desc = L.DomUtil.create("span");
  const kind = L.DomUtil.create("span", `${marker.type}`, desc);
  kind.textContent = wX(marker.type);
  desc.appendChild(displayPortal(portal));
  return desc;
}

export function deleteMarker(
  operation: WasabeeOp,
  marker: WasabeeMarker,
  portal: WasabeePortal
) {
  const pr = L.DomUtil.create("div", null);
  pr.textContent = wX("DELETE MARKER PROMPT");
  pr.appendChild(displayPortal(portal));
  const con = new ConfirmDialog({
    title: wX("DELETE MARKER TITLE"),
    label: pr,
    type: "marker",
    callback: () => {
      operation.removeMarker(marker);
      window.map.fire("wasabee:crosslinks");
    },
  });
  con.enable();
}

export function swapMarker(operation: WasabeeOp, marker: WasabeeMarker) {
  const selectedPortal = getSelected();
  if (!selectedPortal) {
    displayError(wX("SELECT PORTAL"));
    return;
  }
  if (marker.portalId === selectedPortal.id) {
    displayError(wX("SELF SWAP"));
    return;
  }

  const portal = operation.getPortal(marker.portalId);

  const pr = L.DomUtil.create("div", null);
  pr.textContent = wX("swap.marker.prompt");
  pr.appendChild(displayPortal(portal));
  L.DomUtil.create("span", null, pr).textContent = wX("SWAP WITH");
  pr.appendChild(displayPortal(selectedPortal));
  L.DomUtil.create("span", null, pr).textContent = "?";
  const con = new ConfirmDialog({
    title: wX("swap.marker.title"),
    label: pr,
    type: "anchor",
    callback: () => {
      operation.startBatchMode();
      operation.removeMarker(marker);
      operation.addMarker(marker.type, selectedPortal, {
        zone: marker.zone,
        comment: marker.comment,
        assign: marker.assignedTo,
      });
      if (WasabeeMarker.isDestructMarkerType(marker.type))
        WasabeeBlocker.removeBlocker(operation, portal.id);
      operation.endBatchMode();
    },
  });
  con.enable();
}
