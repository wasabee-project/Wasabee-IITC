import { generateId } from "./auxiliar";

export default class WasabeeMarker {
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

  get opOrder() {
    return this.order;
  }

  set opOrder(o) {
    this.order = Number.parseInt(o, 10);
  }

  static create(obj) {
    if (obj instanceof WasabeeMarker) {
      console.log("do not call Marker.create() on a Marker");
      console.log(new Error().stack);
      return obj;
    }

    const marker = new WasabeeMarker();
    for (var prop in obj) {
      if (marker.hasOwnProperty(prop)) {
        marker[prop] = obj[prop];
      }
    }
    return marker;
  }
}
