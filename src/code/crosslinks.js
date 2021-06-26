import WasabeePortal from "./model/portal";
import WasabeeLink from "./model/link";
import { getSelectedOperation } from "./selectedOp";

import PortalUI from "./ui/portal";

const Wasabee = window.plugin.wasabee;

// from iitc rework : https://github.com/IITC-CE/ingress-intel-total-conversion/pull/333
const d2r = Math.PI / 180;

function toCartesian(lat, lng) {
  lat *= d2r;
  lng *= d2r;
  var o = Math.cos(lat);
  return [o * Math.cos(lng), o * Math.sin(lng), Math.sin(lat)];
}

function cross(t, n) {
  return [
    t[1] * n[2] - t[2] * n[1],
    t[2] * n[0] - t[0] * n[2],
    t[0] * n[1] - t[1] * n[0],
  ];
}

function dot(t, n) {
  return t[0] * n[0] + t[1] * n[1] + t[2] * n[2];
}

function equals(a, b) {
  return a.lat === b.lat && a.lng === b.lng;
}

// take L.LatLng
// note: cache cos/sin calls in the object, in order to be efficient, try using same LatLng objects across calls, like using latLng from WasabeePortal attached to an op
export function greatCircleArcIntersectByLatLngs(a0, a1, b0, b1) {
  // 0) quick checks
  // zero length line
  if (equals(a0, a1)) return false;
  if (equals(b0, b1)) return false;

  // lines have a common point
  if (equals(a0, b0) || equals(a0, b1)) return false;
  if (equals(a1, b0) || equals(a1, b1)) return false;

  // check for 'horizontal' overlap in longitude
  if (Math.min(a0.lng, a1.lng) > Math.max(b0.lng, b1.lng)) return false;
  if (Math.max(a0.lng, a1.lng) < Math.min(b0.lng, b1.lng)) return false;

  // a) convert into 3D coordinates on a unit sphere & cache into latLng object
  const ca0 = (a0._cartesian = a0._cartesian
    ? a0._cartesian
    : toCartesian(a0.lat, a0.lng));
  const ca1 = (a1._cartesian = a1._cartesian
    ? a1._cartesian
    : toCartesian(a1.lat, a1.lng));
  const cb0 = (b0._cartesian = b0._cartesian
    ? b0._cartesian
    : toCartesian(b0.lat, b0.lng));
  const cb1 = (b1._cartesian = b1._cartesian
    ? b1._cartesian
    : toCartesian(b1.lat, b1.lng));

  // b) two planes: ca0,ca1,0/0/0 and cb0,cb1,0/0/0
  // find the intersetion line

  // b1) build plane normals for
  const da = cross(ca0, ca1);
  const db = cross(cb0, cb1);

  // prepare for d) build 90° rotated vectors
  const da0 = cross(da, ca0);
  const da1 = cross(da, ca1);
  const db0 = cross(db, cb0);
  const db1 = cross(db, cb1);

  // b2) intersetion line
  const p = cross(da, db);

  // c) special case when both planes are equal
  // = both lines are on the same greatarc. test if they overlap
  const len2 = p[0] * p[0] + p[1] * p[1] + p[2] * p[2];
  if (len2 < 1e-30) {
    /* === 0 */ // b0 inside a0-a1 ?
    const s1 = dot(cb0, da0);
    const d1 = dot(cb0, da1);
    if ((s1 < 0 && d1 > 0) || (s1 > 0 && d1 < 0)) return true;
    // b1 inside a0-a1 ?
    const s2 = dot(cb1, da0);
    const d2 = dot(cb1, da1);
    if ((s2 < 0 && d2 > 0) || (s2 > 0 && d2 < 0)) return true;
    // a inside b0-b1 ?
    const s3 = dot(ca0, db0);
    const d3 = dot(ca0, db1);
    if ((s3 < 0 && d3 > 0) || (s3 > 0 && d3 < 0)) return true;
    return false;
  }

  // d) at this point we have two possible collision points
  //    p or -p  (in 3D space)

  // e) angel to point
  //    since da,db is rotated: dot<0 => left, dot>0 => right of P
  const s = dot(p, da0);
  const d = dot(p, da1);
  const l = dot(p, db0);
  const f = dot(p, db1);

  // is on side a (P)
  if (s > 0 && 0 > d && l > 0 && 0 > f) {
    return true;
  }

  // is on side b (-P)
  if (0 > s && d > 0 && 0 > l && f > 0) {
    return true;
  }

  return false;
}

