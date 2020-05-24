// import WasabeeOp from "./operation";
import WasabeePortal from "./portal";
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
      faked.lat == (newPortal.portal.options.data.latE6 / 1e6).toFixed(6) &&
      faked.lng == (newPortal.portal.options.data.lngE6 / 1e6).toFixed(6)
    ) {
      const np = new WasabeePortal(
        newPortal.portal.options.guid,
        newPortal.portal.options.data.title,
        (newPortal.portal.options.data.latE6 / 1e6).toFixed(6),
        (newPortal.portal.options.data.lngE6 / 1e6).toFixed(6)
      );

      op.swapPortal(faked, np);
      op.update(true);
      // don't bail just yet, more may match
    }
  }
};

export const listenForPortalDetails = e => {
  if (!e.success) return;
  const op = getSelectedOperation();

  for (const faked of op.fakedPortals) {
    if (faked.id == e.guid) {
      faked.name = e.details.title;
      op.update(true);
      return;
    }
  }
  // TODO listen for by location
};

// This is what should be called to add to the queue
// can take either an entire array of portal GUID or a single GUID
// this depends on something listening for the IITC PortalDetailsLoaded hook to process the result
// see listenForPortalDetails above
export const getPortalDetails = function(guid) {
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

const pdqDoNext = function() {
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

  if (!p.length || p.length != 35) return; // ignore faked ones from DrawTools imports and other garbage
  // this is the bit everyone is so worried about
  window.portalDetail.request(p);
};

export const loadFaked = function(operation, force = false) {
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
      x.push(WasabeePortal.fromIITC(window.portals[portal]));
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

// this is the test point used in several auto-draws
// settings allow there to be several different due to
// rouding errors resulting from long distances
export const testPortal = function(recursed = false) {
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

// this is still experimental
export const pointTileDataRequest = function(latlngs, mapZoom = 13) {
  if (window.plugin.wasabee.tileTrawlQueue) {
    console.log("pointTileDataRequest already running");
    return;
  }

  if (latlngs.length == 0) return;
  const dataZoom = window.getDataZoomForMapZoom(mapZoom);
  const tileParams = window.getMapZoomTileParameters(dataZoom);

  window.mapDataRequest.setStatus("trawling", undefined, -1);

  window.plugin.wasabee.tileTrawlQueue = new Map();
  for (const ll of latlngs) {
    // figure out which thile this point is in
    const x = window.latToTile(ll.lat, tileParams);
    const y = window.lngToTile(ll.lng, tileParams);
    const tileID = window.pointToTileId(tileParams, x, y);
    // center point of the tile
    const tilePoint = L.latLng([
      Number(window.tileToLat(x, tileParams).toFixed(6)),
      Number(window.tileToLng(y, tileParams).toFixed(6))
    ]);
    // map so no duplicate tiles are requested
    window.plugin.wasabee.tileTrawlQueue.set(tileID, JSON.stringify(tilePoint));
  }

  // setup listener
  window.addHook("mapDataRefreshEnd", () => tileRequestNext());
  // dive in
  window.map.setZoom(mapZoom);
  tileRequestNext();
  return window.plugin.wasabee.tileTrawlQueue.size;
};

const tileRequestNext = function() {
  const tiles = window.plugin.wasabee.tileTrawlQueue.keys();
  if (tiles.length == 0) {
    delete window.plugin.wasabee.tileTrawlQueue;
    window.removeHook("mapDataRefreshEnd", () => tileRequestNext());
    alert("trawl done");
    return;
  }

  let current = tiles.next().value;
  while (current && window.mapDataRequest.cache.get(current)) {
    console.log("found in cache, skipping", current);
    window.plugin.wasabee.tileTrawlQueue.delete(current);
    current = tiles.next().value;
  }
  if (current) {
    const point = JSON.parse(window.plugin.wasabee.tileTrawlQueue.get(current));
    window.plugin.wasabee.tileTrawlQueue.delete(current);
    window.map.panTo(point, { duration: 0.25, animate: true });
  } else {
    // one last time, to clear
    window.runHooks("mapDataRefreshEnd");
  }
};
