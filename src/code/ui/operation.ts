import ConfirmDialog from "../dialogs/confirmDialog";
import wX from "../wX";

import type { WasabeeOp } from "../model";

export function clearAllItems(operation: WasabeeOp) {
  const con = new ConfirmDialog({
    title: wX("dialog.clear_all.title", { opName: operation.name }),
    label: wX("dialog.clear_all.text", { opName: operation.name }),
    type: "operation",
    callback: () => {
      operation.clearAllItems();
      window.map.fire("wasabee:crosslinks");
    },
  });
  con.enable();
}

export function clearAllLinks(operation: WasabeeOp) {
  const con = new ConfirmDialog({
    title: wX("dialog.clear_links.title", { opName: operation.name }),
    label: wX("dialog.clear_links.text", { opName: operation.name }),
    type: "operation",
    callback: () => {
      operation.clearAllLinks();
      window.map.fire("wasabee:crosslinks");
    },
  });
  con.enable();
}

export function clearAllMarkers(operation: WasabeeOp) {
  const con = new ConfirmDialog({
    title: wX("dialog.clear_markers.title", { opName: operation.name }),
    label: wX("dialog.clear_markers.text", { opName: operation.name }),
    type: "operation",
    callback: () => {
      operation.clearAllMarkers();
      window.map.fire("wasabee:crosslinks");
    },
  });
  con.enable();
}