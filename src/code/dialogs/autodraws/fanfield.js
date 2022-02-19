import { AutoDraw } from "./tools";
import WasabeePortal from "../../model/portal";
import { getSelectedOperation } from "../../selectedOp";
import { greatCircleArcIntersectByLatLngs } from "../../geo";
import { clearAllLinks } from "../../uiCommands";
import wX from "../../wX";
import { displayError, displayInfo } from "../../error";

import { sortPortalsByAngle, selectAngleInterval } from "./algorithm";
import { insertLinks } from "./drawRoutines";

function sortPortals(anchor, portals, start, end) {
  if (!portals.find((p) => p.id === start.id)) portals.push(start);
  if (!portals.find((p) => p.id === end.id)) portals.push(end);
  const sorted = sortPortalsByAngle(anchor, portals);
  return selectAngleInterval(anchor, sorted, start, end);
}

/**
 * Return the link descriptions for fanfield
 * @param {WasabeePortal} anchor
 * @param {WasabeePortal[]} portals
 * @param {WasabeePortal} start
 * @param {WasabeePortal} end
 * @returns {[{ from: WasabeePortal, to: WasabeePortal, comment: string}[], number]}
 */
function fanfield(anchor, portals, start, end) {
  let fields = 0;
  const links = [];

  const sorted = sortPortals(anchor, portals, start, end);

  const available = Array.from(sorted);
  available.reverse();

  for (let i = available.length - 1; i >= 0; i--) {
    const wp = available[i];
    links.push({ from: wp, to: anchor, comment: "anchor" });

    if (i + 1 == available.length) continue;

    // Find the interval of portals that are linkable
    let j = i + 1;
    let prev = null;
    for (; j < available.length; j++) {
      const p = available[j];
      if (
        prev &&
        greatCircleArcIntersectByLatLngs(
          anchor.latLng,
          prev.latLng,
          wp.latLng,
          p.latLng
        )
      )
        break;
      prev = p;
    }
    j--;
    links.push({
      from: wp,
      to: available[j],
      comment: "subfield",
    });
    fields++;

    for (var k = j - 1; k > i; k--) {
      links.push({
        from: wp,
        to: available[k],
        comment: "double subfield",
      });
      fields += 2;
    }
    // remove covered portals
    available.splice(i + 1, j - i - 1);
  }
  return [links, fields];
}

const FanfieldDialog = AutoDraw.extend({
  statics: {
    TYPE: "FanfieldDialog",
  },

  initialize: function (options) {
    AutoDraw.prototype.initialize.call(this, options);
    let p = localStorage["wasabee-anchor-1"];
    if (p) this._anchor = new WasabeePortal(p);
    p = localStorage["wasabee-fanfield-start"];
    if (p) this._start = new WasabeePortal(p);
    p = localStorage["wasabee-fanfield-end"];
    if (p) this._end = new WasabeePortal(p);
  },

  addHooks: function () {
    AutoDraw.prototype.addHooks.call(this);
    this._displayDialog();
    this._updatePortalSet();
  },

  _displayDialog: function () {
    const container = L.DomUtil.create("div", "container");
    const description = L.DomUtil.create("div", "desc", container);
    description.textContent = wX("SELECT_FAN_PORTALS");

    this._addSetPortal(
      wX("ANCHOR_PORTAL"),
      "_anchor",
      container,
      "wasabee-anchor-1"
    );
    this._addSetPortal(
      wX("START_PORT"),
      "_start",
      container,
      "wasabee-fanfield-start"
    );
    this._addSetPortal(
      wX("END_PORT"),
      "_end",
      container,
      "wasabee-fanfield-end"
    );

    this._addSelectSet(wX("AUTODRAW_PORTALS_SET"), "set", container, "all");

    const description2 = L.DomUtil.create("div", "desc secondary", container);
    description2.textContent = wX("SELECT_FAN_PORTALS2");

    // Bottom buttons bar
    // Go button
    const button = L.DomUtil.create("button", "drawb", container);
    button.textContent = wX("FANFIELD");
    L.DomEvent.on(button, "click", (ev) => {
      L.DomEvent.stop(ev);
      this.fanfield.call(this);
    });
    const buttons = {};
    buttons[wX("CLOSE")] = () => {
      this.closeDialog();
    };
    buttons[wX("CLEAR LINKS")] = () => {
      clearAllLinks(getSelectedOperation());
    };

    this.createDialog({
      title: wX("FANFIELD2"),
      html: container,
      width: "auto",
      dialogClass: "fanfield",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.fanfield,
    });
  },

  // fanfiled determines the portals between start/end and their angle (and order)
  fanfield: function () {
    if (!this._anchor || !this._start || !this._end) {
      displayError(wX("SET_3_PORT"));
      return;
    }

    const [links, fields] = fanfield(
      this._anchor,
      this._portalSets["set"].portals,
      this._start,
      this._end
    );

    const op = getSelectedOperation();

    op.startBatchMode();
    const wlinks = links
      .map((l) =>
        op.addLink(l.from, l.to, {
          description: "fanfield " + l.comment,
        })
      )
      .filter((l) => l);

    insertLinks(op, wlinks, 0);
    op.endBatchMode();

    const ap = 313 * links.length + 1250 * fields;
    // too many parameters for wX();
    displayInfo(
      wX("autodraw.fanfield.result", {
        links: links.length,
        fields: fields,
        ap: ap,
      })
    );
  },
});

export default FanfieldDialog;
