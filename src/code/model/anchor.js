import { getSelectedOperation } from "../selectedOp";

// this class is for the popups, and for assign menu
export default class WasabeeAnchor {
  constructor(portalId) {
    const op = getSelectedOperation();
    this.ID = portalId;
    this.portalId = portalId;
    this.type = "anchor";
    this.comment = null;
    this.state = null;
    this.assignedTo = null;
    this.order = 0;

    this._portal = op.getPortal(this.ID);
    this.color = op.color;
    this._opID = op.ID;
  }

  // currently unused
  toJSON() {
    return {
      ID: this.ID,
      portalId: this.portalId,
      type: this.type,
      comment: this.coment,
      state: this.state,
      assignedTo: this.assignedTo,
      order: this.order,
      color: this.color,
    };
  }

  // pointless, since these are never pushed to the server
  set opOrder(o) {
    this.order = Number.parseInt(o, 10);
  }

  get opOrder() {
    return this.order;
  }

  get name() {
    return this._portal.name;
  }

  get latLng() {
    return this._portal.latLng;
  }
}
