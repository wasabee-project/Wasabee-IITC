import { getSelectedOperation } from "../selectedOp";
import AssignDialog from "../dialogs/assignDialog";
import SendTargetDialog from "../dialogs/sendTargetDialog";
import SetCommentDialog from "../dialogs/setCommentDialog";
import wX from "../wX";

// common part for marker and anchors
export const WLPortal = L.Marker.extend({
  type: "portal",

  initialize: function (options) {
    const operation = getSelectedOperation();
    const portal = operation.getPortal(options.portalId);
    options.title = portal.name;
    L.Marker.prototype.initialize.call(this, portal.latLng, options);
    this.bindPopup((layer) => layer._popupContent(), {
      className: "wasabee-popup",
      closeButton: false,
    });

    this.off("click", this._openPopup);
    window.registerMarkerForOMS(this);
    this.on("spiderfiedclick", this._openPopup);
    this.on("spiderfiedclick", this._onClick);
  },

  _onClick: function () {
    const operation = getSelectedOperation();
    const portal = operation.getPortal(this.options.portalId);
    if (portal) window.map.fire("wasabee:portal:click", { portal });
  },

  _popupContent: function () {
    const div = L.DomUtil.create("div", `wasabee-${this.type}-popup`);
    return div;
  },

  _popupPortalComments: function (container, portal, canWrite) {
    const portalComment = L.DomUtil.create(
      "div",
      "wasabee-portal-comment",
      container
    );
    const pcLink = L.DomUtil.create("a", null, portalComment);
    pcLink.textContent = portal.comment || wX("SET_PORTAL_COMMENT");
    if (canWrite) {
      pcLink.href = "#";
      L.DomEvent.on(pcLink, "click", this._setPortalComment, this);
    }
    if (portal.hardness) {
      const portalHardness = L.DomUtil.create(
        "div",
        "wasabee-portal-hardness",
        container
      );
      const phLink = L.DomUtil.create("a", null, portalHardness);
      phLink.textContent = portal.hardness;
      if (canWrite) {
        phLink.href = "#";
        L.DomEvent.on(phLink, "click", this._setPortalComment, this);
      }
    }
  },

  _setPortalComment: function (ev) {
    L.DomEvent.stop(ev);
    const operation = getSelectedOperation();
    const portal = operation.getPortal(this.options.portalId);
    const scd = new SetCommentDialog({
      target: portal,
      operation: operation,
    });
    scd.enable();
    this.closePopup();
  },

  _assignButton: function (container, text, target) {
    const assignButton = L.DomUtil.create("button", null, container);
    assignButton.textContent = text;
    L.DomEvent.on(assignButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      const ad = new AssignDialog({ target: target });
      ad.enable();
      this.closePopup();
    });
  },

  _deleteButton: function (container, text) {
    const deleteButton = L.DomUtil.create("button", null, container);
    deleteButton.textContent = text;
    L.DomEvent.on(deleteButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      if (this._deleteAction) this._deleteAction();
      this.closePopup();
    });
  },

  _sendTargetButton: function (container, text, target) {
    const sendButton = L.DomUtil.create("button", null, container);
    sendButton.textContent = text;
    L.DomEvent.on(sendButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      const std = new SendTargetDialog({ target: target });
      std.enable();
      this.closePopup();
    });
  },

  _mapButton: function (container, text) {
    const gmapButton = L.DomUtil.create("button", null, container);
    gmapButton.textContent = text;
    L.DomEvent.on(gmapButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      this.closePopup();
      const latLng = this.getLatLng();
      // use intent on android
      if (
        typeof window.android !== "undefined" &&
        window.android &&
        window.android.intentPosLink
      ) {
        window.android.intentPosLink(
          +latLng.lat,
          +latLng.lng,
          window.map.getZoom(),
          this.options.title,
          true
        );
      } else {
        window.open(
          "https://www.google.com/maps/search/?api=1&query=" +
            latLng.lat +
            "," +
            latLng.lng
        );
      }
    });
  },
});
