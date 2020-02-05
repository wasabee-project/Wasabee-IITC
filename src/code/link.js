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
    // this.populatePortals(operation);
    this.color = "main";
  }

  /* 
  populatePortals(operation) {
    this.fromPortal = operation.getPortal(this.fromPortalId);
    this.toPortal = operation.getPortal(this.toPortalId);
  } */

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

  getLinkDisplay(operation) {
    const d = document.createElement("div");
    d.appendChild(operation.getPortal(this.fromPortalId).getPortalLink());
    const arrow = d.appendChild(document.createElement("span"));
    arrow.innerHTML = " ➾ ";
    arrow.style.color = this.getColorHex();
    d.appendChild(operation.getPortal(this.toPortalId).getPortalLink());
    return d;
  }

  getColorHex() {
    if (window.plugin.Wasabee.layerTypes.has(this.color)) {
      const c = window.plugin.Wasabee.layerTypes.get(this.color);
      return c.color;
    }
    return "#333333";
  }
}
