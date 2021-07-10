import db from "../db";

export default class WasabeeBlocker {
  constructor(obj) {
    this.opID = obj.opID;
    this.from = obj.fromPortal.id;
    this.to = obj.toPortal.id;
  }

  static async addPortal(op, portal) {
    const store = await (await db).transaction("blockers_portals", "readwrite")
      .store;
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

  static async updatePortal(op, portal) {
    const store = (await db).transaction("blockers_portals", "readwrite").store;
    if (portal.name === portal.id) return;
    const p = await store.get([op.ID, portal.id]);
    if (!p) return;
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
    let cursor = await store
      .index("from")
      .openKeyCursor(IDBKeyRange.only([op.ID, portalId]));
    while (cursor) {
      store.delete(cursor.primaryKey);
      cursor = await cursor.continue();
    }
    cursor = await store
      .index("to")
      .openKeyCursor(IDBKeyRange.only([op.ID, portalId]));
    while (cursor) {
      store.delete(cursor.primaryKey);
      cursor = await cursor.continue();
    }
    await (await db).delete("blockers_portals", [op.ID, portalId]);
  }

  static async removeBlockers(op) {
    let store = (await db).transaction("blockers", "readwrite").store;
    let cursor = await store
      .index("opID")
      .openKeyCursor(IDBKeyRange.only(op.ID));
    while (cursor) {
      store.delete(cursor.primaryKey);
      cursor = await cursor.continue();
    }
    store = (await db).transaction("blockers_portals", "readwrite").store;
    cursor = await store.index("opID").openKeyCursor(IDBKeyRange.only(op.ID));
    while (cursor) {
      store.delete(cursor.primaryKey);
      cursor = await cursor.continue();
    }
  }

  static async addBlocker(op, fromPortal, toPortal) {
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

  static async getAll(op) {
    const blockers = await (
      await db
    ).getAllFromIndex("blockers", "opID", op.ID);
    const portals = await (
      await db
    ).getAllFromIndex("blockers_portals", "opID", op.ID);
    const portalsMap = new Map();
    for (const p of portals) {
      portalsMap.set(p.id, p);
    }
    for (const b of blockers) {
      b.fromPortal = portalsMap.get(b.from);
      b.toPortal = portalsMap.get(b.to);
    }
    return blockers.filter((b) => b.fromPortal && b.toPortal);
  }
}
