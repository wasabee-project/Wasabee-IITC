import db from "../db";
import type WasabeeOp from "./operation";
import WasabeePortal from "./portal";

export interface IBlockerPortal {
  opID: OpID;
  id: PortalID;
  name: string;
  lat: string;
  lng: string;
  team?: "R" | "E" | "M"; // new field 0.23
}

export default class WasabeeBlocker {
  opID: OpID;
  from: PortalID;
  to: PortalID;

  team?: "R" | "E" | "M"; // new field 0.23

  fromPortal?: WasabeePortal;
  toPortal?: WasabeePortal;

  constructor(obj) {
    this.opID = obj.opID;
    this.from = obj.fromPortal.id;
    this.to = obj.toPortal.id;
    this.team = obj.team;
  }

  static async addPortal(
    op: WasabeeOp,
    portal: WasabeePortal,
    team: "R" | "E" | "M"
  ) {
    const store = (await db).transaction("blockers_portals", "readonly").store;
    // sanitize data
    team = team === "E" || team === "R" || team === "M" ? team : null;
    const ent = {
      opID: op.ID,
      id: portal.id,
      name: portal.name,
      lat: portal.lat,
      lng: portal.lng,
      team: team,
    };
    const p = await store.get([op.ID, portal.id]);
    if (p) {
      if (p.lat !== portal.lat || p.lng !== portal.lng) {
        // portal move, drop blockers
        await WasabeeBlocker.removePortal(op, portal.id);
      } else if (team && p.team && p.team !== team) {
        // portal team flip, drop blockers
        await WasabeeBlocker.removePortal(op, portal.id);
      }
      if (ent.id === ent.name && p.name !== p.id) ent.name = p.name;
    }
    await (await db).put("blockers_portals", ent);
  }

  // return true if a blocker portal is updated (title or deleted)
  //        false if not a blocker portal, no change
  // remove blockers if team or location changed
  static async updatePortal(
    op: WasabeeOp,
    portal: WasabeePortal,
    team: "N" | WasabeeBlocker["team"]
  ) {
    if (portal.name === portal.id) return false;
    const store = (await db).transaction("blockers_portals", "readonly").store;
    const p = await store.get([op.ID, portal.id]);
    if (!p) return false;
    if (p.lat !== portal.lat || p.lng !== portal.lng) {
      // portal move, drop blockers
      await WasabeeBlocker.removePortal(op, portal.id);
      return true;
    }
    // sanitize data
    team =
      team === "E" || team === "R" || team === "N" || team === "M"
        ? team
        : null;
    if (team === "N" || (p.team && team && p.team !== team)) {
      // portal team flip, drop blockers
      await WasabeeBlocker.removePortal(op, portal.id);
      return true;
    }
    if (p.name === portal.name) return false;
    await (
      await db
    ).put("blockers_portals", {
      opID: op.ID,
      id: portal.id,
      name: portal.name,
      lat: portal.lat,
      lng: portal.lng,
      team: team,
    });
    return true;
  }

  static async removePortal(op: WasabeeOp, portalId: PortalID) {
    const store = (await db).transaction("blockers", "readwrite").store;
    let cfrom = await store
      .index("from")
      .openKeyCursor(IDBKeyRange.only([op.ID, portalId]));
    while (cfrom) {
      store.delete(cfrom.primaryKey);
      cfrom = await cfrom.continue();
    }
    let cto = await store
      .index("to")
      .openKeyCursor(IDBKeyRange.only([op.ID, portalId]));
    while (cto) {
      store.delete(cto.primaryKey);
      cto = await cto.continue();
    }
    await (await db).delete("blockers_portals", [op.ID, portalId]);
  }

  static async removeBlocker(op: WasabeeOp, from: PortalID, to: PortalID) {
    (await db).delete("blockers", [op.ID, from, to]);
  }

  static async removeBlockers(opID: OpID) {
    const sb = (await db).transaction("blockers", "readwrite").store;
    let co = await sb.index("opID").openKeyCursor(IDBKeyRange.only(opID));
    while (co) {
      sb.delete(co.primaryKey);
      co = await co.continue();
    }
    const sp = (await db).transaction("blockers_portals", "readwrite").store;
    let cp = await sp.index("opID").openKeyCursor(IDBKeyRange.only(opID));
    while (cp) {
      sp.delete(cp.primaryKey);
      cp = await cp.continue();
    }
  }

  static async addBlocker(
    op: WasabeeOp,
    fromPortal: WasabeePortal,
    toPortal: WasabeePortal,
    team?: WasabeeBlocker["team"] // optional for migration
  ) {
    const blocker = new WasabeeBlocker({
      opID: op.ID,
      fromPortal: fromPortal,
      toPortal: toPortal,
      team: team,
    });
    // to store portals
    await WasabeeBlocker.addPortal(op, fromPortal, team);
    await WasabeeBlocker.addPortal(op, toPortal, team);
    await (await db).put("blockers", blocker);
  }

  static async getPortals(op: WasabeeOp) {
    const portals = await (
      await db
    ).getAllFromIndex("blockers_portals", "opID", op.ID);
    return portals;
  }

  static async getAll(op: WasabeeOp) {
    const blockers = await (
      await db
    ).getAllFromIndex("blockers", "opID", op.ID);
    const portals = await WasabeeBlocker.getPortals(op);
    const portalsMap = new Map();
    for (const p of portals) {
      portalsMap.set(p.id, new WasabeePortal(p));
    }
    for (const b of blockers) {
      b.fromPortal = portalsMap.get(b.from);
      b.toPortal = portalsMap.get(b.to);
    }
    return blockers;
  }
}
