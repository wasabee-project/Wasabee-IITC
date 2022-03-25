import { generateId } from "../auxiliar";

export type TaskState = "pending" | "assigned" | "acknowledged" | "completed";

const States: TaskState[] = ["pending" , "assigned" , "acknowledged" , "completed"];

export function sanitizeState(v: string): TaskState {
  return States.find((s) => s === v) || "pending"
}

export default class Task {
  ID: TaskID;
  order: number;
  zone: ZoneID;
  assignedTo?: GoogleID;
  comment?: string;
  dependsOn?: TaskID[];
  deltaminutes?: number;

  _state: TaskState;

  constructor(obj: any) {
    this.ID = obj.ID || generateId();
    this.zone = +obj.zone || 1;
    this.order = +obj.order || 0;
    // to be replaced by .assignments
    this.assignedTo = obj.assignedTo ? obj.assignedTo : null;
    this.comment = obj.comment ? obj.comment : "";
    this.state = obj._state || obj.state;
    // need UI
    this.deltaminutes = obj.deltaminutes;

    // future compatibility
    this.dependsOn = obj.dependsOn || [];

    // for raw task
    if (!this.assignedTo && obj.assignments && obj.assignments.length > 0)
      this.assignedTo = obj.assignments[0];
  }

  toServer() {
    return this.toJSON();
  }

  toJSON(): any {
    return {
      ID: this.ID,
      zone: Number(this.zone),
      order: Number(this.order),
      assignedTo: this.assignedTo,
      state: this._state,
      comment: this.comment,
      // preserve data
      deltaminutes: this.deltaminutes,
      dependsOn: this.dependsOn,
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
    if (gid !== this.assignedTo) {
      this._state = gid ? "assigned" : "pending";
    }
    this.assignedTo = gid ? gid : null;
  }

  complete(gid?: GoogleID) {
    this._state = "completed";
  }

  get completed() {
    return this._state == "completed";
  }

  set completed(v) {
    if (v) this.complete();
    else {
      this.state = "assigned";
    }
  }
}
