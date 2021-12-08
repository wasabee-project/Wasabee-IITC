import { fieldSign } from "../../crosslinks";
import type WasabeePortal from "../../model/portal";

type Poset<T> = Map<T, T[]>;

// given two anchor, build a map that shows which and how many portals are covered by each possible field by guid
// note: a portal always covers itself
export function buildPoset(
  anchor1: WasabeePortal,
  anchor2: WasabeePortal,
  portals: WasabeePortal[]
) {
  const posetPositive: Poset<PortalID> = new Map();
  const posetNegative: Poset<PortalID> = new Map();

  for (const i of portals) {
    if (i.id === anchor1.id || i.id === anchor2.id) continue;
    const result = [];
    const sign = fieldSign(anchor1, anchor2, i);
    for (const j of portals) {
      if (j.id === anchor1.id || j.id === anchor2.id) continue;
      if (i === j) result.push(j.id);
      else if (
        fieldSign(anchor1, anchor2, j) * sign > 0 &&
        fieldSign(anchor2, i, j) * sign > 0 &&
        fieldSign(i, anchor1, j) * sign > 0
      )
        result.push(j.id);
    }
    if (sign > 0) posetPositive.set(i.id, result);
    else posetNegative.set(i.id, result);
  }

  return [posetPositive, posetNegative];
}

// given a poset, compute the maximal paths from all elements
// the result contains a map that gives for any element the next ones and the list of the elements
// that have the longest paths
interface LongestSequences<T> {
  children: T[];
  length: number;
  number: number;
}
function longestSequencesPoset<T>(poset: Poset<T>) {
  const alreadyCalculatedChildren = new Map<
    T | "__start__",
    LongestSequences<T>
  >();
  const preds_from = (c: T | "__start__") => {
    if (alreadyCalculatedChildren.get(c) === undefined) {
      const res: LongestSequences<T> = {
        children: [],
        length: 1,
        number: 1,
      };
      const preds =
        c === "__start__"
          ? Array.from(poset.keys())
          : poset.get(c).filter((i) => i !== c);
      for (const id of preds) {
        const val = preds_from(id);
        if (val.length + 1 > res.length) {
          res.length = val.length + 1;
          res.children = [];
          res.number = 0;
        }
        if (val.length + 1 == res.length) {
          res.children.push(id);
          res.number += val.number;
        }
      }
      alreadyCalculatedChildren.set(c, res);
    }
    return alreadyCalculatedChildren.get(c);
  };

  return {
    maxima: preds_from("__start__").children,
    poset: alreadyCalculatedChildren,
    number: preds_from("__start__").number,
  };
}

// given a poset, find the longest sequence p1,p2,...pk such that poset(p2) contains p1, poset(p3) contains p2 etc
// that minimizes the flight distance
// notes:
// - the result is an empty sequence only if the poset is empty or if poset(p) is empty for any p
// - if the poset is given by buildPOSet, the first element is the guid of a portal that doesn't cover any other portal,
//   and the last element is the portal that covers all portals of the sequence and isn't covered by any other portal
//   (inner to outer)
interface LongestSequence<T> {
  seq: T[];
  dist: number;
}
export function longestSequence<T>(
  poset: Poset<T>,
  start?: T,
  dist?: (a: T, b: T) => number
) {
  const maximalPaths = longestSequencesPoset(poset);
  if (!maximalPaths.maxima.length) return [];
  const alreadyCalculatedSequences = new Map<T, LongestSequence<T>>();
  if (!dist) dist = () => 0;
  const sequence_from = (c: T) => {
    if (alreadyCalculatedSequences.get(c) === undefined) {
      const mP = maximalPaths.poset.get(c);
      if (mP.length == 1)
        alreadyCalculatedSequences.set(c, { seq: [c], dist: 0 });
      else {
        const best = mP.children
          .map(sequence_from)
          .reduce((S1, S2) =>
            S1.dist + dist(c, S1.seq[S1.seq.length - 1]) <
            S2.dist + dist(c, S2.seq[S2.seq.length - 1])
              ? S1
              : S2
          );
        const res = {
          seq: Array.from(best.seq),
          dist: best.dist,
        };
        res.dist += dist(res.seq[res.seq.length - 1], c);
        res.seq.push(c);
        alreadyCalculatedSequences.set(c, res);
      }
    }
    return alreadyCalculatedSequences.get(c);
  };

  if (start) {
    console.debug(
      maximalPaths.poset.get(start).number,
      "possible paths from the given start"
    );
    return sequence_from(start).seq;
  }

  console.debug(maximalPaths.number, "possible paths");
  return maximalPaths.maxima
    .map(sequence_from)
    .reduce((S1, S2) => (S1.dist < S2.dist ? S1 : S2)).seq;
}

export function getSignedSpine(
  pOne: WasabeePortal,
  pTwo: WasabeePortal,
  portals: WasabeePortal[],
  bothSide = false
) {
  const portalsMap = new Map(portals.map((p) => [p.id, p]));
  const [pPos, pNeg] = buildPoset(pOne, pTwo, portals);
  const sequencePos = longestSequence(pPos, null, (a, b) =>
    window.map.distance(portalsMap.get(a).latLng, portalsMap.get(b).latLng)
  );
  const sequenceNeg = longestSequence(pNeg, null, (a, b) =>
    window.map.distance(portalsMap.get(a).latLng, portalsMap.get(b).latLng)
  );

  if (bothSide)
    return [
      sequencePos.map((id) => portalsMap.get(id)),
      sequenceNeg.map((id) => portalsMap.get(id)),
    ];

  const sequence =
    sequencePos.length > sequenceNeg.length ? sequencePos : sequenceNeg;
  return [sequence.map((id) => portalsMap.get(id))];
}
