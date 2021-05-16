import WasabeeLink from "./link";
import WasabeePortal from "./portal";
import WasabeeMarker from "./marker";
import WasabeeMe from "./me";
import WasabeeZone from "./zone";
import { generateId, newColors } from "./auxiliar";
import { GetWasabeeServer } from "./server";
import { addOperation, getSelectedOperation } from "./selectedOp";

import wX from "./wX";

const Wasabee = window.plugin.wasabee;

export default class WasabeeOp {
  constructor(obj) {
    if (typeof obj == "string") {
      try {
        obj = JSON.parse(obj);
      } catch (e) {
        console.error("corrupted operation", e);
        return null;
      }
    }

    this.ID = obj.ID ? obj.ID : generateId();
    this.name = obj.name ? obj.name : "unnamed op";
    this.creator = obj.creator ? obj.creator : "unset";
    this.anchors = obj.anchors ? obj.anchors : Array();
    this.links = this.convertLinksToObjs(obj.links);
    this.markers = this.convertMarkersToObjs(obj.markers);
    this.color = obj.color ? obj.color : Wasabee.skin.defaultOperationColor;
    this.color = newColors(this.color);
    this.comment = obj.comment ? obj.comment : null;
    this.teamlist = obj.teamlist ? obj.teamlist : Array();
    this.fetched = obj.fetched ? obj.fetched : null;
    this.stored = obj.stored ? obj.stored : null;
    this.localchanged = obj.localchanged === false ? obj.localchanged : true;
    this.blockers = this.convertBlockersToObjs(obj.blockers);
    this.keysonhand = obj.keysonhand ? obj.keysonhand : Array();
    this.zones = this.convertZonesToObjs(obj.zones);
    // this.modified = obj.modified ? obj.modified : null;
    this.referencetime = obj.referencetime ? obj.referencetime : null;

    this.lasteditid = obj.lasteditid ? obj.lasteditid : null;
    this.remoteChanged = !!obj.remoteChanged;

    this.server = this.fetched ? obj.server : null;

    this.fetchedOp = obj.fetchedOp ? obj.fetchedOp : null;

    this.background = !!obj.background;

    if (!this.links) this.links = new Array();
    if (!this.markers) this.markers = new Array();
    if (!this.blockers) this.blockers = new Array();

    const opportals = this.convertPortalsToObjs(obj.opportals);
    this._idToOpportals = new Map();
    this._coordsToOpportals = new Map();
    if (opportals) for (const p of opportals) this._idToOpportals.set(p.id, p);
    this.buildCoordsLookupTable();

    this.cleanAnchorList();
    this.cleanPortalList();
  }

