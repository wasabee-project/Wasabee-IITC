const markdown = require("markdown").markdown;
import UiCommands from "./uiCommands.js";
import AssignDialog from "./dialogs/assignDialog";

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
    const operation = window.plugin.wasabee.getSelectedOperation();
    this._portal = operation.getPortal(this.ID);
  }

  // pointless, since these are never pushed to the server
  set opOrder(o) {
    this.order = Number.parseInt(o, 10);
  }

  get opOrder() {
    return this.order;
  }

  static create(portalId) {
    return new WasabeeAnchor(portalId);
  }

  displayFormat(operation) {
    return this._portal.displayFormat(operation);
  }

  get latLng() {
    return new L.LatLng(this._portal.lat, this._portal.lng);
  }

  get icon() {
    const operation = window.plugin.wasabee.getSelectedOperation();
    const colorGroup = operation.color;
    let lt = window.plugin.wasabee.layerTypes.get("main");
    if (window.plugin.wasabee.layerTypes.has(colorGroup)) {
      lt = window.plugin.wasabee.layerTypes.get(colorGroup);
    }
    if (lt.portal.iconUrl) {
      return lt.portal.iconUrl;
    } else {
      return window.plugin.wasabee.static.images.marker_layer_groupa;
    }
  }

  popupContent(marker, operation) {
    marker.className = "wasabee-dialog wasabee-dialog-ops";
    const content = document.createElement("div");
    const title = content.appendChild(document.createElement("div"));
    title.className = "desc";
    title.innerHTML = markdown.toHTML(this._portal.name);
    const buttonSet = content.appendChild(document.createElement("div"));
    buttonSet.className = "temp-op-dialog";
    const linksButton = buttonSet.appendChild(document.createElement("a"));
    linksButton.textContent = "Links";
    linksButton.addEventListener(
      "click",
      () => {
        UiCommands.showLinksDialog(operation, this._portal);
        marker.closePopup();
      },
      false
    );
    var swapButton = buttonSet.appendChild(document.createElement("a"));
    swapButton.textContent = "Swap";
    swapButton.addEventListener(
      "click",
      () => {
        UiCommands.swapPortal(operation, this._portal);
        marker.closePopup();
      },
      false
    );
    var deleteButton = buttonSet.appendChild(document.createElement("a"));
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener(
      "click",
      () => {
        UiCommands.deletePortal(operation, this._portal);
        marker.closePopup();
      },
      false
    );

    if (operation.IsServerOp()) {
      const assignButton = buttonSet.appendChild(document.createElement("a"));
      assignButton.textContent = "Assign Outbound Links";
      assignButton.addEventListener(
        "click",
        () => {
          const anchor = new WasabeeAnchor(this.ID);
          new AssignDialog(anchor, operation);
          marker.closePopup();
        },
        false
      );
    }

    return content;
  }
}
