// import WasabeeOp from "./operation";
import WasabeePortal from "./portal";
import LinkListDialog from "./dialogs/linkListDialog";
import ConfirmDialog from "./dialogs/confirmDialog";
import { getSelectedOperation } from "./selectedOp";
import { locationPromise } from "./server";
import WasabeeMe from "./me";
import wX from "./wX";

export const addPortal = (operation, portal) => {
  if (!portal) {
    return void alert(wX("SELECT PORTAL"));
  }
  operation.addPortal(portal);
};

export const swapPortal = (operation, portal) => {
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
};

export const deletePortal = (operation, portal) => {
  const con = new ConfirmDialog();
  const pr = L.DomUtil.create("div", null);
  pr.innerHTML = wX("DELETE ANCHOR PROMPT");
  pr.appendChild(portal.displayFormat(operation));
  con.setup(wX("DELETE ANCHOR TITLE"), pr, () => {
    operation.removeAnchor(portal.id);
  });
  con.enable();
};

export const deleteMarker = (operation, marker, portal) => {
  const con = new ConfirmDialog();
  const pr = L.DomUtil.create("div", null);
  pr.innerHTML = wX("DELETE MARKER PROMPT");
  pr.appendChild(portal.displayFormat(operation));
  con.setup(wX("DELETE MARKER TITLE"), pr, () => {
    operation.removeMarker(marker);
  });
  con.enable();
};

export const clearAllItems = operation => {
  const con = new ConfirmDialog();
  con.setup(
    `Clear: ${operation.name}`,
    `Do you want to reset ${operation.name}?`,
    () => {
      operation.clearAllItems();
      window.runHooks("wasabeeCrosslinks", operation);
    }
  );
  con.enable();
};

export const clearAllLinks = operation => {
  const con = new ConfirmDialog();
  con.setup(
    `Clear Links: ${operation.name}`,
    `Do you want to remove all links from ${operation.name}?`,
    () => {
      operation.clearAllLinks();
      window.runHooks("wasabeeCrosslinks", operation);
    }
  );
  con.enable();
};

export const showLinksDialog = (operation, portal) => {
  const lld = new LinkListDialog();
  lld.setup(operation, portal);
  lld.enable();
};

export const listenForAddedPortals = newPortal => {
  if (!newPortal.portal.options.data.title) return;

  const op = getSelectedOperation();

  for (const faked of op.fakedPortals) {
    // if we had a GUID -- normal faked
    if (faked.id == newPortal.portal.options.guid) {
      faked.name = newPortal.portal.options.data.title;
      op.update(true);
      return;
    }

    // if we only had location -- from drawtools import
    if (
      faked.lat ==
        (newPortal.portal.options.data.latE6 / 1e6).toFixed(6).toString() &&
      faked.lng ==
        (newPortal.portal.options.data.lngE6 / 1e6).toFixed(6).toString()
    ) {
      const np = new WasabeePortal(
        newPortal.portal.options.guid,
        newPortal.portal.options.data.title,
        (newPortal.portal.options.data.latE6 / 1e6).toFixed(6).toString(),
        (newPortal.portal.options.data.lngE6 / 1e6).toFixed(6).toString()
      );

      op.swapPortal(faked, np);
      op.update(true);
      // don't bail just yet, more may match
    }
  }
};

export const sendLocation = () => {
  if (!WasabeeMe.isLoggedIn()) return;
  const sl =
    localStorage[window.plugin.wasabee.static.constants.SEND_LOCATION_KEY];
  if (sl !== true) return;

  navigator.geolocation.getCurrentPosition(
    position => {
      locationPromise(position.coords.latitude, position.coords.longitude).then(
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
};

export const getAllPortalsOnScreen = function(operation) {
  const bounds = window.clampLatLngBounds(window.map.getBounds());
  const x = [];
  for (const portal in window.portals) {
    if (_isOnScreen(window.portals[portal].getLatLng(), bounds)) {
      if (
        _hasMarker(
          window.portals[portal].options.guid,
          window.plugin.wasabee.static.constants.MARKER_TYPE_EXCLUDE,
          operation
        )
      )
        continue;
      x.push(window.portals[portal]);
    }
  }
  return x;
};

const _isOnScreen = function(ll, bounds) {
  return (
    ll.lat < bounds._northEast.lat &&
    ll.lng < bounds._northEast.lng &&
    ll.lat > bounds._southWest.lat &&
    ll.lng > bounds._southWest.lng
  );
};

const _hasMarker = function(portalid, markerType, operation) {
  if (operation.markers.length == 0) return false;
  for (const m of operation.markers) {
    if (m.portalId == portalid && m.type == markerType) {
      return true;
    }
  }
  return false;
};