  static async load(opID) {
    try {
      const raw = await window.plugin.wasabee.idb.get("operations", opID);
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

  static async delete(opID) {
    delete localStorage[opID]; // leave for now
    await window.plugin.wasabee.idb.delete("operations", opID);
  }

  static async migrate(opID) {
    // skip ones already completed
    const have = await window.plugin.wasabee.idb.get("operations", opID);
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
    json.blockers = this.blockers;
    json.keysonhand = this.keysonhand;
    json.teamlist = this.teamlist;
    json.background = this.background;

    // store to localStorage -- for now
    // localStorage[this.ID] = JSON.stringify(json); // deactivated now

    // store to idb
    try {
      await window.plugin.wasabee.idb.put("operations", json);
    } catch (e) {
      console.error(e);
    }

    // some debug info to trace race condition
    const s = getSelectedOperation();
    if (s && s.ID == this.ID && s != this)
      console.trace(
        "store current OP from a different obj",
        s.ID,
        s.name,
        this.ID,
        this.name
      );
  }

  // build object to serialize, shallow copy, local-only values excluded
  toJSON() {
    return {
      ID: this.ID,
      name: this.name,
      creator: this.creator,
      opportals: Array.from(this._idToOpportals.values()), // includes blocker portals
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
    const o = new WasabeeOp(JSON.stringify(this));
    o.cleanPortalList(); // remove portals which are only relevant to blockers
    return JSON.stringify(o);
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
      const toRemove = new Array();
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
      for (const b of this.blockers) {
        b.fromPortalId = rename.get(b.fromPortalId);
        b.toPortalId = rename.get(b.toPortalId);
      }

      for (const id of toRemove) this._idToOpportals.delete(id);
    }

    this._dirtyCoordsTable = false;
  }

  getColor() {
    if (this.color == null) {
      return Wasabee.skin.defaultOperationColor;
    } else {
      return this.color;
    }
  }

  containsPortal(portal) {
    return this._idToOpportals.has(portal.id);
  }

  // assume lat and lng are strings from .toFixed(6)
  getPortalByLatLng(lat, lng) {
    if (this._dirtyCoordsTable) {
      this.buildCoordsLookupTable();
    }
    return this._coordsToOpportals.get(lat + "/" + lng);
  }

  containsLinkFromTo(fromPortalId, toPortalId) {
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

  containsLink(link) {
    return this.containsLinkFromTo(link.fromPortalId, link.toPortalId);
  }

  containsMarker(portal, markerType) {
    return this.containsMarkerByID(portal.id, markerType);
  }

  containsMarkerByID(portalID, markerType) {
    if (this.markers.length == 0) return false;
    for (const m of this.markers) {
      if (m.portalId == portalID && m.type == markerType) {
        return true;
      }
    }
    return false;
  }

  getPortalMarkers(portal) {
    const markers = new Map();
    if (!portal) return markers;
    for (const m of this.markers) {
      if (m.portalId == portal.id) {
        markers.set(m.type, m);
      }
    }
    return markers;
  }

  getLinkByPortalIDs(portalId1, portalId2) {
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

  getLink(portal1, portal2) {
    return this.getLinkByPortalIDs(portal1.id, portal2.id);
  }

  getLinkListFromPortal(portal) {
    const links = this.links.filter(function (listLink) {
      return (
        listLink.fromPortalId == portal.id || listLink.toPortalId == portal.id
      );
    });
    return links;
  }

  getPortal(portalID) {
    return this._idToOpportals.get(portalID);
  }

  removeAnchor(portalId) {
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
    this.runCrosslinks();
  }

  removeMarker(marker) {
    this.markers = this.markers.filter(function (listMarker) {
      return listMarker.ID !== marker.ID;
    });
    this.cleanPortalList();
    this.update(true);
    this.runCrosslinks();
  }

  setMarkerComment(marker, comment) {
    for (const v of this.markers) {
      if (v.ID == marker.ID) {
        v.comment = comment;
      }
    }
    this.update(true);
  }

  setMarkerState(markerID, state) {
    for (const v of this.markers) {
      if (v.ID == markerID) {
        // validation happens in the marker class
        v.state = state;
      }
    }
    this.update(true);
  }

  setLinkComment(link, comment) {
    for (const v of this.links) {
      if (v.ID == link.ID) {
        v.description = comment;
      }
    }
    this.update(true);
  }

  setLinkState(linkID, state) {
    for (const v of this.links) {
      if (v.ID == linkID) {
        v.state = state;
      }
    }
    this.update(true);
  }

  setLinkColor(linkID, color) {
    for (const v of this.links) {
      if (v.ID == linkID) {
        v.color = color;
      }
    }
    this.update(true);
  }

  setLinkOrder(linkID, order) {
    for (const v of this.links) {
      if (v.ID == linkID) {
        v.opOrder = Number(order);
      }
    }
    this.update(true);
  }

  setMarkerOrder(markerID, order) {
    for (const v of this.markers) {
      if (v.ID == markerID) {
        v.opOrder = Number(order);
      }
    }
    this.update(true);
  }

  setPortalComment(portal, comment) {
    const p = this.getPortal(portal.id);
    if (p) {
      p.comment = comment;
      this.update(true);
    }
  }

  setPortalHardness(portal, hardness) {
    const p = this.getPortal(portal.id);
    if (p) {
      p.hardness = hardness;
      this.update(true);
    }
  }

  //Passed in are the start, end, and portal the link is being removed from(so the other portal can be removed if no more links exist to it)
  removeLink(startPortal, endPortal) {
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
    this.runCrosslinks();
  }

  reverseLink(startPortalID, endPortalID) {
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

  cleanCaches() {
    for (const l of this.links) {
      delete l._crosslinksGL;
    }
  }

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
    const newPortals = new Map();
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
    for (const b of this.blockers) {
      newPortals.set(b.fromPortalId, this._idToOpportals.get(b.fromPortalId));
      newPortals.set(b.toPortalId, this._idToOpportals.get(b.toPortalId));
    }

    // sanitize OP if it get corrupt by my code elsewhere...
    const missingPortal = new Set();
    let corrupt =
      this.links.length + this.markers.length + this.blockers.length;
    for (const [id, v] of newPortals) {
      if (v === undefined) {
        this.links = this.links.filter(
          (l) => l.fromPortalId != id && l.toPortalId != id
        );
        this.markers = this.markers.filter((m) => m.portalId != id);
        this.blockers = this.blockers.filter(
          (b) => b.fromPortalId != id && b.toPortalId != id
        );
        missingPortal.add(id);
      }
    }
    corrupt -= this.links.length + this.markers.length + this.blockers.length;
    if (missingPortal.size > 0) {
      // leave some trace
      console.trace("op corruption: missing portals");
      alert(
        `Oops, something went wrong and OP ${this.name} got corrupted. Fix by removing ${missingPortal.size} missing portals and ${corrupt} links/markers/blockers. Please check your OP and report to the devs.`
      );
      this.cleanAnchorList();
      for (const id of missingPortal) newPortals.delete(id);
    }
    this._idToOpportals = newPortals;
    this.buildCoordsLookupTable();
  }

  addPortal(portal) {
    if (!this.updatePortal(portal) && this._addPortal(portal)) {
      this.update(false); // adding a portal may just be due to a blocker
    }
  }

  _addPortal(portal) {
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

  updatePortal(portal) {
    if (this._updatePortal(portal)) {
      this.update(true);
      return true;
    }
    return false;
  }

  // update portal silently if one with mathching ID or with matching position
  // return true if this update a portal data
  _updatePortal(portal) {
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
          // remove blockers on the old portal
          this.blockers = this.blockers.filter(
            (b) => b.fromPortalId != old.id && b.toPortalId != old.id
          );
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
        for (const b of this.blockers) {
          if (b.fromPortalId == old.id) b.fromPortalId = portal.id;
          if (b.toPortalId == old.id) b.toPortalId = portal.id;
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
  addLink(fromPortal, toPortal, options = {}) {
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
        : new WasabeeLink(
            {
              fromPortalId: fromPortal.id,
              toPortalId: toPortal.id,
            },
            this
          );
    if (options.description) link.description = options.description;
    if (options.order) link.opOrder = options.order;
    if (options.color) link.color = options.color;

    if (!existingLink) {
      this.links.push(link);
      this.update(true);
      this.runCrosslinks();
    } else if (options.replace) {
      this.update(true);
      this.runCrosslinks();
    } else {
      console.debug(
        "Link Already Exists In Operation -> " + JSON.stringify(link)
      );
      return existingLink;
    }
    return link;
  }

  containsAnchor(portalId) {
    if (this.anchors.length == 0) return false;
    for (const a of this.anchors) {
      if (a == portalId) {
        return true;
      }
    }
    return false;
  }

  addAnchor(portal) {
    // doing this ourselves saves a trip to update();
    this._addPortal(portal);
    if (!this.containsAnchor(portal.id)) {
      this.anchors.push(portal.id);
    }
  }

  containsBlocker(link) {
    if (!this.blockers || this.blockers.length == 0) return false;

    for (const l of this.blockers) {
      if (
        l.fromPortalId == link.fromPortalId &&
        l.toPortalId == link.toPortalId
      ) {
        return true;
      }
    }
    return false;
  }

  addBlocker(link) {
    if (!link.fromPortalId || !link.toPortalId) return;
    if (!this.containsBlocker(link)) {
      this.blockers.push(link);
      // this.update(false); // can trigger a redraw-storm, just skip
      // this.store(); // do not await, let it happen in the background -- ideally now blockers should not be part of the op json, but stored independently in indexeddb
    }
  }

  get fakedPortals() {
    const c = Array.from(this._idToOpportals.values()).filter((p) => p.faked);
    return c;
  }

  // silently swap two anchors
  _swapPortal(originalPortal, newPortal) {
    this.anchors = this.anchors.filter(function (listAnchor) {
      return listAnchor !== originalPortal.id;
    });
    if (!this.containsAnchor(newPortal.id)) this.anchors.push(newPortal.id);

    const linksToRemove = [];
    for (const l of this.links) {
      // purge any crosslink check cache
      if (l._crosslinksGL) {
        delete l._crosslinksGL;
      }

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

  swapPortal(originalPortal, newPortal) {
    this._addPortal(newPortal);
    this._swapPortal(originalPortal, newPortal);
    this.update(true);
    this.runCrosslinks();
  }

  addMarker(markerType, portal, options) {
    if (!portal) return;
    if (this.containsMarker(portal, markerType)) {
      alert(wX("ALREADY_HAS_MARKER"));
    } else {
      this.addPortal(portal);
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

      // only need this for virus/destroy/decay -- this should be in the marker class
      const destructMarkerTypes = [
        window.plugin.wasabee.static.constants.MARKER_TYPE_DECAY,
        window.plugin.wasabee.static.constants.MARKER_TYPE_DESTROY,
        window.plugin.wasabee.static.constants.MARKER_TYPE_VIRUS,
      ];
      if (destructMarkerTypes.includes(markerType)) this.runCrosslinks();
    }
  }

  assignMarker(id, gid) {
    for (const v of this.markers) {
      if (v.ID == id) {
        v.assign(gid);
        this.update(true);
      }
    }
  }

  assignLink(id, gid) {
    for (const v of this.links) {
      if (v.ID == id) {
        v.assignedTo = gid;
        this.update(true);
      }
    }
  }

  clearAllItems() {
    this.anchors = Array();
    this.links = Array();
    this.markers = Array();
    this.blockers = Array();

    this._idToOpportals.clear();
    this._coordsToOpportals.clear();
    this.update(true);
  }

  clearAllLinks() {
    this.links = Array();
    this.blockers = Array();
    this.cleanAnchorList();
    this.cleanPortalList();
    this.update(true);
  }

  clearAllMarkers() {
    this.markers = Array();
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
    window.map.fire("wasabeeUIUpdate", { reason: "op update" }, false);
  }

  runCrosslinks() {
    if (this._batchmode === true) return;
    window.map.fire("wasabeeCrosslinks", { reason: "op runCrosslinks" }, false);
  }

  startBatchMode() {
    this._batchmode = true;
  }

  endBatchMode() {
    this._batchmode = false;
    this.update(true);
    this.runCrosslinks();
  }

  convertLinksToObjs(links) {
    const tmpLinks = new Array();
    if (!links || links.length == 0) return tmpLinks;
    for (const l of links) {
      tmpLinks.push(new WasabeeLink(l, this));
    }
    return tmpLinks;
  }

  convertBlockersToObjs(links) {
    const tmpLinks = new Array();
    if (!links || links.length == 0) return tmpLinks;
    for (const l of links) {
      tmpLinks.push(new WasabeeLink(l, this));
    }
    return tmpLinks;
  }

  convertMarkersToObjs(markers) {
    const tmpMarkers = new Array();
    if (!markers || markers.length == 0) return tmpMarkers;
    if (markers) {
      for (const m of markers) {
        tmpMarkers.push(new WasabeeMarker(m));
      }
    }
    return tmpMarkers;
  }

  convertPortalsToObjs(portals) {
    const tmpPortals = Array();
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

  convertZonesToObjs(zones) {
    if (!zones || zones.length == 0) {
      // if not set, use the defaults
      return [
        { id: 1, name: "Primary" },
        { id: 2, name: "Alpha" },
        { id: 3, name: "Beta" },
        { id: 4, name: "Gamma" },
        { id: 5, name: "Delta" },
        { id: 6, name: "Epsilon" },
        { id: 7, name: "Zeta" },
        { id: 8, name: "Eta" },
        { id: 9, name: "Theta" },
      ].map((obj) => new WasabeeZone(obj));
    }
    const tmpZones = Array();
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
    for (const a of this._idToOpportals.values()) {
      lats.push(a.lat);
      lngs.push(a.lng);
    }
    const minlat = Math.min.apply(null, lats);
    const maxlat = Math.max.apply(null, lats);
    const minlng = Math.min.apply(null, lngs);
    const maxlng = Math.max.apply(null, lngs);
    const min = L.latLng(minlat, minlng);
    const max = L.latLng(maxlat, maxlng);
    return L.latLngBounds(min, max);
  }

  // is the op writable to the current server
  IsWritableOp() {
    // not from the server, must be writable
    if (!this.IsServerOp()) return true;
    // if it is a server op and not logged in, assume not writable
    if (!WasabeeMe.isLoggedIn()) return false;
    // if logged on a different server from the one used for the op, not writable
    if (!this.IsOnCurrentServer()) return false;
    // if current user is op creator, it is always writable
    const me = WasabeeMe.cacheGet();
    if (!me) return false;
    if (me.GoogleID == this.creator) return true;
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

  getPermission() {
    // not from the server, must be writable
    if (!this.IsServerOp()) return "write";
    // if it is a server op and not logged in, the user is the owner
    if (!WasabeeMe.isLoggedIn()) return "write";
    // if logged on a different server from the one used for the op, the user is the owner
    if (!this.IsOnCurrentServer()) return "write";
    // if current user is op creator, it is always writable
    const me = WasabeeMe.cacheGet();
    if (!me) return "read"; // fail safe
    if (me.GoogleID == this.creator) return "write";

    const teamsID = new Set(me.Teams.map((t) => t.ID));
    // look for team permission
    for (const t of this.teamlist)
      if (t.role == "write" && teamsID.has(t.teamid)) return "write";

    for (const t of this.teamlist)
      if (t.role == "read" && teamsID.has(t.teamid)) return "read";

    return "assignonly";
  }

  IsOnCurrentServer() {
    // assume yes if .server is not defined yet (<0.19)
    return !this.server || this.server == GetWasabeeServer();
  }

  IsServerOp() {
    if (this.fetched) return true;
    return false;
  }

  IsOwnedOp() {
    if (!this.IsServerOp()) return true;
    if (!WasabeeMe.isLoggedIn()) return true;

    const me = WasabeeMe.cacheGet();
    if (!me) return false;
    if (me.GoogleID == this.creator) return true;
    return false;
  }

  get nextOrder() {
    let o = 0;
    for (const l of this.links) {
      o = Math.max(o, l.opOrder);
    }
    for (const m of this.markers) {
      o = Math.max(o, m.opOrder);
    }
    return ++o;
  }

  // this is only for local display if FireBase doesn't trigger a refresh
  // KOH always takes place on the server because non-write-access
  // agents need to make changes & sync
  keyOnHand(portalId, gid, onhand, capsule) {
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

    const k = {
      portalId: portalId,
      gid: gid,
      onhand: onhand,
      capsule: capsule,
    };
    this.keysonhand.push(k);
    this.update(false);
  }

  KeysOnHandForPortal(portalId) {
    let i = 0;
    for (const k of this.keysonhand) if (k.portalId == portalId) i += k.onhand;
    return i;
  }

  KeysRequiredForPortal(portalId) {
    let i = 0;
    for (const l of this.links) if (l.toPortalId == portalId) i++;
    return i;
  }

  zoneName(zoneID) {
    if (zoneID == "0")
      // All zone
      return "All";
    for (const z of this.zones) {
      if (z.id == zoneID) return z.name;
    }
    return zoneID;
  }

  // a wrapper to set WasabeePortal or WasabeeLink zone and update
  setZone(thing, zoneID) {
    thing.zone = Number(zoneID);
    this.update(true);
  }

  removeZone(zoneID) {
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

  renameZone(zoneID, name) {
    for (const z of this.zones) {
      if (z.id == zoneID) {
        z.name = name;
        break;
      }
    }
    this.update(true);
  }

  addZone() {
    const ids = new Set();
    for (const z of this.zones) {
      ids.add(z.id);
    }
    const newid = Math.max(...ids) + 1;
    this.zones.push(new WasabeeZone({ id: newid, name: newid }));
    this.update(true);
    return newid;
  }

  changes(origin) {
    const changes = {
      addition: new Array(),
      edition: new Array(),
      deletion: new Array(),
    };
    // empty op if old OP (or local OP)
    const oldOp = new WasabeeOp(origin ? origin : this.fetchedOp || {});
    const oldLinks = new Map(oldOp.links.map((l) => [l.ID, l]));
    const oldMarkers = new Map(oldOp.markers.map((m) => [m.ID, m]));

    const newLinks = new Map(this.links.map((l) => [l.ID, l]));
    const newMarkers = new Map(this.markers.map((m) => [m.ID, m]));

    // Note: teams/keyonhand are atomic
    if (oldOp.name != this.name) changes.name = this.name;
    if (oldOp.color != this.color) changes.color = this.color;
    if (oldOp.comment != this.comment) changes.comment = this.comment;
    // blockers: ignored by the server, handle them later
    // zones: handle them later

    for (const [id, p] of this._idToOpportals) {
      if (oldOp._idToOpportals.has(id)) {
        const oldPortal = oldOp._idToOpportals.get(id);
        const fields = ["comment", "hardness"];
        const diff = fields
          .filter((k) => oldPortal[k] != p[k])
          .map((k) => [k, oldPortal[k]]);
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
          "assignedTo",
          "description",
          "throwOrderPos",
          "color",
          "completed",
          "zone",
        ];
        const diff = fields
          .filter((k) => oldLink[k] != l[k])
          .map((k) => [k, oldLink[k]]);
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
          "type",
          "comment",
          "assignedTo",
          "state",
          "order",
          "zone",
        ];
        const diff = fields
          .filter((k) => oldMarker[k] != m[k])
          .map((k) => [k, oldMarker[k]]);
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

  // assume that `this` is a server OP (no blockers, teams/keys are correct)
  applyChanges(changes, op) {
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

    // merge portals
    for (const p of op.opportals) {
      this._addPortal(p);
    }

    for (const b of op.blockers) this.blockers.push(b); // do not use addBlocker

    // add missing zones
    {
      const ids = new Set();
      for (const z of this.zones) {
        ids.add(z.id);
      }
      for (const z of op.zones)
        if (!ids.has(z.id)) {
          op.zones.push(z);
          summary.addition.zone += 1;
        }
    }

    // try to detect 0.18 ops with inconsistent IDs
    {
      const ids = new Set();
      for (const l of this.links) {
        ids.add(l.ID);
      }
      for (const m of this.markers) {
        ids.add(m.ID);
      }
      let foundCollision = false;
      for (const d of changes.deletion) {
        if (d.type == "link" || d.type == "marker")
          if (ids.has(d.id)) {
            foundCollision = true;
            break;
          }
      }
      if (!foundCollision && op.links.some((l) => ids.has(l.ID)))
        foundCollision = true;
      if (!foundCollision && op.markers.some((m) => ids.has(m.ID)))
        foundCollision = true;

      // foundCollision: either there is a collision in IDs, or everything fine
      if (!foundCollision) {
        // unless someone deleted everything and rebuild an OP, IDs differ between op and `this`
        // we need to use the server IDs so everyone use the same IDs
        // this will occur with old client editing the ops, and old ops with always parallel writers (none is sync; bound to disappear)
        summary.compatibility.ok = false;
        for (const d of changes.deletion) {
          if (d.type == "link") {
            const link = this.getLinkByPortalIDs(
              d.link.fromPortalId,
              d.link.toPortalId
            );
            if (link) {
              d.id = link.ID;
              summary.compatibility.rewrite.link += 1;
            }
          }
          if (d.type == "marker") {
            const marker = this.getPortalMarkers(d.marker.portalId).get(
              d.marker.type
            );
            if (marker) {
              d.id = marker.ID;
              summary.compatibility.rewrite.marker += 1;
            }
          }
        }
        for (const e of changes.edition) {
          if (e.type == "link") {
            const link = this.getLinkByPortalIDs(
              e.link.fromPortalId,
              e.link.toPortalId
            );
            if (link) {
              e.id = link.ID;
              summary.compatibility.rewrite.link += 1;
            }
          }
          if (e.type == "marker") {
            const marker = this.getPortalMarkers(e.marker.portalId).get(
              e.marker.type
            );
            if (marker) {
              e.id = marker.ID;
              summary.compatibility.rewrite.marker += 1;
            }
          }
        }
      }
    }

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
            const markers = this.getPortalMarkers(e.marker.portalId);
            const marker = markers.get(e.marker.type);
            if (marker && marker != m) {
              // remove the marker if leading to a duplicate
              this.markers = this.markers.filter((m) => m.ID != e.marker.ID);
              summary.edition.duplicate += 1;
            } else {
              for (const kv of e.diff) m[kv[0]] = e.marker[kv[0]];
              summary.edition.marker += 1;
              if (e.diff.some((kv) => kv[0] == "assignedTo"))
                summary.edition.assignment += 1;
            }
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
}
