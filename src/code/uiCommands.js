// import WasabeeOp from "./operation";
import WasabeePortal from "./portal";
import LinkListDialog from "./dialogs/linkListDialog";
import ConfirmDialog from "./dialogs/confirmDialog";
import { getSelectedOperation } from "./selectedOp";

// wrap operation calls in UI checks
export default {
  addPortal: (operation, portal) => {
    if (!portal) {
      return void alert("Please select a portal first!");
    }
    operation.addPortal(portal);
  },
  swapPortal: (operation, portal) => {
    const selectedPortal = WasabeePortal.getSelected();
    if (!selectedPortal) {
      alert("You must select a new portal!");
      return;
    }
    if (portal.id === selectedPortal.id) {
      alert("Cannot swap a portal with itself! Select a different portal.");
      return;
    }

    const con = new ConfirmDialog();
    const pr = L.DomUtil.create("div", "");
    pr.innerHTML = "Do you want to swap: ";
    pr.appendChild(portal.displayFormat(operation));
    L.DomUtil.create("span", "", pr).innerHTML = " with ";
    pr.appendChild(selectedPortal.displayFormat(operation));
    con.setup("Swap Portal", pr, () => {
      operation.swapPortal(portal, selectedPortal);
    });
    con.enable();
  },
  deletePortal: (operation, portal) => {
    const con = new ConfirmDialog();
    const pr = L.DomUtil.create("div", "");
    pr.innerHTML =
      "Do you want to delete this anchor and all associated links: ";
    pr.appendChild(portal.displayFormat(operation));
    con.setup("Delete Anchor", pr, () => {
      operation.removeAnchor(portal.id);
    });
    con.enable();
  },
  deleteMarker: (operation, marker, portal) => {
    const con = new ConfirmDialog();
    const pr = L.DomUtil.create("div", "");
    pr.innerHTML = "Do you want to delete this marker: ";
    pr.appendChild(portal.displayFormat(operation));
    con.setup("Delete Marker", pr, () => {
      operation.removeMarker(marker);
    });
    con.enable();
  },
  clearAllItems: operation => {
    const con = new ConfirmDialog();
    con.setup(
      `Clear: {$operation.name}`,
      `Do you want to reset ${operation.name}?`,
      () => {
        operation.clearAllItems();
      }
    );
    con.enable();
  },
  showLinksDialog: (operation, portal) => {
    const lld = new LinkListDialog();
    lld.setup(operation, portal);
    lld.enable();
  },
  listenForAddedPortals: newPortal => {
    if (!newPortal.portal.options.data.title) return;

    const op = getSelectedOperation();

    for (const faked of op.fakedPortals) {
      if (faked.id == newPortal.portal.options.guid) {
        faked.name = newPortal.portal.options.data.title;
        op.update(true);
      }
    }
  }
};
