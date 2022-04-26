import AssignDialog from "../dialogs/assignDialog";
import { getSelectedOperation } from "../selectedOp";
import wX from "../wX";

import { displayFormat } from "../ui/link";

export const WLLink = L.GeodesicPolyline.extend({
  initialize: function (link, operation) {
    const latLngs = link.getLatLngs(operation);
    let color = link.getColor(operation);
    if (color == "main")
      color = window.plugin.wasabee.skin.defaultOperationColor;
    const options = L.extend(
      {
        color: color,
        opID: operation.ID,
        linkID: link.ID,
      },
      window.plugin.wasabee.skin.linkStyle
    );
    if (link.assignedTo) options.dashArray = options.assignedDashArray;

    L.GeodesicPolyline.prototype.initialize.call(this, latLngs, options);

    this._wlink = link;

    this.bindPopup((layer) => layer._getPopup(), {
      className: "wasabee-popup",
      closeButton: false,
    });
  },

  _getPopup: function () {
    const operation = getSelectedOperation();
    const link = this._wlink;
    const div = L.DomUtil.create("div", "wasabee-link-popup");
    L.DomUtil.create("div", null, div).appendChild(
      displayFormat(link, operation)
    );
    if (link.comment)
      L.DomUtil.create("div", "enl", div).textContent = link.comment;
    L.DomUtil.create("div", "enl", div).textContent = "# " + link.order;
    const buttonset = L.DomUtil.create("div", "buttonset", div);
    if (operation.canWrite()) {
      const del = L.DomUtil.create("button", null, buttonset);
      del.textContent = wX("DELETE_LINK");
      L.DomEvent.on(del, "click", (ev) => {
        L.DomEvent.stop(ev);
        operation.removeLink(link.fromPortalId, link.toPortalId);
      });
      const rev = L.DomUtil.create("button", null, buttonset);
      rev.textContent = wX("REVERSE");
      L.DomEvent.on(rev, "click", (ev) => {
        L.DomEvent.stop(ev);
        operation.reverseLink(link.fromPortalId, link.toPortalId);
      });
    }
    if (operation.canWriteServer()) {
      const assignButton = L.DomUtil.create("button", null, buttonset);
      assignButton.textContent = wX("ASSIGN");
      L.DomEvent.on(assignButton, "click", (ev) => {
        L.DomEvent.stop(ev);
        const ad = new AssignDialog({ target: link });
        ad.enable();
      });
    }
    return div;
  },
});
