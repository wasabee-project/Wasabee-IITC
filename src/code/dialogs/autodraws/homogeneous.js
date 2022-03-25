import { AutoDraw } from "./tools";
import WasabeePortal from "../../model/portal";
import { getSelectedOperation } from "../../selectedOp";
import {
  extendLatLngToLLC,
  greatCircleArcIntersectByLatLngs,
  portalInField,
  dist2,
  fieldCenter,
} from "../../crosslinks";
import { clearAllLinks, getAllPortalsOnScreen } from "../../uiCommands";
import wX from "../../wX";

import { displayError, displayWarning } from "../../error";

/**
 * Split a set of portals inside a field into three sets with respect to a portal in the field
 * @param {WasabeePortal} centerPoint Portal inside the field one/two/three
 * @param {WasabeePortal[]} possibles Portals inside the field one/two/three
 * @param {WasabeePortal} one
 * @param {WasabeePortal} two
 * @param {WasabeePortal} three
 * @returns {[WasabeePortal[],WasabeePortal[],WasabeePortal[]]} Sets of portals inside one/two/centerPoint, two/three/centerPoint and three/one/centerPoint
 */
function getSubregions(centerPoint, possibles, one, two, three) {
  const possibleExceptAnchors = new Array();
  for (const p of possibles) {
    const guid = p.id || p.options.guid;
    if (
      guid !== centerPoint.id &&
      guid !== one.id &&
      guid !== two.id &&
      guid !== three.id
    )
      possibleExceptAnchors.push(p);
  }

  const onePortals = new Array();
  const twoPortals = new Array();
  const threePortals = new Array();
  for (const p of possibleExceptAnchors) {
    if (
      greatCircleArcIntersectByLatLngs(
        p.latLng,
        one.latLng,
        centerPoint.latLng,
        two.latLng
      ) ||
      greatCircleArcIntersectByLatLngs(
        p.latLng,
        one.latLng,
        centerPoint.latLng,
        three.latLng
      )
    )
      twoPortals.push(p);
    else if (
      greatCircleArcIntersectByLatLngs(
        p.latLng,
        two.latLng,
        centerPoint.latLng,
        one.latLng
      ) ||
      greatCircleArcIntersectByLatLngs(
        p.latLng,
        two.latLng,
        centerPoint.latLng,
        three.latLng
      )
    )
      threePortals.push(p);
    else onePortals.push(p);
  }

  return [onePortals, twoPortals, threePortals];
}

/**
 * Sort in place by distance to point
 * @param {WasabeePortal[]} portals
 * @param {import("leaflet").LatLng} point
 */
function sortByDistance(portals, point) {
  // straight square distance is good enough in 3D
  const cp = extendLatLngToLLC(point)._cartesian;
  const cPs = new Map(
    portals.map((p) => [
      p.id,
      dist2(cp, extendLatLngToLLC(p.latLng)._cartesian),
    ])
  );
  return portals.sort((a, b) => cPs.get(a.id) - cPs.get(b.id));
}

function numInnerPortalsPerDepth(depth) {
  return (3 ** (depth - 1) - 1) / 2;
}

/**
 * Find one of the best (in terms of splits) HF configuration as a Tree decomposition
 * @param {WasabeePortal[]} portalsCovered
 * @param {WasabeePortal} one
 * @param {WasabeePortal} two
 * @param {WasabeePortal} three
 * @param {number} depth
 * @returns {import("./homogeneous").Tree}
 */
