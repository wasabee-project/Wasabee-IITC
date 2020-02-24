/*
  Calculate, given two anchors and a set of portals, the best posible sequence of nested fields.
  Detailed on:
*/
import { greatCircleArcIntersect } from "./crosslinks";

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
      i,
      visible.filter(j => {
        return j == i || fieldCoversPortal(anchor1, anchor2, i, j);
      })
    );
  }
  return poset;
}

/* 
function _longestSequence(poset) {
  let depth = 0;
  const alreadyCalculatedSequences = new Map();
  const sequence_from = c => {
    if (!alreadyCalculatedSequences.has(c)) {
      const sequence = poset.get(c).filter(i => i != c);
      depth++;
      console.log(
        `${depth}: ${sequence.length} portals would be under a field crowned by ${c.options.data.title}`
      );

      // for (const p of sequence) { console.log(`${depth}: ${p.options.data.title}`); }
      if (sequence.length == 0) {
        const p = [c];
        alreadyCalculatedSequences.set(c, p);
        console.log(
          `${depth}: returning from ${c.options.data.title} at bottom`
        );
        depth--;
        console.log(p);
        return p;
      }

      // recurse down into each...
      const seq2 = sequence.map(sequence_from);

      console.log(`${depth}: reducing`);
      console.log(seq2);
      const seq3 = seq2.reduce((S1, S2) => {
        if (S1.length > S2.length) return S1;
        return S2;
      });
      console.log(`${depth}: reduced`);
      console.log(seq3);
      depth--;
      alreadyCalculatedSequences.set(c, seq3);
      console.log(`${depth}: returning from ${c.options.data.title} (seq3)`);
      console.log(seq3);
      return seq3;
    } else {
      const seq = alreadyCalculatedSequences.get(c);
      console.log(
        `${depth}: already have ${c.options.data.title}: ${seq.length}`
      );
      return seq;
    }
  };

  const x = Array.from(poset.keys());
  console.log(x);

  return Array.from(poset.keys())
    .map(sequence_from)
    .reduce((S1, S2) => (S1.length > S2.length ? S1 : S2));
} */

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

export default function multimax(anchor1, anchor2, visible) {
  console.log("starting multimax");
  const poset = buildPOSet(anchor1, anchor2, visible);
  console.log("finding longest path");
  const p = longestSequence(poset);
  console.log("multimax done");
  return p;
}
