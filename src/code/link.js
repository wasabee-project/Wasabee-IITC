// import Operation from "./operation";
import { generateId } from "./auxiliar";

export default class Link {
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
    this.populatePortals(operation);
  }

  populatePortals(operation) {
    this.fromPortal = operation.getPortal(this.fromPortalId);
    this.toPortal = operation.getPortal(this.toPortalId);
  }

  getLatLngs(operation) {
    var fromPortal = operation.getPortal(this.fromPortalId);
    var toPortal = operation.getPortal(this.toPortalId);
    if (fromPortal != null && toPortal != null) {
      var returnArray = Array();
      returnArray.push(new L.LatLng(fromPortal.lat, fromPortal.lng));
      returnArray.push(new L.LatLng(toPortal.lat, toPortal.lng));
      return returnArray;
    } else {
      return null;
    }
  }

  static create(obj, operation) {
    var link = new Link(operation);
    for (var prop in obj) {
      if (link.hasOwnProperty(prop)) {
        link[prop] = obj[prop];
      }
    }
    return link;
  }
}
