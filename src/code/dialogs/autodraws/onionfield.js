import { AutoDraw } from "./tools";
import WasabeePortal from "../../model/portal";
import { getSelectedOperation } from "../../selectedOp";
import { portalInField } from "../../crosslinks";
import { clearAllLinks, getAllPortalsOnScreen } from "../../uiCommands";
import wX from "../../wX";
import { displayError } from "../../error";

/**
 * Sort trangle vertices by widest angle
 * @param {WasabeePortal} one
 * @param {WasabeePortal} two
 * @param {WasabeePortal} three
 * @returns {[WasabeePortal, WasabeePortal, WasabeePortal]}
 */
function sortAnchors(one, two, three) {
  const a = [
    [one, euclideanAngle(one, two, three)],
    [two, euclideanAngle(two, three, one)],
    [three, euclideanAngle(three, one, two)],
  ];
  return a.sort((a, b) => b[1] - a[1]).map((a) => a[0]);
}

/**
 * Returns the angle a<bc
 * @param {WasabeePortal} a
 * @param {WasabeePortal} b
 * @param {WasabeePortal} c
 * @returns
 */
function euclideanAngle(a, b, c) {
  // this formua finds b, swap a&b for our purposes
  const A = window.map.project(b.latLng);
  const B = window.map.project(a.latLng);
  const C = window.map.project(c.latLng);

  const AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
  const BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
  const AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
  const Z = Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB));
  return Z;
}

/**
 *
 * @param {WasabeePortal} anchor
 * @param {WasabeePortal[]} portals
 * @param {"equi" | "balenced" | "grow"} type
 * @returns
 */
function onion(anchor, portals, type) {
  portals = portals.filter((p) => p.id !== anchor.id);
  if (portals.length < 2) return [];

  const m = new Map();
  for (const p of portals) {
    const pDist = window.map.distance(anchor.latLng, p.latLng);
    m.set(pDist, p);
  }
  const sorted = [...m.entries()].sort((a, b) => a[0] - b[0]).map((a) => a[1]);

  let [one, two, three] = sortAnchors(anchor, sorted[0], sorted[1]);
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

  portals = portals.filter((p) => p.id !== two.id && p.id !== three.id);

  const round = type === "grow" ? 3 : 1;

  let running = round;
  while (running > 0 && portals.length > 0) {
    running = running - 1;

    // sorted remaining by distance to one
    const m = new Map();
    for (const p of portals) {
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
      portals = portals.filter((p) => p.id !== wp.id);

      path.push({ from: wp, to: two });
      path.push({ from: wp, to: three });
      path.push({ from: wp, to: one });

      if (type === "balanced") {
        [one, two, three] = [two, three, wp];
      } else {
        // determine the widest angle, wp<23, use that to determine next covered portal
        [one, two, three] = sortAnchors(two, three, wp);
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
}

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
    optionLabel.textContent = wX("autodraw.onion.variant");
    this.optionMenu = L.DomUtil.create("select", null, container);
    for (const [text, value] of [
      [wX("autodraw.onion.variant.equilateral"), "equi"],
      [wX("autodraw.onion.variant.grow"), "grow"],
      [wX("autodraw.onion.variant.balanced"), "balanced"],
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

    const links = onion(this._anchor, allPortals, this.optionMenu.value);

    this._operation.startBatchMode();
    links.forEach((l, i) =>
      this._operation.addLink(l.from, l.to, {
        order: i + 1,
        color: colors[i % colors.length],
      })
    );
    this._operation.endBatchMode();
  },
});

export default OnionfieldDialog;
