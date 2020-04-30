import { WDialog } from "../leafletClasses";
import WasabeePortal from "../portal";
import { getSelectedOperation } from "../selectedOp";
import wX from "../wX";
import MultimaxDialog from "./multimaxDialog";

// now that the formerly external mm functions are in the class, some of the logic can be cleaned up
// to not require passing values around when we can get them from this.XXX
const MadridDialog = MultimaxDialog.extend({
  statics: {
    TYPE: "madridDialog"
  },

  // addHooks inherited from MultimaxDialog
  // removeHooks inherited from MultimaxDialog
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
        localStorage["wasabee-anchor-1"] = JSON.stringify(this._anchorOne);
        this._anchorOneDisplay.textContent = "";
        this._anchorOneDisplay.appendChild(
          this._anchorOne.displayFormat(this._smallScreen)
        );
      } else {
        alert(wX("PLEASE_SELECT_PORTAL"));
      }
    });

    const setOneLabel = L.DomUtil.create("label", null, container);
    setOneLabel.textContent = wX("MADRID_SET_1");
    const setOneButton = L.DomUtil.create("button", null, container);
    setOneButton.textContent = wX("SET");
    this._setOneDisplay = L.DomUtil.create("span", null, container);
    if (this._portalSetOne) {
      this._setOneDisplay = wX("PORTAL_COUNT", this._portalSetOne.length);
    } else {
      this._setOneDisplay.textContent = wX("NOT_SET");
    }

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
        localStorage["wasabee-anchor-2"] = JSON.stringify(this._anchorTwo);
        this._anchorTwoDisplay.textContent = "";
        this._anchorTwoDisplay.appendChild(
          this._anchorTwo.displayFormat(this._smallScreen)
        );
      } else {
        alert(wX("PLEASE_SELECT_PORTAL"));
      }
    });

    const anchorThreeLabel = L.DomUtil.create("label", null, container);
    anchorThreeLabel.textContent = wX("ANCHOR3");
    const anchorThreeButton = L.DomUtil.create("button", null, container);
    anchorThreeButton.textContent = wX("SET");
    this._anchorThreeDisplay = L.DomUtil.create("span", null, container);
    if (this._anchorThree) {
      this._anchorThreeDisplay.appendChild(
        this._anchorThree.displayFormat(this._smallScreen)
      );
    } else {
      this._anchorThreeDisplay.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(anchorThreeButton, "click", () => {
      this._anchorThree = WasabeePortal.getSelected();
      if (this._anchorThree) {
        localStorage["wasabee-anchor-3"] = JSON.stringify(this._anchorThree);
        this._anchorThreeDisplay.textContent = "";
        this._anchorThreeDisplay.appendChild(
          this._anchorThree.displayFormat(this._smallScreen)
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
    button.textContent = wX("MADRID");
    L.DomEvent.on(button, "click", () => {
      const total = this.doMadrid.call(this);
      alert(`Multimax found ${total} layers`);
      this._dialog.dialog("close");
    });

    const fllabel = L.DomUtil.create("label", null, container);
    fllabel.textContent = wX("ADD_BL");
    this._flcheck = L.DomUtil.create("input", null, container);
    this._flcheck.type = "checkbox";

    this._dialog = window.dialog({
      title: wX("MADRID_TITLE"),
      width: "auto",
      height: "auto",
      html: container,
      dialogClass: "wasabee-dialog wasabee-dialog-madrid",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.madrid
    });
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = MultimaxDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
    this.title = wX("MADRID");
    this.label = wX("MADRID");
    this._operation = getSelectedOperation();
    let p = localStorage["wasabee-anchor-1"];
    if (p) this._anchorOne = WasabeePortal.create(p);
    p = localStorage["wasabee-anchor-2"];
    if (p) this._anchorTwo = WasabeePortal.create(p);
    p = localStorage["wasabee-anchor-3"];
    if (p) this._anchorThree = WasabeePortal.create(p);
    this._previousOrder = 3;

    // the unreachable point (urp) to test from
    let urp =
      localStorage[
        window.plugin.wasabee.static.constants.MULTIMAX_UNREACHABLE_KEY
      ];
    if (!urp) {
      urp = '{"lat":-74.2,"lng":-143.4}';
      localStorage[
        window.plugin.wasabee.static.constants.MULTIMAX_UNREACHABLE_KEY
      ] = urp;
    }
    this._urp = JSON.parse(urp);
  },

  // fieldCoversPortal inherited from MultimaxDialog
  // buildPOSet "
  // longestSequence "

  doMadrid: function() {
    // Calculate the multimax
    if (
      !this._anchorOne ||
      !this._anchorTwo ||
      !this._anchorThree ||
      !this._portalSetOne ||
      !this._portalSetTwo ||
      !this._portalSetThree
    ) {
      alert(wX("INVALID REQUEST"));
      return 0;
    }
    this._operation.startBatchMode(); // bypass save and crosslinks checks
    this._operation.addLink(
      this._anchorOne,
      this._anchorTwo,
      "madrid core one",
      1
    );
    this._operation.addLink(
      this._anchorTwo,
      this._anchorThree,
      "madrid core two",
      2
    );
    this._operation.addLink(
      this._anchorThree,
      this._anchorOne,
      "madrid core three",
      3
    );

    let len = 0;
    len += this.madridMM(this._anchorOne, this._anchorTwo, this._portalSetOne);
    len += this.madridMM(
      this._anchorTwo,
      this._anchorThree,
      this._portalSetTwo
    );
    len += this.madridMM(
      this._anchorThree,
      this._anchorOne,
      this._portalSetThree
    );
    this._operation.endBatchMode(); // save and run crosslinks
    return len;
  },

  madridMM: function(pOne, pTwo, portals) {
    const poset = this.buildPOSet(pOne, pTwo, portals);
    const sequence = this.longestSequence(poset);

    if (!Array.isArray(sequence) || !sequence.length) {
      // alert("No layers found");
      return 0;
    }

    let order = sequence.length * (this._flcheck ? 3 : 2) + this._previousOrder;
    let prev = null;
    this._previousOrder = order;

    // draw inner 3 links
    for (const node of sequence) {
      const p = WasabeePortal.get(node);
      if (this._flcheck.checked && prev) {
        this._operation.addLink(prev, p, "back link", order + 3);
        order--;
      }
      if (!p) {
        console.log("skipping: " + node);
        continue;
      }
      this._operation.addLink(p, pOne, "madrid protocol link", order--);
      this._operation.addLink(p, pTwo, "madrid protocol link", order--);
      prev = p;
    }
    return sequence.length;
  }
});

export default MadridDialog;
