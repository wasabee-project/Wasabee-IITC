// import WasabeeOp from "./operation";
import WasabeePortal from "./portal";
import LinkListDialog from "./dialogs/linkListDialog";
import ConfirmDialog from "./dialogs/confirmDialog";
import { getSelectedOperation } from "./selectedOp";
import { locationPromise } from "./server";
import WasabeeMe from "./me";
import wX from "./wX";

// wrap operation calls in UI checks
export default {
  addPortal: (operation, portal) => {
    if (!portal) {
      return void alert(wX("SELECT PORTAL"));
    }
    operation.addPortal(portal);
  },
  swapPortal: (operation, portal) => {
    const selectedPortal = WasabeePortal.getSelected();
    if (!selectedPortal) {
      alert(wX("SELECT PORTAL"));
      return;
    }
    if (portal.id === selectedPortal.id) {
      alert(wX("SELF SWAP"));
      return;
    }

    const con = new ConfirmDialog();
    const pr = L.DomUtil.create("div", null);
    pr.innerHTML = wX("SWAP PROMPT");
    pr.appendChild(portal.displayFormat(operation));
    L.DomUtil.create("span", null, pr).innerHTML = wX("SWAP WITH");
    pr.appendChild(selectedPortal.displayFormat(operation));
    con.setup(wX("SWAP TITLE"), pr, () => {
      operation.swapPortal(portal, selectedPortal);
    });
    con.enable();
  },
  deletePortal: (operation, portal) => {
    const con = new ConfirmDialog();
    const pr = L.DomUtil.create("div", null);
    pr.innerHTML = wX("DELETE ANCHOR PROMPT");
    pr.appendChild(portal.displayFormat(operation));
    con.setup(wX("DELETE ANCHOR TITLE"), pr, () => {
      operation.removeAnchor(portal.id);
    });
    con.enable();
  },
  deleteMarker: (operation, marker, portal) => {
    const con = new ConfirmDialog();
    const pr = L.DomUtil.create("div", null);
    pr.innerHTML = wX("DELETE MARKER PROMPT");
    pr.appendChild(portal.displayFormat(operation));
    con.setup(wX("DELETE MARKER TITLE"), pr, () => {
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
  },
  sendLocation: () => {
    if (!WasabeeMe.isLoggedIn()) return;
    if (!window.plugin.wasabee.sendLocation) return;

    navigator.geolocation.getCurrentPosition(
      position => {
        locationPromise(
          position.coords.latitude,
          position.coords.longitude
        ).then(
          () => {
            console.log(wX("LOCATION SUB"));
          },
          err => {
            console.log(err);
          }
        );
      },
      err => {
        console.log(err);
      }
    );
  }
};
