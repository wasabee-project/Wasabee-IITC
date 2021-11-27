import WasabeeLink from "./link";
import WasabeePortal from "./portal";
import WasabeeMarker from "./marker";
import WasabeeMe from "./me";
import WasabeeZone from "./zone";
import Evented from "./evented";
import { generateId } from "../auxiliar";
import { GetWasabeeServer } from "../server";
import { getSelectedOperation } from "../selectedOp";
import db from "../db";

// 0.20->0.21 blocker migration
import WasabeeBlocker from "./blocker";
import type Task from "./task";
import { displayWarning } from "../error";
import { fieldSign, portalInField } from "../crosslinks";

export type KeyOnHand = {
  portalId: string;
  gid: string;
  capsule: string;
  onhand: number;
};

export type OpPermItem = {
  role: "read" | "write" | "assignonly";
  teamid: string;
  zone: number;
};

interface IOperation {
  ID: OpID;
  name: string;
  creator: string | GoogleID;
  opportals: WasabeePortal[];
  anchors: string[];
  links: WasabeeLink[];
  markers: WasabeeMarker[];
  color: string;
  comment: string;
  zones: WasabeeZone[];
  referencetime: string;
}

export interface IServerOp extends IOperation {
  creator: GoogleID;
  teamlist: OpPermItem[];
  keysonhand: KeyOnHand[];
  lasteditid: string;
  fetched: string;
  modified: string;
}

export interface ILocalOp extends IOperation {
  teamlist: OpPermItem[];
  keysonhand: KeyOnHand[];
  lasteditid: string;
  fetched: string;
  fetchedOp: string;
  server: string;
  localchanged: boolean;
  remoteChanged: boolean;
  background: boolean;
  stored: number;
}

export default class WasabeeOp extends Evented implements IOperation {
  ID: string;
  name: string;
  creator: string;
  anchors: Array<string>;
  links: Array<WasabeeLink>;
  markers: Array<WasabeeMarker>;
  color: string;
  comment: string;
  teamlist: Array<OpPermItem>;
  fetched: string;
  stored: number;
  localchanged: boolean;
  blockers: Array<WasabeeLink>;
  keysonhand: Array<KeyOnHand>;
  zones: Array<WasabeeZone>;

  referencetime: string;
  lasteditid: string;
  remoteChanged: boolean;
  server: string;
  fetchedOp: string;
  background: boolean;

  _idToOpportals: Map<string, WasabeePortal>;
  _coordsToOpportals: Map<string, WasabeePortal>;

  _dirtyCoordsTable = false;
  _batchmode = false;

  constructor(obj) {
    super();
    if (typeof obj == "string") {
      console.trace("op waits for an object");
      return null;
    }

    this.ID = obj.ID ? obj.ID : generateId();
    this.name = obj.name ? obj.name : "unnamed op";
    this.creator = obj.creator ? obj.creator : "unset";
    this.anchors = obj.anchors ? obj.anchors : [];
    this.links = this.convertLinksToObjs(obj.links);
    this.markers = this.convertMarkersToObjs(obj.markers);
    this.color = obj.color ? obj.color : "main";
    this.comment = obj.comment ? obj.comment : null;
    this.teamlist = obj.teamlist ? obj.teamlist : [];
    this.fetched = obj.fetched ? obj.fetched : null;
    this.stored = obj.stored ? obj.stored : null;
    this.localchanged = obj.localchanged === false ? obj.localchanged : true;
    this.keysonhand = obj.keysonhand ? obj.keysonhand : [];
    this.zones = this.convertZonesToObjs(obj.zones);
    // this.modified = obj.modified ? obj.modified : null;
    this.referencetime = obj.referencetime ? obj.referencetime : null;

    this.lasteditid = obj.lasteditid ? obj.lasteditid : null;
    this.remoteChanged = !!obj.remoteChanged;

    this.server = this.fetched ? obj.server : null;

    this.fetchedOp = obj.fetchedOp ? obj.fetchedOp : null;

    this.background = !!obj.background;

    if (!this.links) this.links = [];
    if (!this.markers) this.markers = [];

    const opportals = this.convertPortalsToObjs(obj.opportals);
    this._idToOpportals = new Map();
    this._coordsToOpportals = new Map();
    if (opportals) for (const p of opportals) this._idToOpportals.set(p.id, p);
    this.buildCoordsLookupTable();

    // 0.20->0.21 blocker migration
    if (obj.blockers) {
      for (const blocker of obj.blockers) {
        WasabeeBlocker.addBlocker(
          this,
          this.getPortal(blocker.fromPortalId),
          this.getPortal(blocker.toPortalId)
        );
      }
    }

    this.cleanAnchorList();
    this.cleanPortalList();
  }

  static async load(opID: OpID) {
    try {
      const raw = await (await db).get("operations", opID);
      if (raw == null)
        //throw new Error("invalid operation ID");
        return null;
      const op = new WasabeeOp(raw);
      if (op == null) throw new Error("corrupted operation");
      return op;
    } catch (e) {
      console.error(e);
    }
    return null;
  }

  static async delete(opID: OpID) {
    delete localStorage[opID]; // leave for now
    await (await db).delete("operations", opID);
  }

  static async migrate(opID: OpID) {
    // skip ones already completed
    const have = await (await db).get("operations", opID);
    if (have != null) {
      delete localStorage[opID]; // active now
      return;
    }

    try {
      const raw = localStorage[opID];
      if (raw == null) throw new Error("invalid operation ID");
      const obj = JSON.parse(raw);
      const op = new WasabeeOp(obj);
      if (op == null) throw new Error("corrupted operation");
      await op.store();
      delete localStorage[opID]; // active now
    } catch (e) {
      console.error(e);
    }
  }

