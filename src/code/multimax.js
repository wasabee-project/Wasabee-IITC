/*
  Calculate, given two anchors and a set of portals, the best posible sequence of nested fields.
  Detailed on:
*/
import { greatCircleArcIntersect } from "./crosslinks";
import wX from "./wX";

const fieldCoversPortal = (a, b, field3, portal) => {
  // Let's hope no one ever wants to field over this point!
  const unreachableMapPoint = {
    lat: -74.2,
    lng: -143.4
  };
  const p = portal.getLatLng();
  const c = field3.getLatLng();

  // greatCircleArcIntersect now takes either WasabeeLink or window.link format
  // needs link.getLatLngs(); and to be an object we can cache in

  const urp = new L.GeodesicPolyline([unreachableMapPoint, p]);
  const lab = new L.GeodesicPolyline([a.latLng, b.latLng]);
  const lac = new L.GeodesicPolyline([a.latLng, c]);
  const lbc = new L.GeodesicPolyline([c, b.latLng]);

  let crossings = 0;
  if (greatCircleArcIntersect(urp, lab)) crossings++;
  if (greatCircleArcIntersect(urp, lac)) crossings++;
  if (greatCircleArcIntersect(urp, lbc)) crossings++;
  return crossings == 1; // crossing 0 or 2 is OK, crossing 3 is impossible
};

// build a map that shows which and how many portals are covered by each possible field
function buildPOSet(anchor1, anchor2, visible) {
  const poset = new Map();
  for (const i of visible) {
    poset.set(
      i.options.guid,
      visible.filter(j => {
        // there is a way to reduce the brute factor here
        return j == i || fieldCoversPortal(anchor1, anchor2, i, j);
      })
    );
  }
  return poset;
}

function longestSequence(poset) {
  const out = new Array();

  // the recursive function
  const recurse = () => {
    if (poset.size == 0) return; // hit bottom

    let longest = "";
    let length = 0;

    // determine the longest
    for (const [k, v] of poset) {
      if (v.length > length) {
        length = v.length;
        longest = k;
      }
    }
    out.push(longest);
    const thisList = poset.get(longest);
    poset.delete(longest);

    // remove any portals not under this layer
    // eslint-disable-next-line
    for (const [k, v] of poset) {
      let under = false;
      for (const l of thisList) {
        if (l.options.guid == k) under = true;
      }
      if (!under) {
        poset.delete(k);
      }
    }
    if (poset.size == 0) return; // hit bottom
    recurse(); // keep digging
  };

  recurse();
  return out;
}

export default function multimax(anchor1, anchor2, visible) {
  return new Promise(function(resolve, reject) {
    if (!anchor1 || !anchor2 || !visible) reject(wX("INVALID REQUEST"));

    console.log("starting multimax");
    console.time("buildPOSet");
    const poset = buildPOSet(anchor1, anchor2, visible);
    console.timeEnd("buildPOSet");
    const p = longestSequence(poset);
    console.log("multimax done");
    resolve(p);
  });
}
