/*
  Calculate, given two anchors and a set of portals, the best posible sequence of nested fields.
  Detailed on:
*/
import { greatCircleArcIntersect } from "./crosslinks";

const fieldCoversPortal = ([field1, field2, field3], portal) => {
  // Let's hope no one ever wants to field over this point!
  const unreachableMapPoint = {
    lat: -74.2,
    lng: -143.4
  };
  var p = portal.getLatLng();
  var f1 = field1.getLatLng();
  var f2 = field2.getLatLng();
  var f3 = field3.getLatLng();
  var c = 0;
  if (greatCircleArcIntersect(unreachableMapPoint, p, f1, f2)) c++;
  if (greatCircleArcIntersect(unreachableMapPoint, p, f1, f3)) c++;
  if (greatCircleArcIntersect(unreachableMapPoint, p, f3, f2)) c++;
  if (c == 1) return true;
  else return false;
};

function buildPOSet(a, b, C) {
  const lesser = (p1, p2) => fieldCoversPortal([a, b, p2], p1);
  var poset = new Map();
  C.forEach(i => {
    poset.set(i, C.filter(j => j === i || lesser(j, i)));
  });
  return poset;
}

function longestSequence(poset) {
  var allreadyCalculatedSequences = new Map();
  const sequence_from = c => {
    if (allreadyCalculatedSequences.get(c) === undefined) {
      let sequence = poset
        .get(c)
        .filter(i => i !== c)
        .map(sequence_from)
        .reduce((S1, S2) => (S1.length > S2.length ? S1 : S2), []);
      sequence.push(c);
      allreadyCalculatedSequences.set(c, sequence);
    }
    return allreadyCalculatedSequences.get(c);
  };
  return Array.from(poset.keys())
    .map(sequence_from)
    .reduce((S1, S2) => (S1.length > S2.length ? S1 : S2));
}

export default function multimax(a, b, C) {
  let poset = buildPOSet(a, b, C);
  return longestSequence(poset);
}