  // writes to localStorage with all data included
  async store() {
    this.stored = Date.now();
    const json = this.toJSON();

    // include things not required by the server but necessary for local storage
    json.server = this.server;
    json.fetchedOp = this.fetchedOp;
    json.lasteditid = this.lasteditid;
    json.remoteChanged = this.remoteChanged;
    json.fetched = this.fetched;
    json.stored = this.stored;
    json.localchanged = this.localchanged;
    json.keysonhand = this.keysonhand;
    json.teamlist = this.teamlist;
    json.background = this.background;

    // store to localStorage -- for now
    // localStorage[this.ID] = JSON.stringify(json); // deactivated now

    // store to idb
    try {
      await (await db).put("operations", json);
    } catch (e) {
      console.error(e);
    }

    // some debug info to trace race condition
    const s = getSelectedOperation();
    if (s && s.ID == this.ID && s != this)
      console.trace(
        "store current OP from a different obj, this *should* be followed by makeSelectedOperation",
        s.ID,
        s.name,
        this.ID,
        this.name
      );
  }

  // build object to serialize, shallow copy, local-only values excluded
  toJSON(): any {
    return {
      ID: this.ID,
      name: this.name,
      creator: this.creator,
      opportals: Array.from(this._idToOpportals.values()),
      anchors: this.anchors,
      links: this.links,
      markers: this.markers,
      color: this.color,
      comment: this.comment,
      zones: this.zones,
      referencetime: this.referencetime,
    };
  }

  // JSON with everything optional removed -- inception grade logic here
  toExport() {
    // round-trip through JSON.stringify to ensure a deep copy
    const o = new WasabeeOp(JSON.parse(JSON.stringify(this)));
    return JSON.stringify(o);
  }

  getFetchedOp() {
    if (!this.fetchedOp) return null;
    try {
      const json = JSON.parse(this.fetchedOp);
      return new WasabeeOp(json);
    } catch (e) {
      console.error("corrupted fetched op", e);
      return null;
    }
  }

  // read only (for inspection)
  get opportals() {
    return Array.from(this._idToOpportals.values());
  }

  buildCoordsLookupTable() {
    this._coordsToOpportals.clear();
    this._dirtyCoordsTable = false;

    for (const p of this._idToOpportals.values()) {
      const key = p.lat + "/" + p.lng;
      const old = this._coordsToOpportals.get(key);
      if (!old) this._coordsToOpportals.set(key, p);
      else {
        this._dirtyCoordsTable = true;
        if (old.pureFaked) this._coordsToOpportals.set(key, p);
        else if (!p.pureFaked) {
          // this shouldn't happen unless corrupted data or portal location changes...
          console.warn(
            "operation: portals %s and %s have same coordinates: %s",
            old.id,
            p.id,
            key
          );
          // NB: one of them will be removed on the next round
        }
      }
    }

    if (this._dirtyCoordsTable) {
      console.debug("operation: removing duplicates");
      const toRemove = [];
      const rename = new Map();

      for (const [id, p] of this._idToOpportals) {
        const key = p.lat + "/" + p.lng;
        const preferredPortal = this._idToOpportals.get(
          this._coordsToOpportals.get(key).id
        );
        rename.set(id, preferredPortal.id);
        if (id != preferredPortal.id) {
          toRemove.push(id);
        }
      }
      // replace IDs
      for (const l of this.links) {
        l.fromPortalId = rename.get(l.fromPortalId);
        l.toPortalId = rename.get(l.toPortalId);
      }
      for (const m of this.markers) {
        m.portalId = rename.get(m.portalId);
      }
      this.anchors = this.anchors.map((a) => rename.get(a));

      for (const id of toRemove) this._idToOpportals.delete(id);
    }

    this._dirtyCoordsTable = false;
  }

  getColor() {
    if (this.color == null) {
      return "main";
    } else {
      return this.color;
    }
  }

  containsPortal(portal: WasabeePortal) {
    return this._idToOpportals.has(portal.id);
  }

  // assume lat and lng are strings from .toFixed(6)
  getPortalByLatLng(lat: string, lng: string) {
    if (this._dirtyCoordsTable) {
      this.buildCoordsLookupTable();
    }
    return this._coordsToOpportals.get(lat + "/" + lng);
  }

  containsLinkFromTo(fromPortalId: PortalID, toPortalId: PortalID) {
    if (this.links.length == 0) return false;

    for (const l of this.links) {
      if (
        (l.fromPortalId == fromPortalId && l.toPortalId == toPortalId) ||
        (l.toPortalId == fromPortalId && l.fromPortalId == toPortalId)
      ) {
        return true;
      }
    }
    return false;
  }

  containsLink(link: WasabeeLink) {
    return this.containsLinkFromTo(link.fromPortalId, link.toPortalId);
  }

  containsMarker(portal: WasabeePortal, markerType: string) {
    return this.containsMarkerByID(portal.id, markerType);
  }

  containsMarkerByID(portalID: PortalID, markerType: string) {
    if (this.markers.length == 0) return false;
    for (const m of this.markers) {
      if (m.portalId == portalID && m.type == markerType) {
        return true;
      }
    }
    return false;
  }

  getLinkByPortalIDs(portalId1: PortalID, portalId2: PortalID) {
    for (const l of this.links) {
      if (
        (l.fromPortalId == portalId1 && l.toPortalId == portalId2) ||
        (l.fromPortalId == portalId2 && l.toPortalId == portalId1)
      ) {
        return l;
      }
    }
    return null;
  }

  getLink(portal1: WasabeePortal, portal2: WasabeePortal) {
    return this.getLinkByPortalIDs(portal1.id, portal2.id);
  }

