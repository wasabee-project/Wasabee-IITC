import LinkListDialog from "../dialogs/linkListDialog";
import { getSelectedOperation } from "../selectedOp";
import { swapPortal, deletePortal } from "../uiCommands";
import { newColors } from "../auxiliar";
import wX from "../wX";

import WasabeeAnchor from "../model/anchor";

import PortalUI from "./portal";

const WLAnchor = PortalUI.WLPortal.extend({
  initialize: function (portalId, operation) {
    const anchor = new WasabeeAnchor(portalId, operation);
    // use newColors(anchor.color) for 0.19
    let layer = anchor.color;
    if (newColors(layer) == layer) layer = "custom";
    const icon = L.divIcon({
      className:
        layer != "custom"
          ? `wasabee-anchor-icon wasabee-layer-${layer}`
          : "wasabee-anchor-icon",
      shadowUrl: null,
      iconAnchor: [12, 41],
      iconSize: [25, 41],
      popupAnchor: [0, -35],
      html:
        layer != "custom"
          ? null
          : L.Util.template(
              '<svg style="fill: {color}"><use href="#wasabee-anchor-icon"/></svg>',
              { color: anchor.color }
            ),
    });
    PortalUI.WLPortal.prototype.initialize.call(this, {
      portalId: portalId,
      id: portalId,
      color: anchor.color,
      icon: icon,
    });
  },

  _popupContent: function () {
    const operation = getSelectedOperation();
    const canWrite = operation.canWrite();
    const portal = operation.getPortal(this.options.portalId);

    const content = PortalUI.WLPortal.prototype._popupContent.call(this);
    const desc = L.DomUtil.create("div", "desc", content);
    desc.appendChild(PortalUI.displayFormat(portal));
    this._popupPortalComments(desc, portal, canWrite);

    const requiredKeys = L.DomUtil.create("div", "desc", content);
    const onHand = operation.KeysOnHandForPortal(portal.id);
    const required = operation.KeysRequiredForPortal(portal.id);
    requiredKeys.textContent = "Keys: " + onHand + " / " + required;

    const buttonSet = L.DomUtil.create(
      "div",
      "wasabee-marker-buttonset",
      content
    );
    this._linksButton(buttonSet);
    if (canWrite) {
      this._swapButton(buttonSet);
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
    const swapButton = L.DomUtil.create("button", null, container);
    swapButton.textContent = wX("SWAP");
    L.DomEvent.on(swapButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      swapPortal(operation, portal);
      this.closePopup();
    });
  },

  _deleteAction: function () {
    const operation = getSelectedOperation();
    const portal = operation.getPortal(this.options.portalId);
    deletePortal(operation, portal);
  },
});

export default {
  WLAnchor,
};
