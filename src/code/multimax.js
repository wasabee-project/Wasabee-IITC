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
  let c = 0;
  if (greatCircleArcIntersect(unreachableMapPoint, p, a, b)) c++;
  if (greatCircleArcIntersect(unreachableMapPoint, p, a, f3)) c++;
  if (greatCircleArcIntersect(unreachableMapPoint, p, f3, b)) c++;
  if (c == 1) return true;
  else return false;
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
  let poset = buildPOSet(a, b, C);
  console.log("multimax done");
  return longestSequence(poset);
}