  getLinkListFromPortal(portal: WasabeePortal) {
    const links = this.links.filter(function (listLink) {
      return (
        listLink.fromPortalId == portal.id || listLink.toPortalId == portal.id
      );
    });
    return links;
  }

  getPortal(portalID: PortalID) {
    return this._idToOpportals.get(portalID);
  }

  getMarker(markerID: MarkerID) {
    for (const m of this.markers) {
      if (m.ID == markerID) {
        return m;
      }
    }
    return null;
  }

  removeAnchor(portalId: PortalID) {
    this.anchors = this.anchors.filter(function (anchor) {
      return anchor !== portalId;
    });
    this.links = this.links.filter(function (listLink) {
      return (
        listLink.fromPortalId !== portalId && listLink.toPortalId !== portalId
      );
    });

    this.cleanAnchorList();
    this.cleanPortalList();
    this.update(true);
    this.updateBlockers();
  }

  removeMarkerByID(markerID: MarkerID) {
    this.markers = this.markers.filter(function (listMarker) {
      return listMarker.ID !== markerID;
    });
    this.cleanPortalList();
    this.update(true);
    this.updateBlockers();
  }

  removeMarker(marker: WasabeeMarker) {
    this.removeMarkerByID(marker.ID);
  }

  setMarkerComment(marker: WasabeeMarker, comment: string) {
    for (const v of this.markers) {
      if (v.ID == marker.ID) {
        v.comment = comment;
      }
    }
    this.update(true);
  }

  setMarkerState(markerID: MarkerID, state: Task["state"]) {
    for (const v of this.markers) {
      if (v.ID == markerID) {
        // validation happens in the marker class
        v.state = state;
      }
    }
    this.update(true);
  }

  setLinkComment(link: WasabeeLink, comment: string) {
    for (const v of this.links) {
      if (v.ID == link.ID) {
        v.comment = comment;
      }
    }
    this.update(true);
  }

  setLinkState(linkID: LinkID, state: Task["state"]) {
    for (const v of this.links) {
      if (v.ID == linkID) {
        v.state = state;
      }
    }
    this.update(true);
  }

  setLinkColor(linkID: LinkID, color: string) {
    for (const v of this.links) {
      if (v.ID == linkID) {
        v.color = color;
      }
    }
    this.update(true);
  }

  setLinkOrder(linkID: LinkID, order: string | number) {
    for (const v of this.links) {
      if (v.ID == linkID) {
        v.setOrder(order);
      }
    }
    this.update(true);
  }

  setMarkerOrder(markerID: MarkerID, order: string | number) {
    for (const v of this.markers) {
      if (v.ID == markerID) {
        v.setOrder(order);
      }
    }
    this.update(true);
  }

  setPortalComment(portal: WasabeePortal, comment: string) {
    const p = this.getPortal(portal.id);
    if (p) {
      p.comment = comment;
      this.update(true);
    }
  }

  setPortalHardness(portal: WasabeePortal, hardness: string) {
    const p = this.getPortal(portal.id);
    if (p) {
      p.hardness = hardness;
      this.update(true);
    }
  }

  removeLinkByID(linkID: LinkID) {
    this.links = this.links.filter((l) => l.ID != linkID);
    this.cleanAnchorList();
    this.cleanPortalList();
    this.update(true);
    this.updateBlockers();
  }

  //Passed in are the start, end, and portal the link is being removed from(so the other portal can be removed if no more links exist to it)
  removeLink(startPortal: PortalID, endPortal: PortalID) {
    const newLinks = [];
    for (const l of this.links) {
      if (!(l.fromPortalId == startPortal && l.toPortalId == endPortal)) {
        newLinks.push(l);
      }
    }
    this.links = newLinks;
    this.cleanAnchorList();
    this.cleanPortalList();
    this.update(true);
    this.updateBlockers();
  }

  reverseLink(startPortalID: PortalID, endPortalID: PortalID) {
    const newLinks = [];
    for (const l of this.links) {
      if (l.fromPortalId == startPortalID && l.toPortalId == endPortalID) {
        l.fromPortalId = endPortalID;
        l.toPortalId = startPortalID;
      }
      newLinks.push(l);
    }
    this.links = newLinks;
    this.update(true);
  }

  cleanAll() {
    this.cleanAnchorList();
    this.cleanPortalList();
    this.cleanCaches();
  }

  cleanCaches() {}

  cleanAnchorList() {
    const newAnchorList = [];
    for (const l of this.links) {
      if (!newAnchorList.includes(l.fromPortalId))
        newAnchorList.push(l.fromPortalId);
      if (!newAnchorList.includes(l.toPortalId))
        newAnchorList.push(l.toPortalId);
    }
    this.anchors = newAnchorList;
  }

  //This removes opportals with no links and removes duplicates
  cleanPortalList() {
    const newPortals = new Map<PortalID, WasabeePortal>();
    for (const l of this.links) {
      newPortals.set(l.fromPortalId, this._idToOpportals.get(l.fromPortalId));
      newPortals.set(l.toPortalId, this._idToOpportals.get(l.toPortalId));
    }
    for (const m of this.markers) {
      newPortals.set(m.portalId, this._idToOpportals.get(m.portalId));
    }
    for (const a of this.anchors) {
      newPortals.set(a, this._idToOpportals.get(a));
    }

    // sanitize OP if it get corrupt by my code elsewhere...
    const missingPortal = new Set<PortalID>();
    let corrupt = this.links.length + this.markers.length;
    for (const [id, v] of newPortals) {
      if (v === undefined) {
        this.links = this.links.filter(
          (l) => l.fromPortalId != id && l.toPortalId != id
        );
        this.markers = this.markers.filter((m) => m.portalId != id);
        missingPortal.add(id);
      }
    }
    corrupt -= this.links.length + this.markers.length;
    if (missingPortal.size > 0) {
      // leave some trace
      console.trace("op corruption: missing portals");
      displayWarning(
        `Oops, something went wrong and OP ${this.name} got corrupted. Fix by removing ${missingPortal.size} missing portals and ${corrupt} links/markers. Please check your OP and report to the devs.`
      );
      this.cleanAnchorList();
      for (const id of missingPortal) newPortals.delete(id);
    }
    this._idToOpportals = newPortals;
    this.buildCoordsLookupTable();
  }

