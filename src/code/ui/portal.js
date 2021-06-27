import WasabeePortal from "../model/portal";

import { getSelectedOperation } from "../selectedOp";
import AssignDialog from "../dialogs/assignDialog";
import SendTargetDialog from "../dialogs/sendTargetDialog";
import SetCommentDialog from "../dialogs/setCommentDialog";
import wX from "../wX";

function fromIITC(p) {
  // we have all the details
  if (p && p.options && p.options.data && p.options.guid) {
    const data = p.options.data;
    const id = p.options.guid;
    if (data.title) {
      return new WasabeePortal({
        id: id,
        name: data.title,
        lat: (data.latE6 / 1e6).toFixed(6),
        lng: (data.lngE6 / 1e6).toFixed(6),
      });
    }
    // do we have enough to fake it?
    if (data.latE6) {
      return WasabeePortal.fake(
        (data.latE6 / 1e6).toFixed(6),
        (data.lngE6 / 1e6).toFixed(6),
        id
      );
    }
  }
  // nothing to get
  return null;
}

function team(portal) {
  if (window.portals[portal.id] && window.portals[portal.id].options.data)
    return window.portals[portal.id].options.data.team;
  return "";
}

function displayName(portal) {
  if (portal.pureFaked) return wX("FAKED", { portalId: portal.id });
  if (portal.loading) return wX("LOADING1", { portalGuid: portal.id });
  return portal.name;
}

function displayFormat(portal, shortName = false) {
  const pt = portal.latLng;
  const v = `${portal.lat},${portal.lng}`;
  const name = displayName(portal);
  const e = L.DomUtil.create("a", "wasabee-portal");
  if (shortName === true && portal.name.length > 12) {
    e.textContent = name.slice(0, 8) + "...";
  } else {
    e.textContent = name;
  }

  const t = team(portal);
  if (t == "E") {
    e.classList.add("enl");
  }
  if (t == "R") {
    e.classList.add("res");
  }
  if (t == "N") {
    e.classList.add("unclaimed");
  }

  // e.title = this.name;
  e.href = `/intel?ll=${v}&pll=${v}`;

  L.DomEvent.on(e, "click", (event) => {
    if (window.selectedPortal != portal.id && portal.id.length == 35)
      window.renderPortalDetails(portal.id);
    else window.map.panTo(pt);
    event.preventDefault();
    return false;
  }).on(e, "dblclick", (event) => {
    if (window.selectedPortal != portal.id && portal.id.length == 35)
      window.renderPortalDetails(portal.id);
    if (window.map.getBounds().contains(pt))
      window.zoomToAndShowPortal(portal.id, pt);
    else window.map.panTo(pt);
    event.preventDefault();
    return false;
  });
  return e;
}

function get(id) {
  return fromIITC(window.portals[id]);
}

function getSelected() {
  return window.selectedPortal ? get(window.selectedPortal) : null;
}

// common part for marker and anchors
const WLPortal = L.Marker.extend({
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
    return assignButton;
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
    return sendButton;
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

export default {
  fromIITC,
  displayName,
  displayFormat,
  get,
  getSelected,
  WLPortal,
};
