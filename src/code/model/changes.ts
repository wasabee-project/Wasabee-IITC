import WasabeeLink from "./link";
import WasabeePortal from "./portal";
import type WasabeeOp from "./operation";
import WasabeeMarker from "./marker";
import WasabeeZone from "./zone";

type Change<T, K extends keyof T> = {
  id: string | number;
  props?: Partial<Pick<T, K>>;
  value?: T;
  type: "addition" | "edition" | "deletion";
};

type MarkerChange = Change<
  WasabeeMarker,
  "type" | "zone" | "order" | "completedID" | "assignedTo" | "state" | "comment"
>;
type LinkChange = Change<
  WasabeeLink,
  | "fromPortalId"
  | "toPortalId"
  | "color"
  | "zone"
  | "order"
  | "completedID"
  | "assignedTo"
  | "state"
  | "comment"
>;

type PortalChange = Change<WasabeePortal, "hardness" | "comment">;

type ZoneChange = Change<WasabeeZone, "name" | "color" | "points">;

type OperationChange = Change<
  WasabeeOp,
  "name" | "comment" | "referencetime" | "color"
> & {
  type: "edition";
  portals: PortalChange[];
  links: LinkChange[];
  markers: MarkerChange[];
  zones: ZoneChange[];
};

function computeDiff<T, K extends keyof T>(origin: T, current: T, keys: K[]) {
  const props: Partial<T> = {};
  let once = false;
  for (const key of keys) {
    if (JSON.stringify(origin[key]) !== JSON.stringify(current[key])) {
      props[key] = current[key];
      once = true;
    }
  }
  if (once) return props;
  return null;
}

function linkChanges(origin: WasabeeLink, current: WasabeeLink) {
  const changes: LinkChange = {
    id: origin.ID,
    type: "edition",
    props: computeDiff(origin, current, [
      "fromPortalId",
      "toPortalId",
      "color",
      "zone",
      "order",
      "completedID",
      "assignedTo",
      "comment",
      "state",
    ]),
  };
  return changes;
}

function markerChanges(origin: WasabeeMarker, current: WasabeeMarker) {
  const changes: MarkerChange = {
    id: origin.ID,
    type: "edition",
    props: computeDiff(origin, current, [
      "type",
      /*"portalId",*/ // unlikely because we don't swap marker yet
      "zone",
      "order",
      "completedID",
      "assignedTo",
      "comment",
      "state",
    ]),
  };
  return changes;
}

function portalChanges(origin: WasabeePortal, current: WasabeePortal) {
  const changes: PortalChange = {
    id: origin.id,
    type: "edition",
    props: computeDiff(origin, current, ["comment", "hardness"]),
  };
  return changes;
}

function zoneChanges(origin: WasabeeZone, current: WasabeeZone) {
  const changes: ZoneChange = {
    id: origin.id,
    type: "edition",
    props: computeDiff(origin, current, ["name", "color", "points"]),
  };
  return changes;
}

function compareList<
  T extends { id?: string | number; ID?: string },
  K extends keyof T
>(
  origin: T[],
  current: T[],
  keyID: keyof T & ("id" | "ID"),
  cmp: (o: T, c: T) => Change<T, K>
) {
  const olist = origin.slice();
  const clist = current.slice();
  olist.sort((a, b) =>
    a[keyID] < b[keyID] ? -1 : a[keyID] > b[keyID] ? 1 : 0
  );
  clist.sort((a, b) =>
    a[keyID] < b[keyID] ? -1 : a[keyID] > b[keyID] ? 1 : 0
  );

  const result: Change<T, K>[] = [];

  let i = 0;
  let j = 0;
  while (i < olist.length && j < clist.length) {
    const oTop = olist[i];
    const cTop = clist[j];
    if (oTop[keyID] < cTop[keyID]) {
      result.push({
        id: oTop[keyID],
        type: "deletion",
      });
      i += 1;
    } else if (oTop[keyID] > cTop[keyID]) {
      result.push({
        id: cTop[keyID],
        type: "addition",
        value: cTop,
      });
      j += 1;
    } else {
      const diff = cmp(oTop, cTop);
      if (diff.props) result.push(diff);
      i += 1;
      j += 1;
    }
  }

  while (i < olist.length) {
    result.push({
      id: olist[i][keyID],
      type: "deletion",
    });
    i += 1;
  }

  while (j < clist.length) {
    result.push({
      id: clist[j][keyID],
      type: "addition",
      value: clist[j],
    });
    j += 1;
  }

  return result;
}