  addPortal(portal: WasabeePortal) {
    if (!this.updatePortal(portal) && this._addPortal(portal)) {
      this.update(false); // adding a portal may just be due to a blocker
    }
  }

  _addPortal(portal: WasabeePortal) {
    if (!this.containsPortal(portal)) {
      const key = portal.lat + "/" + portal.lng;
      if (this._coordsToOpportals.has(key)) {
        // the portal is likely to be a real portal while old is a faked one
        // this is addressed later when rebuilding coords lookup table.
        // use _updatePortal to replace old one by the new one
        console.debug(
          "add portal %s on portal %s location %s",
          this._coordsToOpportals.get(key).id,
          portal.id,
          key
        );
        this._dirtyCoordsTable = true;
      }
      this._idToOpportals.set(portal.id, portal);
      this._coordsToOpportals.set(key, portal);
      //this.opportals.push(portal);
      return true;
    }
    return false;
  }

  updatePortal(portal: WasabeePortal) {
    if (this._updatePortal(portal)) {
      this.update(true);
      return true;
    }
    return false;
  }

  // update portal silently if one with mathching ID or with matching position
  // return true if this update a portal data
  _updatePortal(portal: WasabeePortal) {
    const old = this.getPortal(portal.id);
    if (old) {
      if (!portal.faked) {
        if (portal.lat !== old.lat || portal.lng !== old.lng) {
          // portal has moved, so we create a fake portal to replace this
          console.warn(
            "portal %s has moved, replacing by a fake at old location",
            old.id
          );
          const fake = WasabeePortal.fake(old.lat, old.lng, null, old.name);
          // and swap the old with the fake
          this._coordsToOpportals.delete(old.lat + "/" + old.lng); // prevent dirty
          this._addPortal(fake);
          this._swapPortal(old, fake);
          // re-attribute markers
          for (const m of this.markers) {
            if (m.portalId == old.id) m.portalId = fake.id;
          }

          this._idToOpportals.delete(old.id);
          // add the new portal so any data related to the real portal (keys) still works
          this._addPortal(portal);
          return true;
        }
        if (old.name == portal.name) return false;
        old.name = portal.name;
        return true;
      }
    } else {
      const old = this.getPortalByLatLng(portal.lat, portal.lng);
      if (old) {
        if (!old.pureFaked)
          console.warn(
            "update real portal %s by portal %s at location %s",
            old.id,
            portal.id,
            portal.lat + "/" + portal.lng
          );
        // prevent dirty
        this._coordsToOpportals.delete(portal.lat + "/" + portal.lng);
        this._addPortal(portal);
        this._swapPortal(old, portal);
        for (const m of this.markers) {
          if (m.portalId == old.id) m.portalId = portal.id;
        }

        this._idToOpportals.delete(old.id);

        //this.opportals = Array.from(this._idToOpportals.values());

        // NB: truly faked portal are anchors only so we can delete them if swaped
        return true;
      }
    }
    return false;
  }

  // options: {description,order,color,replace}
  addLink(
    fromPortal: WasabeePortal,
    toPortal: WasabeePortal,
    options: {
      description?: string;
      order?: number;
      color?: string;
      replace?: boolean;
    } = {}
  ) {
    console.assert(fromPortal && toPortal, "missing portal for link");
    if (fromPortal.id === toPortal.id) {
      console.debug(
        "Operation: Ignoring link where source and target are the same portal."
      );
      return null;
    }

    this.addAnchor(fromPortal);
    this.addAnchor(toPortal);

    const existingLink = this.getLink(fromPortal, toPortal);

    const link =
      existingLink && options.replace
        ? existingLink
        : new WasabeeLink({
            fromPortalId: fromPortal.id,
            toPortalId: toPortal.id,
          });
    if (options.description) link.comment = options.description;
    if (options.order) link.setOrder(options.order);
    if (options.color) link.color = options.color;

    if (!existingLink) {
      this.links.push(link);
      this.update(true);
      this.updateBlockers();
    } else if (options.replace) {
      this.update(true);
      this.updateBlockers();
    } else {
      console.debug(
        "Link Already Exists In Operation -> " + JSON.stringify(link)
      );
      return existingLink;
    }
    return link;
  }

  containsAnchor(portalId: string) {
    if (this.anchors.length == 0) return false;
    for (const a of this.anchors) {
      if (a == portalId) {
        return true;
      }
    }
    return false;
  }

  addAnchor(portal: WasabeePortal) {
    // doing this ourselves saves a trip to update();
    this._addPortal(portal);
    if (!this.containsAnchor(portal.id)) {
      this.anchors.push(portal.id);
    }
  }

  get fakedPortals() {
    const c = Array.from(this._idToOpportals.values()).filter((p) => p.faked);
    return c;
  }