// takes WasabeeLink or L.geodesicPolyline format
export function greatCircleArcIntersect(existing, drawn) {
  const eLL = existing.getLatLngs();
  const dLL = drawn.getLatLngs();

  const a0 = eLL[0];
  const a1 = eLL[1];
  const b0 = dLL[0];
  const b1 = dLL[1];

  return greatCircleArcIntersectByLatLngs(a0, a1, b0, b1);
}

function testPolyLine(wasabeeLink, realLink, operation) {
  if (greatCircleArcIntersect(realLink, wasabeeLink)) {
    if (!operation.markers || operation.markers.length == 0) {
      return true;
    }

    for (const marker of operation.markers) {
      if (
        marker.type == Wasabee.static.constants.MARKER_TYPE_DESTROY ||
        marker.type == Wasabee.static.constants.MARKER_TYPE_VIRUS ||
        marker.type == Wasabee.static.constants.MARKER_TYPE_DECAY
      ) {
        if (
          marker.portalId == realLink.options.data.dGuid ||
          marker.portalId == realLink.options.data.oGuid
        ) {
          return false;
        }
      }
    }
    return true;
  }
  return false;
}

function showCrossLink(link, operation) {
  // this should be in static.js or skin
  const blocked = L.geodesicPolyline(link.getLatLngs(operation), {
    color: "#d22",
    opacity: 0.7,
    weight: 5,
    interactive: false,
    dashArray: [8, 8],
    guid: link.options.guid,
  });

  blocked.addTo(window.plugin.wasabee.crossLinkLayers);
  window.plugin.wasabee._crosslinkCache.set(link.options.guid, blocked);
}

function testLink(link, operation) {
  // if the crosslink already exists, do not recheck
  if (window.plugin.wasabee._crosslinkCache.has(link.options.guid)) {
    return;
  }

  for (const drawnLink of operation.links) {
    if (testPolyLine(drawnLink, link, operation)) {
      showCrossLink(link, operation);
      let fromPortal = PortalUI.get(link.options.data.oGuid);
      if (!fromPortal)
        fromPortal = WasabeePortal.fake(
          (link.options.data.oLatE6 / 1e6).toFixed(6),
          (link.options.data.oLngE6 / 1e6).toFixed(6),
          link.options.data.oGuid
        );
      operation._addPortal(fromPortal);
      let toPortal = PortalUI.get(link.options.data.dGuid);
      if (!toPortal)
        toPortal = WasabeePortal.fake(
          (link.options.data.dLatE6 / 1e6).toFixed(6),
          (link.options.data.dLngE6 / 1e6).toFixed(6),
          link.options.data.dGuid
        );
      operation._addPortal(toPortal);
      const blocker = new WasabeeLink(
        { fromPortalId: fromPortal.id, toPortalId: toPortal.id },
        operation
      );
      operation.addBlocker(blocker); // op.update() is called here
      break;
    }
  }
}

function testSelfBlock(incoming, operation) {
  for (const against of operation.links) {
    if (incoming.ID == against.ID) continue;
    if (greatCircleArcIntersect(against, incoming)) {
      const blocked = L.geodesicPolyline(
        against.getLatLngs(operation),
        window.plugin.wasabee.skin.selfBlockStyle
      );
      blocked.options.interactive = false;
      blocked.addTo(window.plugin.wasabee.crossLinkLayers);
    }
  }
}

// lets see if using a generator makes the GUI more responsive on large ops
// -- yeild doesn't seem to release the main thread, maybe we need to yeild a
// Promise.resolve(window.links[g]) and await it in the for loop?
function* realLinks() {
  const guids = Object.getOwnPropertyNames(window.links);
  // it is possible that the link was purged while we were yielded
  // checking here should reduce the workload while scrolling/zooming
  for (const g of guids) {
    if (window.links[g] != null) yield window.links[g];
  }
}

