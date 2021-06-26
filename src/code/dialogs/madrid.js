import { WDialog } from "../leafletClasses";
import WasabeePortal from "../model/portal";
import { getSelectedOperation } from "../selectedOp";
import {
  getAllPortalsOnScreen,
  testPortal,
  clearAllLinks,
} from "../uiCommands";
import wX from "../wX";
import MultimaxDialog from "./multimaxDialog";

// now that the formerly external mm functions are in the class, some of the logic can be cleaned up
// to not require passing values around when we can get them from this.XXX
const MadridDialog = MultimaxDialog.extend({
  statics: {
    TYPE: "madridDialog",
  },

  needWritePermission: true,

  // addHooks inherited from MultimaxDialog
  _displayDialog: function () {
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
        localStorage[window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY] =
          JSON.stringify(this._anchorOne);
        this._anchorOneDisplay.textContent = "";
        this._anchorOneDisplay.appendChild(
          this._anchorOne.displayFormat(this._smallScreen)
        );
      } else {
        alert(wX("PLEASE_SELECT_PORTAL"));
      }
    });

    const setOneLabel = L.DomUtil.create("div", "set_label", container);
    setOneLabel.textContent = wX("MADRID_SET_1");
    const setOneButton = L.DomUtil.create("button", null, container);
    setOneButton.textContent = wX("SET");
    this._setOneDisplay = L.DomUtil.create("span", null, container);
    if (this._portalSetOne) {
      this._setOneDisplay.textContent = wX("PORTAL_COUNT", {
        count: this._portalSetOne.length,
      });
    } else {
      this._setOneDisplay.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(setOneButton, "click", () => {
      this._portalSetOne = getAllPortalsOnScreen(getSelectedOperation());
      // XXX this is not enough, need to cache them in case IITC purges them
      this._setOneDisplay.textContent = wX("PORTAL_COUNT", {
        count: this._portalSetOne.length,
      });
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
        localStorage[window.plugin.wasabee.static.constants.ANCHOR_TWO_KEY] =
          JSON.stringify(this._anchorTwo);
        this._anchorTwoDisplay.textContent = "";
        this._anchorTwoDisplay.appendChild(
          this._anchorTwo.displayFormat(this._smallScreen)
        );
      } else {
        alert(wX("PLEASE_SELECT_PORTAL"));
      }
    });

    const setTwoLabel = L.DomUtil.create("div", "set_label", container);
    setTwoLabel.textContent = wX("MADRID_SET_2");
    const setTwoButton = L.DomUtil.create("button", null, container);
    setTwoButton.textContent = wX("SET");
    this._setTwoDisplay = L.DomUtil.create("span", null, container);
    if (this._portalSetTwo) {
      this._setTwoDisplay.textContent = wX("PORTAL_COUNT", {
        count: this._portalSetTwo.length,
      });
    } else {
      this._setTwoDisplay.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(setTwoButton, "click", () => {
      this._portalSetTwo = getAllPortalsOnScreen(getSelectedOperation());
      // XXX cache
      this._setTwoDisplay.textContent = wX("PORTAL_COUNT", {
        count: this._portalSetTwo.length,
      });
    });

    const anchorThreeLabel = L.DomUtil.create("label", null, container);
    anchorThreeLabel.textContent = wX("ANCHOR3");
    const anchorThreeDisplay = L.DomUtil.create("span", null, container);
    anchorThreeDisplay.textContent = "Auto-determined";

    const setThreeLabel = L.DomUtil.create("div", "set_label", container);
    setThreeLabel.textContent = wX("MADRID_SET_3");
    const setThreeButton = L.DomUtil.create("button", null, container);
    setThreeButton.textContent = wX("SET");
    this._setThreeDisplay = L.DomUtil.create("span", null, container);
    if (this._portalSetThree) {
      this._setThreeDisplay.textContent = wX("PORTAL_COUNT", {
        count: this._portalSetThree.length,
      });
    } else {
      this._setThreeDisplay.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(setThreeButton, "click", () => {
      this._portalSetThree = getAllPortalsOnScreen(getSelectedOperation());
      // XXX cache
      this._setThreeDisplay.textContent = wX("PORTAL_COUNT", {
        count: this._portalSetThree.length,
      });
    });

    //Add backlinks after all the rest is set up
    const fllabel = L.DomUtil.create("label", null, container);
    fllabel.textContent = wX("ADD_BL");
    fllabel.htmlFor = "wasabee-madrid-backlink";
    this._flcheck = L.DomUtil.create("input", null, container);
    this._flcheck.type = "checkbox";
    this._flcheck.id = "wasabee-madrid-backlink";

    const balancedLabel = L.DomUtil.create("label", null, container);
    balancedLabel.textContent = "Balanced";
    balancedLabel.htmlFor = "wasabee-madrid-balanced";
    this._balancedcheck = L.DomUtil.create("input", null, container);
    this._balancedcheck.type = "checkbox";
    this._balancedcheck.id = "wasabee-madrid-balanced";

    const newLine = L.DomUtil.create("label", "newline", container);
    const dividerBeforeDraw = L.DomUtil.create("span", null, container);
    newLine.textContent = "\u0000";
    dividerBeforeDraw.textContent = "\u0000";
    //   dividerBeforeDraw.textContent = "";

    const placeholder = L.DomUtil.create("label", "placeholder", container);
    placeholder.textContent = "\u2063";
    // Go button
    const button = L.DomUtil.create("button", "drawb", container);
    button.textContent = wX("MADRID");
    L.DomEvent.on(button, "click", () => {
      this._operation = getSelectedOperation();
      const total = this._balancedcheck.checked
        ? this.doBalancedMadrid.call(this)
        : this.doMadrid.call(this);
      alert(`Madrid found ${total} layers`);
      // this.closeDialog();
    });

    const buttons = {};
    buttons[wX("CLOSE")] = () => {
      this.closeDialog();
    };
    buttons[wX("CLEAR LINKS")] = () => {
      clearAllLinks(getSelectedOperation());
    };

    this.createDialog({
      title: wX("MADRID_TITLE"),
      html: container,
      width: "auto",
      dialogClass: "madrid",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.madrid,
    });
  },

  initialize: function (options) {
    WDialog.prototype.initialize.call(this, options);
    this.title = wX("MADRID");
    this.label = wX("MADRID");
    let p = localStorage[window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY];
    if (p) this._anchorOne = new WasabeePortal(p);
    p = localStorage[window.plugin.wasabee.static.constants.ANCHOR_TWO_KEY];
    if (p) this._anchorTwo = new WasabeePortal(p);
    this._urp = testPortal();
  },

  getSpine: function (pOne, pTwo, portals) {
    const portalsMap = new Map(portals.map((p) => [p.id, p]));
    const poset = this.buildPOSet(pOne, pTwo, portals);
    const sequence = this.longestSequence(poset, null, (a, b) =>
      window.map.distance(portalsMap.get(a).latLng, portalsMap.get(b).latLng)
    );

    return sequence.map((id) => portalsMap.get(id));
  },

  doBalancedMadrid: function () {
    // Calculate the multimax
    if (
      !this._anchorOne ||
      !this._anchorTwo ||
      !this._portalSetOne ||
      !this._portalSetTwo ||
      !this._portalSetThree
    ) {
      alert(wX("INVALID REQUEST"));
      return 0;
    }

    // the set 1 must contain anchor 1 (first back link)
    if (this._portalSetOne.find((p) => this._anchorOne.id == p.id) == undefined)
      this._portalSetOne.push(this._anchorOne);
    // the set 2 must contain anchor 2 (first back link)
    if (this._portalSetTwo.find((p) => this._anchorTwo.id == p.id) == undefined)
      this._portalSetTwo.push(this._anchorTwo);

    const spineThree = this.getSpine(
      this._anchorOne,
      this._anchorTwo,
      this._portalSetThree
    );
    const lastThree = spineThree[spineThree.length - 1];

    const spineOne = this.getSpine(
      this._anchorTwo,
      lastThree,
      this._portalSetOne.filter(
        (p) =>
          this._anchorOne.id == p.id ||
          this.fieldCoversPortal(this._anchorTwo, lastThree, p, this._anchorOne)
      )
    );
    const lastOne = spineOne[spineOne.length - 1];

    const spineTwo = this.getSpine(
      lastThree,
      lastOne,
      this._portalSetTwo.filter(
        (p) =>
          this._anchorTwo.id == p.id ||
          this.fieldCoversPortal(lastThree, lastOne, p, this._anchorTwo)
      )
    );
    // const lastTwo = spineTwo[spineTwo.length - 1];

    const spines = [spineOne, spineTwo, spineThree];
    const step = spines.map((s) => 1 / s.length);

    this._operation.startBatchMode();

    // ignore order + direction
    this._operation.addLink(spines[0][0], spines[1][0], {
      description: "inner field",
    });
    this._operation.addLink(spines[1][0], spines[2][0], {
      description: "inner field",
    });
    this._operation.addLink(spines[2][0], spines[0][0], {
      description: "inner field",
    });

    const indices = [1, 1, 1];

    while (indices.some((v, i) => v < spines[i].length)) {
      let spineOrder = [0, 1, 2].sort(
        (a, b) => indices[a] * step[a] - indices[b] * step[b]
      );
      let p = spines[spineOrder[0]][indices[spineOrder[0]]];
      let pOne = spines[spineOrder[0]][indices[spineOrder[0]] - 1];
      let pTwo = spines[spineOrder[1]][indices[spineOrder[1]] - 1];
      let pThree = spines[spineOrder[2]][indices[spineOrder[2]] - 1];

      // hackish, I have no proof of this working in all cases
      for (
        let i = 0;
        (!p || !this.fieldCoversPortal(p, pTwo, pThree, pOne)) && i < 3;
        i++
      ) {
        this._operation.setPortalComment(pOne, "point of disbalance");

        spineOrder = [spineOrder[1], spineOrder[2], spineOrder[0]];
        p = spines[spineOrder[0]][indices[spineOrder[0]]];
        pOne = spines[spineOrder[0]][indices[spineOrder[0]] - 1];
        pTwo = spines[spineOrder[1]][indices[spineOrder[1]] - 1];
        pThree = spines[spineOrder[2]][indices[spineOrder[2]] - 1];
      }
      if (!this.fieldCoversPortal(p, pTwo, pThree, pOne))
        console.log("well, this doesn't work here...");
      const toTwo = this._operation.addLink(p, pTwo, { description: "link" });
      const toThree = this._operation.addLink(p, pThree, {
        description: "link",
      });
      toTwo.zone = spineOrder[0] + 1;
      toThree.zone = spineOrder[0] + 1;

      indices[spineOrder[0]] += 1;
    }

    this._operation.endBatchMode();

    return indices[0] + indices[1] + indices[2] - 2;
  },

  // fieldCoversPortal inherited from MultimaxDialog
  // MM "

  doMadrid: function () {
    // Calculate the multimax
    if (
      !this._anchorOne ||
      !this._anchorTwo ||
      !this._portalSetOne ||
      !this._portalSetTwo ||
      !this._portalSetThree
    ) {
      alert(wX("INVALID REQUEST"));
      return 0;
    }
    this._operation.startBatchMode(); // bypass save and crosslinks checks
    this._operation.addLink(this._anchorOne, this._anchorTwo, {
      description: "madrid base",
      order: 1,
    });

    let len = 0;
    const [len1, order1, last1] = this.MM(
      this._anchorOne,
      this._anchorTwo,
      this._portalSetThree,
      1,
      false,
      "madrid protocol "
    );
    len += len1;

    const newThree = last1;
    // the set 1 must contain anchor 1 (first back link)
    if (this._portalSetOne.find((p) => this._anchorOne.id == p.id) == undefined)
      this._portalSetOne.push(this._anchorOne);

    const [len2, order2, last2] = this.MM(
      this._anchorTwo,
      newThree,
      this._portalSetOne.filter(
        (p) =>
          this._anchorOne.id == p.id ||
          this.fieldCoversPortal(this._anchorTwo, newThree, p, this._anchorOne)
      ),
      order1,
      false,
      "madrid protocol "
    );
    len += len2 - 1;

    // _anchorOne is no longer useful, use last2
    const newOne = last2;
    // the set 2 must contain anchor 2 (first back link)
    if (this._portalSetTwo.find((p) => this._anchorTwo.id == p.id) == undefined)
      this._portalSetTwo.push(this._anchorTwo);

    const len3 = this.MM(
      newThree,
      newOne,
      this._portalSetTwo.filter(
        (p) =>
          this._anchorTwo.id == p.id ||
          this.fieldCoversPortal(newThree, newOne, p, this._anchorTwo)
      ),
      order2,
      false,
      "madrid protocol "
    )[0];
    len += len3 - 1;

    this._operation.endBatchMode(); // save and run crosslinks

    return len;
  },
});

export default MadridDialog;