  // silently swap two anchors
  _swapPortal(originalPortal: WasabeePortal, newPortal: WasabeePortal) {
    this.anchors = this.anchors.filter(function (listAnchor) {
      return listAnchor !== originalPortal.id;
    });
    if (!this.containsAnchor(newPortal.id)) this.anchors.push(newPortal.id);

    const linksToRemove = [];
    for (const l of this.links) {
      if (l.fromPortalId == originalPortal.id) {
        if (l.toPortalId === newPortal.id) {
          console.debug(
            `Operation: Removing link '${l.ID}' while swapping because it would create a link with the same source and target.`
          );
          linksToRemove.push(l);
        } else if (!this.containsLinkFromTo(newPortal.id, l.toPortalId)) {
          l.fromPortalId = newPortal.id;
        } else {
          console.debug(
            `Operation: Removing link '${l.ID}' while swapping because it would duplicate an existing link in the operation.`
          );
          linksToRemove.push(l);
        }
      } else if (l.toPortalId == originalPortal.id) {
        if (l.fromPortalId === newPortal.id) {
          console.debug(
            `Operation: Removing link '${l.ID}' while swapping because it would create a link with the same source and target.`
          );
          linksToRemove.push(l);
        } else if (!this.containsLinkFromTo(l.fromPortalId, newPortal.id)) {
          l.toPortalId = newPortal.id;
        } else {
          console.debug(
            `Operation: Removing link '${l.ID}' while swapping because it would duplicate an existing link in the operation.`
          );
          linksToRemove.push(l);
        }
      }
    }
    // Remove the invalid links from the array (after we are done iterating through it)
    this.links = this.links.filter(
      (element) => !linksToRemove.includes(element)
    );
  }

  swapPortal(originalPortal: WasabeePortal, newPortal: WasabeePortal) {
    this._addPortal(newPortal);
    this._swapPortal(originalPortal, newPortal);
    this.update(true);
    this.updateBlockers();
  }

  addMarker(markerType: string, portal: WasabeePortal, options) {
    if (!portal) return false;

    // save a trip to update()
    this._addPortal(portal);
    const marker = new WasabeeMarker({
      type: markerType,
      portalId: portal.id,
    });
    if (options && options.comment) marker.comment = options.comment;
    if (options && options.zone) marker.zone = options.zone;
    if (options && options.assign && options.assign != 0)
      marker.assign(options.assign);
    this.markers.push(marker);

    this.update(true);
    // run crosslink to update the layer
    // XXX: we don't need to check, only redraw, so we need something clever, probably in mapDraw or crosslink.js
    if (marker.isDestructMarker()) this.updateBlockers();
    return true;
  }

  assignMarker(id: MarkerID, gid: GoogleID) {
    for (const v of this.markers) {
      if (v.ID == id) {
        v.assign(gid);
        this.update(true);
      }
    }
  }

  assignLink(id: LinkID, gid: GoogleID) {
    for (const v of this.links) {
      if (v.ID == id) {
        v.assign(gid);
        this.update(true);
      }
    }
  }

  clearAllItems() {
    this.anchors = [];
    this.links = [];
    this.markers = [];

    this._idToOpportals.clear();
    this._coordsToOpportals.clear();
    this.update(true);
  }

  clearAllLinks() {
    this.links = [];
    this.cleanAnchorList();
    this.cleanPortalList();
    this.update(true);
  }

  clearAllMarkers() {
    this.markers = [];
    this.cleanPortalList();
    this.update(true);
  }

  // save the op and redraw everything on the map
  update(updateLocalchanged = true) {
    // batchmode skips all this, for bulk adding links/etc
    if (this._batchmode === true) return;

    if (this.fetched && updateLocalchanged) {
      this.localchanged = true;
    }

    this.store(); // no await, let it happen in the background unless we see races
    this.fire("update");
  }

  updateBlockers() {
    if (this._batchmode === true) return;
    this.fire("blockers");
  }

  startBatchMode() {
    this._batchmode = true;
  }

  endBatchMode() {
    this._batchmode = false;
    this.update(true);
    this.updateBlockers();
  }

  convertLinksToObjs(links: any[]) {
    const tmpLinks = [];
    if (!links || links.length == 0) return tmpLinks;
    for (const l of links) {
      tmpLinks.push(new WasabeeLink(l));
    }
    return tmpLinks;
  }

  convertMarkersToObjs(markers: any[]) {
    const tmpMarkers = [];
    if (!markers || markers.length == 0) return tmpMarkers;
    if (markers) {
      for (const m of markers) {
        tmpMarkers.push(new WasabeeMarker(m));
      }
    }
    return tmpMarkers;
  }

  convertPortalsToObjs(portals: any[]) {
    const tmpPortals = [];
    if (!portals || portals.length == 0) return tmpPortals;
    for (const p of portals) {
      if (p instanceof WasabeePortal) {
        tmpPortals.push(p);
      } else {
        const np = new WasabeePortal(p);
        tmpPortals.push(np);
      }
    }
    return tmpPortals;
  }

  convertZonesToObjs(zones: any[]) {
    if (!zones || zones.length == 0) {
      // if not set, use the defaults
      return [
        { id: 1, name: "Primary", color: "purple" },
        { id: 2, name: "Secondary", color: "yellow" },
      ].map((obj) => new WasabeeZone(obj));
    }
    const tmpZones = [];
    for (const z of zones) {
      if (z instanceof WasabeeZone) {
        tmpZones.push(z);
      } else {
        const nz = new WasabeeZone(z);
        tmpZones.push(nz);
      }
    }
    return tmpZones;
  }

  // minimum bounds rectangle
  get mbr() {
    if (this._idToOpportals.size == 0) return null;
    const lats = [];
    const lngs = [];
    for (const a of this.anchors) {
      const portal = this.getPortal(a);
      lats.push(portal.lat);
      lngs.push(portal.lng);
    }
    for (const m of this.markers) {
      const portal = this.getPortal(m.portalId);
      lats.push(portal.lat);
      lngs.push(portal.lng);
    }
    if (!lats.length) return null;
    const minlat = Math.min.apply(null, lats);
    const maxlat = Math.max.apply(null, lats);
    const minlng = Math.min.apply(null, lngs);
    const maxlng = Math.max.apply(null, lngs);
    const min = L.latLng(minlat, minlng);
    const max = L.latLng(maxlat, maxlng);
    return L.latLngBounds(min, max);
  }

