import type { LatLng } from "leaflet";
import type { IITC, PortalGUID } from "../../types/iitc";
import {
  WasabeeBlocker,
  WasabeeMarker,
  WasabeeOp,
  WasabeePortal,
} from "../model";
import { getSelectedOperation } from "../selectedOp";

import wX from "../wX";

export function fromIITC(p: IITC.Portal) {
  // we have all the details
  if (p && p.options && p.options.data && p.options.guid) {
    const data = p.options.data;
    const id = p.options.guid;
    if (data.title) {
      return new WasabeePortal({
        id: id,
        name: data.title,
        lat: (data.latE6 / 1e6).toFixed(6),
        lng: (data.lngE6 / 1e6).toFixed(6),
      });
    }
    // do we have enough to fake it?
    if (data.latE6) {
      return WasabeePortal.fake(
        (data.latE6 / 1e6).toFixed(6),
        (data.lngE6 / 1e6).toFixed(6),
        id
      );
    }
  }
  // nothing to get
  return null;
}

export function team(portal: WasabeePortal) {
  if (window.portals[portal.id] && window.portals[portal.id].options.data)
    return window.portals[portal.id].options.data.team;
  return "";
}

export function displayName(portal: WasabeePortal) {
  if (portal.pureFaked) return wX("FAKED", { portalId: portal.id });
  if (portal.loading) return wX("LOADING1", { portalGuid: portal.id });
  return portal.name;
}

export function displayFormat(portal: WasabeePortal, shortName = false) {
  const pt = portal.latLng;
  const v = `${portal.lat},${portal.lng}`;
  const name = displayName(portal);
  const e = L.DomUtil.create("a", "wasabee-portal");
  if (shortName === true && portal.name.length > 12) {
    e.textContent = name.slice(0, 8) + "...";
  } else {
    e.textContent = name;
  }

  const t = team(portal);
  if (t == "E") {
    e.classList.add("enl");
  }
  if (t == "R") {
    e.classList.add("res");
  }
  if (t == "M") {
    e.classList.add("mac");
  }
  if (t == "N") {
    e.classList.add("unclaimed");
  }

  // e.title = this.name;
  e.href = `/intel?ll=${v}&pll=${v}`;

  L.DomEvent.on(e, "click", (event) => {
    if (window.selectedPortal != portal.id && portal.id.length == 35)
      window.renderPortalDetails(portal.id);
    else window.map.panTo(pt);
    event.preventDefault();
    return false;
  }).on(e, "dblclick", (event) => {
    if (window.selectedPortal != portal.id && portal.id.length == 35)
      window.renderPortalDetails(portal.id);
    if (window.map.getBounds().contains(pt))
      window.zoomToAndShowPortal(portal.id, pt as LatLng);
    else window.map.panTo(pt);
    event.preventDefault();
    return false;
  });
  return e;
}

export function get(id: PortalGUID) {
  return fromIITC(window.portals[id]);
}

export function getSelected() {
  return window.selectedPortal ? get(window.selectedPortal) : null;
}

export function getAllPortalsOnScreen(operation: WasabeeOp) {
  const bounds = window.map.getBounds();
  const x = [];
  for (const portal in window.portals) {
    if (bounds.contains(window.portals[portal].getLatLng())) {
      if (
        operation.containsMarkerByID(
          window.portals[portal].options.guid,
          WasabeeMarker.constants.MARKER_TYPE_EXCLUDE
        )
      )
        continue;
      const wp = fromIITC(window.portals[portal]);
      if (wp) x.push(wp);
    }
  }
  return x;
}

export function listenForAddedPortals(newPortal: EventPortalAdded) {
  if (!newPortal.portal.options.data.title) return;

  const team = newPortal.portal.options.data.team as "N" | "R" | "E" | "M";
  const op = getSelectedOperation();
  const portal = fromIITC(newPortal.portal);
  op.updatePortal(portal);
  WasabeeBlocker.updatePortal(op, portal, team).then((r) => {
    if (r) window.map.fire("wasabee:crosslinks:update");
  });
}

export function listenForPortalDetails(e: EventPortalDetailLoaded) {
  if (!e.success) return;
  const team = e.details.team as "N" | "R" | "E" | "M";
  const portal = new WasabeePortal({
    id: e.guid,
    name: e.details.title,
    lat: (e.details.latE6 / 1e6).toFixed(6),
    lng: (e.details.lngE6 / 1e6).toFixed(6),
  });
  const op = getSelectedOperation();
  op.updatePortal(portal);
  WasabeeBlocker.updatePortal(op, portal, team).then((r) => {
    if (r) window.map.fire("wasabee:crosslinks:update");
  });
}

// This is what should be called to add to the queue
// can take either an entire array of portal GUID or a single GUID
// this depends on something listening for the IITC PortalDetailsLoaded hook to process the result
// see listenForPortalDetails above
function getPortalDetails(guid) {
  if (Array.isArray(guid)) {
    window.plugin.wasabee.portalDetailQueue =
      window.plugin.wasabee.portalDetailQueue.concat(guid);
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
}

function pdqDoNext() {
  const p = window.plugin.wasabee.portalDetailQueue.shift();

  // are we done?
  if (p === undefined) {
    console.debug(
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
}

// load faked op portals
export function loadFaked(operation: WasabeeOp, force = false) {
  const flag =
    localStorage[window.plugin.wasabee.static.constants.AUTO_LOAD_FAKED] ||
    false;

  // local storage always returns as string
  if (flag !== "true" && !force) return;

  const f = [];
  for (const x of operation.fakedPortals) f.push(x.id);
  if (f.length > 0) getPortalDetails(f);
}

// load faked blocker portals
export async function loadBlockerFaked(operation: WasabeeOp, force = false) {
  const flag =
    localStorage[window.plugin.wasabee.static.constants.AUTO_LOAD_FAKED] ||
    false;

  // local storage always returns as string
  if (flag !== "true" && !force) return;

  const bp = await WasabeeBlocker.getPortals(operation);
  const f = bp.filter((p) => p.id === p.name).map((p) => p.id);
  if (f.length > 0) getPortalDetails(f);
}
