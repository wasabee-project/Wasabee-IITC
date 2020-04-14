import { showLinksDialog, swapPortal, deletePortal } from "./uiCommands.js";
import AssignDialog from "./dialogs/assignDialog";
import { getSelectedOperation } from "./selectedOp";
import wX from "./wX";

// this class exists to satisfy the interface for the assignment dialog
// allows assigining all links FROM this anchor en mass
export default class WasabeeAnchor {
  constructor(portalId, op) {
    this.ID = portalId;
    this.portalId = portalId;
    this.type = "anchor";
    this.comment = null;
    this.state = null;
    this.assignedTo = null;
    this.order = 0;

    const operation = op ? op : getSelectedOperation();
    this._portal = operation.getPortal(this.ID);
    this.color = operation.color;
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

  static create(portalId) {
    return new WasabeeAnchor(portalId);
  }

  displayFormat(smallScreen = false) {
    return this._portal.displayFormat(smallScreen);
  }

  get latLng() {
    return this._portal.latLng;
  }

  get icon() {
    let lt = window.plugin.wasabee.static.layerTypes.get("main");
    if (window.plugin.wasabee.static.layerTypes.has(this.color)) {
      lt = window.plugin.wasabee.static.layerTypes.get(this.color);
    }
    return lt.portal.iconUrl.default;
  }

  popupContent(marker, operation) {
    marker.className = "wasabee-marker-popup";
    const content = L.DomUtil.create("div", null);
    const title = L.DomUtil.create("div", "desc", content);
    title.innerHTML = this._portal.name;
    const buttonSet = L.DomUtil.create(
      "div",
      "wasabee-marker-buttonset",
      content
    );
    const linksButton = L.DomUtil.create("button", null, buttonSet);
    linksButton.textContent = wX("LINKS");
    L.DomEvent.on(linksButton, "click", ev => {
      L.DomEvent.stop(ev);
      showLinksDialog(operation, this._portal);
      marker.closePopup();
    });
    const swapButton = L.DomUtil.create("button", null, buttonSet);
    swapButton.textContent = wX("SWAP");
    L.DomEvent.on(swapButton, "click", ev => {
      L.DomEvent.stop(ev);
      swapPortal(operation, this._portal);
      marker.closePopup();
    });
    const deleteButton = L.DomUtil.create("button", null, buttonSet);
    deleteButton.textContent = wX("DELETE_ANCHOR");
    L.DomEvent.on(deleteButton, "click", ev => {
      L.DomEvent.stop(ev);
      deletePortal(operation, this._portal);
      marker.closePopup();
    });

    if (operation.IsServerOp()) {
      const assignButton = L.DomUtil.create("button", null, buttonSet);
      assignButton.textContent = wX("ASSIGN OUTBOUND");
      L.DomEvent.on(assignButton, "click", ev => {
        L.DomEvent.stop(ev);
        // XXX why can't I just use "this"? instead of making a new anchor?
        const anchor = new WasabeeAnchor(this.ID);
        const ad = new AssignDialog();
        ad.setup(anchor, operation);
        ad.enable();
        marker.closePopup();
      });
    }

    return content;
  }
}