export function checkAllLinks() {
  if (window.isLayerGroupDisplayed("Wasabee Cross Links") === false) return;

  const operation = getSelectedOperation();

  window.plugin.wasabee.crossLinkLayers.clearLayers();
  window.plugin.wasabee._crosslinkCache.clear();

  if (!operation.links || operation.links.length == 0) return;

  const linkGenerator = realLinks();
  for (const link of linkGenerator) {
    testLink(link, operation);
  }

  for (const l of operation.links) {
    testSelfBlock(l, operation);
  }
  window.map.fire("wasabee:crosslinks:done");
}

function onLinkAdded(data) {
  testLink(data.link, getSelectedOperation());
}

function onMapDataRefreshStart() {
  window.removeHook("linkAdded", onLinkAdded);
}

function onMapDataRefreshEnd() {
  if (window.isLayerGroupDisplayed("Wasabee Cross Links") === false) return;
  window.plugin.wasabee.crossLinkLayers.bringToFront();

  checkAllLinks();
  window.addHook("linkAdded", onLinkAdded);
}

export function initCrossLinks() {
  window.map.on("wasabee:crosslinks", checkAllLinks);
  window.plugin.wasabee.crossLinkLayers = new L.FeatureGroup();
  window.plugin.wasabee._crosslinkCache = new Map();
  window.addLayerGroup(
    "Wasabee Cross Links",
    window.plugin.wasabee.crossLinkLayers,
    true
  );

  // rerun crosslinks on re-enable
  window.map.on("layeradd", (obj) => {
    if (obj.layer === window.plugin.wasabee.crossLinkLayers) {
      window.plugin.wasabee._crosslinkCache = new Map();
      checkAllLinks();
    }
  });

  // clear crosslinks on disable
  window.map.on("layerremove", (obj) => {
    if (obj.layer === window.plugin.wasabee.crossLinkLayers) {
      window.plugin.wasabee.crossLinkLayers.clearLayers();
      delete window.plugin.wasabee._crosslinkCache;
    }
  });

  window.addHook("mapDataRefreshStart", onMapDataRefreshStart);
  window.addHook("mapDataRefreshEnd", onMapDataRefreshEnd);
}

export class GeodesicLine {
  constructor(start, end) {
    let d2r = Math.PI / 180.0;
    // let r2d = 180.0 / Math.PI; //eslint-disable-line
    // maths based on http://williams.best.vwh.net/avform.htm#Int
    if (start.lng == end.lng) {
      throw new Error("Error: cannot calculate latitude for meridians");
    }
    // only the variables needed to calculate a latitude for a given longitude are stored in 'this'
    this.lat1 = start.lat * d2r;
    this.lat2 = end.lat * d2r;
    this.lng1 = start.lng * d2r;
    this.lng2 = end.lng * d2r;
    let dLng = this.lng1 - this.lng2;
    let sinLat1 = Math.sin(this.lat1);
    let sinLat2 = Math.sin(this.lat2);
    let cosLat1 = Math.cos(this.lat1);
    let cosLat2 = Math.cos(this.lat2);
    this.sinLat1CosLat2 = sinLat1 * cosLat2;
    this.sinLat2CosLat1 = sinLat2 * cosLat1;
    this.cosLat1CosLat2SinDLng = cosLat1 * cosLat2 * Math.sin(dLng);
  }

  isMeridian() {
    return this.lng1 == this.lng2;
  }

  latAtLng(lng) {
    lng = (lng * Math.PI) / 180; //to radians
    let lat;
    // if we're testing the start/end point, return that directly rather than calculating
    // 1. this may be fractionally faster, no complex maths
    // 2. there's odd rounding issues that occur on some browsers (noticed on IITC MObile) for very short links - this may help
    if (lng == this.lng1) {
      lat = this.lat1;
    } else if (lng == this.lng2) {
      lat = this.lat2;
    } else {
      lat = Math.atan(
        (this.sinLat1CosLat2 * Math.sin(lng - this.lng2) -
          this.sinLat2CosLat1 * Math.sin(lng - this.lng1)) /
          this.cosLat1CosLat2SinDLng
      );
    }
    return (lat * 180) / Math.PI; // return value in degrees
  }

  // bearing in radians
  bearing() {
    const dLng = this.lng1 - this.lng2;
    const cosLat2 = Math.cos(this.lat2);
    const y = Math.sin(dLng) * cosLat2;
    const x = this.sinLat2CosLat1 - this.sinLat1CosLat2 * Math.cos(dLng);
    return Math.atan2(y, x);
  }
}
