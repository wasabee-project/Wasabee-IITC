import { generateId } from "./auxiliar";

export default class Marker {
  constructor(type, portalId, comment) {
    this.ID = generateId();
    this.portalId = portalId;
    this.type = type;
    this.comment = comment;
    this.state = "pending";
    this.completedBy = ""; // should be GID, requires change on the server
    this.assignedTo = "";
    this.order = 0;
  }

  static create(obj) {
    if (obj instanceof Marker) {
      console.log("do not call Marker.create() on a Marker");
      console.log(new Error().stack);
      return obj;
    }

    const marker = new Marker();
    for (var prop in obj) {
      if (marker.hasOwnProperty(prop)) {
        marker[prop] = obj[prop];
      }
    }
    return marker;
  }
}
