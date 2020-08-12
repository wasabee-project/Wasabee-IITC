import WasabeeLink from "./link";
import WasabeePortal from "./portal";
import WasabeeMarker from "./marker";
import WasabeeMe from "./me";
import { generateId } from "./auxiliar";
import store from "../lib/store";
import { updateOpPromise } from "./server";

import wX from "./wX";

// this should be in statics.js
const DEFAULT_OPERATION_COLOR = "groupa";

export default class WasabeeOp {
  //ID <- randomly generated alpha-numeric ID for the operation
  //name <- name of operation
  //creator <- agent who created it
  //portals <- List of Portals
  //links <- List of Links
  constructor(creator, name) {
    this.ID = generateId();
    this.name = name;
    this.creator = creator;
    //this.opportals = Array();
    this.anchors = Array();
    this.links = Array();
    this.markers = Array();
    this.color = DEFAULT_OPERATION_COLOR;
    this.comment = null;
    this.teamlist = Array();
    this.fetched = null;
    this.stored = null;
    this.localchanged = true;
    this.blockers = Array();
    this.keysonhand = Array();

    this._idToOpportals = new Map();
    this._coordsToOpportals = new Map();
    this.buildCoordsLookupTable();
  }

  store() {
    this.stored = Date.now();
    store.set(this.ID, JSON.stringify(this));
  }

  // build object to serialize
  toJSON() {
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
      teamlist: this.teamlist,
      fetched: this.fetched,
      stored: this.stored,
      localchanged: this.localchanged,
      blockers: this.blockers,
      keysonhand: this.keysonhand,
    };
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
      console.log("operation: removing duplicates");
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