  // is the op writable to the *current server*
  // for assignment, team permission, update
  canWriteServer() {
    // not from the server, not writable to server
    if (!this.isServerOp()) return false;
    // if it is a server op and not logged in, assume not writable
    if (!WasabeeMe.isLoggedIn()) return false;
    // if logged on a different server from the one used for the op, not writable
    if (!this.isOnCurrentServer()) return false;
    // if current user is op creator, it is always writable
    const me = WasabeeMe.cacheGet();
    if (!me) return false;
    if (me.id == this.creator) return true;
    // if the user has no teams enabled, it can't be writable
    if (!me.Teams || me.Teams.length == 0) return false;
    // if on a write-allowed team, is writable
    for (const t of this.teamlist) {
      if (t.role == "write") {
        for (const m of me.Teams) {
          if (t.teamid == m.ID) return true;
        }
      }
    }

    // not on a write-access team, must not be
    return false;
  }

  // suitable for any change except assignments, op perms
  canWrite() {
    return this.getPermission() === "write";
  }

  getPermission() {
    // not from the server, must be writable
    if (!this.isServerOp()) return "write";
    // if it is a server op and not logged in, the user is the owner
    if (!WasabeeMe.isLoggedIn()) return "write";
    // if logged on a different server from the one used for the op, the user is the owner
    if (!this.isOnCurrentServer()) return "write";
    // if current user is op creator, it is always writable
    const me = WasabeeMe.cacheGet();
    if (!me) return "read"; // fail safe
    if (me.id == this.creator) return "write";

    const teamsID = new Set(me.Teams.map((t) => t.ID));
    // look for team permission
    for (const t of this.teamlist)
      if (t.role == "write" && teamsID.has(t.teamid)) return "write";

    for (const t of this.teamlist)
      if (t.role == "read" && teamsID.has(t.teamid)) return "read";

    return "assignonly";
  }

  isOnCurrentServer() {
    return this.isServerOp() && this.server == GetWasabeeServer();
  }

  isServerOp() {
    if (this.fetched) return true;
    return false;
  }

  isOwnedOp() {
    if (!this.isServerOp()) return true;
    if (!WasabeeMe.isLoggedIn()) return true;

    const me = WasabeeMe.cacheGet();
    if (!me) return false;
    if (me.id == this.creator) return true;
    return false;
  }

  get nextOrder() {
    let o = 0;
    for (const l of this.links) {
      o = Math.max(o, l.order);
    }
    for (const m of this.markers) {
      o = Math.max(o, m.order);
    }
    return ++o;
  }

  // this is only for local display if FireBase doesn't trigger a refresh
  // KOH always takes place on the server because non-write-access
  // agents need to make changes & sync
  keyOnHand(
    portalId: PortalID,
    gid: GoogleID,
    onhand: number,
    capsule: string
  ) {
    if (typeof onhand == "string") {
      onhand = Number.parseInt(onhand, 10);
    }

    for (const k of this.keysonhand) {
      // fix broken ops
      if (typeof k.onhand == "string") {
        k.onhand = Number.parseInt(k.onhand, 10);
      }

      if (k.portalId == portalId && k.gid == gid) {
        k.onhand = onhand;
        k.capsule = capsule;
        this.update(false);
        return;
      }
    }

    const k: KeyOnHand = {
      portalId: portalId,
      gid: gid,
      onhand: onhand,
      capsule: capsule,
    };
    this.keysonhand.push(k);
    this.update(false);
  }

  KeysOnHandForPortal(portalId: PortalID) {
    let i = 0;
    for (const k of this.keysonhand) if (k.portalId == portalId) i += k.onhand;
    return i;
  }

  KeysRequiredForPortal(portalId: PortalID) {
    let i = 0;
    for (const l of this.links) if (l.toPortalId == portalId) i++;
    return i;
  }

  zoneName(zoneID: ZoneID) {
    if (zoneID === 0) return 0;
    for (const z of this.zones) {
      if (z.id == zoneID) return z.name;
    }
    return zoneID;
  }

  getZone(zoneID: ZoneID) {
    for (const z of this.zones) {
      if (z.id == zoneID) return z;
    }
    return null;
  }

  // a wrapper to set WasabeePortal or WasabeeLink zone and update
  setZone(thing: Task, zoneID: ZoneID) {
    thing.zone = Number(zoneID);
    this.update(true);
  }

  removeZone(zoneID: ZoneID) {
    if (zoneID == 1) {
      console.log("cannot remove zone 1");
      return;
    }
    for (const m of this.markers) {
      if (m.zone == zoneID) m.zone = 1;
    }
    for (const l of this.links) {
      if (l.zone == zoneID) l.zone = 1;
    }
    this.zones = this.zones.filter((z) => {
      return z.id != zoneID;
    });
    this.update(true);
  }

  removeZonePoints(zoneID: ZoneID) {
    for (const z of this.zones) {
      if (z.id == zoneID) {
        z.points = [];
      }
    }
    this.update(true);
  }

  renameZone(zoneID: ZoneID, name: string) {
    for (const z of this.zones) {
      if (z.id == zoneID) {
        z.name = name;
        break;
      }
    }
    this.update(true);
  }

  addZone() {
    const ids = new Set<number>();
    for (const z of this.zones) {
      ids.add(z.id);
    }
    const newid = Math.max(...ids) + 1;
    this.zones.push(new WasabeeZone({ id: newid, name: newid }));
    this.update(true);
    return newid;
  }

