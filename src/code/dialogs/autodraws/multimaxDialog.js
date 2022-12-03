import { AutoDraw } from "./tools";
import { WasabeePortal } from "../../model";
import { getSelectedOperation } from "../../selectedOp";
import wX from "../../wX";
import { clearAllLinks } from "../../ui/operation";
import { displayError, displayInfo } from "../../error";
import { getSignedSpine } from "./algorithm";
import { drawSpine, insertLinks } from "./drawRoutines";

// now that the formerly external mm functions are in the class, some of the logic can be cleaned up
// to not require passing values around when we can get them from this.XXX
const MultimaxDialog = AutoDraw.extend({
  statics: {
    TYPE: "multimaxDialog",
  },

  initialize: function (options) {
    AutoDraw.prototype.initialize.call(this, options);
    let p = localStorage[window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY];
    if (p) this._anchorOne = new WasabeePortal(p);
    p = localStorage[window.plugin.wasabee.static.constants.ANCHOR_TWO_KEY];
    if (p) this._anchorTwo = new WasabeePortal(p);
  },

  addHooks: function () {
    AutoDraw.prototype.addHooks.call(this);

    this._displayDialog();
    this._updatePortalSet();
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

    this._addCheckbox(
      wX("MM_BOTH_SIDE"),
      "wasabee-multimax-both-side",
      "_bothSide",
      container,
      false
    );

    this._addSelectSet(wX("MM_SPINE"), "spine", container, "all");

    // Go button
    const button = L.DomUtil.create("button", "drawb", container);
    button.textContent = wX("MULTI_M");
    L.DomEvent.on(button, "click", () => {
      const total = this.doMultimax.call(this);
      if (total.length === 2) {
        displayInfo(
          wX("autodraw.multimax.result_both_side", {
            count1: total[0],
            count2: total[1],
          })
        );
      } else {
        displayInfo(
          wX("autodraw.multimax.result", {
            count: total[0],
          })
        );
      }
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

  /*
  Calculate, given two anchors and a set of portals, the deepest sequence of nested fields.
  */
  MM: function (
    pOne,
    pTwo,
    portals,
    order = 0, // first link is order + 1
    base = true,
    commentPrefix = "multimax ",
    bothSide = false
  ) {
    const spines = getSignedSpine(pOne, pTwo, portals, bothSide);

    if (base) {
      order = insertLinks(
        this._operation,
        [
          this._operation.addLink(pOne, pTwo, {
            description: commentPrefix + "base",
          }),
        ],
        order
      );
    }

    for (const s of spines) {
      order = drawSpine(this._operation, pOne, pTwo, s, order, {
        commentPrefix: "multimax ",
        backlink: this._flcheck,
      });
    }
    return spines.map((s) => s.length);
  },

  doMultimax: function () {
    const portals = this._portalSets.spine.portals;

    // Calculate the multimax
    if (!this._anchorOne || !this._anchorTwo || !portals.length) {
      displayError(wX("INVALID REQUEST"));
      return 0;
    }

    this._operation.startBatchMode();

    console.log("starting multimax");
    const lengths = this.MM(
      this._anchorOne,
      this._anchorTwo,
      portals,
      this._orderFromEnd ? this._operation.nextOrder - 1 : 0,
      true,
      "multimax ",
      this._bothSide
    );
    console.log("multimax done");

    this._operation.endBatchMode(); // save and run crosslinks

    return lengths;
  },
});

export default MultimaxDialog;
