import db from "../db";
import type WasabeeOp from "./operation";
import type WasabeePortal from "./portal";

export interface IBlockerPortal {
  opID: OpID;
  id: PortalID;
  name: string;
  lat: string;
  lng: string;
}

export default class WasabeeBlocker {
  opID: OpID;
  from: PortalID;
  to: PortalID;

  fromPortal?: WasabeePortal;
  toPortal?: WasabeePortal;

  constructor(obj) {
    this.opID = obj.opID;
    this.from = obj.fromPortal.id;
    this.to = obj.toPortal.id;
  }

  static async addPortal(op: WasabeeOp, portal: WasabeePortal) {
    const store = (await db).transaction("blockers_portals", "readwrite").store;
    const ent = {
      opID: op.ID,
      id: portal.id,
      name: portal.name,
      lat: portal.lat,
      lng: portal.lng,
    };
    if (ent.id === ent.name) {
      const p = await store.get([op.ID, ent.id]);
      if (p && p.name !== p.id) ent.name = p.name;
    }
    await store.put(ent);
  }

  // return true if a blocker portal is updated
  static async updatePortal(op: WasabeeOp, portal: WasabeePortal) {
    const store = (await db).transaction("blockers_portals", "readwrite").store;
    if (portal.name === portal.id) return false;
    const p = await store.get([op.ID, portal.id]);
    if (!p) return false;
    if (p.lat !== portal.lat || p.lng !== portal.lng) {
      // portal move, drop blockers
      await WasabeeBlocker.removeBlocker(op, portal.id);
      return true;
    }
    if (p.name === portal.name) return false;
    await store.put({
      opID: op.ID,
      id: portal.id,
      name: portal.name,
      lat: portal.lat,
      lng: portal.lng,
    });
    return true;
  }

  static async removeBlocker(op, portalId) {
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

  static async removeBlockers(opID: string) {
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
    toPortal: WasabeePortal
  ) {
    const blocker = new WasabeeBlocker({
      opID: op.ID,
      fromPortal: fromPortal,
      toPortal: toPortal,
    });
    await (await db).put("blockers", blocker);
    // to store portals
    await WasabeeBlocker.addPortal(op, fromPortal);
    await WasabeeBlocker.addPortal(op, toPortal);
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
      portalsMap.set(p.id, p);
    }
    for (const b of blockers) {
      b.fromPortal = portalsMap.get(b.from);
      b.toPortal = portalsMap.get(b.to);
    }
    return blockers;
  }
}
