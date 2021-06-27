import { generateId } from "../auxiliar";
import { getSelectedOperation } from "../selectedOp";

export default class WasabeeLink {
  constructor(obj) {
    this.ID = obj.ID ? obj.ID : generateId();
    this.fromPortalId = obj.fromPortalId;
    this.toPortalId = obj.toPortalId;
    this.description = obj.description ? obj.description : null;
    this.assignedTo = obj.assignedTo ? obj.assignedTo : "";
    this.throwOrderPos = obj.throwOrderPos ? Number(obj.throwOrderPos) : 0;
    this.color = obj.color ? obj.color : "main";
    this.completed = obj.completed ? !!obj.completed : false;
    this.zone = obj.zone ? Number(obj.zone) : 1;
  }

  // build object to serialize
  toJSON() {
    return {
      ID: this.ID,
      fromPortalId: this.fromPortalId,
      toPortalId: this.toPortalId,
      description: this.description,
      assignedTo: this.assignedTo,
      throwOrderPos: Number(this.throwOrderPos),
      color: this.color,
      completed: !!this.completed, // !! forces a boolean value
      zone: Number(this.zone),
    };
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
  get opOrder() {
    return this.throwOrderPos;
  }

  set opOrder(o) {
    this.throwOrderPos = Number.parseInt(o, 10);
  }

  // make the interface match (kinda) what markers do
  // 'pending','assigned','acknowledged','completed'
  // THESE ARE INTERNAL VALUES AND SHOULD NOT BE wX'd!!!
  get state() {
    if (this.completed) return "completed";
    if (this.assignedTo) return "assigned";
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
    if (!operation) operation = getSelectedOperation();

    const returnArray = Array();

    const fromPortal = operation.getPortal(this.fromPortalId);
    if (!fromPortal || !fromPortal.lat) {
      console.log("unable to get source portal");
      return null;
    }
    returnArray.push(fromPortal.latLng);

    const toPortal = operation.getPortal(this.toPortalId);
    if (!toPortal || !toPortal.lat) {
      console.log("unable to get destination portal");
      return null;
    }
    returnArray.push(toPortal.latLng);

    return returnArray;
  }

  get latLngs() {
    return this.getLatLngs(getSelectedOperation());
  }

  setColor(color, operation) {
    this.color = color;
    if (this.color == operation.color) this.color = "main";
    operation.update();
  }

  getColor(operation) {
    let color = this.color;
    if (color == "main") color = operation.color;
    return color;
  }

  length(operation) {
    const latlngs = this.getLatLngs(operation);
    return L.latLng(latlngs[0]).distanceTo(latlngs[1]);
  }
}