  addZonePoint(zoneID: number, latlng: L.LatLng) {
    for (const z of this.zones) {
      if (z.id == zoneID) {
        z.points.push({
          lat: latlng.lat,
          lng: latlng.lng,
          position: z.points.length,
        });
        break;
      }
    }
    this.update(true);
  }

  changes(origin?: WasabeeOp) {
    interface PortalType {
      type: "portal";
      portal: WasabeePortal;
    }
    interface LinkType {
      type: "link";
      link: WasabeeLink;
    }
    interface MarkerType {
      type: "marker";
      marker: WasabeeMarker;
    }
    interface OpChanges {
      addition: (PortalType | LinkType | MarkerType)[];
      edition: ((PortalType | LinkType | MarkerType) & {
        diff: [string, any][];
      })[];
      deletion: ((LinkType | MarkerType) & { id: TaskID })[];
      name: string;
      color: string;
      comment: string;
    }
    const changes: OpChanges = {
      addition: [],
      edition: [],
      deletion: [],
      name: null,
      color: null,
      comment: null,
    };
    // empty op if old OP (or local OP)
    const oldOp = new WasabeeOp(origin ? origin : this.getFetchedOp() || {});
    const oldLinks = new Map(oldOp.links.map((l) => [l.ID, l]));
    const oldMarkers = new Map(oldOp.markers.map((m) => [m.ID, m]));

    const newLinks = new Map(this.links.map((l) => [l.ID, l]));
    const newMarkers = new Map(this.markers.map((m) => [m.ID, m]));

    // Note: teams/keyonhand are atomic
    if (oldOp.name != this.name) changes.name = this.name;
    if (oldOp.color != this.color) changes.color = this.color;
    if (oldOp.comment != this.comment) changes.comment = this.comment;
    // zones: handle them later

    for (const [id, p] of this._idToOpportals) {
      if (oldOp._idToOpportals.has(id)) {
        const oldPortal = oldOp._idToOpportals.get(id);
        const fields = ["comment", "hardness"];
        const diff = fields
          .filter((k) => oldPortal[k] != p[k])
          .map((k) => [k, oldPortal[k]] as [string, any]);
        if (diff.length > 0)
          changes.edition.push({ type: "portal", portal: p, diff: diff });
      }
    }

    for (const [id, l] of oldLinks) {
      if (!newLinks.has(id)) {
        changes.deletion.push({ type: "link", link: l, id: id });
      }
    }
    for (const l of this.links) {
      if (!oldLinks.has(l.ID)) {
        changes.addition.push({ type: "link", link: l });
      } else {
        const oldLink = oldLinks.get(l.ID);
        const fields = [
          "fromPortalId",
          "toPortalId",
          "color",
          "zone",
          "order",
          "assignedTo",
          "completedID",
          "comment",
          "state",
        ];
        const diff = fields
          .filter((k) => oldLink[k] != l[k])
          .map((k) => [k, oldLink[k]] as [string, any]);
        if (diff.length > 0)
          changes.edition.push({ type: "link", link: l, diff: diff });
      }
    }

    for (const [id, m] of oldMarkers) {
      if (!newMarkers.has(id)) {
        changes.deletion.push({ type: "marker", marker: m, id: id });
      }
    }
    for (const m of this.markers) {
      if (!oldMarkers.has(m.ID)) {
        changes.addition.push({ type: "marker", marker: m });
      } else {
        const oldMarker = oldMarkers.get(m.ID);
        const fields = [
          /* "portalId", */ // unlikely because we don't swap marker yet
          "type",
          "zone",
          "order",
          "assignedTo",
          "completedID",
          "comment",
          "state",
        ];
        const diff = fields
          .filter((k) => oldMarker[k] != m[k])
          .map((k) => [k, oldMarker[k]] as [string, any]);
        if (diff.length > 0)
          changes.edition.push({ type: "marker", marker: m, diff: diff });
      }
    }

    return changes;
  }

  checkChanges() {
    if (this.localchanged) {
      const changes = this.changes();
      if (
        changes.addition.length +
          changes.edition.length +
          changes.deletion.length ==
        0
      )
        this.localchanged = false;
    }
    return this.localchanged;
  }

  // currently overwrite zones instead of ignoring conflict
  mergeZones(op: WasabeeOp) {
    const ids = new Map<ZoneID, WasabeeZone>();
    let count = 0;
    for (const z of this.zones) {
      ids.set(z.id, z);
    }
    for (const z of op.zones) {
      if (!ids.has(z.id)) {
        this.zones.push(z);
        count += 1;
      } else {
        const lz = ids.get(z.id);
        if (JSON.stringify(z) !== JSON.stringify(lz)) {
          lz.color = z.color;
          lz.name = z.name;
          lz.points = z.points;
          count += 1;
        }
      }
    }
    return count;
  }

