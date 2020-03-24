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
  const urp = L.polyline([unreachableMapPoint, p]);
  const lab = L.polyline([a.latLng, b.latLng]);
  const lac = L.polyline([a.latLng, c]);
  const lbc = L.polyline([c, b.latLng]);

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
        return j == i || fieldCoversPortal(anchor1, anchor2, i, j);
      })
    );
  }
  return poset;
}

/*
function buildPOSetFaster(a, b, visible) {
  const poset = new Map();
  for (const i of visible) {
    const iCovers = new Array();
    for (const j of visible) {
      // console.log(iCovers);
      if (iCovers.includes(j.options.guid)) {
        // we've already found this one
        // console.log("saved some searching");
        continue;
      }
      if (j.options.guid == i.options.guid) {
        // iCovers.push(j.options.guid);
        continue;
      }
      if (fieldCoversPortal(a, b, i, j)) {
        iCovers.push(j.options.guid);
        if (poset.has(j.options.guid)) {
          // if a-b-i covers j, a-b-i will also cover anything a-b-j covers
          // console.log("found savings");
          for (const n of poset.get(j.options.guid)) {
            if (!iCovers.includes(j.options.guid)) iCovers.push(n);
          }
        }
      }
    }
    poset.set(i.options.guid, iCovers);
  }
  return poset;
} */

function longestSequence(poset) {
  const out = new Array();

  // the recursive function
  const recurse = () => {
    if (poset.size == 0) return; // hit bottom

    let longest = "";
    let length = 0;

    // let prev = null;
    // determine the longest
    for (const [k, v] of poset) {
      if (v.length > length) {
        length = v.length;
        longest = k;
        // TODO build array of all with this same length
        // TODO determine which is closest to previous
      }
      // record previous
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
    const poset = buildPOSet(anchor1, anchor2, visible);
    const p = longestSequence(poset);
    console.log("multimax done");
    resolve(p);
  });
}
