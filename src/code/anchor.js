// this class exists to satisfy the interface for the assignment dialog
// allows assigining all links FROM this anchor en mass
export default class WasabeeAnchor {
  constructor(portalId) {
    this.ID = portalId;
    this.portalId = portalId;
    this.type = "anchor";
    this.comment = null;
    this.state = null;
    this.assignedTo = null;
    this.order = 0;
  }

  static create(portalId) {
    return new WasabeeAnchor(portalId);
  }
}
