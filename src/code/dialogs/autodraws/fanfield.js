import { AutoDraw } from "./tools";
import WasabeePortal from "../../model/portal";
import { getSelectedOperation } from "../../selectedOp";
import { greatCircleArcIntersect, GeodesicLine } from "../../crosslinks";
import WasabeeLink from "../../model/link";
import { clearAllLinks } from "../../uiCommands";
import wX from "../../wX";

export function angle(a, p) {
  if (a.id == p.id) throw Error("same portal");
  if (a.latLng.lng == p.latLng.lng) {
    if (a.latLng.lat > p.latLng.lat) return 0;
    else return Math.PI;
  }
  const link = new GeodesicLine(a.latLng, p.latLng);
  return link.bearing();
}

export function sortPortalsByAngle(anchor, portals, start, end) {
  const startAngle = angle(anchor, start);
  const endAngle = angle(anchor, end);

  // swap start/end if more than 180°
  let invert = false;
  if (
    (((endAngle - startAngle) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) >
    Math.PI
  ) {
    invert = true;
  }

  const good = new Map();
  for (const p of portals) {
    if (p.id == anchor.id) continue;
    const pAngle = angle(anchor, p);

    good.set(pAngle, p); // what are the odds of two having EXACTLY the same angle?
  }
  // add start and end portals just in case
  good.set(startAngle, start);
  good.set(endAngle, end);

  const sorted = new Array(...good.entries())
    .sort((a, b) => a[0] - b[0])
    .map((v) => v[1]);

  if (invert) {
    sorted.reverse();
  }
  // Build the sequence of portals between start/end
  const slice = new Array();
  let s = 0;
  for (s = 0; sorted[s].id != start.id; s++);
  for (; sorted[s % sorted.length].id != end.id; s++) {
    slice.push(sorted[s % sorted.length]);
  }
  slice.push(end);

  return slice;
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
      alert(wX("SET_3_PORT"));
      return;
    }

    const steps = sortPortalsByAngle(
      this._anchor,
      this._portalSets["set"].portals,
      this._start,
      this._end
    );
    this._draw(steps);
  },

  // draw takes the sorted list of poratls and draws the links
  // determining any sub-fields can be added
  _draw: function (sorted) {
    const op = getSelectedOperation();
    op.startBatchMode();
    let order = 0;
    let fields = 0;

    const available = Array.from(sorted);
    available.reverse();

    for (let i = available.length - 1; i >= 0; i--) {
      const wp = available[i];
      order++;
      op.addLink(wp, this._anchor, { description: "fan anchor", order: order });

      // skip back links if first portal
      if (i + 1 == available.length) continue;

      // Find the interval of portals that are linkable
      let j = i + 1;
      for (; j < available.length; j++) {
        const testlink = new WasabeeLink(
          { fromPortalId: wp.id, toPortalId: available[j].id },
          op
        );
        let crossed = false;
        for (const real of op.links) {
          // Check links to anchor only
          if (real.toPortalId != this._anchor.id) continue;
          if (greatCircleArcIntersect(real, testlink)) {
            crossed = true;
            break;
          }
        }
        if (crossed) break;
      }
      j--;
      op.addLink(wp, available[j], {
        description: "fan subfield",
        order: ++order,
      });
      fields++;

      for (var k = j - 1; k > i; k--) {
        const check = available[k];
        op.addLink(wp, check, {
          description: "fan double subfield",
          order: ++order,
        });
        fields += 2;
      }
      // remove covered portals
      available.splice(i + 1, j - i - 1);
    }
    op.endBatchMode();
    const ap = 313 * order + 1250 * fields;
    // too many parameters for wX();
    alert(`Fanfield found ${order} links and ${fields} fields for ${ap} AP`);
  },
});

export default FanfieldDialog;
