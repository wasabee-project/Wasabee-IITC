import { swapPortal, deletePortal } from "./uiCommands";
import { getSelectedOperation } from "./selectedOp";
import AssignDialog from "./dialogs/assignDialog";
import SendTargetDialog from "./dialogs/sendTargetDialog";
import SetCommentDialog from "./dialogs/setCommentDialog";
import LinkListDialog from "./dialogs/linkListDialog";
import wX from "./wX";

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

  displayFormat(smallScreen = false) {
    return this._portal.displayFormat(smallScreen);
  }

  get latLng() {
    return this._portal.latLng;
  }

  popupContent(marker) {
    // just log for now, if we see it, then we can figure out what is really going on
    const operation = getSelectedOperation();
    if (operation == null) {
      console.log("null op for anchor?");
    }
    if (this._opID != operation.ID) {
      console.log("anchor opID != selected opID");
    }

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
      const scd = new SetCommentDialog({
        target: this._portal,
        operation: operation,
      });
      scd.enable();
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
        const scd = new SetCommentDialog({
          target: this._portal,
          operation: operation,
        });
        scd.enable();
        marker.closePopup();
      });
    }

    const requiredKeys = L.DomUtil.create("div", "desc", content);
    const onHand = operation.KeysOnHandForPortal(this._portal.id);
    const required = operation.KeysRequiredForPortal(this._portal.id);
    requiredKeys.textContent = "Keys: " + onHand + " / " + required;

    const buttonSet = L.DomUtil.create(
      "div",
      "wasabee-marker-buttonset",
      content
    );
    const linksButton = L.DomUtil.create("button", null, buttonSet);
    linksButton.textContent = wX("LINKS");
    L.DomEvent.on(linksButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      const lld = new LinkListDialog({ portal: this._portal });
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
      // use intent on android
      if (
        typeof window.android !== "undefined" &&
        window.android &&
        window.android.intentPosLink
      ) {
        window.android.intentPosLink(
          +this._portal.lat,
          +this._portal.lng,
          window.map.getZoom(),
          this.name,
          true
        );
      } else {
        window.open(
          "https://www.google.com/maps/search/?api=1&query=" +
            this._portal.lat +
            "," +
            this._portal.lng
        );
      }
    });

    if (operation.IsServerOp()) {
      if (operation.IsWritableOp()) {
        const assignButton = L.DomUtil.create("button", null, buttonSet);
        assignButton.textContent = wX("ASSIGN OUTBOUND");
        L.DomEvent.on(assignButton, "click", (ev) => {
          L.DomEvent.stop(ev);
          const ad = new AssignDialog({ target: this });
          ad.enable();
          marker.closePopup();
        });
      }

      if (operation.IsOnCurrentServer()) {
        const sendButton = L.DomUtil.create("button", null, buttonSet);
        sendButton.textContent = wX("SEND TARGET");
        L.DomEvent.on(sendButton, "click", (ev) => {
          L.DomEvent.stop(ev);
          const std = new SendTargetDialog({ target: this });
          std.enable();
          marker.closePopup();
        });
      }
    }

    return content;
  }
}
