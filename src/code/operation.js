import WasabeeLink from "./link";
import WasabeePortal from "./portal";
import WasabeeMarker from "./marker";
import { generateId } from "./auxiliar";
import store from "../lib/store";

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
    this.opportals = Array();
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
  }

  store() {
    this.stored = Date.now();
    store.set(this.ID, JSON.stringify(this));
    this.localchanged = true;
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
    if (this.opportals.length == 0) return false;
    for (const opp of this.opportals) {
      if (opp && opp.id == portal.id) {
        return true;
      }
    }
    return false;
  }

  getPortalByLatLng(lat, lng) {
    for (const portal of this.opportals) {
      if (portal.lat == lat && portal.lng == lng) {
        return portal;
      }
    }
    return false;
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
    const fromPortalId = link.fromPortalId;
    const toPortalId = link.toPortalId;
    return this.containsLinkFromTo(fromPortalId, toPortalId);
  }

  containsMarker(portal, markerType) {
    if (this.markers.length == 0) return false;
    for (const m of this.markers) {
      if (m.portalId == portal.id && m.type == markerType) {
        return true;
      }
    }
    return false;
  }

  getLinkListFromPortal(portal) {
    var links = this.links.filter(function(listLink) {
      return (
        listLink.fromPortalId == portal.id || listLink.toPortalId == portal.id
      );
    });
    return links;
  }

  getPortal(portalID) {
    for (const p of this.opportals) {
      if (p.id == portalID) return p;
    }
    return null;
  }

  removeAnchor(portalId) {
    this.anchors = this.anchors.filter(function(anchor) {
      return anchor !== portalId;
    });
    this.links = this.links.filter(function(listLink) {
      return (
        listLink.fromPortalId !== portalId && listLink.toPortalId !== portalId
      );
    });
    this.cleanAnchorList();
    this.cleanPortalList();
    this.update();
  }

  removeMarker(marker) {
    this.markers = this.markers.filter(function(listMarker) {
      return listMarker.ID !== marker.ID;
    });
    this.cleanPortalList();
    this.update();
  }

  setMarkerComment(marker, comment) {
    for (const v of this.markers) {
      if (v.ID == marker.ID) {
        v.comment = comment;
      }
    }
    this.update();
  }

  setLinkComment(link, comment) {
    for (const v of this.links) {
      if (v.ID == link.ID) {
        v.description = comment;
      }
    }
    this.update();
  }

  //Passed in are the start, end, and portal the link is being removed from(so the other portal can be removed if no more links exist to it)
  removeLink(startPortal, endPortal) {
    var newLinks = [];
    for (const l of this.links) {
      if (!(l.fromPortalId == startPortal && l.toPortalId == endPortal)) {
        newLinks.push(l);
      }
    }
    this.links = newLinks;
    this.cleanPortalList();
    this.cleanAnchorList();
    this.update();
  }

  reverseLink(startPortalID, endPortalID) {
    var newLinks = [];
    for (const l of this.links) {
      if (l.fromPortalId == startPortalID && l.toPortalId == endPortalID) {
        l.fromPortalId = endPortalID;
        l.toPortalId = startPortalID;
      }
      newLinks.push(l);
    }
    this.links = newLinks;
    this.update();
  }

  cleanAnchorList() {
    var newAnchorList = [];
    for (const a of this.anchors) {
      var foundAnchor = false;
      for (const l of this.links) {
        if (l.fromPortalId == a || l.toPortalId == a) {
          foundAnchor = true;
        }
      }

      if (foundAnchor) {
        newAnchorList.push(a);
      }
    }
    this.anchors = newAnchorList;
  }

  //This removes opportals with no links and removes duplicates
  cleanPortalList() {
    var newPortals = [];
    for (const p of this.opportals) {
      let foundPortal = false;
      for (const l of this.links) {
        if (p.id == l.fromPortalId || p.id == l.toPortalId) {
          foundPortal = true;
        }
      }
      for (const m of this.markers) {
        if (p.id == m.portalId) {
          foundPortal = true;
        }
      }
      for (const a of this.anchors) {
        if (p.id == a) {
          foundPortal = true;
        }
      }
      if (foundPortal) {
        newPortals.push(p);
      }
    }

    const finalPortals = [];
    for (const p of newPortals) {
      if (finalPortals.length == 0) {
        finalPortals.push(p);
      } else {
        let foundFinalPortal = false;
        for (const fp of finalPortals) {
          if (p.id == fp.id) {
            foundFinalPortal = true;
          }
        }
        if (!foundFinalPortal) {
          finalPortals.push(p);
        }
      }
    }
    this.opportals = finalPortals;
  }

  addPortal(portal) {
    if (!this.containsPortal(portal)) {
      this.opportals.push(portal);
      this.update();
    }
  }

  // this updates all portal data from IITC (if moved/renamed)
  updatePortalsFromIITCData() {
    for (const p of this.opportals) {
      p.fullUpdate();
    }
  }

  addLink(fromPortal, toPortal, description, order) {
    if (fromPortal.id === toPortal.id) {
      console.log(
        "Operation: Ignoring link where source and target are the same portal."
      );
      return;
    }

    this.addAnchor(fromPortal);
    this.addAnchor(toPortal);

    const link = new WasabeeLink(this, fromPortal.id, toPortal.id, description);
    if (order) link.opOrder = order;
    if (!this.containsLink(link)) {
      this.links.push(link);
      this.update();
    } else {
      console.log(
        "Link Already Exists In Operation -> " + JSON.stringify(link)
      );
    }
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
    if (!this.containsPortal(portal)) {
      this.opportals.push(portal);
    }
    if (!this.containsAnchor(portal.id)) {
      this.anchors.push(portal.id);
      this.update();
    }
  }

  containsBlocker(link) {
    if (this.blockers.length == 0) return false;

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
      // this.update();
    }
  }

  get fakedPortals() {
    const c = this.opportals.filter(p => {
      if (p.name.match("^Loading: .*")) return true;
      return false;
    });
    return c;
  }

  swapPortal(originalPortal, newPortal) {
    this.anchors = this.anchors.filter(function(listAnchor) {
      return listAnchor !== originalPortal.id;
    });
    this.addAnchor(newPortal);
    const linksToRemove = [];
    for (const l of this.links) {
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
            `Operation: Removing link '$l.ID}' while swapping because it would duplicate an existing link in the operation.`
          );
          linksToRemove.push(l);
        }
      }
    }
    // Remove the invalid links from the array (after we are done iterating through it)
    this.links = this.links.filter(element => !linksToRemove.includes(element));
    this.update();
  }

  addMarker(markerType, portal, comment) {
    if (portal) {
      if (!this.containsMarker(portal, markerType)) {
        this.addPortal(portal);
        const marker = new WasabeeMarker(markerType, portal.id, comment);
        this.markers.push(marker);
        this.update();
      } else {
        alert("This portal already has a marker. Chose a different portal.");
      }
    }
  }

  // strictly speaking, this doesn't do anything since the server does it all, but this is for UI changes real-time
  assignMarker(id, gid) {
    for (const v of this.markers) {
      if (v.ID == id) {
        v.assignedTo = gid;
      }
    }
    this.update();
  }

  assignLink(id, gid) {
    for (const v of this.links) {
      if (v.ID == id) {
        v.assignedTo = gid;
      }
    }
    this.update();
  }

  clearAllItems() {
    this.opportals = Array();
    this.anchors = Array();
    this.links = Array();
    this.markers = Array();
    this.update();
  }

  // call update to save the op and redraw everything on the map
  update() {
    this.store();
    window.runHooks("wasabeeUIUpdate", this);
  }

  convertLinksToObjs(links) {
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
    const tmpMarkers = new Array();
    for (const m of markers) {
      if (m instanceof WasabeeMarker) {
        tmpMarkers.push(m);
      } else {
        tmpMarkers.push(WasabeeMarker.create(m));
      }
    }
    return tmpMarkers;
  }

  convertPortalsToObjs(portals) {
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
  mbr() {
    const lats = [];
    const lngs = [];
    for (const a of this.opportals) {
      lats.push(a.lat);
      lngs.push(a.lng);
    }
    const minlat = Math.min.apply(null, lats);
    const maxlat = Math.max.apply(null, lats);
    const minlng = Math.min.apply(null, lngs);
    const maxlng = Math.max.apply(null, lngs);
    const min = L.latLng(minlat, minlng);
    const max = L.latLng(maxlat, maxlng);
    const bounds = L.latLngBounds(min, max);
    return bounds;
  }

  IsWritableOp(me) {
    if (me == null) {
      return false;
    }

    if (me.GoogleID == this.creator) {
      return true;
    }

    if (me.Teams == undefined) {
      return false;
    }

    for (const t of this.teamlist) {
      if (t.role == "write" && me.Teams.includes(t.ID)) {
        return true;
      }
    }
    return false;
  }

  IsServerOp() {
    if (this.teamlist.length != 0) {
      return true;
    }
    return false;
  }

  IsOwnedOp(me) {
    if (me == null) {
      return false;
    }
    if (me.GoogleID == this.creator) {
      return true;
    }
    return false;
  }

  static create(obj) {
    if (typeof obj == "string") {
      obj = JSON.parse(obj);
    }
    const operation = new WasabeeOp();
    for (var prop in obj) {
      if (operation.hasOwnProperty(prop)) {
        if (prop == "links") {
          operation[prop] = operation.convertLinksToObjs(obj[prop]);
        } else if (prop == "markers") {
          operation[prop] = operation.convertMarkersToObjs(obj[prop]);
        } else if (prop == "opportals") {
          operation[prop] = operation.convertPortalsToObjs(obj[prop]);
        } else if (prop == "opportals") {
          operation[prop] = operation.convertBlockersToObjs(obj[prop]);
        } else {
          operation[prop] = obj[prop];
        }
      }
    }
    return operation;
  }
}
