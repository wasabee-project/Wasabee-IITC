import AssignDialog from "../dialogs/assignDialog";
import SendTargetDialog from "../dialogs/sendTargetDialog";
import SetCommentDialog from "../dialogs/setCommentDialog";
import LinkListDialog from "../dialogs/linkListDialog";
import { getSelectedOperation } from "../selectedOp";
import { swapPortal, deletePortal } from "../uiCommands";
import wX from "../wX";

import PortalUI from "./portal";

export default {
  popupContent,
};

function popupContent(anchor, leafletMarker) {
  const operation = getSelectedOperation();
  const canWrite = operation.canWrite();
  const portal = operation.getPortal(anchor.ID);

  leafletMarker.className = "wasabee-anchor-popup";
  const content = L.DomUtil.create("div", null);
  const title = L.DomUtil.create("div", "desc", content);
  title.appendChild(PortalUI.displayFormat(portal));
  const portalComment = L.DomUtil.create(
    "div",
    "wasabee-portal-comment",
    content
  );
  const pcLink = L.DomUtil.create("a", null, portalComment);
  pcLink.textContent = portal.comment || wX("SET_PORTAL_COMMENT");
  if (canWrite) {
    pcLink.href = "#";
    L.DomEvent.on(pcLink, "click", (ev) => {
      L.DomEvent.stop(ev);
      const scd = new SetCommentDialog({
        target: portal,
        operation: operation,
      });
      scd.enable();
      leafletMarker.closePopup();
    });
  }
  if (portal.hardness) {
    const portalHardness = L.DomUtil.create(
      "div",
      "wasabee-portal-hardness",
      content
    );
    const phLink = L.DomUtil.create("a", null, portalHardness);
    phLink.textContent = portal.hardness;
    if (canWrite) {
      phLink.href = "#";
      L.DomEvent.on(phLink, "click", (ev) => {
        L.DomEvent.stop(ev);
        const scd = new SetCommentDialog({
          target: portal,
          operation: operation,
        });
        scd.enable();
        leafletMarker.closePopup();
      });
    }
  }

  const requiredKeys = L.DomUtil.create("div", "desc", content);
  const onHand = operation.KeysOnHandForPortal(portal.id);
  const required = operation.KeysRequiredForPortal(portal.id);
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
    const lld = new LinkListDialog({ portal: portal });
    lld.enable();
    leafletMarker.closePopup();
  });
  if (canWrite) {
    const swapButton = L.DomUtil.create("button", null, buttonSet);
    swapButton.textContent = wX("SWAP");
    L.DomEvent.on(swapButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      swapPortal(operation, portal);
      leafletMarker.closePopup();
    });
    const deleteButton = L.DomUtil.create("button", null, buttonSet);
    deleteButton.textContent = wX("DELETE_ANCHOR");
    L.DomEvent.on(deleteButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      deletePortal(operation, portal);
      leafletMarker.closePopup();
    });
  }
  const gmapButton = L.DomUtil.create("button", null, buttonSet);
  gmapButton.textContent = wX("ANCHOR_GMAP");
  L.DomEvent.on(gmapButton, "click", (ev) => {
    L.DomEvent.stop(ev);
    leafletMarker.closePopup();
    // use intent on android
    if (
      typeof window.android !== "undefined" &&
      window.android &&
      window.android.intentPosLink
    ) {
      window.android.intentPosLink(
        +portal.lat,
        +portal.lng,
        window.map.getZoom(),
        portal.name,
        true
      );
    } else {
      window.open(
        "https://www.google.com/maps/search/?api=1&query=" +
          portal.lat +
          "," +
          portal.lng
      );
    }
  });

  if (operation.canWriteServer()) {
    const assignButton = L.DomUtil.create("button", null, buttonSet);
    assignButton.textContent = wX("ASSIGN OUTBOUND");
    L.DomEvent.on(assignButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      const ad = new AssignDialog({ target: portal });
      ad.enable();
      leafletMarker.closePopup();
    });
  }

  if (operation.isOnCurrentServer()) {
    const sendButton = L.DomUtil.create("button", null, buttonSet);
    sendButton.textContent = wX("SEND TARGET");
    L.DomEvent.on(sendButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      const std = new SendTargetDialog({ target: portal });
      std.enable();
      leafletMarker.closePopup();
    });
  }

  return content;
}
