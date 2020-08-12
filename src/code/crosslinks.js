import WasabeePortal from "./portal";
import WasabeeLink from "./link";
import { getSelectedOperation } from "./selectedOp";

const Wasabee = window.plugin.wasabee;

// takes WasabeeLink or L.geodesicPolyline format
export const greatCircleArcIntersect = (existing, drawn) => {
  // based on the formula at http://williams.best.vwh.net/avform.htm#Int

  // method:
  // check to ensure no line segment is zero length - if so, cannot cross
  // check to see if either of the lines start/end at the same point. if so, then they cannot cross
  // check to see if the line segments overlap in longitude. if not, no crossing
  // if overlap, clip each line to the overlapping longitudes, then see if latitudes cross

  // anti-meridian handling. this code will not sensibly handle a case where one point is
  // close to -180 degrees and the other +180 degrees. unwrap coordinates in this case, so one point
  // is beyond +-180 degrees. this is already true in IITC
  // FIXME? if the two lines have been 'unwrapped' differently - one positive, one negative - it will fail

  //Dimand: Lets fix the date line issue.
  //always work in the eastern hemisphere. so += 360

  const eLL = existing.getLatLngs();
  const dLL = drawn.getLatLngs();
  const a0 = eLL[0];
  const a1 = eLL[1];
  const b0 = dLL[0];
  const b1 = dLL[1];

  // zero length line tests
  if (a0.lat == a1.lat && a0.lng == a1.lng) {
    return false;
  }
  if (b0.lat == b1.lat && b0.lng == b1.lng) {
    return false;
  }

  // lines have a common point
  if (a0.lat == b0.lat && a0.lng == b0.lng) {
    return false;
  }
  if (a0.lat == b1.lat && a0.lng == b1.lng) {
    return false;
  }
  if (a1.lat == b0.lat && a1.lng == b0.lng) {
    return false;
  }
  if (a1.lat == b1.lat && a1.lng == b1.lng) {
    return false;
  }

  // a0.lng<=-90 && a1.lng>=90 dosent suffice... a link from -70 to 179 still crosses
  //if a0.lng-a1.lng >180 or <-180 there is a cross!
  let aCross = false;
  let bCross = false;
  //this is the real link
  if (a0.lng - a1.lng < -180 || a0.lng - a1.lng > 180) {
    //we have a dateline cross
    //console.log('DateLine Cross!');
    //move everything in the eastern hemisphere to the extended eastern one
    aCross = true;
    if (a0.lng < 0) {
      a0.lng += 360;
    }
    if (a1.lng < 0) {
      a1.lng += 360;
    }
  }
  //this is the arc
  if (b0.lng - b1.lng < -180 || b0.lng - b1.lng > 180) {
    //console.log('DateLine Cross!');
    bCross = true;
    if (b0.lng < 0) {
      b0.lng += 360;
    }
    if (b1.lng < 0) {
      b1.lng += 360;
    }
  }
  //now corrected both a and b for date line crosses.
  //now if link is entirely in the west we need to move it to the east.
  if (bCross && aCross) {
    //both got moved. all should be good.
    //do nothing
  } else if (aCross) {
    //now we need to move any links in the west of the main one
    if (Math.max(b0.lng, b1.lng) < Math.min(a0.lng, a1.lng)) {
      //console.log('arc shift');
      b0.lng += 360;
      b1.lng += 360;
    }
  } else if (bCross) {
    //now we need to move any links in the west of the main one
    if (Math.max(a0.lng, a1.lng) < Math.min(b0.lng, b1.lng)) {
      //console.log('link shift');
      a0.lng += 360;
      a1.lng += 360;
      //console.log(a0);
      //console.log(a1);
      //console.log(b0);
      //console.log(b1);
    }
  }

  // check for 'horizontal' overlap in longitude
  if (Math.min(a0.lng, a1.lng) > Math.max(b0.lng, b1.lng)) {
    return false;
  }
  if (Math.max(a0.lng, a1.lng) < Math.min(b0.lng, b1.lng)) {
    return false;
  }

  // ok, our two lines have some horizontal overlap in longitude
  // 1. calculate the overlapping min/max longitude
  // 2. calculate each line latitude at each point
  // 3. if latitudes change place between overlapping range, the lines cross
  // class to hold the pre-calculated maths for a geodesic line

  // calculate the longitude of the overlapping region
  const leftLng = Math.max(Math.min(a0.lng, a1.lng), Math.min(b0.lng, b1.lng));
  const rightLng = Math.min(Math.max(a0.lng, a1.lng), Math.max(b0.lng, b1.lng));
  //console.log(leftLng);
  //console.log(rightLng);

  // calculate the latitudes for each line at left + right longitudes
  // NOTE: need a special case for meridians - as GeodesicLine.latAtLng method is invalid in that case
  let aLeftLat, aRightLat;
  if (a0.lng == a1.lng) {
    // 'left' and 'right' now become 'top' and 'bottom' (in some order) - which is fine for the below intersection code
    aLeftLat = a0.lat;
    aRightLat = a1.lat;
  } else {
    let aGeo = existing._crosslinksGL;
    if (!aGeo) {
      aGeo = new GeodesicLine(a0, a1);
      existing._crosslinksGL = aGeo;
    }
    aLeftLat = aGeo.latAtLng(leftLng);
    aRightLat = aGeo.latAtLng(rightLng);
  }

  let bLeftLat, bRightLat;
  if (b0.lng == b1.lng) {
    // 'left' and 'right' now become 'top' and 'bottom' (in some order) - which is fine for the below intersection code
    bLeftLat = b0.lat;
    bRightLat = b1.lat;
  } else {
    let bGeo = drawn._crosslinksGL;
    if (!bGeo) {
      bGeo = new GeodesicLine(b0, b1);
      drawn._crosslinksGL = bGeo;
    }
    bLeftLat = bGeo.latAtLng(leftLng);
    bRightLat = bGeo.latAtLng(rightLng);
  }
  //console.log(aLeftLat);
  //console.log(aRightLat);
  //console.log(bLeftLat);
  //console.log(bRightLat);
  // if both a are less or greater than both b, then lines do not cross

  if (aLeftLat < bLeftLat && aRightLat < bRightLat) {
    return false;
  }
  if (aLeftLat > bLeftLat && aRightLat > bRightLat) {
    return false;
  }

  // latitudes cross between left and right - so geodesic lines cross
  //console.log('Xlink!');
  return true;
};

