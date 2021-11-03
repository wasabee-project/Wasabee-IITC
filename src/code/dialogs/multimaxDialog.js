import { WDialog } from "../leafletClasses";
import WasabeePortal from "../model/portal";
import WasabeeMarker from "../model/marker";
import { getSelectedOperation } from "../selectedOp";
import wX from "../wX";
import {
  getAllPortalsOnScreen,
  testPortal,
  clearAllLinks,
} from "../uiCommands";
import { greatCircleArcIntersectByLatLngs } from "../crosslinks";

import PortalUI from "../ui/portal";

// now that the formerly external mm functions are in the class, some of the logic can be cleaned up
// to not require passing values around when we can get them from this.XXX
const MultimaxDialog = WDialog.extend({
  statics: {
    TYPE: "multimaxDialog",
  },

  needWritePermission: true,

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    window.map.on("wasabee:op:select", this.closeDialog, this);
    window.map.on("wasabee:op:change", this._opChange, this);
    this._mapRefreshHook = this._updatePortalSet.bind(this);
    window.addHook("mapDataRefreshEnd", this._mapRefreshHook);

    this._operation = getSelectedOperation();

    this._displayDialog();
    this._updatePortalSet();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.map.off("wasabee:op:select", this.closeDialog, this);
    window.map.off("wasabee:op:change", this._opChange, this);
    window.removeHook("mapDataRefreshEnd", this._mapRefreshHook);
  },

  _opChange: function () {
    this._operation = getSelectedOperation();
    this._updatePortalSet();
  },

  _initPortalSet: function (setKey, zone, keys) {
    const portalSet = this._portalSets[setKey];
    portalSet.zone = zone;
    portalSet.keys = keys;
    portalSet.portals = [];
  },

  _updatePortalSet: function () {
    for (const setKey in this._portalSets) {
      const portalSet = this._portalSets[setKey];
      if (portalSet.keys) {
        const keys = this._operation.markers.filter(
          (m) => m.type === WasabeeMarker.constants.MARKER_TYPE_KEY
        );
        portalSet.portals = keys.map((m) =>
          this._operation.getPortal(m.portalId)
        );

        if (portalSet.zone) {
          const zone = this._operation.getZone(portalSet.zone);
          if (zone) {
            //failsafe
            portalSet.portals = portalSet.portals.filter((p) =>
              zone.contains(p.latLng)
            );
          }
        }
      } else {
        const portals = getAllPortalsOnScreen(this._operation);
        if (portalSet.zone == 0) portalSet.portals = portals;
        else {
          const ids = new Set(portalSet.portals.map((p) => p.id));
          for (const p of portals) {
            if (!ids.has(p.id)) portalSet.portals.push(p);
          }
          const zone = this._operation.getZone(portalSet.zone);
          if (zone) {
            // filter all, if zone shape changed
            portalSet.portals = portalSet.portals.filter((p) =>
              zone.contains(p.latLng)
            );
          }
        }
      }
      portalSet.display.textContent = wX("PORTAL_COUNT", {
        count: portalSet.portals.length,
      });
    }
  },

  _addSetPortal: function (text, thisKey, container, storageKey) {
    const label = L.DomUtil.create("label", null, container);
    label.textContent = text;
    const button = L.DomUtil.create("button", null, container);
    button.textContent = wX("SET");
    const display = L.DomUtil.create("span", null, container);
    if (this[thisKey]) {
      display.appendChild(
        PortalUI.displayFormat(this[thisKey], this._smallScreen)
      );
    } else {
      display.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(button, "click", () => {
      this[thisKey] = PortalUI.getSelected();
      if (this[thisKey]) {
        if (storageKey)
          localStorage[storageKey] = JSON.stringify(this[thisKey]);
        display.textContent = "";
        display.appendChild(
          PortalUI.displayFormat(this[thisKey], this._smallScreen)
        );
      } else {
        display.textContent = wX("NOT_SET");
        alert(wX("PLEASE_SELECT_PORTAL"));
      }
    });
  },

  _addCheckbox: function (text, id, thisKey, container, defaultValue) {
    const label = L.DomUtil.create("label", null, container);
    label.textContent = text;
    label.htmlFor = id;
    this[thisKey] = L.DomUtil.create("input", null, container);
    this[thisKey].type = "checkbox";
    this[thisKey].id = id;
    this[thisKey].checked = defaultValue;
  },

  _addSelectSet: function (text, setKey, container, defaultValue) {
    const label = L.DomUtil.create("label", null, container);
    label.textContent = text;
    const select = L.DomUtil.create("select", null, container);
    const display = L.DomUtil.create("span", null, container);
    display.textContent = wX("NOT_SET");
    {
      const o = L.DomUtil.create("option", null, select);
      o.textContent = wX("MM_SET_ALL_PORTALS");
      o.value = "all";
      o.selected = defaultValue == o.value;
    }
    {
      const o = L.DomUtil.create("option", null, select);
      o.textContent = wX("MM_SET_ALL_KEYS");
      o.value = "keys";
      o.selected = defaultValue == o.value;
    }
    for (const zone of this._operation.zones) {
      const o = L.DomUtil.create("option", null, select);
      o.textContent = zone.name;
      o.value = zone.id;
      o.selected = defaultValue == o.value;
    }
    for (const zone of this._operation.zones) {
      const o = L.DomUtil.create("option", null, select);
      o.textContent = wX("MM_SET_KEYS_ZONE", { zoneName: zone.name });
      o.value = "keys" + zone.id;
      o.selected = defaultValue == o.value;
    }
    L.DomEvent.on(select, "change", (ev) => {
      L.DomEvent.stop(ev);
      const keys = select.value.slice(0, 4) === "keys";
      const zone =
        select.value === "all" || select.value === "keys"
          ? 0
          : +(keys ? select.value.slice(4) : select.value);
      this._initPortalSet(setKey, zone, keys);
      this._updatePortalSet();
    });

    this._portalSets[setKey] = {
      portals: [],
      zone: 0,
      keys: false,
      display: display,
    };
  },

  _buildContent: function () {
    const container = L.DomUtil.create("div", "container");
    const description = L.DomUtil.create("div", "desc", container);
    description.textContent = wX("SELECT_INSTRUCTIONS");

    const description2 = L.DomUtil.create("div", "desc", container);
    description2.textContent = wX("SEL_SB_ANCHOR2");

    this._addSetPortal(
      wX("ANCHOR1"),
      "_anchorOne",
      container,
      window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY
    );
    this._addSetPortal(
      wX("ANCHOR2"),
      "_anchorTwo",
      container,
      window.plugin.wasabee.static.constants.ANCHOR_TWO_KEY
    );

    this._addCheckbox(
      wX("ADD_BL"),
      "wasabee-multimax-backlink",
      "_flcheck",
      container
    );

    this._addCheckbox(
      wX("MM_INSERT_ORDER"),
      "wasabee-multimax-insert-order",
      "_orderFromEnd",
      container,
      true
    );

    this._addSelectSet(wX("MM_SPINE"), "spine", container, "all");

    // Go button
    const button = L.DomUtil.create("button", "drawb", container);
    button.textContent = wX("MULTI_M");
    L.DomEvent.on(button, "click", () => {
      const total = this.doMultimax.call(this);
      alert(`Multimax found ${total} layers`);
      // this.closeDialog();
    });

    return container;
  },

  _displayDialog: function () {
    const container = this._buildContent();

    const buttons = {};
    buttons[wX("CLOSE")] = () => {
      this.closeDialog();
    };
    buttons[wX("CLEAR LINKS")] = () => {
      clearAllLinks(getSelectedOperation());
    };

    this.createDialog({
      title: wX("MULTI_M_TITLE"),
      html: container,
      width: "auto",
      dialogClass: "multimax",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.multimaxButton,
    });
  },

  initialize: function (options) {
    WDialog.prototype.initialize.call(this, options);
    let p = localStorage[window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY];
    if (p) this._anchorOne = new WasabeePortal(p);
    p = localStorage[window.plugin.wasabee.static.constants.ANCHOR_TWO_KEY];
    if (p) this._anchorTwo = new WasabeePortal(p);
    this._urp = L.latLng(testPortal());
    this._portalSets = {};
  },

  getSpine: function (pOne, pTwo, portals) {
    const portalsMap = new Map(portals.map((p) => [p.id, p]));
    const poset = this.buildPOSet(pOne, pTwo, portals);
    const sequence = this.longestSequence(poset, null, (a, b) =>
      window.map.distance(portalsMap.get(a).latLng, portalsMap.get(b).latLng)
    );

    return sequence.map((id) => portalsMap.get(id));
  },

  /*
  Calculate, given two anchors and a set of portals, the deepest sequence of nested fields.
  */
  MM: function (
    pOne,
    pTwo,
    portals,
    order = 0, // first link is order + 1
    base = true,
    commentPrefix = "multimax "
  ) {
    const sequence = this.getSpine(pOne, pTwo, portals);

    // shift current op tasks order
    if (order < this._operation.nextOrder - 1) {
      let diff = sequence.length * 2 + 1;
      if (this._flcheck.checked) diff += sequence.length - 1;
      for (const l of this._operation.links) {
        // skip base
        if (l.toPortalId === pOne.id && l.fromPortalId === pTwo.id) continue;
        if (l.fromPortalId === pOne.id && l.toPortalId === pTwo.id) continue;
        if (l.opOrder > order) l.opOrder += diff;
      }
      for (const m of this._operation.markers) {
        if (m.opOrder > order) m.opOrder += diff;
      }
    }

    if (base)
      this._operation.addLink(pOne, pTwo, {
        description: commentPrefix + "base",
        order: ++order,
      });

    if (!Array.isArray(sequence) || !sequence.length) {
      // alert("No layers found");
      return [0, order, null];
    }

    let prev = null;

    for (const p of sequence) {
      this._operation.addLink(p, pOne, {
        description: commentPrefix + "link",
        order: ++order,
      });
      this._operation.addLink(p, pTwo, {
        description: commentPrefix + "link",
        order: ++order,
      });
      if (this._flcheck.checked && prev) {
        this._operation.addLink(p, prev, {
          description: commentPrefix + "back link",
          order: ++order,
        });
      }
      prev = p;
    }
    // return number of layers, last link order and last portal
    return [sequence.length, order, prev];
  },

  doMultimax: function () {
    // this._operation is OK here
    const portals = this._portalSets.spine.portals;

    // Calculate the multimax
    if (!this._anchorOne || !this._anchorTwo || !portals.length) {
      alert(wX("INVALID REQUEST"));
      return 0;
    }

    this._operation.startBatchMode();

    console.log("starting multimax");
    const length = this.MM(
      this._anchorOne,
      this._anchorTwo,
      portals,
      this._orderFromEnd.checked ? this._operation.nextOrder - 1 : 0
    )[0];
    console.log("multimax done");

    this._operation.endBatchMode(); // save and run crosslinks

    return length;
  },

  fieldCoversPortal: function (a, b, c, p) {
    const urp = this._urp;

    let crossings = 0;
    if (greatCircleArcIntersectByLatLngs(urp, p.latLng, a.latLng, b.latLng))
      crossings++;
    if (greatCircleArcIntersectByLatLngs(urp, p.latLng, a.latLng, c.latLng))
      crossings++;
    if (greatCircleArcIntersectByLatLngs(urp, p.latLng, b.latLng, c.latLng))
      crossings++;
    return crossings == 1; // crossing 0 or 2 is OK, crossing 3 is impossible
  },

  // given two anchor, build a map that shows which and how many portals are covered by each possible field by guid
  // note: a portal always covers itself
  buildPOSet: function (anchor1, anchor2, visible) {
    const poset = new Map();

    for (const i of visible) {
      const result = [];
      for (const j of visible) {
        if (i === j) result.push(j.id);
        else if (this.fieldCoversPortal(anchor1, anchor2, i, j))
          result.push(j.id);
      }
      poset.set(i.id, result);
    }

    return poset;
  },

  // given a poset, compute the maximal paths from all elements
  // the result contains a map that gives for any element the next ones and the list of the elements
  // that have the longest paths
  longestSequencesPoset: function (poset) {
    const alreadyCalculatedChildren = new Map();
    const preds_from = (c) => {
      if (alreadyCalculatedChildren.get(c) === undefined) {
        const res = {
          children: [],
          length: 1,
          number: 1,
        };
        for (const id of poset.get(c).filter((i) => i !== c)) {
          const val = preds_from(id);
          if (val.length + 1 > res.length) {
            res.length = val.length + 1;
            res.children = [];
            res.number = 0;
          }
          if (val.length + 1 == res.length) {
            res.children.push(id);
            res.number += val.number;
          }
        }
        alreadyCalculatedChildren.set(c, res);
      }
      return alreadyCalculatedChildren.get(c);
    };

    poset.set("__start__", Array.from(poset.keys()));
    return {
      maxima: preds_from("__start__").children,
      poset: alreadyCalculatedChildren,
      number: preds_from("__start__").number,
    };
  },

  // given a poset, find the longest sequence p1,p2,...pk such that poset(p2) contains p1, poset(p3) contains p2 etc
  // that minimizes the flight distance
  // notes:
  // - the result is an empty sequence only if the poset is empty or if poset(p) is empty for any p
  // - if the poset is given by buildPOSet, the first element is the guid of a portal that doesn't cover any other portal,
  //   and the last element is the portal that covers all portals of the sequence and isn't covered by any other portal
  //   (inner to outer)
  longestSequence: function (poset, start, dist) {
    const maximalPaths = this.longestSequencesPoset(poset);
    const alreadyCalculatedSequences = new Map();
    if (!dist) dist = () => 0;
    const sequence_from = (c) => {
      if (alreadyCalculatedSequences.get(c) === undefined) {
        const mP = maximalPaths.poset.get(c);
        if (mP.length == 1)
          alreadyCalculatedSequences.set(c, { seq: [c], dist: 0 });
        else {
          const best = mP.children
            .map(sequence_from)
            .reduce((S1, S2) =>
              S1.dist + dist(c, S1.seq[S1.seq.length - 1]) <
              S2.dist + dist(c, S2.seq[S2.seq.length - 1])
                ? S1
                : S2
            );
          const res = {
            seq: Array.from(best.seq),
            dist: best.dist,
          };
          res.dist += dist(res.seq[res.seq.length - 1], c);
          res.seq.push(c);
          alreadyCalculatedSequences.set(c, res);
        }
      }
      return alreadyCalculatedSequences.get(c);
    };

    if (start) {
      console.debug(
        maximalPaths.poset.get(start).number,
        "possible paths from the given start"
      );
      return sequence_from(start).seq;
    }

    console.debug(maximalPaths.number, "possible paths");
    return maximalPaths.maxima
      .map(sequence_from)
      .reduce((S1, S2) => (S1.dist < S2.dist ? S1 : S2)).seq;
  },
});

export default MultimaxDialog;
