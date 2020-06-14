import { WDialog } from "../leafletClasses";
import WasabeePortal from "../portal";
import { getSelectedOperation } from "../selectedOp";
import wX from "../wX";
import {
  getAllPortalsOnScreen,
  testPortal,
  clearAllLinks
} from "../uiCommands";
import { greatCircleArcIntersect } from "../crosslinks";

// now that the formerly external mm functions are in the class, some of the logic can be cleaned up
// to not require passing values around when we can get them from this.XXX
const MultimaxDialog = WDialog.extend({
  statics: {
    TYPE: "multimaxDialog"
  },

  addHooks: function() {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function() {
    WDialog.prototype.removeHooks.call(this);
  },

  _displayDialog: function() {
    if (!this._map) return;

    const container = L.DomUtil.create("div", "container");
    const description = L.DomUtil.create("div", "desc", container);
    description.textContent = wX("SELECT_INSTRUCTIONS");

    const description2 = L.DomUtil.create("div", "desc", container);
    description2.textContent = wX("SEL_SB_ANCHOR2");

    const anchorOneLabel = L.DomUtil.create("label", null, container);
    anchorOneLabel.textContent = wX("ANCHOR1");
    const anchorOneButton = L.DomUtil.create("button", null, container);
    anchorOneButton.textContent = wX("SET");
    this._anchorOneDisplay = L.DomUtil.create("span", null, container);
    if (this._anchorOne) {
      this._anchorOneDisplay.appendChild(
        this._anchorOne.displayFormat(this._smallScreen)
      );
    } else {
      this._anchorOneDisplay.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(anchorOneButton, "click", () => {
      this._anchorOne = WasabeePortal.getSelected();
      if (this._anchorOne) {
        localStorage[
          window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY
        ] = JSON.stringify(this._anchorOne);
        this._anchorOneDisplay.textContent = "";
        this._anchorOneDisplay.appendChild(
          this._anchorOne.displayFormat(this._smallScreen)
        );
      } else {
        alert(wX("PLEASE_SELECT_PORTAL"));
      }
    });

    const anchorTwoLabel = L.DomUtil.create("label", null, container);
    anchorTwoLabel.textContent = wX("ANCHOR2");
    const anchorTwoButton = L.DomUtil.create("button", null, container);
    anchorTwoButton.textContent = wX("SET");
    this._anchorTwoDisplay = L.DomUtil.create("span", null, container);
    if (this._anchorTwo) {
      this._anchorTwoDisplay.appendChild(
        this._anchorTwo.displayFormat(this._smallScreen)
      );
    } else {
      this._anchorTwoDisplay.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(anchorTwoButton, "click", () => {
      this._anchorTwo = WasabeePortal.getSelected();
      if (this._anchorTwo) {
        localStorage[
          window.plugin.wasabee.static.constants.ANCHOR_TWO_KEY
        ] = JSON.stringify(this._anchorTwo);
        this._anchorTwoDisplay.textContent = "";
        this._anchorTwoDisplay.appendChild(
          this._anchorTwo.displayFormat(this._smallScreen)
        );
      } else {
        alert(wX("PLEASE_SELECT_PORTAL"));
      }
    });

    const fllabel = L.DomUtil.create("label", null, container);
    fllabel.textContent = wX("ADD_BL");
    this._flcheck = L.DomUtil.create("input", null, container);
    this._flcheck.type = "checkbox";

    // Go button
    const button = L.DomUtil.create("button", "drawb", container);
    button.textContent = wX("MULTI_M");
    L.DomEvent.on(button, "click", () => {
      const total = this.doMultimax.call(this);
      alert(`Multimax found ${total} layers`);
      // this._dialog.dialog("close");
    });

    const buttons = {};
    buttons[wX("CLOSE")] = () => {
      this._dialog.dialog("close");
    };
    buttons[wX("CLEAR LINKS")] = () => {
      clearAllLinks(getSelectedOperation());
    };

    this._dialog = window.dialog({
      title: wX("MULTI_M_TITLE"),
      html: container,
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-multimax",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.multimaxButton
    });
    this._dialog.dialog("option", "buttons", buttons);
  },

  initialize: function(map = window.map, options) {
    this.type = MultimaxDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
    this.title = wX("MULTI_M");
    this.label = wX("MULTI_M");
    this._operation = getSelectedOperation();
    let p = localStorage[window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY];
    if (p) this._anchorOne = WasabeePortal.create(p);
    p = localStorage[window.plugin.wasabee.static.constants.ANCHOR_TWO_KEY];
    if (p) this._anchorTwo = WasabeePortal.create(p);
    this._urp = testPortal();
  },

  /*
  Calculate, given two anchors and a set of portals, the best posible sequence of nested fields.
  */
  MM: function(
    pOne,
    pTwo,
    portals,
    order = 0,
    base = true,
    commentPrefix = "multimax "
  ) {
    const poset = this.buildPOSet(pOne, pTwo, portals);
    const sequence = this.longestSequence(poset);

    const portalsMap = new Map(portals.map(p => [p.id, p]));

    if (base)
      this._operation.addLink(pOne, pTwo, commentPrefix + "base", ++order);

    if (!Array.isArray(sequence) || !sequence.length) {
      // alert("No layers found");
      return [0, order, null];
    }

    let prev = null;

    for (const node of sequence) {
      const p = portalsMap.get(node);
      if (!p) {
        console.log("skipping: " + node);
        continue;
      }
      this._operation.addLink(p, pOne, commentPrefix + "link", ++order);
      this._operation.addLink(p, pTwo, commentPrefix + "link", ++order);
      if (this._flcheck.checked && prev) {
        this._operation.addLink(p, prev, commentPrefix + "back link", ++order);
      }
      prev = p;
    }
    // return number of layers, last link order and last portal
    return [sequence.length, order, prev];
  },

  doMultimax: function() {
    const portals = getAllPortalsOnScreen(this._operation);

    // Calculate the multimax
    if (!this._anchorOne || !this._anchorTwo || !portals) {
      alert(wX("INVALID REQUEST"));
      return 0;
    }

    this._operation.startBatchMode();

    console.log("starting multimax");
    const length = this.MM(this._anchorOne, this._anchorTwo, portals)[0];
    console.log("multimax done");

    this._operation.endBatchMode(); // save and run crosslinks

    return length;
  },

  fieldCoversPortal: function(a, b, c, p) {
    const unreachableMapPoint = this._urp;

    // greatCircleArcIntersect now takes either WasabeeLink or window.link format
    // needs link.getLatLngs(); and to be an object we can cache in
    const urp = L.polyline([unreachableMapPoint, p.latLng]);
    const lab = L.polyline([a.latLng, b.latLng]);
    const lac = L.polyline([a.latLng, c.latLng]);
    const lbc = L.polyline([c.latLng, b.latLng]);

    let crossings = 0;
    if (greatCircleArcIntersect(urp, lab)) crossings++;
    if (greatCircleArcIntersect(urp, lac)) crossings++;
    if (greatCircleArcIntersect(urp, lbc)) crossings++;
    return crossings == 1; // crossing 0 or 2 is OK, crossing 3 is impossible
  },

  // given two anchor, build a map that shows which and how many portals are covered by each possible field by guid
  // note: a portal always covers itself
  buildPOSet: function(anchor1, anchor2, visible) {
    const poset = new Map();
    for (const i of visible) {
      poset.set(
        i.id,
        visible
          .filter(j => {
            return j == i || this.fieldCoversPortal(anchor1, anchor2, i, j);
          })
          .map(j => j.id)
      );
    }
    return poset;
  },

  // build a map that shows which and how many portals are covering each possible field by guid
  // note: a portal is always covered by itself
  buildRevPOSet: function(anchor1, anchor2, visible) {
    const poset = new Map();
    for (const i of visible) {
      poset.set(
        i.id,
        visible
          .filter(j => {
            return j == i || this.fieldCoversPortal(anchor1, anchor2, j, i);
          })
          .map(j => j.id)
      );
    }
    return poset;
  },

  /* not working properly */
  buildPOSetFaster: function(a, b, visible) {
    const poset = new Map();
    for (const i of visible) {
      const iCovers = new Array();
      for (const j of visible) {
        // console.log(iCovers);
        if (iCovers.includes(j.id)) {
          // we've already found this one
          // console.log("saved some searching");
          continue;
        }
        if (j.id == i.id) {
          // iCovers.push(j.options.guid);
          continue;
        }
        if (this.fieldCoversPortal(a, b, i, j)) {
          iCovers.push(j.id);
          if (poset.has(j.id)) {
            // if a-b-i covers j, a-b-i will also cover anything a-b-j covers
            // console.log("found savings");
            for (const n of poset.get(j.id)) {
              if (!iCovers.includes(j.id)) iCovers.push(n);
            }
          }
        }
      }
      poset.set(i.id, iCovers);
    }
    return poset;
  },

  // given a poset, find the longest sequence p1,p2,...pk such that poset(p2) contains p1, poset(p3) contains p2 etc
  // notes:
  // - the result is an empty sequence only if the poset is empty or if poset(p) is empty for any p
  // - if the poset is given by buildPOSet, the first element is the guid of a portal that doesn't cover any other portal,
  //   and the last element is the portal that covers all portals of the sequence and isn't covered by any other portal
  //   (inner to outer)
  longestSequence: function(poset, start) {
    const alreadyCalculatedSequences = new Map();
    const sequence_from = c => {
      if (alreadyCalculatedSequences.get(c) === undefined) {
        let sequence = Array.from(
          poset
            .get(c)
            .filter(i => i !== c)
            .map(sequence_from)
            .reduce((S1, S2) => (S1.length > S2.length ? S1 : S2), [])
        );
        sequence.push(c);
        alreadyCalculatedSequences.set(c, sequence);
      }
      return alreadyCalculatedSequences.get(c);
    };

    if (start) return sequence_from(start);

    return Array.from(poset.keys())
      .map(sequence_from)
      .reduce((S1, S2) => (S1.length > S2.length ? S1 : S2), []);
  }
});

export default MultimaxDialog;
