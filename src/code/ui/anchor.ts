import ConfirmDialog from "../dialogs/confirmDialog";
import { displayError } from "../error";
import { displayFormat, getSelected } from "./portal";
import wX from "../wX";

import type { WasabeeOp, WasabeePortal } from "../model";

export function swapPortal(operation: WasabeeOp, portal: WasabeePortal) {
  const selectedPortal = getSelected();
  if (!selectedPortal) {
    displayError(wX("SELECT PORTAL"));
    return;
  }
  if (portal.id === selectedPortal.id) {
    displayError(wX("SELF SWAP"));
    return;
  }

  const pr = L.DomUtil.create("div", null);
  pr.textContent = wX("SWAP PROMPT");
  pr.appendChild(displayFormat(portal));
  L.DomUtil.create("span", null, pr).textContent = wX("SWAP WITH");
  pr.appendChild(displayFormat(selectedPortal));
  L.DomUtil.create("span", null, pr).textContent = "?";
  const con = new ConfirmDialog({
    title: wX("SWAP TITLE"),
    label: pr,
    type: "anchor",
    callback: () => {
      operation.swapPortal(portal, selectedPortal);
    },
  });
  con.enable();
}

export function deletePortal(operation: WasabeeOp, portal: WasabeePortal) {
  const pr = L.DomUtil.create("div", null);
  pr.textContent = wX("DELETE ANCHOR PROMPT");
  pr.appendChild(displayFormat(portal));
  const con = new ConfirmDialog({
    title: wX("DELETE ANCHOR TITLE"),
    label: pr,
    type: "anchor",
    callback: () => {
      operation.removeAnchor(portal.id);
      // window.map.fire("wasabee:crosslinks"); -- only needed if we also reset the cache first
    },
  });
  con.enable();
}
