import { generateId } from "../auxiliar";

const markers = {
  MARKER_TYPE_CAPTURE: "CapturePortalMarker",
  MARKER_TYPE_DECAY: "LetDecayPortalAlert",
  MARKER_TYPE_EXCLUDE: "ExcludeMarker",
  MARKER_TYPE_DESTROY: "DestroyPortalAlert",
  MARKER_TYPE_FARM: "FarmPortalMarker",
  MARKER_TYPE_GOTO: "GotoPortalMarker",
  MARKER_TYPE_KEY: "GetKeyPortalMarker",
  MARKER_TYPE_LINK: "CreateLinkAlert",
  MARKER_TYPE_MEETAGENT: "MeetAgentPortalMarker",
  MARKER_TYPE_OTHER: "OtherPortalAlert",
  MARKER_TYPE_RECHARGE: "RechargePortalAlert",
  MARKER_TYPE_UPGRADE: "UpgradePortalAlert",
  MARKER_TYPE_VIRUS: "UseVirusPortalAlert",
};

const markerTypes = new Set(Object.values(markers));

const STATE_UNASSIGNED = "pending";
const STATE_ASSIGNED = "assigned";
const STATE_ACKNOWLEDGED = "acknowledged";
const STATE_COMPLETED = "completed";

export default class WasabeeMarker {
  // static properties is not supported by eslint yet
  static get markerTypes() {
    return markerTypes;
  }

  static get constants() {
    return markers;
  }

  constructor(obj) {
    this.ID = obj.ID ? obj.ID : generateId();
    this.portalId = obj.portalId;
    this.type = obj.type;
    this.comment = obj.comment ? obj.comment : ""; // why "" and not null? This isn't go
    this.completedID = obj.completedID ? obj.completedID : "";
    this.order = obj.order ? Number(obj.order) : 0;
    this.zone = obj.zone ? Number(obj.zone) : 1;

    this.assign(obj.assignedTo); // WAS this.assignedTo = obj.assignedTo ? obj.assignedTo : "";
    // if ._state then it came from indexeddb, otherwise from server/localStorage
    if (obj._state) {
      this.state = obj._state;
    } else this.state = obj.state ? obj.state : null;
  }

  // not called when pushing to indexeddb, but used when sending to server
  toJSON() {
    return {
      ID: this.ID,
      portalId: this.portalId,
      type: this.type,
      comment: this.comment,
      state: this._state, // no need to validate here
      completedID: this.completedID,
      assignedTo: this.assignedTo,
      order: Number(this.order),
      zone: Number(this.zone),
    };
  }

  get opOrder() {
    return this.order;
  }

  set opOrder(o) {
    this.order = Number.parseInt(o, 10);
  }

  assign(gid) {
    if (!gid || gid == "") {
      this._state = STATE_UNASSIGNED;
      this.assignedTo = "";
      return;
    }

    this.assignedTo = gid;
    this._state = STATE_ASSIGNED;
    return;
  }

  set state(state) {
    switch (state) {
      case STATE_UNASSIGNED:
        this.assignedTo = null;
        this._state = STATE_UNASSIGNED;
        break;
      case STATE_ASSIGNED: // fall-through
      case STATE_ACKNOWLEDGED:
        if (!this.assignedTo || this.assignedTo == "") {
          this._state = STATE_UNASSIGNED;
          break;
        }
        this._state = state;
        break;
      case STATE_COMPLETED:
        this._state = STATE_COMPLETED;
        break;
      default:
        this._state = STATE_UNASSIGNED;
        break;
    }
  }

  get state() {
    return this._state;
  }
}
