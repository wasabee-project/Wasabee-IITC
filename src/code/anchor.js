import { swapPortal, deletePortal } from "./uiCommands.js";
import AssignDialog from "./dialogs/assignDialog";
import SendTargetDialog from "./dialogs/sendTargetDialog";
import { getSelectedOperation } from "./selectedOp";
import wX from "./wX";
import SetCommentDialog from "./dialogs/setCommentDialog";
import LinkListDialog from "./dialogs/linkListDialog";

// this class is for the popups, and for assign menu
export default class WasabeeAnchor {
  constructor(portalId, op = getSelectedOperation()) {
    this.ID = portalId;
    this.portalId = portalId;
    this.type = "anchor";
    this.comment = null;
    this.state = null;
    this.assignedTo = null;
    this.order = 0;

    this._operation = op;
    this._portal = op.getPortal(this.ID);
    this.color = op.color;
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

  displayFormat(smallScreen = false) {
    return this._portal.displayFormat(smallScreen);
  }

  get latLng() {
    return this._portal.latLng;
  }

  get icon() {
    let lt = window.plugin.wasabee.skin.layerTypes.get("main");
    if (window.plugin.wasabee.skin.layerTypes.has(this.color)) {
      lt = window.plugin.wasabee.skin.layerTypes.get(this.color);
    }
    return lt.portal.iconUrl.default;
  }

  popupContent(marker, operation) {
    marker.className = "wasabee-anchor-popup";
    const content = L.DomUtil.create("div", null);
    const title = L.DomUtil.create("div", "desc", content);
    title.appendChild(this._portal.displayFormat());
    const portalComment = L.DomUtil.create(
      "div",
      "wasabee-portal-comment",
      content
    );
    const pcLink = L.DomUtil.create("a", null, portalComment);
    pcLink.textContent = this._portal.comment || wX("SET_PORTAL_COMMENT");
    pcLink.href = "#";
    L.DomEvent.on(pcLink, "click", (ev) => {
      L.DomEvent.stop(ev);
      const cd = new SetCommentDialog();
      cd.setup(this._portal, this._operation);
      cd.enable();
      marker.closePopup();
    });
    if (this._portal.hardness) {
      const portalHardness = L.DomUtil.create(
        "div",
        "wasabee-portal-hardness",
        content
      );
      const phLink = L.DomUtil.create("a", null, portalHardness);
      phLink.textContent = this._portal.hardness;
      phLink.href = "#";
      L.DomEvent.on(phLink, "click", (ev) => {
        L.DomEvent.stop(ev);
        const cd = new SetCommentDialog();
        cd.setup(this._portal, this._operation);
        cd.enable();
        marker.closePopup();
      });
    }
    const buttonSet = L.DomUtil.create(
      "div",
      "wasabee-marker-buttonset",
      content
    );
    const linksButton = L.DomUtil.create("button", null, buttonSet);
    linksButton.textContent = wX("LINKS");
    L.DomEvent.on(linksButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      const lld = new LinkListDialog();
      lld.setup(operation, this._portal);
      lld.enable();
      marker.closePopup();
    });
    const swapButton = L.DomUtil.create("button", null, buttonSet);
    swapButton.textContent = wX("SWAP");
    L.DomEvent.on(swapButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      swapPortal(operation, this._portal);
      marker.closePopup();
    });
    const deleteButton = L.DomUtil.create("button", null, buttonSet);
    deleteButton.textContent = wX("DELETE_ANCHOR");
    L.DomEvent.on(deleteButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      deletePortal(operation, this._portal);
      marker.closePopup();
    });

    const gmapButton = L.DomUtil.create("button", null, buttonSet);
    gmapButton.textContent = wX("ANCHOR_GMAP");
    L.DomEvent.on(gmapButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      marker.closePopup();
      window.open(
        "https://www.google.com/maps/search/?api=1&query=" +
          this._portal.lat +
          "," +
          this._portal.lng
      );
    });

    if (operation.IsServerOp()) {
      const assignButton = L.DomUtil.create("button", null, buttonSet);
      assignButton.textContent = wX("ASSIGN OUTBOUND");
      L.DomEvent.on(assignButton, "click", (ev) => {
        L.DomEvent.stop(ev);
        // XXX why can't I just use "this"? instead of making a new anchor?
        const anchor = new WasabeeAnchor(this.ID);
        const ad = new AssignDialog();
        ad.setup(anchor, operation);
        ad.enable();
        marker.closePopup();
      });

      // needs wX
      const sendButton = L.DomUtil.create("button", null, buttonSet);
      sendButton.textContent = wX("SEND TARGET");
      L.DomEvent.on(sendButton, "click", (ev) => {
        L.DomEvent.stop(ev);
        const std = new SendTargetDialog();
        std.setup(this, operation);
        std.enable();
        marker.closePopup();
      });
    }

    return content;
  }
}
