import { WDialog } from "../leafletClasses";
import WasabeePortal from "../portal";
import { getSelectedOperation } from "../selectedOp";
import { greatCircleArcIntersect } from "../crosslinks";
import WasabeeLink from "../link";
import { clearAllLinks, getAllPortalsOnScreen } from "../uiCommands";
import wX from "../wX";

const FanfieldDialog = WDialog.extend({
  statics: {
    TYPE: "FanfieldDialog"
  },

  addHooks: function() {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
    this._layerGroup = new L.LayerGroup();
    window.addLayerGroup("Wasabee Fan Field Debug", this._layerGroup, true);
  },

  removeHooks: function() {
    WDialog.prototype.removeHooks.call(this);
    window.removeLayerGroup(this._layerGroup);
  },

  _displayDialog: function() {
    if (!this._map) return;

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
        this._anchor.displayFormat(this._smallScreen)
      );
    } else {
      this._anchorDisplay.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(anchorButton, "click", ev => {
      L.DomEvent.stop(ev);
      this._anchor = WasabeePortal.getSelected();
      if (this._anchor) {
        localStorage["wasabee-anchor-1"] = JSON.stringify(this._anchor);
        this._anchorDisplay.textContent = "";
        this._anchorDisplay.appendChild(
          this._anchor.displayFormat(this._smallScreen)
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
        this._start.displayFormat(this._smallScreen)
      );
    } else {
      this._startDisplay.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(startButton, "click", ev => {
      L.DomEvent.stop(ev);
      this._start = WasabeePortal.getSelected();
      if (this._start) {
        localStorage["wasabee-fanfield-start"] = JSON.stringify(this._start);
        this._startDisplay.textContent = "";
        this._startDisplay.appendChild(
          this._start.displayFormat(this._smallScreen)
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
      this._endDisplay.appendChild(this._end.displayFormat(this._smallScreen));
    } else {
      this._endDisplay.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(endButton, "click", ev => {
      L.DomEvent.stop(ev);
      this._end = WasabeePortal.getSelected();
      if (this._end) {
        localStorage["wasabee-fanfield-end"] = JSON.stringify(this._end);
        this._endDisplay.textContent = "";
        this._endDisplay.appendChild(
          this._end.displayFormat(this._smallScreen)
        );
      } else {
        alert(wX("PLEASE_SELECT_PORTAL"));
      }
    });

    const description2 = L.DomUtil.create("div", "desc2", container);
    description2.textContent = wX("SELECT_FAN_PORTALS2");

    // Bottom buttons bar
    // Go button
    const button = L.DomUtil.create("drawb", null, container);
    button.textContent = "\uD83D\uDC1D" + wX("FANFIELD");
    L.DomEvent.on(button, "click", ev => {
      L.DomEvent.stop(ev);
      this.fanfield.call(this);
    });

    this._dialog = window.dialog({
      title: wX("FANFIELD2"),
      width: "auto",
      height: "auto",
      html: container,
      dialogClass: "wasabee-dialog wasabee-dialog-fanfield",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      buttons: {
        OK: () => {
          this._dialog.dialog("close");
        },
        "Clear Links": () => {
          clearAllLinks(getSelectedOperation());
        }
      }
    });
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = FanfieldDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
    this.title = wX("FAN_FIELD3");
    this.label = wX("FAN_FIELD3");
    this._operation = getSelectedOperation();
    let p = localStorage["wasabee-anchor-1"];
    if (p) this._anchor = WasabeePortal.create(p);
    p = localStorage["wasabee-fanfield-start"];
    if (p) this._start = WasabeePortal.create(p);
    p = localStorage["wasabee-fanfield-end"];
    if (p) this._end = WasabeePortal.create(p);
  },

  // fanfiled determines the portals between start/end and their angle (and order)
  fanfield: function() {
    this._layerGroup.clearLayers();

    if (!this._anchor || !this._start || !this._end) {
      alert(wX("SET_3_PORT"));
      return;
    }

    let startAngle = this._angle(this._anchor, this._start);
    let endAngle = this._angle(this._anchor, this._end);

    // swap start/end if more than 180°
    this._invert = false;
    if (
      (((endAngle - startAngle) % (2 * Math.PI)) + 2 * Math.PI) %
        (2 * Math.PI) >
      Math.PI
    ) {
      let swap = this._start;
      this._start = this._end;
      this._end = swap;

      swap = startAngle;
      startAngle = endAngle;
      endAngle = swap;

      // update interface
      localStorage["wasabee-fanfield-start"] = JSON.stringify(this._start);
      this._startDisplay.textContent = "";
      this._startDisplay.appendChild(
        this._start.displayFormat(this._smallScreen)
      );
      localStorage["wasabee-fanfield-end"] = JSON.stringify(this._end);
      this._endDisplay.textContent = "";
      this._endDisplay.appendChild(this._end.displayFormat(this._smallScreen));

      this._invert = true;
    }

    // const text = min + " ... " + max + " " + this._cw + " " + (max - min);
    // console.log(text);

    const good = new Map();
    for (const p of getAllPortalsOnScreen(this._operation).map(p =>
      WasabeePortal.get(p.options.guid)
    )) {
      if (p.id == this._anchor.id) continue;
      let pAngle = this._angle(this._anchor, p);

      const label = L.marker(p.latLng, {
        icon: L.divIcon({
          className: "plugin-portal-names",
          iconAnchor: [15],
          iconSize: [30, 12],
          html: pAngle
        }),
        guid: p.id
      });
      label.addTo(this._layerGroup);

      good.set(pAngle, p); // what are the odds of two having EXACTLY the same angle?
    }
    // add start and end portals just in case
    good.set(startAngle, this._start);
    good.set(endAngle, this._end);

    const sorted = new Array(...good.entries())
      .sort((a, b) => a[0] - b[0])
      .map(v => v[1]);
    // Build the sequence of portals between start/end
    let slice = new Array();
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
  _draw: function(sorted) {
    this._operation.startBatchMode();
    let order = 0;
    let fields = 0;
    for (const wp of sorted) {
      order++;
      this._operation.addLink(wp, this._anchor, "fan anchor", order);
      for (const check of sorted) {
        if (wp.id == check.id) break; // stop if we've gone too far
        const testlink = new WasabeeLink(this._operation, wp.id, check.id);
        let crossed = false;
        for (const real of this._operation.links) {
          if (greatCircleArcIntersect(real, testlink)) {
            crossed = true;
            break;
          }
        }
        if (!crossed) {
          testlink.throwOrderPos = ++order;
          testlink.description = "fan subfield";
          fields++;
          this._operation.links.push(testlink);
        }
      }
    }
    this._operation.endBatchMode();
    const ap = 313 * order + 1250 * fields;
    // too many parameters for wX();
    let message = `Fanfield found ${order} links and ${fields} fields for ${ap} AP.`;
    if (this._invert)
      message +=
        "\nNB: start/end portals were swapped due to angle exceeding 180°.";
    alert(message);
  },

  _angle: function(a, p) {
    const all = a.latLng; // anchor is always a WasabeePortal
    const pll = p.latLng || p._latlng; // probably not a WasabeePortal (except start/end)

    // work in radians since no one sees it and degrees would be slower
    return Math.atan2(pll.lng - all.lng, pll.lat - all.lat);
  }
});

export default FanfieldDialog;