function fullRecurser(portalsCovered, one, two, three, depth) {
  const alreadyCalculatedCover = new Map();

  console.log(
    "Expect at least",
    Math.max(0, numInnerPortalsPerDepth(depth) - portalsCovered.length),
    "missing splits"
  );

  /**
   * Find one of the best (in terms of splits) HF configuration as a Tree decomposition
   * @param {number} depth
   * @param {WasabeePortal[]} portalsCovered
   * @param {WasabeePortal} one
   * @param {WasabeePortal} two
   * @param {WasabeePortal} three
   * @returns {import("./homogeneous").Tree}
   */
  const homogeneousFrom = (depth, portalsCovered, one, two, three) => {
    if (depth <= 1)
      return { success: true, anchors: [one, two, three], split: 0 };

    const key = [depth, one.id, two.id, three.id].sort().toString();
    if (alreadyCalculatedCover.get(key) === undefined) {
      const maxNbSplit = Math.min(
        numInnerPortalsPerDepth(depth),
        portalsCovered.length
      );
      /** @type {import("./homogeneous").Tree} */
      let bestResult = {
        success: false,
        anchors: [one, two, three],
        split: 0,
        portal: null,
        children: null,
      };
      sortByDistance(portalsCovered, fieldCenter(one, two, three));
      for (const wp of portalsCovered) {
        const subregions = getSubregions(
          wp,
          new Array(...portalsCovered),
          one,
          two,
          three
        );
        const maxNbSplitSubregions =
          Math.min(numInnerPortalsPerDepth(depth - 1), subregions[0].length) +
          Math.min(numInnerPortalsPerDepth(depth - 1), subregions[1].length) +
          Math.min(numInnerPortalsPerDepth(depth - 1), subregions[2].length);
        if (maxNbSplitSubregions + 1 <= bestResult.split) {
          // Skip the portal since it will induce less splits than the current best choice
          continue;
        }

        let ret1 = homogeneousFrom(
          depth - 1,
          new Array(...subregions[0]),
          one,
          two,
          wp
        );
        let ret2 = homogeneousFrom(
          depth - 1,
          new Array(...subregions[1]),
          two,
          three,
          wp
        );
        let ret3 = homogeneousFrom(
          depth - 1,
          new Array(...subregions[2]),
          one,
          three,
          wp
        );

        const nbSplit = ret1.split + ret2.split + ret3.split + 1;

        if (nbSplit > bestResult.split) {
          bestResult.success = ret1.success && ret2.success && ret3.success;
          bestResult.split = nbSplit;
          bestResult.portal = wp;
          bestResult.children = [ret1, ret2, ret3];
        }

        if (nbSplit == maxNbSplit) {
          // we cannot do more split so it is one of the best choice
          break;
        }
      }
      alreadyCalculatedCover.set(key, bestResult);
    }
    return alreadyCalculatedCover.get(key);
  };
  return homogeneousFrom(depth, portalsCovered, one, two, three);
}

/**
 * Find a HF Tree decomposition with a greedy heuristic, may fail even if HF exists
 * @param {WasabeePortal[]} portalsCovered
 * @param {WasabeePortal} one
 * @param {WasabeePortal} two
 * @param {WasabeePortal} three
 * @param {number} depth
 * @returns {import("./homogeneous").Tree}
 */
function greedy(portalsCovered, one, two, three, depth) {
  if (depth <= 1)
    return { success: true, anchors: [one, two, three], split: 0 };

  // empty tree
  /** @type {import("./homogeneous").Tree} */
  let bestResult = {
    success: false,
    anchors: [one, two, three],
    split: 0,
    portal: null,
    children: null,
  };

  if (!portalsCovered.length) {
    return bestResult;
  }

  // sort first by distance to center
  sortByDistance(portalsCovered, fieldCenter(one, two, three));

  // greedy heuristic:
  // find the portal that divides the area into regions with the closest number of portals
  // starts at the center-most and works outwards
  let differential = portalsCovered.length;
  let best = [];
  let bestp = {};
  // for each of the portals in play
  for (const wp of portalsCovered) {
    const subregions = getSubregions(
      wp,
      new Array(...portalsCovered),
      one,
      two,
      three
    );
    // smallest difference in the number of portals between the greatest and least, 0 being ideal
    const temp =
      Math.max(
        subregions[0].length,
        subregions[1].length,
        subregions[2].length
      ) -
      Math.min(
        subregions[0].length,
        subregions[1].length,
        subregions[2].length
      );
    if (temp < differential) {
      best = subregions;
      differential = temp;
      bestp = wp;
    }
    // found one with equal number of portals in all 3, quit digging
    if (differential == 0) break;
  }

  bestResult.portal = bestp;

  bestResult.children = [
    greedy(new Array(...best[0]), one, two, bestp, depth - 1),
    greedy(new Array(...best[1]), two, three, bestp, depth - 1),
    greedy(new Array(...best[2]), one, three, bestp, depth - 1),
  ];
  bestResult.success =
    bestResult.children[0].success &&
    bestResult.children[1].success &&
    bestResult.children[2].success;
  bestResult.split =
    1 +
    bestResult.children[0].split +
    bestResult.children[1].split +
    bestResult.children[2].split;
  return bestResult;
}

