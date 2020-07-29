// import WasabeeOp from "./operation";
import WasabeePortal from "./portal";
import ConfirmDialog from "./dialogs/confirmDialog";
import { getSelectedOperation } from "./selectedOp";
import { locationPromise } from "./server";
import WasabeeMe from "./me";
import wX from "./wX";

export const addPortal = (operation, portal) => {
  if (!portal) {
    alert(wX("SELECT PORTAL"));
    return;
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
  pr.textContent = wX("SWAP PROMPT");
  pr.appendChild(portal.displayFormat());
  L.DomUtil.create("span", null, pr).textContent = wX("SWAP WITH");
  pr.appendChild(selectedPortal.displayFormat());
  con.setup(wX("SWAP TITLE"), pr, () => {
    operation.swapPortal(portal, selectedPortal);
  });
  con.enable();
};

export const deletePortal = (operation, portal) => {
  const con = new ConfirmDialog();
  const pr = L.DomUtil.create("div", null);
  pr.textContent = wX("DELETE ANCHOR PROMPT");
  pr.appendChild(portal.displayFormat());
  con.setup(wX("DELETE ANCHOR TITLE"), pr, () => {
    operation.removeAnchor(portal.id);
  });
  con.enable();
};

export const deleteMarker = (operation, marker, portal) => {
  const con = new ConfirmDialog();
  const pr = L.DomUtil.create("div", null);
  pr.textContent = wX("DELETE MARKER PROMPT");
  pr.appendChild(portal.displayFormat());
  con.setup(wX("DELETE MARKER TITLE"), pr, () => {
    operation.removeMarker(marker);
  });
  con.enable();
};

export const clearAllItems = (operation) => {
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

export const clearAllLinks = (operation) => {
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

export const listenForAddedPortals = (newPortal) => {
  if (!newPortal.portal.options.data.title) return;

  const op = getSelectedOperation();
  op.updatePortal(WasabeePortal.fromIITC(newPortal.portal));
};

export const listenForPortalDetails = (e) => {
  if (!e.success) return;
  const op = getSelectedOperation();
  op.updatePortal(
    new WasabeePortal(
      e.guid,
      e.details.title,
      (e.details.latE6 / 1e6).toFixed(6),
      (e.details.lngE6 / 1e6).toFixed(6)
    )
  );
};

// This is what should be called to add to the queue
// can take either an entire array of portal GUID or a single GUID
// this depends on something listening for the IITC PortalDetailsLoaded hook to process the result
// see listenForPortalDetails above
export const getPortalDetails = function (guid) {
  if (Array.isArray(guid)) {
    window.plugin.wasabee.portalDetailQueue = window.plugin.wasabee.portalDetailQueue.concat(
      guid
    );
  } else {
    window.plugin.wasabee.portalDetailQueue.push(guid);
  }

  const rate =
    localStorage[
      window.plugin.wasabee.static.constants.PORTAL_DETAIL_RATE_KEY
    ] || 1000;

  // if not already processing the queue, start it
  if (!window.plugin.wasabee.portalDetailIntervalID) {
    window.plugin.wasabee.portalDetailIntervalID = window.setInterval(
      pdqDoNext,
      rate
    );
    console.log(
      "starting portal details request queue: " +
        window.plugin.wasabee.portalDetailIntervalID
    );
  }
};

const pdqDoNext = function () {
  const p = window.plugin.wasabee.portalDetailQueue.shift();

  // are we done?
  if (p === undefined) {
    console.log(
      "closing portal details request queue: " +
        window.plugin.wasabee.portalDetailIntervalID
    );
    window.clearInterval(window.plugin.wasabee.portalDetailIntervalID);
    window.plugin.wasabee.portalDetailIntervalID = null;
    return;
  }

  if (p.length != 35) return; // ignore faked ones from DrawTools imports and other garbage
  // this is the bit everyone is so worried about
  window.portalDetail.request(p);
};

export const loadFaked = function (operation, force = false) {
  const flag =
    localStorage[window.plugin.wasabee.static.constants.AUTO_LOAD_FAKED] ||
    false;

  // local storage always returns as string
  if (flag !== "true" && !force) return;

  const f = new Array();
  for (const x of operation.fakedPortals) f.push(x.id);
  if (f.length > 0) getPortalDetails(f);
};

export const sendLocation = () => {
  if (!WasabeeMe.isLoggedIn()) return;
  const sl =
    localStorage[window.plugin.wasabee.static.constants.SEND_LOCATION_KEY];
  if (sl !== "true") return;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      locationPromise(position.coords.latitude, position.coords.longitude).then(
        () => {
          console.log(wX("LOCATION SUB"));
        },
        (err) => {
          console.log(err);
        }
      );
    },
    (err) => {
      console.log(err);
    }
  );
};

export const getAllPortalsOnScreen = function (operation) {
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
      const wp = WasabeePortal.fromIITC(window.portals[portal]);
      if (wp) x.push(wp);
    }
  }
  return x;
};

