import { AutoDraw } from "./tools";
import wX from "../../wX";
import { getSelectedOperation } from "../../selectedOp";
import { getAllPortalsOnScreen, clearAllLinks } from "../../uiCommands";

import WasabeePortal from "../../model/portal";
import WasabeeMarker from "../../model/marker";

import { angle } from "./fanfield";
import { greatCircleArcIntersectByLatLngs } from "../../crosslinks";

function selectAngleInterval(anchor, portalsSorted, start, end) {
  const startAngle = angle(anchor, start);
  const endAngle = angle(anchor, end);

  // swap start/end if more than 180°
  if (
    (((endAngle - startAngle) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) >
    Math.PI
  ) {
    [start, end] = [end, start];
  }

  // Build the sequence of portals between start/end
  const slice = new Array();
  let s = 0;
  for (s = 0; portalsSorted[s].id != start.id; s++);
  for (; portalsSorted[s % portalsSorted.length].id != end.id; s++) {
    slice.push(portalsSorted[s % portalsSorted.length]);
  }
  slice.push(end);

  return slice;
}

function sortPortalsByAngle(anchor, portals) {
  const good = new Map();
  for (const p of portals) {
    if (p.id == anchor.id) continue;
    const pAngle = angle(anchor, p);
    good.set(pAngle, p);
  }

  const sorted = new Array(...good.entries())
    .sort((a, b) => a[0] - b[0])
    .map((v) => v[1]);

  return sorted;
}

function fastFan(anchor, two, three, portalsSorted, offset, revSortAngle) {
  const res = [];
  const inserted = [two, three];
  if (revSortAngle.get(two.id) > revSortAngle.get(three.id)) inserted.reverse();
  for (let i = offset; i < portalsSorted.length; i++) {
    const p = portalsSorted[i];
    if (!revSortAngle.has(p.id)) continue;
    let prev = inserted.length - 1;
    let next = 0;
    while (
      prev >= 0 &&
      revSortAngle.get(inserted[prev].id) > revSortAngle.get(p.id)
    )
      prev--;
    while (
      next < inserted.length &&
      revSortAngle.get(inserted[next].id) < revSortAngle.get(p.id)
    )
      next++;
    if (
      !greatCircleArcIntersectByLatLngs(
        anchor,
        p,
        inserted[prev],
        inserted[next]
      )
    ) {
      res.push([p, inserted[prev], inserted[next]]);
      inserted.splice(prev + 1, 0, p);
    }
  }
  return res;
}

// now that the formerly external mm functions are in the class, some of the logic can be cleaned up
// to not require passing values around when we can get them from this.XXX
const FlipFlopDialog = AutoDraw.extend({
  statics: {
    TYPE: "madridDialog",
  },

  initialize: function (options) {
    AutoDraw.prototype.initialize.call(this, options);
    let p = localStorage[window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY];
    if (p) this._anchorOne = new WasabeePortal(p);
  },

  addHooks: function () {
    AutoDraw.prototype.addHooks.call(this);
    this._displayDialog();
  },

  _buildContent: function () {
    const container = L.DomUtil.create("div", "container");
    const description = L.DomUtil.create("div", "desc", container);
    description.textContent = wX("FLIP_FLOP_DESC");

    const description2 = L.DomUtil.create("div", "desc", container);
    description2.textContent = wX("FLIP_FLOP_INSTRUCTION");

    this._addSetPortal(
      wX("ANCHOR1"),
      "_anchorOne",
      container,
      window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY
    );

    this._addSelectSet(wX("AUTODRAW_PORTALS_SET"), "set", container, "all");

    L.DomUtil.create("label", null, container).textContent = "#SBUL";
    this._nbSbul = L.DomUtil.create("input", null, container);
    this._nbSbul.type = "number";
    this._nbSbul.value = 2;
    this._nbSbul.size = 1;
    this._nbSbul.min = 0;
    this._nbSbul.max = 4;

    // Go button
    const button = L.DomUtil.create("button", "drawb", container);
    button.textContent = wX("FANFIELD");
    L.DomEvent.on(button, "click", () => {
      const total = this.doFanGun();
      alert(`Flip flop: found ${total} links`);
    });

    return container;
  },

  _displayDialog: function () {
    const container = this._buildContent();

    const buttons = {};
    buttons[wX("CLOSE")] = () => {
      this.closeDialog();
    };
    buttons[wX("FLIP_FLOP_FIND_ANCHORS")] = () => {
      this.findOtherAnchors();
    };
    buttons[wX("CLEAR LINKS")] = () => {
      clearAllLinks(getSelectedOperation());
    };

    this.createDialog({
      title: wX("FLIP_FLOP_TITLE"),
      html: container,
      width: "auto",
      dialogClass: "flipflop",
      buttons: buttons,
      id: "flipflop",
    });
  },

  findOtherAnchors: function () {
    if (!this.best) return;

    this._operation = getSelectedOperation();
    const portals = getAllPortalsOnScreen(this._operation);

    const sequencePortals = this.best.steps.map((s) => s[0]);
    const linkedPortals = sequencePortals.concat([
      this.best.two,
      this.best.three,
    ]);
    const portalsMatch = [];
    for (const a of portals) {
      let match = true;

      // check distance order
      for (const [p, p1, p2] of this.best.steps) {
        if (
          a.latLng.distanceTo(p.latLng) > a.latLng.distanceTo(p1.latLng) ||
          a.latLng.distanceTo(p.latLng) > a.latLng.distanceTo(p2.latLng)
        ) {
          match = false;
          break;
        }
      }
      if (!match) continue;

      // check angle order
      const sortedAngle = sortPortalsByAngle(a, linkedPortals);
      const interval = selectAngleInterval(
        a,
        sortedAngle,
        this.best.two,
        this.best.three
      );
      if (interval.length !== linkedPortals.length) continue;

      const angleSort = interval.map((p) => p.id);
      let i = 0,
        j = 0;
      while (i < angleSort.length && j < this.best.angleSort.length) {
        if (this.best.angleSort[j] === angleSort[i]) i++;
        j++;
      }
      match = i == angleSort.length;

      if (match) portalsMatch.push(a);
    }
    for (const a of portalsMatch) {
      this._operation.addMarker(WasabeeMarker.constants.MARKER_TYPE_LINK, a, {
        comment: "flipflop anchor",
      });
    }
  },

  getDistances: function (anchor, portals) {
    if (this.distCache && this.distCache.has(anchor.id))
      return this.distCache.get(anchor.id);
    const dists = new Map(
      portals.map((p) => [p.id, p.latLng.distanceTo(anchor.latLng)])
    );
    if (this.distCache) this.distCache.set(anchor.id, dists);
    return dists;
  },

  createFanLinks: function (one, two, three, steps, order = 0) {
    this._operation.addLink(two, three, {
      description: "flipflop origin",
      order: order + 1,
    });
    for (const [p, a, b] of steps) {
      this._operation.addLink(p, a, {
        description: "flipflop origin",
        order: order + 1,
      });
      this._operation.addLink(p, b, {
        description: "flipflop origin",
        order: order + 1,
      });
    }

    order++;
    this._operation.addLink(one, two, {
      description: "flipflop fire",
      order: ++order,
    });
    this._operation.addLink(one, three, {
      description: "flipflop fire",
      order: ++order,
    });
    for (const s of steps) {
      const p = s[0];
      this._operation.addLink(one, p, {
        description: "flipflop fire",
        order: ++order,
      });
    }
  },

  doFanGun: function () {
    // Calculate the multimax
    if (!this._anchorOne) {
      alert(wX("INVALID REQUEST"));
      return 0;
    }

    this._operation = getSelectedOperation();
    const portals = this._portalSets["set"].portals.filter(
      (p) => p.id != this._anchorOne.id
    );

    const nbSbul =
      +this._nbSbul.value < 0
        ? 0
        : +this._nbSbul.value > 4
        ? 4
        : +this._nbSbul.value;

    console.log("starting fastfan");
    this.distCache = new Map();
    const distances = this.getDistances(this._anchorOne, portals);
    portals.sort((a, b) => distances.get(b.id) - distances.get(a.id));

    const sortedAngle = sortPortalsByAngle(this._anchorOne, portals);

    const best = {
      two: null,
      three: null,
      steps: [],
    };
    const maxSteps = 8 * (nbSbul + 1) - 2;

    for (let i = 0; i < portals.length; i++) {
      const pTwo = portals[i];
      for (let j = i + 1; j < portals.length; j++) {
        const pThree = portals[j];
        const interval = selectAngleInterval(
          this._anchorOne,
          sortedAngle,
          pTwo,
          pThree
        );
        const revAngleSort = new Map(interval.map((p, i) => [p.id, i]));
        const res = fastFan(
          this._anchorOne,
          pTwo,
          pThree,
          portals,
          j + 1,
          revAngleSort
        );
        if (!best.two || best.steps.length < res.length) {
          best.steps = res;
          best.two = pTwo;
          best.three = pThree;
          best.angleSort = interval.map((p) => p.id);
          if (best.steps.length >= maxSteps) break;
        }
      }
      if (best.steps.length >= maxSteps) break;
    }

    if (best.steps.length > maxSteps)
      best.steps = best.steps.slice(0, maxSteps);

    if (!best.two) {
      alert(wX("INVALID REQUEST"));
      return 0;
    }

    this.best = best;

    this._operation.startBatchMode();
    this.createFanLinks(
      this._anchorOne,
      best.two,
      best.three,
      best.steps,
      this._operation.nextOrder - 1
    );
    console.log("fastfan done");

    this._operation.endBatchMode(); // save and run crosslinks

    return best.steps.length + 2;
  },
});

export default FlipFlopDialog;