const HomogeneousDialog = AutoDraw.extend({
  statics: {
    TYPE: "HomogeneousDialog",
  },

  initialize: function (options) {
    AutoDraw.prototype.initialize.call(this, options);
    let p = localStorage[window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY];
    if (p) this._anchorOne = new WasabeePortal(p);
    p = localStorage[window.plugin.wasabee.static.constants.ANCHOR_TWO_KEY];
    if (p) this._anchorTwo = new WasabeePortal(p);
    p = localStorage[window.plugin.wasabee.static.constants.ANCHOR_THREE_KEY];
    if (p) this._anchorThree = new WasabeePortal(p);
    this._failed = 0;
  },

  addHooks: function () {
    AutoDraw.prototype.addHooks.call(this);
    this._layerGroup = new L.LayerGroup();
    window.addLayerGroup("Wasabee H-G Debug", this._layerGroup, true);
    this._displayDialog();
    this._updatePortalSet();
  },

  _updatePortalSet: function () {
    AutoDraw.prototype._updatePortalSet.call(this);
    if (this._anchorOne && this._anchorTwo && this._anchorThree) {
      this._portalSets.portals.portals =
        this._portalSets.portals.portals.filter((p) =>
          portalInField(this._anchorOne, this._anchorTwo, this._anchorThree, p)
        );

      this._portalSets.portals.display.textContent = wX("PORTAL_COUNT", {
        count: this._portalSets.portals.portals.length,
      });
    }
  },

  removeHooks: function () {
    window.removeLayerGroup(this._layerGroup);
    AutoDraw.prototype.removeHooks.call(this);
  },

  _displayDialog: function () {
    const container = L.DomUtil.create("div", "container");
    const description2 = L.DomUtil.create("div", "desc", container);
    description2.textContent = wX("H-GEN_INST");

    this._addSetPortal(
      wX("ANCHOR_PORTAL"),
      "_anchorOne",
      container,
      window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY,
      this._updatePortalSet.bind(this)
    );
    this._addSetPortal(
      wX("ANCHOR_PORTAL2"),
      "_anchorTwo",
      container,
      window.plugin.wasabee.static.constants.ANCHOR_TWO_KEY,
      this._updatePortalSet.bind(this)
    );
    this._addSetPortal(
      wX("ANCHOR_PORTAL3"),
      "_anchorThree",
      container,
      window.plugin.wasabee.static.constants.ANCHOR_THREE_KEY,
      this._updatePortalSet.bind(this)
    );

    this._addSelectSet(wX("AUTODRAW_PORTALS_SET"), "portals", container, "all");
    this.spanPortalNeeded = L.DomUtil.create("span", "", container);

    const depthLabel = L.DomUtil.create("label", null, container);
    depthLabel.textContent = wX("MAX_SPLITS");
    this.depthMenu = L.DomUtil.create("input", null, container);
    this.depthMenu.type = "number";
    this.depthMenu.min = 2;
    this.depthMenu.value = 4;

    L.DomEvent.on(this.depthMenu, "change", () => {
      this.spanPortalNeeded.textContent = wX(
        "autodraw.homogeneous.portals_required",
        { count: numInnerPortalsPerDepth(+this.depthMenu.value) }
      );
    });

    const orderLabel = L.DomUtil.create("label", null, container);
    orderLabel.textContent = wX("autodraw.homogeneous.order");
    this.orderMenu = L.DomUtil.create("select", null, container);
    for (const [text, value] of [
      [wX("FROM_DEPTH"), "core"], // need wX on first column
      [wX("FROM_1-2"), "base12"],
      [wX("FROM_1-3"), "base13"],
      [wX("FROM_2-3"), "base23"],
    ]) {
      const orderOption = L.DomUtil.create("option", null, this.orderMenu);
      orderOption.value = value;
      orderOption.textContent = text;
    }

    this._addCheckbox(
      wX("HF_DEEP_SEARCH"),
      "wasabee-homogeneous-deep",
      "_fullSearch",
      container,
      true
    );

    const spanRedraw = L.DomUtil.create("div", null, container);
    this._redrawButton = L.DomUtil.create("button", null, spanRedraw);
    this._redrawButton.textContent = wX("HF_REDRAW_BUTTON");
    this._redrawButton.style.display = "none";
    L.DomEvent.on(this._redrawButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      this._operation = getSelectedOperation();
      if (this._tree) this._draw.call(this);
    });

    // Go button
    const drawButton = L.DomUtil.create("button", "drawb", container);
    drawButton.textContent = wX("HF_DRAW_BUTTON");
    L.DomEvent.on(drawButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      this._operation = getSelectedOperation();
      if (+this.depthMenu.value < 2) return;
      if (this._fullSearch) this.hdeepfield();
      else this.hfield();
    });

    const buttons = {};
    buttons[wX("CLOSE")] = () => {
      this.closeDialog();
    };
    buttons[wX("CLEAR LINKS")] = () => {
      this._layerGroup.clearLayers();
      clearAllLinks(getSelectedOperation());
    };

    this.createDialog({
      title: wX("HG"),
      html: container,
      width: "auto",
      dialogClass: "homogeneous",
      buttons: buttons,
    });
  },

  hfield: function () {
    this._failed = 0;
    this._layerGroup.clearLayers();

    if (!this._anchorOne || !this._anchorTwo || !this._anchorThree) {
      displayError("please select three anchors");
      return;
    }

    const portals = new Array();
    for (const p of getAllPortalsOnScreen(this._operation)) {
      if (portalInField(this._anchorOne, this._anchorTwo, this._anchorThree, p))
        portals.push(p);
    }

    console.time("HF greedy");
    const tree = greedy(
      portals,
      this._anchorOne,
      this._anchorTwo,
      this._anchorThree,
      +this.depthMenu.value
    );
    console.timeEnd("HF greedy");

    this._tree = tree;
    this._failed = numInnerPortalsPerDepth(+this.depthMenu.value) - tree.split;

    this._draw();

    if (this._failed > 0) {
      displayWarning(
        wX("autodraw.homogeneous.missing_split", { count: this._failed })
      );
    }
  },

  hdeepfield: function () {
    this._failed = 0;
    this._layerGroup.clearLayers();

    if (!this._anchorOne || !this._anchorTwo || !this._anchorThree) {
      displayError("please select three anchors");
      return;
    }

    const portals = new Array();
    for (const p of getAllPortalsOnScreen(this._operation)) {
      if (portalInField(this._anchorOne, this._anchorTwo, this._anchorThree, p))
        portals.push(p);
    }

    console.time("HF deep recurser");
    const tree = fullRecurser(
      portals,
      this._anchorOne,
      this._anchorTwo,
      this._anchorThree,
      +this.depthMenu.value
    );
    console.timeEnd("HF deep recurser");

    this._tree = tree;
    this._failed =
      numInnerPortalsPerDepth(+this.depthMenu.value) / 2 - tree.split;

    this._draw();

    if (this._failed > 0) {
      displayWarning(
        wX("autodraw.homogeneous.missing_split", { count: this._failed })
      );
    }

    this._failed = 0;

    if (!this._anchorOne || !this._anchorTwo || !this._anchorThree) {
      displayError("please select three anchors");
      return;
    }
  },

  _draw: function () {
    this._colors = [
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

    this._operation.startBatchMode();
    if (this.orderMenu.value == "base12")
      this._drawTreeBase(this._tree, this._anchorOne, this._anchorTwo);
    else if (this.orderMenu.value == "base13")
      this._drawTreeBase(this._tree, this._anchorOne, this._anchorThree);
    else if (this.orderMenu.value == "base23")
      this._drawTreeBase(this._tree, this._anchorTwo, this._anchorThree);
    else this._drawTreeCore(this._tree);
    this._operation.endBatchMode();

    // this._operation.cleanAnchorList();
    // now, remove the portals that are unused
    this._operation.cleanPortalList();

    this._redrawButton.style.display = "";
  },

  _drawTreeCore: function (tree) {
    const depthValue = +this.depthMenu.value - 1;
    const [one, two, three] = tree.anchors;
    const computeDepth = (depth, tree, map) => {
      if (tree.portal) {
        map.set(tree.portal.id, depth);
        for (const child of tree.children) computeDepth(depth + 1, child, map);
      }
    };

    const portalDepth = new Map([
      [one.id, 0],
      [two.id, 0],
      [three.id, 0],
    ]);
    computeDepth(1, tree, portalDepth);

    // the order follows this process (consider only op links)
    // (0) if max depth is 1, goto (9)
    // (1) start from maximal depth D portals
    // (2) for each portals of depth D:
    // (3)   link to the _only_ portal deepless by 1 (D-1)
    // (4)   if the second deepless portal isn't an anchor
    // (5)     link to the second deepest portal
    // (6) for each of the 1 deepless portals:
    // (7)   link to all the deeper portals by _increasing_ depth (D+1, D+2 etc)
    // (8) if D > 1 then goto (2) with D = D-1
    // (9) for each anchor:
    // (A)   deploy it (or don't link it before this step)
    // (B)   link to previous anchors
    // (C)   link to all deeper portals by _increasing_ depth (1, 2 etc)
    // NB: rules 4/5 were added to reduce the number of outbound links the center portal. Those links can be done earlier because they are not backlinks
    const orderByDepth = (a, b) => {
      let ad = portalDepth.get(a.id);
      let bd = portalDepth.get(b.id);

      const baseOrder = ((depthValue - bd) * (depthValue - bd - 1)) / 2 + 1;

      if (bd != 0 || b.id == one.id) return baseOrder + ad - bd - 1;

      if (b.id == two.id) return baseOrder + depthValue + ad;

      return baseOrder + 2 * depthValue + ad + 1;
    };

    const draw = (depth, r) => {
      if (r.portal) {
        const [first, second, father] = r.anchors
          .map((p) => [portalDepth.get(p.id), p])
          .sort()
          .map((a) => a[1]);
        const firstOrder = orderByDepth(r.portal, first);
        const secondOrder = orderByDepth(r.portal, second);
        const fatherOrder = orderByDepth(r.portal, father);
        const data = [
          portalDepth.get(first.id) // not outer anchor
            ? [first, r.portal, "intern", firstOrder]
            : [first, r.portal, "anchor intern", firstOrder],
          // not an intern link (no double field)
          portalDepth.get(second.id) > 0
            ? [r.portal, second, "early", fatherOrder]
            : [second, r.portal, "anchor intern", secondOrder],
          portalDepth.get(father.id) == 0
            ? [father, r.portal, "anchor intern", fatherOrder]
            : [r.portal, father, "to father", fatherOrder],
        ];
        for (const [from, to, comment, order] of data) {
          this._operation.addLink(from, to, {
            description: comment,
            order: order,
            color: this._colors[order % this._colors.length],
            replace: true,
          });
        }
        for (const child of r.children) draw(depth + 1, child);
      }
    };

    const drawDebug = (depth, r) => {
      if (r.portal) for (const child of r.children) drawDebug(depth - 1, child);
      if (!r.portal && !r.success) {
        // debug layer
        const color = depth == 1 ? "orange" : "red";
        const latlngs = [
          r.anchors[0].latLng,
          r.anchors[1].latLng,
          r.anchors[2].latLng,
          r.anchors[0].latLng,
        ];
        const polygon = L.polygon(latlngs, { color: color });
        polygon.addTo(this._layerGroup);
      }
    };
    drawDebug(depthValue, tree);

    this._operation.addPortal(one);
    this._operation.addPortal(two);
    this._operation.addPortal(three);
    this._operation.addLink(two, one, {
      description: "Outer 1",
      order: (depthValue * (depthValue - 1)) / 2 + depthValue + 1,
      color:
        this._colors[
          ((depthValue * (depthValue - 1)) / 2 + depthValue + 1) %
            this._colors.length
        ],
      replace: true,
    });
    this._operation.addLink(three, one, {
      description: "Outer 2",
      order: (depthValue * (depthValue - 1)) / 2 + 2 * depthValue + 2,
      color:
        this._colors[
          ((depthValue * (depthValue - 1)) / 2 + 2 * depthValue + 2) %
            this._colors.length
        ],
      replace: true,
    });
    this._operation.addLink(three, two, {
      description: "Outer 3",
      order: (depthValue * (depthValue - 1)) / 2 + 2 * depthValue + 2,
      color:
        this._colors[
          ((depthValue * (depthValue - 1)) / 2 + 2 * depthValue + 2) %
            this._colors.length
        ],
      replace: true,
    });
    draw(1, tree);
  },

  _drawTreeBase: function (tree, one, two) {
    const depthValue = +this.depthMenu.value - 1;

    const drawFractal = (depth, r, pOne, pTwo, order) => {
      if (r.portal) {
        // draw inner HF on base 1-2
        const pThree = r.anchors.filter(
          (p) => p.id !== pOne.id && p.id !== pTwo.id
        )[0];
        for (const child of r.children)
          if (child.anchors.every((p) => p.id !== pThree.id))
            order = draw(depth + 1, child, pOne, pTwo, order);

        let order1, order2;
        // draw fractal on 1-p
        for (const child of r.children)
          if (child.anchors.every((p) => p.id !== pTwo.id))
            order1 = drawFractal(depth + 1, child, pOne, r.portal, order);

        // draw fractal on 2-p
        for (const child of r.children)
          if (child.anchors.every((p) => p.id !== pOne.id))
            order2 = drawFractal(depth + 1, child, pTwo, r.portal, order);

        // should be computed with a formula
        order = Math.max(order1, order2);
      }
      return order;
    };

    // link an anchor to inner portals in depth order
    const drawBackLink = (depth, r, anchor, order) => {
      if (r.portal) {
        this._operation.addLink(anchor, r.portal, {
          description: "intern link",
          order: order + 1,
          color: this._colors[order % this._colors.length],
          replace: true,
        });
        for (const child of r.children)
          if (child.anchors.includes(anchor))
            drawBackLink(depth + 1, child, anchor, order + 1);
      }
      return order + depthValue - depth + 1;
    };

    // draw a HF from base
    const draw = (depth, r, pOne, pTwo, order = 1) => {
      // draw fratal on 1-2
      order = drawFractal(depth, r, pOne, pTwo, order);
      const pThree = r.anchors.filter(
        (p) => p.id !== pOne.id && p.id !== pTwo.id
      )[0];
      // draw outer link
      for (const anchor of [pOne, pTwo]) {
        this._operation.addLink(pThree, anchor, {
          order: order + 1,
          color: this._colors[order % this._colors.length],
          replace: true,
        });
      }
      if (!r.portal) return order + 1;
      // draw inner link from 3
      return drawBackLink(depth, r, pThree, order + 1);
    };

    const drawDebug = (depth, r) => {
      if (r.portal) for (const child of r.children) drawDebug(depth - 1, child);
      if (!r.portal && !r.success) {
        // debug layer
        const color = depth == 1 ? "orange" : "red";
        const latlngs = [
          r.anchors[0].latLng,
          r.anchors[1].latLng,
          r.anchors[2].latLng,
          r.anchors[0].latLng,
        ];
        const polygon = L.polygon(latlngs, { color: color });
        polygon.addTo(this._layerGroup);
      }
    };
    drawDebug(depthValue, tree);

    for (const p of tree.anchors) this._operation.addPortal(p);
    this._operation.addLink(two, one, {
      description: "Outer base",
      order: 1,
      color: this._colors[0],
      replace: true,
    });
    draw(1, tree, one, two);
  },

  _getCenter: function (a, b, c) {
    const A = window.map.project(a.latLng || a._latlng);
    const B = window.map.project(b.latLng || b._latlng);
    const C = window.map.project(c.latLng || c._latlng);

    const point = L.point((A.x + B.x + C.x) / 3, (A.y + B.y + C.y) / 3);
    return window.map.unproject(point);
  },
});

export default HomogeneousDialog;