      //this.opportals = Array.from(this._idToOpportals.values());
    }

    this._dirtyCoordsTable = false;
  }

  getColor() {
    if (this.color == null) {
      return DEFAULT_OPERATION_COLOR;
    } else {
      return this.color;
    }
  }

  containsPortal(portal) {
    if (!portal && !portal.id) {
      console.log("containsPortal w/o args");
      return false;
    }
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

  getLink(portal1, portal2) {
    for (const l of this.links) {
      if (
        (l.fromPortalId == portal1.id && l.toPortalId == portal2.id) ||
        (l.fromPortalId == portal2.id && l.toPortalId == portal1.id)
      ) {
        return l;
      }
    }
    return null;
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
    console.log("removing anchor");
    console.log(this.links);

    this.anchors = this.anchors.filter(function (anchor) {
      return anchor !== portalId;
    });
    this.links = this.links.filter(function (listLink) {
      return (
        listLink.fromPortalId !== portalId && listLink.toPortalId !== portalId
      );
    });

    console.log(this.links);

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
        v.opOrder = order;
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
    this.cleanPortalList();
    this.cleanAnchorList();
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
    this.store();
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
        console.log(
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
  _updatePortal(portal) {
    const old = this.getPortal(portal.id);
    if (old) {
      if (!portal.faked) {
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

  addLink(fromPortal, toPortal, description, order, replace = false) {
    if (!fromPortal || !toPortal) {
      console.log("missing portal for link");
      return null;
    }
    if (fromPortal.id === toPortal.id) {
      console.log(
        "Operation: Ignoring link where source and target are the same portal."
      );
      return null;
    }

    this.addAnchor(fromPortal);
    this.addAnchor(toPortal);

    const existingLink = this.getLink(fromPortal, toPortal);

    const link =
      existingLink && replace
        ? existingLink
        : new WasabeeLink(this, fromPortal.id, toPortal.id);
    link.description = description;
    if (order) link.opOrder = order;

    if (!existingLink) {
      this.links.push(link);
      this.update(true);
      this.runCrosslinks();
    } else if (replace) {
      this.update(true);
      this.runCrosslinks();
    } else {
      console.log(
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
      this.update(true);
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
    if (!link.fromPortalId || !link.toPortalId) {
      console.log("not fully formed");
      console.log(link);
      return;
    }
    if (!this.containsBlocker(link)) {
      this.blockers.push(link);
      this.update(false); // can trigger a redraw-storm, just skip
    }
  }

  removeBlocker() {
    // console.log("remove blocker called... write this"); // no need for now
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
          console.log(
            `Operation: Removing link '${l.ID}' while swapping because it would create a link with the same source and target.`
          );
          linksToRemove.push(l);
        } else if (!this.containsLinkFromTo(newPortal.id, l.toPortalId)) {
          l.fromPortalId = newPortal.id;
        } else {
          console.log(
            `Operation: Removing link '${l.ID}' while swapping because it would duplicate an existing link in the operation.`
          );
          linksToRemove.push(l);
        }
      } else if (l.toPortalId == originalPortal.id) {
        if (l.fromPortalId === newPortal.id) {
          console.log(
            `Operation: Removing link '${l.ID}' while swapping because it would create a link with the same source and target.`
          );
          linksToRemove.push(l);
        } else if (!this.containsLinkFromTo(l.fromPortalId, newPortal.id)) {
          l.toPortalId = newPortal.id;
        } else {
          console.log(
            `Operation: Removing link '{$l.ID}' while swapping because it would duplicate an existing link in the operation.`
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

    //this.opportals = Array.from(this._idToOpportals.values());

    this._swapPortal(originalPortal, newPortal);
    this.update(true);
    this.runCrosslinks();
  }

  addMarker(markerType, portal, comment) {
    if (!portal) return;
    const destructMarkerTypes = [
      window.plugin.wasabee.static.constants.MARKER_TYPE_DECAY,
      window.plugin.wasabee.static.constants.MARKER_TYPE_DESTROY,
      window.plugin.wasabee.static.constants.MARKER_TYPE_VIRUS,
    ];
    if (this.containsMarker(portal, markerType)) {
      alert(wX("ALREADY_HAS_MARKER"));
    } else {
      this.addPortal(portal);
      const marker = new WasabeeMarker(markerType, portal.id, comment);
      this.markers.push(marker);
      this.update(true);

      // only need this for virus/destroy
      if (destructMarkerTypes.includes(markerType)) this.runCrosslinks();
    }
  }

  assignMarker(id, gid) {
    for (const v of this.markers) {
      if (v.ID == id) {
        v.assignedTo = gid;
      }
    }
    this.update(true);
  }

  assignLink(id, gid) {
    for (const v of this.links) {
      if (v.ID == id) {
        v.assignedTo = gid;
      }
    }
    this.update(true);
  }

  clearAllItems() {
    //this.opportals = Array();
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

  // call update to save the op and redraw everything on the map
  update(updateLocalchanged = true) {
    // batchmode skips all this, for bulk adding links/etc
    if (this._batchmode === true) return;

    if (this.fetched) {
      // server op
      if (updateLocalchanged) {
        // caller requested store (default)
        const modeKey = window.plugin.wasabee.static.constants.MODE_KEY;
        const mode = localStorage[modeKey];
        if (mode == "active") {
          if (!WasabeeMe.isLoggedIn()) {
            alert("Not Logged in, disabling active mode");
            localStorage[modeKey] = "design";
            this.localchanged = true;
          } else {
            // active mode
            this._updateOnServer();
          }
        } else {
          // design mode
          this.localchanged = true;
        }
      }
    }

    // even if not server
    this.store();
    window.runHooks("wasabeeUIUpdate", this);
  }

  // only for use by "active" mode
  _updateOnServer() {
    const now = Date.now();
    if (this._AMpushed && now - this._AMpushed < 1000) {
      this._AMpushed = now;
      console.log("skipping active mode push");
      return;
    }

    this._AMpushed = now;
    updateOpPromise(this).then(
      () => {
        console.log("active mode change pushed", new Date().toGMTString());
      },
      (err) => {
        console.log(err);
        alert("Active Mode Update failed: " + err);
      }
    );
  }

  runCrosslinks() {
    if (this._batchmode === true) return;
    window.runHooks("wasabeeCrosslinks", this);
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
    if (!links || links.length == 0) return null;
    const tempLinks = new Array();
    for (const l of links) {
      if (l instanceof WasabeeLink) {
        tempLinks.push(l);
      } else {
        tempLinks.push(WasabeeLink.create(l, this));
      }
    }
    return tempLinks;
  }

  convertBlockersToObjs(links) {
    if (!links || links.length == 0) return null;
    const tempLinks = new Array();
    for (const l of links) {
      if (l instanceof WasabeeLink) {
        tempLinks.push(l);
      } else {
        tempLinks.push(WasabeeLink.create(l, this));
      }
    }
    return tempLinks;
  }

  convertMarkersToObjs(markers) {
    if (!markers || markers.length == 0) return null;
    const tmpMarkers = new Array();
    if (markers) {
      for (const m of markers) {
        if (m instanceof WasabeeMarker) {
          tmpMarkers.push(m);
        } else {
          tmpMarkers.push(WasabeeMarker.create(m));
        }
      }
    }
    return tmpMarkers;
  }

  convertPortalsToObjs(portals) {
    if (!portals || portals.length == 0) return null;
    const tmpPortals = Array();
    for (const p of portals) {
      if (p instanceof WasabeePortal) {
        tmpPortals.push(p);
      } else {
        const np = new WasabeePortal(
          p.id,
          p.name,
          p.lat,
          p.lng,
          p.comment,
          p.hardness
        );
        tmpPortals.push(np);
      }
    }
    return tmpPortals;
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

  IsWritableOp() {
    // not from the server, must be writable
    if (!this.IsServerOp()) return true;
    // if it is a server op and not logged in, assume not writable
    if (!WasabeeMe.isLoggedIn()) return false;
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
          if (t.teamid == m.ID && m.State == "On") return true;
        }
      }
    }

    // not on a write-access team, must not be
    return false;
  }

  IsServerOp() {
    if (this.fetched) return true;
    return false;
  }

  IsOwnedOp() {
    if (!this.IsServerOp()) return true;
    if (!WasabeeMe.isLoggedIn()) return false;

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

  static create(obj) {
    if (typeof obj == "string") {
      try {
        obj = JSON.parse(obj);
      } catch (e) {
        console.log("corrupted operation");
        return null;
      }
    }
    const operation = new WasabeeOp(obj.creator, obj.name);
    if (obj.ID) operation.ID = obj.ID;
    const opportals = operation.convertPortalsToObjs(obj.opportals);
    operation.anchors = obj.anchors ? obj.anchors : Array();
    operation.links = operation.convertLinksToObjs(obj.links);
    operation.markers = operation.convertMarkersToObjs(obj.markers);
    operation.color = obj.color ? obj.color : DEFAULT_OPERATION_COLOR;
    operation.comment = obj.comment ? obj.comment : null;
    operation.teamlist = obj.teamlist ? obj.teamlist : Array();
    operation.fetched = obj.fetched ? obj.fetched : null;
    operation.stored = obj.stored ? obj.stored : null;
    operation.localchanged = obj.localchanged ? obj.localchanged : true;
    operation.blockers = operation.convertBlockersToObjs(obj.blockers);
    operation.keysonhand = obj.keysonhand ? obj.keysonhand : Array();

    //if (!operation.opportals) operation.opportals = new Array();
    if (!operation.links) operation.links = new Array();
    if (!operation.markers) operation.markers = new Array();
    if (!operation.blockers) operation.blockers = new Array();
    // if (!operation.teamlist) operation.teamlist = new Array();
    // if (!operation.keysonhand) operation.keysonhand = new Array()

    if (opportals)
      for (const p of opportals) operation._idToOpportals.set(p.id, p);
    operation.buildCoordsLookupTable();

    operation.cleanAnchorList();
    operation.cleanPortalList();

    // this should not be needed past 0.16
    if (operation.keysonhand.length > 0) {
      for (const k in operation.keysonhand) {
        if (typeof operation.keysonhand[k].onhand == "string") {
          console.log("in migration path for keys at op load");
          operation.keysonhand[k].onhand = Number.parseInt(
            operation.keysonhand[k].onhand,
            10
          );
        }
      }
    }

    return operation;
  }
}
