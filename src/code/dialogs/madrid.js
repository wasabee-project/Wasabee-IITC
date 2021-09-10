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

  _addSetZone: function (text, thisKey, container) {
    const label = L.DomUtil.create("div", "set_label", container);
    label.textContent = text;
    const button = L.DomUtil.create("button", null, container);
    button.textContent = wX("SET");
    const display = L.DomUtil.create("span", null, container);
    if (this[thisKey]) {
      display.textContent = wX("PORTAL_COUNT", {
        count: this[thisKey].length,
      });
    } else {
      display.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(button, "click", () => {
      this[thisKey] = getAllPortalsOnScreen(getSelectedOperation());
      // XXX this is not enough, need to cache them in case IITC purges them
      display.textContent = wX("PORTAL_COUNT", {
        count: this[thisKey].length,
      });
    });
  },

  _buildContent: function () {
    const container = L.DomUtil.create("div", "container");
    const description = L.DomUtil.create("div", "desc", container);
    description.textContent = wX("SELECT_INSTRUCTIONS");

    this._addSetPortal(
      wX("ANCHOR1"),
      "_anchorOne",
      container,
      window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY
    );
    this._addSetZone(wX("MADRID_SET_1"), "_portalSetOne", container);

    this._addSetPortal(
      wX("ANCHOR2"),
      "_anchorTwo",
      container,
      window.plugin.wasabee.static.constants.ANCHOR_TWO_KEY
    );
    this._addSetZone(wX("MADRID_SET_2"), "_portalSetTwo", container);

    const anchorThreeLabel = L.DomUtil.create("label", null, container);
    anchorThreeLabel.textContent = wX("ANCHOR3");
    const anchorThreeDisplay = L.DomUtil.create("span", null, container);
    anchorThreeDisplay.textContent = "Auto-determined";
    this._addSetZone(wX("MADRID_SET_3"), "_portalSetThree", container);

    this._addCheckbox(
      wX("ADD_BL"),
      "wasabee-madrid-backlink",
      "_flcheck",
      container
    );
    this._addCheckbox(
      "Balanced", // wX
      "wasabee-madrid-balanced",
      "_balancedcheck",
      container
    );

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

    return container;
  },

  // addHooks inherited from MultimaxDialog
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
