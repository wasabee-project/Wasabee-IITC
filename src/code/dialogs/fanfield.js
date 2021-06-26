import { WDialog } from "../leafletClasses";
import WasabeePortal from "../model/portal";
import { getSelectedOperation } from "../selectedOp";
import { greatCircleArcIntersect, GeodesicLine } from "../crosslinks";
import WasabeeLink from "../model/link";
import { clearAllLinks, getAllPortalsOnScreen } from "../uiCommands";
import wX from "../wX";

import PortalUI from "../ui/portal";

const FanfieldDialog = WDialog.extend({
  statics: {
    TYPE: "FanfieldDialog",
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  _displayDialog: function () {
    const container = L.DomUtil.create("div", "container");
    const description = L.DomUtil.create("div", "desc", container);
    description.textContent = wX("SELECT_FAN_PORTALS");

    const anchorLabel = L.DomUtil.create("label", null, container);
    anchorLabel.textContent = wX("ANCHOR_PORTAL");
    const anchorButton = L.DomUtil.create("button", null, container);
    anchorButton.textContent = wX("SET");
    this._anchorDisplay = L.DomUtil.create("span", null, container);
    if (this._anchor) {
      this._anchorDisplay.appendChild(
        PortalUI.displayFormat(this._anchor, this._smallScreen)
      );
    } else {
      this._anchorDisplay.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(anchorButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      this._anchor = PortalUI.getSelected();
      if (this._anchor) {
        localStorage["wasabee-anchor-1"] = JSON.stringify(this._anchor);
        this._anchorDisplay.textContent = "";
        this._anchorDisplay.appendChild(
          PortalUI.displayFormat(this._anchor, this._smallScreen)
        );
      } else {
        alert(wX("PLEASE_SELECT_PORTAL"));
      }
    });

    const startLabel = L.DomUtil.create("label", null, container);
    startLabel.textContent = wX("START_PORT");
    const startButton = L.DomUtil.create("button", null, container);
    startButton.textContent = wX("SET");
    this._startDisplay = L.DomUtil.create("span", null, container);
    if (this._start) {
      this._startDisplay.appendChild(
        PortalUI.displayFormat(this._start, this._smallScreen)
      );
    } else {
      this._startDisplay.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(startButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      this._start = PortalUI.getSelected();
      if (this._start) {
        localStorage["wasabee-fanfield-start"] = JSON.stringify(this._start);
        this._startDisplay.textContent = "";
        this._startDisplay.appendChild(
          PortalUI.displayFormat(this._start, this._smallScreen)
        );
      } else {
        alert(wX("PLEASE_SELECT_PORTAL"));
      }
    });

    const endLabel = L.DomUtil.create("label", null, container);
    endLabel.textContent = wX("END_PORT");
    const endButton = L.DomUtil.create("button", null, container);
    endButton.textContent = wX("SET");
    this._endDisplay = L.DomUtil.create("span", null, container);
    if (this._end) {
      this._endDisplay.appendChild(
        PortalUI.displayFormat(this._end, this._smallScreen)
      );
    } else {
      this._endDisplay.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(endButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      this._end = PortalUI.getSelected();
      if (this._end) {
        localStorage["wasabee-fanfield-end"] = JSON.stringify(this._end);
        this._endDisplay.textContent = "";
        this._endDisplay.appendChild(
          PortalUI.displayFormat(this._end, this._smallScreen)
        );
      } else {
        alert(wX("PLEASE_SELECT_PORTAL"));
      }
    });

    const description2 = L.DomUtil.create("div", "desc2", container);
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

  initialize: function (options) {
    WDialog.prototype.initialize.call(this, options);
    this.title = wX("FAN_FIELD3");
    this.label = wX("FAN_FIELD3");
    let p = localStorage["wasabee-anchor-1"];
    if (p) this._anchor = new WasabeePortal(p);
    p = localStorage["wasabee-fanfield-start"];
    if (p) this._start = new WasabeePortal(p);
    p = localStorage["wasabee-fanfield-end"];
    if (p) this._end = new WasabeePortal(p);
  },

  // fanfiled determines the portals between start/end and their angle (and order)
  fanfield: function () {
    if (!this._anchor || !this._start || !this._end) {
      alert(wX("SET_3_PORT"));
      return;
    }

    const startAngle = this._angle(this._anchor, this._start);
    const endAngle = this._angle(this._anchor, this._end);

    // swap start/end if more than 180°
    this._invert = false;
    if (
      (((endAngle - startAngle) % (2 * Math.PI)) + 2 * Math.PI) %
        (2 * Math.PI) >
      Math.PI
    ) {
      this._invert = true;
    }

    const good = new Map();
    const op = getSelectedOperation();
    for (const p of getAllPortalsOnScreen(op)) {
      if (p.id == this._anchor.id) continue;
      const pAngle = this._angle(this._anchor, p);

      good.set(pAngle, p); // what are the odds of two having EXACTLY the same angle?
    }
    // add start and end portals just in case
    good.set(startAngle, this._start);
    good.set(endAngle, this._end);

    const sorted = new Array(...good.entries())
      .sort((a, b) => a[0] - b[0])
      .map((v) => v[1]);

    if (this._invert) {
      sorted.reverse();
    }
    // Build the sequence of portals between start/end
    const slice = new Array();
    let start = 0;
    for (start = 0; sorted[start].id != this._start.id; start++);
    for (; sorted[start % sorted.length].id != this._end.id; start++) {
      slice.push(sorted[start % sorted.length]);
    }
    slice.push(this._end);

    this._draw(slice);
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

  _angle: function (a, p) {
    const link = new GeodesicLine(a.latLng, p.latLng);
    return link.bearing();
  },
});

export default FanfieldDialog;
