// import WasabeeOp from "./operation";
import WasabeePortal from "./portal";
import LinkListDialog from "./dialogs/linkListDialog";
import ConfirmDialog from "./dialogs/confirmDialog";

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
    const prompt = document.createElement("div");
    prompt.innerHTML = "Do you want to swap: ";
    prompt.appendChild(portal.displayFormat(operation));
    prompt.appendChild(document.createElement("span")).innerHTML = " with ";
    prompt.appendChild(selectedPortal.displayFormat(operation));
    con.setup("Swap Portal", prompt, () => {
      operation.swapPortal(portal, selectedPortal);
    });
    con.enable();
  },
  deletePortal: (operation, portal) => {
    const con = new ConfirmDialog();
    const prompt = document.createElement("div");
    prompt.innerHTML =
      "Do you want to delete this anchor and all associated links: ";
    prompt.appendChild(portal.displayFormat(operation));
    con.setup("Delete Anchor", prompt, () => {
      operation.removeAnchor(portal.id);
    });
    con.enable();
  },
  deleteMarker: (operation, marker, portal) => {
    const con = new ConfirmDialog();
    const prompt = document.createElement("div");
    prompt.innerHTML = "Do you want to delete this marker: ";
    prompt.appendChild(portal.displayFormat(operation));
    con.setup("Delete Marker", prompt, () => {
      operation.removeMarker(marker);
    });
    con.enable();
  },
  clearAllItems: operation => {
    const con = new ConfirmDialog();
    con.setup(
      "Clear: " + operation.name,
      "Do you want to reset " + operation.name + "?",
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
  }
};
