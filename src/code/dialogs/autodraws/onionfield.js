import { AutoDraw } from "./tools";
import WasabeePortal from "../../model/portal";
import { getSelectedOperation } from "../../selectedOp";
import { portalInField } from "../../crosslinks";
import { clearAllLinks, getAllPortalsOnScreen } from "../../uiCommands";
import wX from "../../wX";
import { displayError } from "../../error";

const OnionfieldDialog = AutoDraw.extend({
  statics: {
    TYPE: "OnionDialog",
  },

  initialize: function (options) {
    AutoDraw.prototype.initialize.call(this, options);
    const p =
      localStorage[window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY];
    if (p) this._anchor = new WasabeePortal(p);
  },

  addHooks: function () {
    AutoDraw.prototype.addHooks.call(this);
    this._displayDialog();
  },

  _displayDialog: function () {
    const container = L.DomUtil.create("div", "container");
    const description = L.DomUtil.create("div", "desc", container);
    description.textContent = wX("SELECT_ONION_PORTALS");
    const description3 = L.DomUtil.create("div", "desc", container);
    description3.textContent = wX("SEL_SB_ANCHOR2");

    this._addSetPortal(
      wX("ANCHOR_PORTAL"),
      "_anchor",
      container,
      window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY
    );

    const optionLabel = L.DomUtil.create("label", null, container);
    optionLabel.textContent = "Options"; // wX
    this.optionMenu = L.DomUtil.create("select", null, container);
    for (const [text, value] of [
      ["~Equilateral", "equi"],
      ["Let it grow", "grow"],
      ["Perfect balance", "balanced"], // need wX on first column
    ]) {
      const option = L.DomUtil.create("option", null, this.optionMenu);
      option.value = value;
      option.textContent = text;
    }

    // Go button
    const button = L.DomUtil.create("button", "drawb", container);
    button.textContent = wX("ONION");
    L.DomEvent.on(button, "click", (ev) => {
      L.DomEvent.stop(ev);
      this.onion.call(this);
    });
    const buttons = {};
    buttons[wX("CLOSE")] = () => {
      this.closeDialog();
    };
    buttons[wX("CLEAR LINKS")] = () => {
      clearAllLinks(getSelectedOperation());
    };

    this.createDialog({
      title: "Onion/Rose",
      html: container,
      width: "auto",
      dialogClass: "onion",
      buttons: buttons,
    });
  },

  onion: function () {
    // this._operation is OK here
    this._operation = getSelectedOperation();
    if (!this._anchor) {
      displayError("no anchor selected");
      return;
    }
    const colors = [
      "#f80c12",
      "#ee1100",
      "#ff3311",
      "#ff4422",
      "#ff6644",
      "#ff9933",
      "#feae2d",
      "#ccbb33",
      "#d0c310",
      "#aacc22",
      "#69d025",
      "#22ccaa",
      "#12bdb9",
      "#11aabb",
      "#4444dd",
      "#3311bb",
      "#3b0cbd",
      "#442299",
    ];
    const allPortals = getAllPortalsOnScreen(this._operation);

    const links = this._recurser(
      allPortals,
      this._anchor,
      this.optionMenu.value
    );

    this._operation.startBatchMode();
    links.forEach((l, i) =>
      this._operation.addLink(l.from, l.to, {
        order: i + 1,
        color: colors[i % colors.length],
      })
    );
    this._operation.endBatchMode();
  },

  // the data passing for this (portalsRemaining, thisPath)
  // is designed to allow for determining optimum path, the fast route is quick
  // and gets a reasonable set, optimum path determination is VERY slow and nets
  // only a few extra layers
  _recurser: function (portalsRemaining, start, type) {
    portalsRemaining = portalsRemaining.filter((p) => p.id !== start.id);
    if (portalsRemaining.length < 2) return [];

    const m = new Map();
    for (const p of portalsRemaining) {
      const pDist = window.map.distance(start.latLng, p.latLng);
      m.set(pDist, p);
    }
    const sorted = [...m.entries()]
      .sort((a, b) => a[0] - b[0])
      .map((a) => a[1]);

    let [one, two, three] = this._sortAnchors(start, sorted[0], sorted[1]);
    const path = [
      {
        from: two,
        to: one,
      },
      {
        from: three,
        to: one,
      },
      {
        from: three,
        to: two,
      },
    ];

    portalsRemaining = portalsRemaining.filter(
      (p) => p.id !== two.id && p.id !== three.id
    );

    const round = type === "grow" ? 3 : 1;

    let running = round;
    while (running > 0 && portalsRemaining.length > 0) {
      running = running - 1;

      // sorted remaining by distance to one
      const m = new Map();
      for (const p of portalsRemaining) {
        const pDist = window.map.distance(one.latLng, p.latLng);
        m.set(pDist, p);
      }
      const sorted = [...m.entries()]
        .sort((a, b) => a[0] - b[0])
        .map((a) => a[1]);

      // for each of the portals in play
      const wp = sorted.find((p) => portalInField(p, two, three, one));
      if (wp) {
        running = round;
        portalsRemaining = portalsRemaining.filter((p) => p.id !== wp.id);

        path.push({ from: wp, to: two });
        path.push({ from: wp, to: three });
        path.push({ from: wp, to: one });

        if (type === "balanced") {
          [one, two, three] = [two, three, wp];
        } else {
          // determine the widest angle, wp<23, use that to determine next covered portal
          [one, two, three] = this._sortAnchors(two, three, wp);
        }
      }
      if (running < round) {
        if (type == "grow") {
          // drop the widest angle constraint, take the next one
          [one, two, three] = [two, three, one];
        }
      }
    }
    // console.log("hit bottom", thisPath.length);
    return path;
  },

  _sortAnchors: function (one, two, three) {
    const a = [
      [one, this._angle(one, two, three)],
      [two, this._angle(two, three, one)],
      [three, this._angle(three, one, two)],
    ];
    return a.sort((a, b) => b[1] - a[1]).map((a) => a[0]);
  },

  // angle a<bc in radians
  _angle: function (a, b, c) {
    // this formua finds b, swap a&b for our purposes
    const A = window.map.project(b.latLng);
    const B = window.map.project(a.latLng);
    const C = window.map.project(c.latLng);

    const AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
    const BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
    const AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
    const Z = Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB));
    return Z;
  },
});

export default OnionfieldDialog;