export function operationChanges(origin: WasabeeOp, current: WasabeeOp) {
  const changes: OperationChange = {
    id: origin.ID,
    type: "edition", // always
    props: computeDiff(origin, current, [
      "name",
      "comment",
      "referencetime",
      "color",
    ]),
    portals: compareList(
      origin.opportals,
      current.opportals,
      "id",
      portalChanges
    ),
    links: compareList(origin.links, current.links, "ID", linkChanges),
    markers: compareList(origin.markers, current.markers, "ID", markerChanges),
    zones: compareList(origin.zones, current.zones, "id", zoneChanges),
  };
  return changes;
}

function rebaseDiff<T>(master: Partial<T>, follower: Partial<T>) {
  const props: Partial<T> = {};
  let once = false;
  for (const k in follower) {
    if (!master || JSON.stringify(master[k]) !== JSON.stringify(follower[k])) {
      props[k] = follower[k];
      once = true;
    }
  }
  if (once) return props;
  return null;
}

function rebaseChanges<T, K extends keyof T>(
  master: Change<T, K>[],
  follower: Change<T, K>[],
  conflictOnDoubleEditOnly = false, // portal and zone
  concurrentEditKeys: K[] = []
) {
  master.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  follower.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const result: Change<T, K>[] = [];
  const conflict: {
    id: string | number;
    type:
      | "addition/addition"
      | "edition/edition"
      | "edition/deletion"
      | "deletion/edition";
    value?: T;
    master?: Change<T, K>;
    follower?: Change<T, K>;
  }[] = [];

  let i = 0;
  let j = 0;
  while (i < master.length && j < follower.length) {
    const masterTop = master[i];
    const followerTop = follower[j];
    if (masterTop.id < followerTop.id) {
      i += 1;
    } else if (masterTop.id > followerTop.id) {
      result.push(followerTop);
      j += 1;
    } else {
      if (masterTop.type === "addition" || followerTop.type === "addition") {
        // id cannot be created on both end except for portals (what about zones?)
        if (conflictOnDoubleEditOnly) {
          const p = rebaseDiff(masterTop.props, followerTop.props);
          if (p) {
            result.push({
              id: followerTop.id,
              type: "edition",
              props: p,
            });
          }
        } else {
          conflict.push({
            id: followerTop.id,
            type: "addition/addition",
          });
        }
      } else if (
        masterTop.type === "deletion" &&
        followerTop.type === "deletion"
      ) {
        // this is easy, both agree
      } else if (
        masterTop.type === "edition" &&
        followerTop.type === "edition"
      ) {
        const p = rebaseDiff(masterTop.props, followerTop.props);
        if (p) {
          let ok = true;
          // if edit same fields
          for (const k in p) {
            if (k in masterTop.props) {
              ok = false;
              break;
            }
          }
          // or touch a field to be cautious about
          for (const k in masterTop.props) {
            if (!ok || concurrentEditKeys.includes(k)) {
              ok = false;
              break;
            }
          }
          for (const k in followerTop.props) {
            if (!ok || concurrentEditKeys.includes(k)) {
              ok = false;
              break;
            }
          }
          // then don't solve
          if (!ok) {
            // concurrent edition on the same field
            // of triggered on specific field
            conflict.push({
              id: followerTop.id,
              type: "edition/edition",
              master: masterTop,
              follower: followerTop,
            });
          } else {
            // looks good so far
            result.push({
              id: followerTop.id,
              type: "edition",
              props: p,
            });
          }
        }
      } else {
        // edition/deletion conflict
        if (conflictOnDoubleEditOnly) {
          if (followerTop.type === "edition") {
            result.push(followerTop);
          }
        } else {
          conflict.push({
            id: followerTop.id,
            type: (masterTop.type +
              "/" +
              followerTop.type) as typeof conflict[number]["type"],
            master: masterTop,
            follower: followerTop,
          });
        }
      }
      i += 1;
      j += 1;
    }
  }

  while (j < follower.length) {
    result.push(follower[j]);
    j += 1;
  }

  return {
    result,
    conflict,
  };
}

// change follower additions id to match master if equals
function unifyAdditions<T, K extends keyof T, C extends Change<T, K>>(
  master: C[],
  follower: C[],
  eq: (a: C["value"], b: C["value"]) => boolean
) {
  const masterAdd = master.filter((c) => c.type === "addition");
  const followerAdd = follower.filter((c) => c.type === "addition");
  for (const a of followerAdd) {
    for (const b of masterAdd) {
      if (eq(a.value, b.value)) {
        a.id = b.id;
        break;
      }
    }
  }
}

