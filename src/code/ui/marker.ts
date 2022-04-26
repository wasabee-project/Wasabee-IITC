import ConfirmDialog from "../dialogs/confirmDialog";
import wX from "../wX";
import { displayFormat as displayPortal } from "./portal";

import type { WasabeeOp, WasabeeMarker, WasabeePortal } from "../model";

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
