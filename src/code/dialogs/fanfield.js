import { WDialog } from "../leafletClasses";
import WasabeePortal from "../portal";
import { getSelectedOperation } from "../selectedOp";
import { greatCircleArcIntersect } from "../crosslinks";
import WasabeeLink from "../link";
import { clearAllItems, getAllPortalsOnScreen } from "../uiCommands";
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

    const container = L.DomUtil.create("div", null);
    const description = L.DomUtil.create("div", "desc", container);
    description.textContent = wX("SELECT_FAN_PORTALS");

    const controls = L.DomUtil.create("div", null, container);

    const anchorDiv = L.DomUtil.create("div", null, controls);
    const anchorLabel = L.DomUtil.create("label", null, anchorDiv);
    anchorLabel.textContent = "Anchor Portal ";
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
        localStorage["wasabee-anchor-1"] = JSON.stringify(this._anchor);
        this._anchorDisplay.textContent = "";
        this._anchorDisplay.appendChild(this._anchor.displayFormat());
      } else {
        alert(wX("PLEASE_SELECT_PORTAL"));
      }
    });

    const startDiv = L.DomUtil.create("div", null, controls);
    const startLabel = L.DomUtil.create("label", null, startDiv);
    startLabel.textContent = "Start Portal ";
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
        alert(wX("PLEASE_SELECT_PORTAL"));
      }
    });

    const endDiv = L.DomUtil.create("div", null, controls);
    const endLabel = L.DomUtil.create("label", null, endDiv);
    endLabel.textContent = "End Portal ";
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
        alert(wX("PLEASE_SELECT_PORTAL"));
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
    button.textContent = wX("FANFIELD");
    L.DomEvent.on(button, "click", () => {
      const context = this;
      this.fanfield(context);
    });

    const context = this;
    this._dialog = window.dialog({
      title: wX("FANFIELD2"),
      width: "auto",
      height: "auto",
      html: container,
      dialogClass: "wasabee-dialog wasabee-dialog-fanfield",
      closeCallback: function() {
        context.disable();
        delete context._dialog;
      },
      buttons: {
        OK: () => {
          this._dialog.dialog("close");
        },
        "Clear All": () => {
          clearAllItems(getSelectedOperation());
        }
      }
    });
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = FanfieldDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
    this.title = "Fan Field";
    this.label = "Fan Field";
    this._operation = getSelectedOperation();
    let p = localStorage["wasabee-anchor-1"];
    if (p) this._anchor = WasabeePortal.create(p);
    p = localStorage["wasabee-fanfield-start"];
    if (p) this._start = WasabeePortal.create(p);
    p = localStorage["wasabee-fanfield-end"];
    if (p) this._end = WasabeePortal.create(p);
  },

  // fanfiled determines the portals between start/end and their angle (and order)
  fanfield: context => {
    context._layerGroup.clearLayers();

    if (!context._anchor || !context._start || !context._end) {
      alert(wX("SET_3_PORT"));
      return;
    }

    let startAngle = context._angle(context._anchor, context._start, false);
    let endAngle = context._angle(context._anchor, context._end, false);
    let min = Math.min(startAngle, endAngle);
    let max = Math.max(startAngle, endAngle);
    context._cw = false;

    if (startAngle != min) {
      console.log("fanfield running clockwise");
      context._cw = true; // must be going counter-clockwise
      startAngle = context._angle(context._anchor, context._start, true);
      endAngle = context._angle(context._anchor, context._end, true);
      min = Math.min(startAngle, endAngle);
      max = Math.max(startAngle, endAngle);
    }

    const text = min + " ... " + max + " " + context._cw + " " + (max - min);
    console.log(text);

    // if we cross 0, rotate 180deg so we don't have to deal with it
    context._invert = false;
    if (max - min > Math.PI) {
      console.log("going inverted");
      context._invert = true;
      // min = (min + Math.PI) % (2 * Math.PI);
      // max = (max + Math.PI) % (2 * Math.PI);
    }

    const good = new Map();
    for (const p of getAllPortalsOnScreen(context._operation)) {
      if (p.options.guid == context._anchor.id) continue;
      let pAngle = context._angle(context._anchor, p, context._cw);

      if (context._invert) pAngle = (pAngle + Math.PI) % (2 * Math.PI);

      const label = L.marker(p._latlng, {
        icon: L.divIcon({
          className: "plugin-portal-names",
          iconAnchor: [15],
          iconSize: [30, 12],
          html: pAngle
        }),
        guid: p.options.guid
      });
      label.addTo(context._layerGroup);

      if (pAngle < min || pAngle > max) continue;
      good.set(pAngle, p); // what are the odds of two having EXACTLY the same angle?
    }
    const sorted = new Map([...good.entries()].sort());
    context._draw(sorted, context);
  },

  // draw takes the sorted list of poratls and draws the links
  // determining any sub-fields can be added
  _draw: function(sorted, context) {
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
          wp.id,
          check.options.guid
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
    const ap = 313 * order + 1250 * fields;
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