const _isOnScreen = function (ll, bounds) {
  return (
    ll.lat < bounds._northEast.lat &&
    ll.lng < bounds._northEast.lng &&
    ll.lat > bounds._southWest.lat &&
    ll.lng > bounds._southWest.lng
  );
};

const _hasMarker = function (portalid, markerType, operation) {
  if (operation.markers.length == 0) return false;
  for (const m of operation.markers) {
    if (m.portalId == portalid && m.type == markerType) {
      return true;
    }
  }
  return false;
};

// this is the test point used in several auto-draws
// settings allow there to be several different due to
// rouding errors resulting from long distances
export const testPortal = function (recursed = false) {
  let urp =
    localStorage[
      window.plugin.wasabee.static.constants.MULTIMAX_UNREACHABLE_KEY
    ];
  if (!urp) {
    urp = '{"lat":-74.2,"lng":-143.4}';
    localStorage[
      window.plugin.wasabee.static.constants.MULTIMAX_UNREACHABLE_KEY
    ] = urp;
  }

  let parsed = null;
  try {
    parsed = JSON.parse(urp);
  } catch (err) {
    if (!recursed) {
      delete localStorage[
        window.plugin.wasabee.static.constants.MULTIMAX_UNREACHABLE_KEY
      ];
      return testPortal(true);
    }
  }

  // if recrused and still getting garbage, we have a problem
  return parsed;
};

// recursive function to auto-mark blockers
export const blockerAutomark = function (operation, first = true) {
  if (first) operation.startBatchMode();
  // build count list
  const portals = new Array();
  for (const b of operation.blockers) {
    if (
      !operation.containsMarkerByID(
        b.fromPortalId,
        window.plugin.wasabee.static.constants.MARKER_TYPE_EXCLUDE
      )
    )
      portals.push(b.fromPortalId);
    if (
      !operation.containsMarkerByID(
        b.toPortalId,
        window.plugin.wasabee.static.constants.MARKER_TYPE_EXCLUDE
      )
    )
      portals.push(b.toPortalId);
  }
  const reduced = {};
  for (const p of portals) {
    if (!reduced[p]) reduced[p] = 0;
    reduced[p]++;
  }
  const sorted = Object.entries(reduced).sort((a, b) => b[1] - a[1]);

  // return from recursion
  if (sorted.length == 0) {
    if (first) operation.endBatchMode();
    window.runHooks("wasabeeUIUpdate", operation);
    return;
  }

  const portalId = sorted[0][0];

  // put in some smarts for picking close portals, rather than random ones
  // when the count gets > 3

  // get WasabeePortal for portalId
  let wportal = operation.getPortal(portalId);
  if (!wportal) wportal = WasabeePortal.get(portalId);
  if (!wportal) {
    alert(wX("AUTOMARK STOP"));
    return;
  }
  // console.log(wportal);

  // add marker
  let type = window.plugin.wasabee.static.constants.MARKER_TYPE_DESTROY;
  if (wportal.team == "E") {
    type = window.plugin.wasabee.static.constants.MARKER_TYPE_VIRUS;
  }
  operation.addMarker(type, wportal, "auto-marked");

  // remove nodes from blocker list
  operation.blockers = operation.blockers.filter((b) => {
    if (b.fromPortalId == portalId || b.toPortalId == portalId) return false;
    return true;
  });
  // recurse
  blockerAutomark(operation, false);
};
