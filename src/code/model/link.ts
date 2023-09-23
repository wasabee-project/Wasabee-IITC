import type WasabeeOp from "./operation";
import type { WLatLng } from "./portal";

import Task from "./task";

function fromServer(obj: any) {
  // convert link task
  obj.order = +obj.throwOrderPos || 0;
  obj.state = "pending";
  obj.completedID = obj.completed ? obj.assignedTo : null;
  if (obj.completedID) obj.state = "completed";
  else if (obj.assignedTo) obj.state = "assigned";
  if (obj.description) obj.comment = obj.description;
  return obj;
}

export default class WasabeeLink extends Task {
  fromPortalId: PortalID;
  toPortalId: PortalID;
  color: string;

  selfBlocked?: boolean;
  blocked?: boolean;

  constructor(obj: any) {
    if (obj.throwOrderPos !== undefined) {
      obj = fromServer(obj);
    }
    super(obj);
    this.fromPortalId = obj.fromPortalId;
    this.toPortalId = obj.toPortalId;
    this.color = obj.color ? obj.color : "main";

    this.selfBlocked = obj.selfBlocked;
    this.blocked = obj.blocked;
  }

  // build object to serialize
  toJSON() {
    return {
      ...super.toJSON(),

      fromPortalId: this.fromPortalId,
      toPortalId: this.toPortalId,
      color: this.color,
    };
  }

  // kludge to make the interface work
  get portalId() {
    return this.fromPortalId;
  }

  getLatLngs(operation: WasabeeOp) {
    const returnArray: WLatLng[] = [];

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

  setColor(color: string, operation: WasabeeOp) {
    this.color = color;
    if (this.color == operation.color) this.color = "main";
    operation.update();
  }

  getColor(operation: WasabeeOp) {
    let color = this.color;
    if (color == "main") color = operation.color;
    return color;
  }

  length(operation: WasabeeOp) {
    const latlngs = this.getLatLngs(operation);
    return L.latLng(latlngs[0]).distanceTo(latlngs[1]);
  }
}
