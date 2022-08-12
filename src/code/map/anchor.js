import LinkListDialog from "../dialogs/linkListDialog";
import { getSelectedOperation } from "../selectedOp";
import { swapPortal, deletePortal, duplicateAnchor } from "../ui/anchor";
import wX from "../wX";

import { displayFormat } from "../ui/portal";

import { WLPortal } from "./portal";
import { WasabeeMe } from "../model";

export const WLAnchor = WLPortal.extend({
  type: "anchor",

  initialize: function (portalId, operation) {
    let color = operation.color;
    if (color == "main")
      color = window.plugin.wasabee.skin.defaultOperationColor;
    const icon = L.divIcon({
      className: "wasabee-anchor-icon",
      shadowUrl: null,
      iconAnchor: [12, 41],
      iconSize: [25, 41],
      popupAnchor: [0, -35],
      html: L.Util.template(
        '<svg style="fill: {color}"><use href="#wasabee-anchor-icon"/></svg>',
        { color: color }
      ),
    });
    WLPortal.prototype.initialize.call(this, {
      portalId: portalId,
      id: portalId,
      icon: icon,
    });
  },

  _popupContent: function () {
    const operation = getSelectedOperation();
    const canWrite = operation.canWrite();
    const portal = operation.getPortal(this.options.portalId);

    const content = WLPortal.prototype._popupContent.call(this);
    const desc = L.DomUtil.create("div", "desc", content);
    desc.appendChild(displayFormat(portal));
    this._popupPortalComments(desc, portal, canWrite);

    const infoBlock = L.DomUtil.create("div", "info-block", content);

    const requiredKeys = L.DomUtil.create("div", "key-required", infoBlock);

    const onHand = operation.KeysOnHandForPortal(portal.id);
    const required = operation.keysRequiredForPortalPerAgent(portal.id);
    let requiredTotal = 0;
    for (const id in required) requiredTotal += required[id];

    requiredKeys.textContent = wX("popup.anchor.keys", {
      onHand,
      required: requiredTotal,
    });
    if (onHand < requiredTotal) requiredKeys.classList.add("key-missing");

    if (WasabeeMe.isLoggedIn()) {
      const requiredKeysSelf = L.DomUtil.create(
        "div",
        "key-required-self",
        infoBlock
      );
      const myCount = operation.KeysOnHandForPortal(
        portal.id,
        WasabeeMe.localGet().id
      );
      requiredKeysSelf.textContent = wX("popup.anchor.keys_mycount", {
        myCount,
        required: required[WasabeeMe.localGet().id] || 0,
      });
      if (myCount < (required[WasabeeMe.localGet().id] || 0))
        requiredKeysSelf.classList.add("key-missing");

      /* check per agent */
      const onHandPerAgent = operation.keysOnHandForPortalPerAgent(portal.id);
      if (onHand >= requiredTotal) {
        for (const id in required) {
          if (!onHandPerAgent[id] || onHandPerAgent[id] < required[id]) {
            requiredKeys.classList.add("key-missing");
            break;
          }
        }
      }
    }

    const buttonSet = L.DomUtil.create(
      "div",
      "wasabee-anchor-buttonset",
      content
    );
    this._linksButton(buttonSet);
    if (canWrite) {
      this._swapButton(buttonSet);
      this._dupButton(buttonSet);
      this._deleteButton(buttonSet, wX("DELETE_ANCHOR"));
    }
    this._mapButton(buttonSet, wX("ANCHOR_GMAP"));
    if (operation.canWriteServer())
      this._assignButton(buttonSet, wX("ASSIGN OUTBOUND"), portal);
    if (operation.isOnCurrentServer())
      this._sendTargetButton(buttonSet, wX("SEND TARGET"), portal);

    return content;
  },

  _linksButton: function (container) {
    const operation = getSelectedOperation();
    const portal = operation.getPortal(this.options.portalId);
    const linksButton = L.DomUtil.create("button", null, container);
    linksButton.textContent = wX("LINKS");
    L.DomEvent.on(linksButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      const lld = new LinkListDialog({ portal: portal });
      lld.enable();
      this.closePopup();
    });
  },

  _swapButton: function (container) {
    const operation = getSelectedOperation();
    const portal = operation.getPortal(this.options.portalId);
    const swapButton = L.DomUtil.create("button", "swap", container);
    swapButton.textContent = wX("SWAP");
    L.DomEvent.on(swapButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      swapPortal(operation, portal);
      this.closePopup();
    });
  },

  _dupButton: function (container) {
    const operation = getSelectedOperation();
    const portal = operation.getPortal(this.options.portalId);
    const dupButton = L.DomUtil.create("button", "duplicate", container);
    dupButton.textContent = wX("popup.anchor.duplicate");
    L.DomEvent.on(dupButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      duplicateAnchor(operation, portal);
      this.closePopup();
    });
  },

  _deleteAction: function () {
    const operation = getSelectedOperation();
    const portal = operation.getPortal(this.options.portalId);
    deletePortal(operation, portal);
  },
});