  // assume that `this` is a server OP (teams/keys are correct)
  applyChanges(changes: ReturnType<WasabeeOp["changes"]>, op: WasabeeOp) {
    const summary = {
      compatibility: {
        ok: true,
        rewrite: {
          link: 0,
          marker: 0,
        },
      },
      addition: {
        link: 0,
        marker: 0,
        zone: 0,
        ignored: 0,
      },
      deletion: {
        link: 0,
        marker: 0,
      },
      edition: {
        portal: 0,
        link: 0,
        marker: 0,
        assignment: 0,
        duplicate: 0,
        singlePortalLink: 0,
        removed: 0,
      },
    };

    // merge *portals*
    for (const p of op.opportals) {
      this._addPortal(p);
    }

    // add missing zones
    summary.addition.zone = this.mergeZones(op);

    for (const d of changes.deletion) {
      if (d.type == "link") {
        const links = this.links.filter((l) => l.ID != d.id);
        summary.deletion.link += this.links.length - links.length;
        this.links = links;
      } else if (d.type == "marker") {
        const markers = this.markers.filter((m) => m.ID != d.id);
        summary.deletion.marker += this.markers.length - markers.length;
        this.markers = markers;
      }
    }
    // links/markers absent from `this` are not added back
    for (const e of changes.edition) {
      if (e.type == "portal") {
        const portal = this.getPortal(e.portal.id);
        for (const kv of e.diff) portal[kv[0]] = e.portal[kv[0]];
        summary.edition.portal += 1;
      } else if (e.type == "link") {
        let found = false;
        for (const l of this.links) {
          if (l.ID == e.link.ID) {
            const link = this.getLinkByPortalIDs(
              e.link.fromPortalId,
              e.link.toPortalId
            );
            if (link && link != l) {
              // remove the link if leading to a duplicate
              // note: in some unexpected situation, this could lead to link loses (when user swap portal a LOT on the same spines)
              this.links = this.links.filter((l) => l.ID != e.link.ID);
              summary.edition.duplicate += 1;
            } else {
              for (const kv of e.diff) l[kv[0]] = e.link[kv[0]];
              if (l.fromPortalId == l.toPortalId) {
                this.links = this.links.filter((link) => link.ID != l.ID);
                summary.edition.singlePortalLink += 1;
              } else {
                summary.edition.link += 1;
                if (e.diff.some((kv) => kv[0] == "assignedTo"))
                  summary.edition.assignment += 1;
              }
            }
            found = true;
            break;
          }
        }
        if (!found) summary.edition.removed += 1;
      } else if (e.type == "marker") {
        let found = false;
        for (const m of this.markers) {
          if (m.ID == e.marker.ID) {
            for (const kv of e.diff) m[kv[0]] = e.marker[kv[0]];
            summary.edition.marker += 1;
            if (e.diff.some((kv) => kv[0] == "assignedTo"))
              summary.edition.assignment += 1;
            found = true;
            break;
          }
        }
        if (!found) summary.edition.removed += 1;
      }
    }
    // `this` takes over `changes` for additions
    for (const a of changes.addition) {
      if (a.type == "portal") {
        // already done
      } else if (a.type == "link") {
        if (!this.getLinkByPortalIDs(a.link.fromPortalId, a.link.toPortalId)) {
          this.links.push(a.link);
          summary.addition.link += 1;
        } else summary.addition.ignored += 1;
      } else if (a.type == "marker") {
        if (!this.containsMarkerByID(a.marker.portalId, a.marker.type)) {
          this.markers.push(a.marker);
          summary.addition.marker += 1;
        } else summary.addition.ignored += 1;
      }
    }
    return summary;
  }

  determineZone(latlng: { lat: number; lng: number }) {
    // sort first, lowest ID wins if a marker is in 2 overlapping zones
    this.zones.sort((a, b) => {
      return a.id - b.id;
    });
    for (const z of this.zones) {
      if (z.contains(latlng)) return z.id;
    }
    // default to primary zone
    return 1;
  }

  getOrderInfo() {
    const links = Array.from(this.links);
    links.sort((a, b) => a.order - b.order);

    // map portal id to link they got covered
    const coveredPortals = new Map<PortalID, WasabeeLink>();
    const linksFromInner: WasabeeLink[] = [];

    let fieldCount = 0;
    let emptyCount = 0;

    // maps a portal id to its linked portals
    const portalLinks = new Map<PortalID, Set<LinkID>>();
    const emptyFieldLinks: [WasabeeLink, number][] = [];
    for (const link of links) {
      if (!portalLinks.has(link.fromPortalId))
        portalLinks.set(link.fromPortalId, new Set());
      if (!portalLinks.has(link.toPortalId))
        portalLinks.set(link.toPortalId, new Set());
      const a = portalLinks.get(link.fromPortalId);
      const b = portalLinks.get(link.toPortalId);

      // common neighbors portal
      const intersect = new Set<PortalID>();
      for (const p of a) if (b.has(p)) intersect.add(p);

      // update the mapping
      a.add(link.toPortalId);
      b.add(link.fromPortalId);

      // ignore link with order 0
      if (link.order > 0) {
        // the link closes at least one field
        const p1 = this.getPortal(link.fromPortalId);
        const p2 = this.getPortal(link.toPortalId);
        const positive: WasabeePortal[] = [];
        const negative: WasabeePortal[] = [];
        // ignore earth curvature (todo: use it)
        for (const pid of intersect) {
          const p = this.getPortal(pid);
          const sign = fieldSign(p, p1, p2);
          if (sign > 0) positive.push(p);
          else negative.push(p);
        }
        if (positive.length) fieldCount += 1;
        if (negative.length) fieldCount += 1;
        // if the link closes multiple fields on the same side of the link, we have empty fields.
        // doesn't support crossed links configuration yet
        if (positive.length > 1 || negative.length > 1) {
          let count = 0;
          if (positive.length > 1) count += positive.length - 1;
          if (negative.length > 1) count += negative.length - 1;
          emptyFieldLinks.push([link, count]);
          emptyCount += count;
        }

        // record covering time
        for (const pid of intersect) {
          const p = this.getPortal(pid);
          for (const a of this.anchors) {
            if (a === pid || a === p1.id || a === p2.id) continue;
            if (!coveredPortals.has(a)) {
              const ap = this.getPortal(a);
              if (portalInField(p1, p2, p, ap)) coveredPortals.set(a, link);
            }
          }
        }
      }

      if (coveredPortals.has(link.fromPortalId)) {
        linksFromInner.push(link);
      }
    }

    return {
      fieldCount,
      emptyFieldLinks,
      emptyCount,
      linksFromInner,
      coveredPortals,
    };
  }
}
