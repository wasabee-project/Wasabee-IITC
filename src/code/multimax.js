/*
  Calculate, given two anchors and a set of portals, the best posible sequence of nested fields.
  Detailed on:
*/
import { greatCircleArcIntersect } from "./crosslinks";

const fieldCoversPortal = ([a, b, field3], portal) => {
  // Let's hope no one ever wants to field over this point!
  const unreachableMapPoint = {
    lat: -74.2,
    lng: -143.4
  };
  const p = portal.getLatLng();
  const f3 = field3.getLatLng();

  // greatCircleArcIntersect now takes either WasabeeLink or window.link format
  // needs link.getLatLngs(); and to be an object we can cache in

  const urp = new L.GeodesicPolyline([unreachableMapPoint, p]);
  const lab = new L.GeodesicPolyline([a.latLng, b.latLng]);
  const laf = new L.GeodesicPolyline([a.latLng, f3]);
  const lfb = new L.GeodesicPolyline([f3, b.latLng]);
  let c = 0;
  if (greatCircleArcIntersect(urp, lab)) c++;
  if (greatCircleArcIntersect(urp, laf)) c++;
  if (greatCircleArcIntersect(urp, lfb)) c++;

  // console.log(a, b, field3, c);
  return c == 1;
};

function buildPOSet(a, b, C) {
  const lesser = (p1, p2) => fieldCoversPortal([a, b, p2], p1);
  const poset = new Map();
  C.forEach(i => {
    poset.set(i, C.filter(j => j === i || lesser(j, i)));
  });
  return poset;
}

function longestSequence(poset) {
  const alreadyCalculatedSequences = new Map();
  const sequence_from = c => {
    if (alreadyCalculatedSequences.get(c) === undefined) {
      let sequence = poset
        .get(c)
        .filter(i => i !== c)
        .map(sequence_from)
        .reduce((S1, S2) => (S1.length > S2.length ? S1 : S2), []);
      sequence.push(c);
      alreadyCalculatedSequences.set(c, sequence);
    }
    return alreadyCalculatedSequences.get(c);
  };
  return Array.from(poset.keys())
    .map(sequence_from)
    .reduce((S1, S2) => (S1.length > S2.length ? S1 : S2));
}

export default function multimax(a, b, C) {
  console.log("starting multimax");
  const poset = buildPOSet(a, b, C);
  console.log("multimax done");
  return longestSequence(poset);
}
