import { generateId } from "../auxiliar";

export type TaskState = "pending" | "assigned" | "acknowledged" | "completed";

export default class Task {
  ID: TaskID;
  order: number;
  zone: ZoneID;
  assignedTo?: GoogleID;
  completedID?: GoogleID;
  comment?: string;

  _state: TaskState;

  constructor(obj: any) {
    this.ID = obj.ID || generateId();
    this.zone = +obj.zone || 1;
    this.order = +obj.order || 0;
    this.assignedTo = obj.assignedTo ? obj.assignedTo : null;
    this.completedID = obj.completedID ? obj.completedID : null;
    this.comment = obj.comment ? obj.comment : "";
    this.state = obj._state || obj.state;
  }

  toServer() {
    return this.toJSON();
  }

  toJSON(): any {
    return {
      ID: this.ID,
      zone: Number(this.zone),
      order: Number(this.order),
      completedID: this.completedID,
      assignedTo: this.assignedTo,
      state: this._state,
    };
  }

  get state() {
    return this._state;
  }

  set state(state: TaskState) {
    switch (state) {
      case "assigned": // fall-through
      case "acknowledged":
        if (!this.assignedTo || this.assignedTo == "") {
          this._state = "pending";
          break;
        }
        this._state = state;
        break;
      case "completed":
        this.complete();
        break;
      case "pending":
      default:
        this.assignedTo = null;
        this._state = "pending";
        break;
    }
  }

  setOrder(o: number | string) {
    this.order = +o || 0;
  }

  assign(gid?: GoogleID) {
    if (gid !== this.assignedTo) this._state = gid ? "assigned" : "pending";
    this.assignedTo = gid ? gid : null;
  }

  complete(gid?: GoogleID) {
    if (!this.completedID || gid)
      this.completedID = gid ? gid : this.assignedTo;
    this._state = "completed";
  }

  get completed() {
    return this._state == "completed";
  }

  set completed(v) {
    if (v) this.complete();
    else {
      delete this.completedID;
      this.state = "assigned";
    }
  }
}
