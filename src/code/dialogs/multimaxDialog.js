import { WDialog } from "../leafletClasses";
import WasabeePortal from "../portal";
import { getSelectedOperation } from "../selectedOp";
import wX from "../wX";
import { getAllPortalsOnScreen, testPortal } from "../uiCommands";
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

    // Bottom buttons bar
    // Enter arrow
    const opt = L.DomUtil.create("label", "arrow", container);
    opt.textContent = "\u21b3";

    // Go button
    const button = L.DomUtil.create("button", null, container);
    button.textContent = wX("MULTI_M");
    L.DomEvent.on(button, "click", () => {
      const total = this.doMultimax.call(this);
      alert(`Multimax found ${total} layers`);
      this._dialog.dialog("close");
    });

    const fllabel = L.DomUtil.create("label", null, container);
    fllabel.textContent = wX("ADD_BL");
    this._flcheck = L.DomUtil.create("input", null, container);
    this._flcheck.type = "checkbox";

    this._dialog = window.dialog({
      title: wX("MULTI_M_TITLE"),
      width: "auto",
      height: "auto",
      html: container,
      dialogClass: "wasabee-dialog wasabee-dialog-multimax",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.multimaxButton
    });
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
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

  doMultimax: function() {
    const portalsOnScreen = getAllPortalsOnScreen(this._operation);

    // Calculate the multimax
    if (!this._anchorOne || !this._anchorTwo || !portalsOnScreen) {
      alert(wX("INVALID REQUEST"));
      return 0;
    }

    console.log("starting multimax");
    const poset = this.buildPOSet(
      this._anchorOne,
      this._anchorTwo,
      portalsOnScreen
    );
    const sequence = this.longestSequence(poset);
    console.log("multimax done");

    if (!Array.isArray(sequence) || !sequence.length) {
      // alert("No layers found");
      return 0;
    }

    let order = sequence.length * (this._flcheck ? 3 : 2);
    let prev = null;

    this._operation.startBatchMode(); // bypass save and crosslinks checks
    this._operation.addLink(
      this._anchorOne,
      this._anchorTwo,
      "multimax base",
      1
    );

    for (const node of sequence) {
      let p = WasabeePortal.get(node);
      if (!p || !p.lat) {
        console.log("data not loaded, skipping: " + node);
        continue;
      }
      if (this._flcheck.checked && prev) {
        this._operation.addLink(
          prev,
          p,
          "multimax generated back link",
          order + 3
        );
        order--;
      }
      this._operation.addLink(
        p,
        this._anchorOne,
        "multimax generated link",
        order--
      );
      this._operation.addLink(
        p,
        this._anchorTwo,
        "multimax generated link",
        order--
      );
      prev = p;
    }
    this._operation.endBatchMode(); // save and run crosslinks
    return sequence.length;
  },

  /*
Calculate, given two anchors and a set of portals, the best posible sequence of nested fields.
 */
  fieldCoversPortal: function(a, b, field3, portal) {
    const unreachableMapPoint = this._urp;

    const p = portal.getLatLng();
    const c = field3.getLatLng();

    // greatCircleArcIntersect now takes either WasabeeLink or window.link format
    // needs link.getLatLngs(); and to be an object we can cache in
    const urp = L.polyline([unreachableMapPoint, p]);
    const lab = L.polyline([a.latLng, b.latLng]);
    const lac = L.polyline([a.latLng, c]);
    const lbc = L.polyline([c, b.latLng]);

    let crossings = 0;
    if (greatCircleArcIntersect(urp, lab)) crossings++;
    if (greatCircleArcIntersect(urp, lac)) crossings++;
    if (greatCircleArcIntersect(urp, lbc)) crossings++;
    return crossings == 1; // crossing 0 or 2 is OK, crossing 3 is impossible
  },

  // build a map that shows which and how many portals are covered by each possible field
  buildPOSet: function(anchor1, anchor2, visible) {
    const poset = new Map();
    for (const i of visible) {
      poset.set(
        i.options.guid,
        visible
          .filter(j => {
            return j == i || this.fieldCoversPortal(anchor1, anchor2, i, j);
          })
          .map(l => l.options.guid)
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
        if (iCovers.includes(j.options.guid)) {
          // we've already found this one
          // console.log("saved some searching");
          continue;
        }
        if (j.options.guid == i.options.guid) {
          // iCovers.push(j.options.guid);
          continue;
        }
        if (this.fieldCoversPortal(a, b, i, j)) {
          iCovers.push(j.options.guid);
          if (poset.has(j.options.guid)) {
            // if a-b-i covers j, a-b-i will also cover anything a-b-j covers
            // console.log("found savings");
            for (const n of poset.get(j.options.guid)) {
              if (!iCovers.includes(j.options.guid)) iCovers.push(n);
            }
          }
        }
      }
      poset.set(i.options.guid, iCovers);
    }
    return poset;
  },

  longestSequence: function(poset) {
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
    return Array.from(poset.keys())
      .map(sequence_from)
      .reduce((S1, S2) => (S1.length > S2.length ? S1 : S2));
  }
});

export default MultimaxDialog;
