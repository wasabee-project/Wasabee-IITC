import { generateId } from "./auxiliar";

export default class WasabeeLink {
  //ID <- randomly generated alpha-numeric ID for the link
  //fromPortal <- portal the link is from
  //toPortal <- portal the link is to
  //description <- user entered description of link
  constructor(operation, fromPortalId, toPortalId, description) {
    this.ID = generateId();
    this.fromPortalId = fromPortalId;
    this.toPortalId = toPortalId;
    this.description = description;
    this.assignedTo = null;
    this.throwOrderPos = null;
    this.color = "main";
    this.completed = false;
  }

  // for interface consistency, the other types use comment
  // we can't rename them here w/o making the corresponding changes on the server
  get comment() {
    return this.description;
  }

  set comment(c) {
    this.description = c;
  }

  // for interface consistency, other types use order
  get order() {
    return this.throwOrderPos;
  }

  set order(o) {
    this.throwOrderPos = o;
  }

  // make the interface match (kinda) what markers do
  // 'pending','assigned','acknowledged','completed'
  get state() {
    if (this.completed) {
      return "completed";
    }
    if (this.assignedTo) {
      return "assigned";
    }
    return "pending";
  }

  set state(s) {
    if (s == "completed") {
      this.completed = true;
    } else {
      this.completed = false;
    }
  }

  // kludge to make the interface work
  get portalId() {
    return this.fromPortalId;
  }

  getLatLngs(operation) {
    const fromPortal = operation.getPortal(this.fromPortalId);
    const toPortal = operation.getPortal(this.toPortalId);
    if (fromPortal != null && toPortal != null) {
      const returnArray = Array();
      returnArray.push(new L.LatLng(fromPortal.lat, fromPortal.lng));
      returnArray.push(new L.LatLng(toPortal.lat, toPortal.lng));
      return returnArray;
    } else {
      return null;
    }
  }

  static create(obj, operation) {
    const link = new WasabeeLink(operation);
    for (var prop in obj) {
      if (link.hasOwnProperty(prop)) {
        link[prop] = obj[prop];
      }
    }
    return link;
  }

  // returns a DOM object appropriate for display
  displayFormat(operation) {
    const d = document.createElement("div");
    d.appendChild(
      operation.getPortal(this.fromPortalId).displayFormat(operation)
    );
    const arrow = d.appendChild(document.createElement("span"));
    arrow.innerHTML = " ➾ ";
    arrow.style.color = this.getColorHex();
    d.appendChild(
      operation.getPortal(this.toPortalId).displayFormat(operation)
    );
    return d;
  }

  getColorHex() {
    if (window.plugin.Wasabee.layerTypes.has(this.color)) {
      const c = window.plugin.Wasabee.layerTypes.get(this.color);
      return c.color;
    }
    return "#333333";
  }

  length(operation) {
    const latlngs = this.getLatLngs(operation);
    return L.latLng(latlngs[0]).distanceTo(latlngs[1]);
  }
}
