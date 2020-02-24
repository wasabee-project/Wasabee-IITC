const markdown = require("markdown").markdown;
import UiCommands from "./uiCommands.js";
import AssignDialog from "./dialogs/assignDialog";
import { getSelectedOperation } from "./selectedOp";

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

    const operation = getSelectedOperation();
    this._portal = operation.getPortal(this.ID);
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

  displayFormat(operation) {
    return this._portal.displayFormat(operation);
  }

  get latLng() {
    return this._portal.latLng;
  }

  get icon() {
    const operation = getSelectedOperation();
    const colorGroup = operation.color;
    let lt = window.plugin.wasabee.static.layerTypes.get("main");
    if (window.plugin.wasabee.static.layerTypes.has(colorGroup)) {
      lt = window.plugin.wasabee.static.layerTypes.get(colorGroup);
    }
    if (lt.portal.iconUrl) {
      return lt.portal.iconUrl;
    } else {
      return window.plugin.wasabee.static.images.marker_layer_groupa;
    }
  }

  popupContent(marker, operation) {
    marker.className = "wasabee-dialog wasabee-dialog-ops";
    const content = L.DomUtil.create("div", "");
    const title = L.DomUtil.create("div", "desc", content);
    title.innerHTML = markdown.toHTML(this._portal.name);
    const buttonSet = L.DomUtil.create("div", "temp-op-dialog", content);
    const linksButton = L.DomUtil.create("a", "", buttonSet);
    linksButton.textContent = "Links";
    L.DomEvent.on(linksButton, "click", () => {
      UiCommands.showLinksDialog(operation, this._portal);
      marker.closePopup();
    });
    const swapButton = L.DomUtil.create("a", "", buttonSet);
    swapButton.textContent = "Swap";
    L.DomEvent.on(swapButton, "click", () => {
      UiCommands.swapPortal(operation, this._portal);
      marker.closePopup();
    });
    const deleteButton = L.DomUtil.create("a", "", buttonSet);
    deleteButton.textContent = "Delete";
    L.DomEvent.on(deleteButton, "click", () => {
      UiCommands.deletePortal(operation, this._portal);
      marker.closePopup();
    });

    if (operation.IsServerOp()) {
      const assignButton = L.DomUtil.create("a", "", buttonSet);
      assignButton.textContent = "Assign Outbound Links";
      L.DomEvent.on(assignButton, "click", () => {
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
