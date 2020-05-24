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
// pass in an array of L.LatLngs, it determines the zoom-15 tiles
// and requests those tiles be loaded with IITC's queuing and caching
export const pointTileDataRequest = function(latlngs, mapZoom = 15) {
  if (latlngs.length == 0) return;
  if (window.plugin.wasabee.ptdrIntervalID) {
    console.log("pointTileDataRequest already running");
    return;
  }

  // abuse the window.mapDataRequest
  const mdr = window.mapDataRequest;
  mdr.idle = true;

  const bounds = window.clampLatLngBounds(new L.LatLngBounds(latlngs));
  window.map.fitBounds(bounds);

  mdr.debugTiles.reset();
  const oldDebugTiles = mdr.debugTiles;
  mdr.debugTiles = new FakeDebugTiles();
  mdr.resetRenderQueue();
  mdr.tileErrorCount = {};

  const dataZoom = window.getDataZoomForMapZoom(mapZoom);
  const tileParams = window.getMapZoomTileParameters(dataZoom);

  // used by mapMoveEnd
  // mdr.fetchedDataParams = { bounds: bounds, mapZoom: mapZoom, dataZoom: dataZoom };
  /* window.runHooks("mapDataRefreshStart", { bounds: bounds, mapZoom: mapZoom, dataZoom: dataZoom, minPortalLevel: tileParams.level, tileBounds: bounds });
  const _render = mdr.render;
  _render.render.startRenderPass(tileParams.level, bounds);
  window.runHooks("mapDataEntityInject", {
    callback: e => _render.processGameEntities(e)
  });
  mdr.render.processGameEntities(window.artifact.getArtifactEntities());
   */

  mdr.setStatus("trawling", undefined, -1);
  // shut mdr down for now
  // mdr.pauseRenderQueue(true);
  mdr.clearTimeout();
  mdr.cache.runExpire();
  mdr.cache.debug();

  // use a map to prevent dupes
  const list = new Map();
  for (const ll of latlngs) {
    const x = window.lngToTile(ll.lat, tileParams);
    const y = window.lngToTile(ll.lng, tileParams);
    const tileID = window.pointToTileId(tileParams, x, y);
    list.set(tileID, 0);
  }
  const tiles = Array.from(list.keys());
  const totaltiles = tiles.length;
  // embiggen cache
  if (mdr.cache) {
    mdr.cache.REQUEST_CACHE_MAX_ITEMS = totaltiles + 1000;
    mdr.cache.REQUEST_CACHE_MAX_CHARS = 1000000000;
  }
  // console.log(tiles);
  const qt = {};
  for (const t of tiles) {
    if (mdr.cache && mdr.cache._cache[t]) continue;
    qt[t] = t;
  }
  // why does this kick off the IITC queue runner?
  mdr.queuedTiles = qt;

  const rate = 330;
  window.plugin.wasabee.ptdrIntervalID = window.setInterval(() => {
    const t = tiles.pop();
    if (t) {
      mdr.setStatus("trawl: " + t, undefined, -1);
      mdr.cache.debug();
      if (mdr.cache && mdr.cache._cache[t]) {
        // console.log("already cached?", t, mdr.cache._cache[t]);
        return;
      }
      if (!Object.prototype.hasOwnProperty.call(mdr.queuedTiles, t)) {
        console.log("not in queue?", t, mdr.cache._cache[t]);
        console.log(mdr.queuedTiles);
        return;
      }
      mdr.sendTileRequest([t]);
      // call mdr.handleRequest when data loads
      // XXX counts wrong direction
      // mdr.setStatus("trawling", t, tiles.length / totaltiles);
      return;
    }

    // nothing left in the queue, shut it down
    window.clearInterval(window.plugin.wasabee.ptdrIntervalID);
    delete window.plugin.wasabee.ptdrIntervalID;
    mdr.setStatus("trawl complete", undefined, -1);
    console.log(mdr);
    mdr.cache.debug();
    mdr.pauseRenderQueue(false);
    mdr.idleResume();
    mdr.debugTiles = oldDebugTiles;

    // mdr.processRequestQueue(true);
    // mdr.processRenderQueue();
    window.runHooks("requestFinished", { success: true });
    alert("trawl done");
  }, rate);
};

// I'll send a patch to IITC once I get our stuff working
class FakeDebugTiles {
  constructor() {
    console.log(
      "creating fake debug tile class -- breaking debug tiles for now"
    );
  }

  reset() {
    // console.log("fdtc reset");
  }

  create() {
    // console.log("fdtc create");
  }

  setState() {
    //setState(id, state) {
    // console.log("fdtc setState: " + id + " " + state);
  }

  runClearPass() {
    console.log("fdtc runClearPass");
  }
}
