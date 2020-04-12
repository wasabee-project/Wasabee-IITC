import { WDialog } from "../leafletClasses";
import WasabeePortal from "../portal";
import { getSelectedOperation } from "../selectedOp";
import wX from "../wX";
import { getAllPortalsOnScreen } from "../uiCommands";
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
      this._anchorOneDisplay.appendChild(this._anchorOne.displayFormat());
    } else {
      this._anchorOneDisplay.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(anchorOneButton, "click", () => {
      this._anchorOne = WasabeePortal.getSelected();
      if (this._anchorOne) {
        localStorage["wasabee-anchor-1"] = JSON.stringify(this._anchorOne);
        this._anchorOneDisplay.textContent = "";
        this._anchorOneDisplay.appendChild(this._anchorOne.displayFormat());
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
      this._anchorTwoDisplay.appendChild(this._anchorTwo.displayFormat());
    } else {
      this._anchorTwoDisplay.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(anchorTwoButton, "click", () => {
      this._anchorTwo = WasabeePortal.getSelected();
      if (this._anchorTwo) {
        localStorage["wasabee-anchor-2"] = JSON.stringify(this._anchorTwo);
        this._anchorTwoDisplay.textContent = "";
        this._anchorTwoDisplay.appendChild(this._anchorTwo.displayFormat());
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
      const context = this;

      this.doMultimax(context).then(
        total => {
          alert(`Multimax found ${total} layers`);
          this._dialog.dialog("close");
        },
        reject => {
          console.log(reject);
          alert(reject);
        }
      );
    });

    const fllabel = L.DomUtil.create("label", null, container);
    fllabel.textContent = wX("ADD_BL");
    this._flcheck = L.DomUtil.create("input", null, container);
    this._flcheck.type = "checkbox";

    // const context = this;
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
    let p = localStorage["wasabee-anchor-1"];
    if (p) this._anchorOne = WasabeePortal.create(p);
    p = localStorage["wasabee-anchor-2"];
    if (p) this._anchorTwo = WasabeePortal.create(p);
  },

  doMultimax: context => {
    return new Promise((resolve, reject) => {
      const A = context._anchorOne;
      const B = context._anchorTwo;
      if (!A || !B) reject(wX("SEL_PORT_FIRST"));
      const portalsOnScreen = getAllPortalsOnScreen(context._operation);

      // Calculate the multimax
      // TODO remove this promise wrapper, it accomplishes nothing
      this.multimax(A, B, portalsOnScreen).then(
        sequence => {
          if (!Array.isArray(sequence) || !sequence.length)
            reject("No layers found");

          let order = sequence.length * (context._flcheck ? 3 : 2);
          let prev = null;

          context._operation.startBatchMode(); // bypass save and crosslinks checks
          context._operation.addLink(A, B, "multimax base", 1);

          for (const node of sequence) {
            let p = WasabeePortal.get(node);
            if (context._flcheck.checked && prev) {
              context._operation.addLink(
                prev,
                p,
                "multimax generated back link",
                order + 3
              );
              order--;
            }
            if (!p) {
              console.log("skipping: " + node);
              continue;
              // const ll = node.getLatLng(); p = WasabeePortal.fake(ll.lat, ll.lng, node);
            }
            context._operation.addLink(
              p,
              A,
              "multimax generated link",
              order--
            );
            context._operation.addLink(
              p,
              B,
              "multimax generated link",
              order--
            );
            prev = p;
          }
          context._operation.endBatchMode(); // save and run crosslinks
          resolve(sequence.length);
        },
        err => {
          console.log(err);
          reject(err);
        }
      );
    });
  },

  /*
  Calculate, given two anchors and a set of portals, the best posible sequence of nested fields.
*/
  fieldCoversPortal: (a, b, field3, portal) => {
    // Let's hope no one ever wants to field over this point!
    const unreachableMapPoint = {
      lat: -74.2,
      lng: -143.4
    };
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
  buildPOSet: (anchor1, anchor2, visible) => {
    const poset = new Map();
    for (const i of visible) {
      poset.set(
        i.options.guid,
        visible.filter(j => {
          return j == i || this.fieldCoversPortal(anchor1, anchor2, i, j);
        })
      );
    }
    return poset;
  },

  /* not working properly */
  buildPOSetFaster: (a, b, visible) => {
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

  longestSequence: poset => {
    const out = new Array();

    // the recursive function
    const recurse = () => {
      if (poset.size == 0) return; // hit bottom

      let longest = "";
      let length = 0;

      // let prev = null;
      // determine the longest
      for (const [k, v] of poset) {
        if (v.length > length) {
          length = v.length;
          longest = k;
          // TODO build array of all with this same length
          // TODO determine which is closest to previous
        }
        // record previous
      }
      out.push(longest);
      const thisList = poset.get(longest);
      poset.delete(longest);

      // remove any portals not under this layer
      // eslint-disable-next-line
      for (const [k, v] of poset) {
        let under = false;
        for (const l of thisList) {
          if (l.options.guid == k) under = true;
        }
        if (!under) {
          poset.delete(k);
        }
      }
      if (poset.size == 0) return; // hit bottom
      recurse(); // keep digging
    };

    recurse();
    return out;
  },

  multimax: (anchor1, anchor2, visible) => {
    // this returning a promise was an old attempt at having a progress bar
    // remove it
    return new Promise(function(resolve, reject) {
      if (!anchor1 || !anchor2 || !visible) reject(wX("INVALID REQUEST"));

      console.log("starting multimax");
      const poset = this.buildPOSet(anchor1, anchor2, visible);
      const p = this.longestSequence(poset);
      console.log("multimax done");
      resolve(p);
    });
  }
});

export default MultimaxDialog;