export function computeRebaseChanges(
  origin: WasabeeOp,
  master: WasabeeOp,
  follower: WasabeeOp
) {
  // add "deleted" portal
  for (const p of origin.opportals) {
    master._addPortal(p);
    follower._addPortal(p);
  }
  const masterChanges = operationChanges(origin, master);
  const followerChanges = operationChanges(origin, follower);

  // use master ID if links are added at both ends
  unifyAdditions(
    masterChanges.links,
    followerChanges.links,
    (a, b) =>
      (a.fromPortalId === b.fromPortalId && a.toPortalId === b.toPortalId) ||
      (a.fromPortalId === b.toPortalId && a.toPortalId === b.fromPortalId)
  );
  // use master ID if markers are added at both ends
  // note: assume we shouldn't have multiple markers with same type on a portal
  unifyAdditions(
    masterChanges.markers,
    followerChanges.markers,
    (a, b) => a.portalId === b.portalId && a.type === b.type
  );

  const changes = {
    props: rebaseDiff(masterChanges.props, followerChanges.props),
    portals: rebaseChanges(
      masterChanges.portals,
      followerChanges.portals,
      true
    ),
    links: rebaseChanges(masterChanges.links, followerChanges.links, false, [
      "fromPortalId",
      "toPortalId",
    ]),
    markers: rebaseChanges(
      masterChanges.markers,
      followerChanges.markers,
      false
    ),
    zones: rebaseChanges(masterChanges.zones, followerChanges.zones, true),
  };

  // define conflict default resolution value
  defaultChangeChoice(master, changes);

  return changes;
}

function applyChanges<T>(obj: T, props: Partial<T>) {
  for (const k in props) {
    obj[k] = props[k];
  }
}

export function defaultChangeChoice(
  masterOrCurrent: WasabeeOp,
  changes: ReturnType<typeof computeRebaseChanges>
) {
  for (const pc of changes.portals.conflict) {
    pc.value = masterOrCurrent.getPortal(pc.id as string);
  }
  for (const zc of changes.zones.conflict) {
    zc.value = masterOrCurrent.getZone(zc.id as number);
  }
  for (const mc of changes.markers.conflict) {
    mc.value = masterOrCurrent.getMarker(mc.id as string);
  }
  for (const lc of changes.links.conflict) {
    lc.value = masterOrCurrent.getLinkById(lc.id as string);
  }
}

export function applyRebaseChanges(
  master: WasabeeOp,
  current: WasabeeOp,
  changes: ReturnType<typeof computeRebaseChanges>
) {
  applyChanges(master, changes.props);
  // add possible missing portals
  for (const p of current.opportals) {
    master._addPortal(new WasabeePortal(p));
  }
  // add missing zone (deleted)
  for (const z of current.zones) {
    const mz = master.getZone(z.id);
    if (!mz) master.zones.push(new WasabeeZone(z));
  }
  // edit portals
  for (const pc of changes.portals.result) {
    if (pc.type === "addition") {
      // already done, be safe
      master._addPortal(pc.value);
    } else if (pc.type === "edition") {
      const p = master.getPortal(pc.id as string);
      if (p) applyChanges(p, pc.props);
    }
  }
  // edit zones
  for (const zc of changes.zones.result) {
    if (zc.type === "addition") {
      // already done, be safe
      const mz = master.getZone(zc.id as number);
      if (!mz) master.zones.push(new WasabeeZone(zc.value));
    } else if (zc.type === "edition") {
      const mz = master.getZone(zc.id as number);
      if (mz) applyChanges(mz, zc.props);
    }
  }
  // apply marker changes
  for (const mc of changes.markers.result) {
    if (mc.type === "deletion") {
      master.markers = master.markers.filter((m) => m.ID === mc.id);
    } else if (mc.type === "addition") {
      master.markers.push(new WasabeeMarker(mc.value));
    } else {
      const m = master.getMarker(mc.id as string);
      if (m) applyChanges(m, mc.props);
    }
  }
  // apply link changes
  for (const lc of changes.links.result) {
    if (lc.type === "deletion") {
      master.links = master.links.filter((l) => l.ID === lc.id);
    } else if (lc.type === "addition") {
      master.links.push(new WasabeeLink(lc.value));
    } else {
      const l = master.getLinkById(lc.id as string);
      if (l) applyChanges(l, lc.props);
    }
  }
  // Conflicts
  for (const pc of changes.portals.conflict) {
    // no deletion
    if (pc.value) master._updatePortal(pc.value);
  }
  for (const zc of changes.zones.conflict) {
    // no deletion
    if (zc.value) {
      master.zones = master.zones.filter((z) => z.id !== zc.id);
      master.zones.push(zc.value);
    }
  }
  for (const mc of changes.markers.conflict) {
    master.markers = master.markers.filter((m) => m.ID !== mc.id);
    if (mc.value) master.markers.push(mc.value);
  }
  for (const lc of changes.links.conflict) {
    master.links = master.links.filter((l) => l.ID !== lc.id);
    if (lc.value) master.links.push(lc.value);
  }

  // remove duplicates
  master.links = master.links.filter(
    (l) => master.getLinkByPortalIDs(l.fromPortalId, l.toPortalId) === l
  );

  master.cleanAnchorList();
  master.cleanPortalList();
}