const testPolyLine = (wasabeeLink, realLink, operation) => {
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
};

const showCrossLink = (link, operation) => {
  // this should be in static.js or skin
  const blocked = L.geodesicPolyline(link.getLatLngs(operation), {
    color: "#d22",
    opacity: 0.7,
    weight: 5,
    clickable: false,
    dashArray: [8, 8],
    guid: link.options.guid,
  });

  blocked.addTo(window.plugin.wasabee.crossLinkLayers);
  window.plugin.wasabee._crosslinkCache.set(link.options.guid, blocked);
};

const testLink = (link, operation) => {
  // if the crosslink already exists, do not recheck
  if (window.plugin.wasabee._crosslinkCache.has(link.options.guid)) {
    return;
  }

  for (const drawnLink of operation.links) {
    if (testPolyLine(drawnLink, link, operation)) {
      showCrossLink(link, operation);
      let fromPortal = WasabeePortal.get(link.options.data.oGuid);
      if (!fromPortal)
        fromPortal = WasabeePortal.fake(
          (link.options.data.oLatE6 / 1e6).toFixed(6),
          (link.options.data.oLngE6 / 1e6).toFixed(6),
          link.options.data.oGuid
        );
      operation._addPortal(fromPortal);
      let toPortal = WasabeePortal.get(link.options.data.dGuid);
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
};

const testSelfBlock = (incoming, operation) => {
  for (const against of operation.links) {
    if (incoming.ID == against.ID) continue;
    if (greatCircleArcIntersect(against, incoming)) {
      const blocked = L.geodesicPolyline(
        against.getLatLngs(operation),
        window.plugin.wasabee.skin.selfBlockStyle
      );
      blocked.addTo(window.plugin.wasabee.crossLinkLayers);
    }
  }
};

export const checkAllLinks = (operation) => {
  // console.time("checkAllLinks");
  window.plugin.wasabee.crossLinkLayers.clearLayers();
  window.plugin.wasabee._crosslinkCache.clear();

  if (!operation.links || operation.links.length == 0) return;
  for (const guid in window.links) {
    testLink(window.links[guid], operation);
  }

  for (const l of operation.links) {
    testSelfBlock(l, operation);
  }
  // console.timeEnd("checkAllLinks");
};

const onLinkAdded = (data) => {
  testLink(data.link, getSelectedOperation());
};

const onMapDataRefreshStart = () => {
  window.removeHook("linkAdded", onLinkAdded);
};

const onMapDataRefreshEnd = () => {
  if (window.isLayerGroupDisplayed("Wasabee Cross Links") === false) return;
  window.plugin.wasabee.crossLinkLayers.bringToFront();
  const operation = getSelectedOperation();

  checkAllLinks(operation);
  // testForDeletedLinks();
  window.addHook("linkAdded", onLinkAdded);
};

export const initCrossLinks = () => {
  window.addHook("wasabeeCrosslinks", (operation) => {
    checkAllLinks(operation);
  });

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
      const operation = getSelectedOperation();
      if (operation) {
        checkAllLinks(operation);
      }
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
};

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
