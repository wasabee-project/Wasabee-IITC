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

    // Bottom buttons bar
    // Enter arrow
    const opt = L.DomUtil.create("label", "arrow", container);
    opt.textContent = "\u21b3";
    // Go button
    const button = L.DomUtil.create("button", null, container);
    button.textContent = wX("FANFIELD");
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

    let startAngle = this._angle(this._anchor, this._start, false);
    let endAngle = this._angle(this._anchor, this._end, false);
    let min = Math.min(startAngle, endAngle);
    let max = Math.max(startAngle, endAngle);
    this._cw = false;

    if (startAngle != min) {
      console.log("fanfield running clockwise");
      this._cw = true; // must be going counter-clockwise
      startAngle = this._angle(this._anchor, this._start, true);
      endAngle = this._angle(this._anchor, this._end, true);
      min = Math.min(startAngle, endAngle);
      max = Math.max(startAngle, endAngle);
    }

    // const text = min + " ... " + max + " " + this._cw + " " + (max - min);
    // console.log(text);

    // if we cross 0, rotate 180deg so we don't have to deal with it
    this._invert = false;
    if (max - min > Math.PI) {
      console.log("going inverted");
      this._invert = true;
      // min = (min + Math.PI) % (2 * Math.PI);
      // max = (max + Math.PI) % (2 * Math.PI);
    }

    const good = new Map();
    for (const p of getAllPortalsOnScreen(this._operation)) {
      if (p.options.guid == this._anchor.id) continue;
      let pAngle = this._angle(this._anchor, p, this._cw);

      if (this._invert) pAngle = (pAngle + Math.PI) % (2 * Math.PI);

      const label = L.marker(p._latlng, {
        icon: L.divIcon({
          className: "plugin-portal-names",
          iconAnchor: [15],
          iconSize: [30, 12],
          html: pAngle
        }),
        guid: p.options.guid
      });
      label.addTo(this._layerGroup);

      if (pAngle < min || pAngle > max) continue;
      good.set(pAngle, p); // what are the odds of two having EXACTLY the same angle?
    }
    const sorted = new Map([...good.entries()].sort());
    this._draw(sorted);
  },

  // draw takes the sorted list of poratls and draws the links
  // determining any sub-fields can be added
  _draw: function(sorted) {
    this._operation.startBatchMode();
    let order = 0;
    let fields = 0;
    for (const [angle, p] of sorted) {
      order++;
      const wp = WasabeePortal.get(p.options.guid);
      if (!wp) {
        // needs wX()
        alert("unable to load details for portal " + p.options.guid);
        continue;
      }
      this._operation.addLink(wp, this._anchor, "fan anchor", order);
      for (const [nextangle, check] of sorted) {
        if (nextangle >= angle) break; // stop if we've gone too far
        const testlink = new WasabeeLink(
          this._operation,
          wp.id,
          check.options.guid
        );
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
    alert(`Fanfield found ${order} links and ${fields} fields for ${ap} AP`);
  },

  _angle: function(a, p, cw) {
    const all = a.latLng; // anchor is always a WasabeePortal
    const pll = p.latLng || p._latlng; // probably not a WasabeePortal (except start/end)

    // always return a positive value so the sort() functions work sanely
    // work in radians since no one sees it and degrees would be slower
    if (cw)
      return Math.abs(
        (Math.atan2(pll.lng - all.lng, pll.lat - all.lat) % (2 * Math.PI)) -
          Math.PI
      );
    return (
      (Math.atan2(pll.lng - all.lng, pll.lat - all.lat) % (2 * Math.PI)) +
      Math.PI
    );
  }
});

export default FanfieldDialog;
