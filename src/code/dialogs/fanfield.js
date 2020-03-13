import { Feature } from "../leafletDrawImports";
import WasabeePortal from "../portal";
import { getSelectedOperation } from "../selectedOp";
import { greatCircleArcIntersect } from "../crosslinks";
import WasabeeLink from "../link";
import UiCommands from "../uiCommands";

const FanfieldDialog = Feature.extend({
  statics: {
    TYPE: "FanfieldDialog"
  },

  addHooks: function() {
    if (!this._map) return;
    Feature.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
  },

  _displayDialog: function() {
    if (!this._map) return;

    const container = L.DomUtil.create("div", null);
    const description = L.DomUtil.create("div", null, container);
    description.textContent =
      "Select an anchor portals, a start portal, an end portal, then zoom in to an area for the fan field, wait until the portals are loaded (portals must be on screen to be considered) and press the Fanfield button.";
    const controls = L.DomUtil.create("div", null, container);

    const anchorDiv = L.DomUtil.create("div", null, controls);
    const anchorLabel = L.DomUtil.create("label", null, anchorDiv);
    anchorLabel.textContent = "Anchor Portal";
    const anchorButton = L.DomUtil.create("button", null, anchorLabel);
    anchorButton.textContent = "set";
    this._anchorDisplay = L.DomUtil.create("span", null, anchorLabel);
    if (this._anchor) {
      this._anchorDisplay.appendChild(this._anchor.displayFormat());
    } else {
      this._anchorDisplay.textContent = "not set";
    }
    L.DomEvent.on(anchorButton, "click", () => {
      this._anchor = WasabeePortal.getSelected();
      if (this._anchor) {
        localStorage["wasabee-fanfield-anchor"] = JSON.stringify(this._anchor);
        this._anchorDisplay.textContent = "";
        this._anchorDisplay.appendChild(this._anchor.displayFormat());
      } else {
        alert("Please select a portal");
      }
    });

    const startDiv = L.DomUtil.create("div", null, controls);
    const startLabel = L.DomUtil.create("label", null, startDiv);
    startLabel.textContent = "Start Portal";
    const startButton = L.DomUtil.create("button", null, startLabel);
    startButton.textContent = "set";
    this._startDisplay = L.DomUtil.create("span", null, startLabel);
    if (this._start) {
      this._startDisplay.appendChild(this._start.displayFormat());
    } else {
      this._startDisplay.textContent = "not set";
    }
    L.DomEvent.on(startButton, "click", () => {
      this._start = WasabeePortal.getSelected();
      if (this._start) {
        localStorage["wasabee-fanfield-start"] = JSON.stringify(this._start);
        this._startDisplay.textContent = "";
        this._startDisplay.appendChild(this._start.displayFormat());
      } else {
        alert("Please select a portal");
      }
    });

    const endDiv = L.DomUtil.create("div", null, controls);
    const endLabel = L.DomUtil.create("label", null, endDiv);
    endLabel.textContent = "End Portal";
    const endButton = L.DomUtil.create("button", null, endLabel);
    endButton.textContent = "set";
    this._endDisplay = L.DomUtil.create("span", null, endLabel);
    if (this._end) {
      this._endDisplay.appendChild(this._end.displayFormat());
    } else {
      this._endDisplay.textContent = "not set";
    }
    L.DomEvent.on(endButton, "click", () => {
      this._end = WasabeePortal.getSelected();
      if (this._end) {
        localStorage["wasabee-fanfield-end"] = JSON.stringify(this._end);
        this._endDisplay.textContent = "";
        this._endDisplay.appendChild(this._end.displayFormat());
      } else {
        alert("Please select a portal");
      }
    });

    // Bottom buttons bar
    const element = L.DomUtil.create("div", "buttonbar", container);
    const div = L.DomUtil.create("span", null, element);
    // Enter arrow
    const opt = L.DomUtil.create("span", "arrow", div);
    opt.textContent = "\u21b3";
    // Go button
    const button = L.DomUtil.create("button", null, div);
    button.textContent = "Fanfield!";
    L.DomEvent.on(button, "click", () => {
      const context = this;
      this.fanfield(context);
    });

    const context = this;
    this._dialog = window.dialog({
      title: "Fanfield",
      width: "auto",
      height: "auto",
      html: container,
      dialogClass: "wasabee-dialog-mustauth",
      closeCallback: function() {
        context.disable();
        delete context._dialog;
      },
      buttons: {
        OK: () => {
          this._dialog.dialog("close");
        },
        "Clear All": () => {
          UiCommands.clearAllItems(getSelectedOperation());
        }
      }
    });
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = FanfieldDialog.TYPE;
    Feature.prototype.initialize.call(this, map, options);
    this.title = "Fan Field";
    this.label = "Fan Field";
    this._operation = getSelectedOperation();
    let p = localStorage["wasabee-fanfield-anchor"];
    if (p) this._anchor = WasabeePortal.create(p);
    p = localStorage["wasabee-fanfield-start"];
    if (p) this._start = WasabeePortal.create(p);
    p = localStorage["wasabee-fanfield-end"];
    if (p) this._end = WasabeePortal.create(p);
  },

  fanfield: context => {
    if (!context._anchor || !context._start || !context._end) {
      alert("Please set the three portals first!");
      return;
    }

    let startAngle = context._angle(context._anchor, context._start, false);
    let endAngle = context._angle(context._anchor, context._end, false);
    let min = Math.min(startAngle, endAngle);
    let max = Math.max(startAngle, endAngle);

    let ccw = false;
    if (startAngle != min) {
      console.log("fanfield running counter-clockwise");
      ccw = true; // must be going counter-clockwise
      startAngle = context._angle(context._anchor, context._start, true);
      endAngle = context._angle(context._anchor, context._end, true);
      min = Math.min(startAngle, endAngle);
      max = Math.max(startAngle, endAngle);
    }

    context._angleTwo(context._anchor, context._start, context._end);

    const good = new Map();
    for (const p of context._getAllPortalsOnScreen()) {
      if (p.options.guid == context._anchor.id) continue;
      const pAngle = context._angle(context._anchor, p, ccw);
      context._angleTwo(context._anchor, context._start, p);
      if (pAngle < min || pAngle > max) continue;
      good.set(pAngle, p); // what are the odds of two having EXACTLY the same angle?
    }
    const sorted = new Map([...good.entries()].sort()); // what ugly is this?

    context._operation.startBatchMode();
    let order = 0;
    let fields = 0;
    for (const [angle, p] of sorted) {
      order++;
      const wp = WasabeePortal.get(p.options.guid);
      context._operation.addLink(wp, context._anchor, "fan anchor", order);
      for (const [nextangle, check] of sorted) {
        if (nextangle >= angle) break; // stop if we've gone too far
        const testlink = new WasabeeLink(
          context._operation,
          check.options.guid,
          wp.id
        );
        let crossed = false;
        for (const real of context._operation.links) {
          if (greatCircleArcIntersect(real, testlink)) {
            crossed = true;
            break;
          }
        }
        if (!crossed) {
          testlink.throwOrderPos = ++order;
          testlink.description = "fan subfield";
          fields++;
          context._operation.links.push(testlink);
        }
      }
    }
    context._operation.endBatchMode();
    let ap = 313 * order + 1250 * fields;
    alert(`Fanfield found ${order} links and ${fields} fields for ${ap} AP`);
  },

  _angle: function(a, p, ccw) {
    const all = a.latLng; // anchor is always a WasabeePortal
    const pll = p.latLng || p._latlng; // probably not a WasabeePortal (except start/end)
    // if (!pll) pll = p._latlng; // if not, treat as IITC portal

    // always return a positive value so the sort() functions work sanely
    // work in radians since no one sees it and degrees would be slower
    if (ccw) return 4 - Math.atan2(pll.lng - all.lng, pll.lat - all.lat);
    return 2 + Math.atan2(pll.lng - all.lng, pll.lat - all.lat);
  },

  _angleTwo: function(anchor, start, check) {
    // if slow, cache these
    const ap = L.Projection.LonLat.project(anchor.latLng);
    const sp = L.Projection.LonLat.project(start.latLng);
    const cp = L.Projection.LonLat.project(check.latLng || check._latlng);

    const AB = Math.sqrt(Math.pow(sp.x - ap.x, 2) + Math.pow(sp.y - ap.y, 2));
    const BC = Math.sqrt(Math.pow(sp.x - cp.x, 2) + Math.pow(sp.y - cp.y, 2));
    const AC = Math.sqrt(Math.pow(cp.x - ap.x, 2) + Math.pow(cp.y - ap.y, 2));
    const r = Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB));
    if (Number.isNaN(r)) return 0;
    return r;
  },

  _isOnScreen: function(ll, bounds) {
    return (
      ll.lat < bounds._northEast.lat &&
      ll.lng < bounds._northEast.lng &&
      ll.lat > bounds._southWest.lat &&
      ll.lng > bounds._southWest.lng
    );
  },

  _getAllPortalsOnScreen: function() {
    const bounds = window.clampLatLngBounds(window.map.getBounds());
    const x = [];
    for (const portal in window.portals) {
      if (this._isOnScreen(window.portals[portal].getLatLng(), bounds)) {
        x.push(window.portals[portal]);
      }
    }
    return x;
  }
});

export default FanfieldDialog;
