import { portalInField } from "../../geo";
import { displayError, displayInfo } from "../../error";
import { getSelectedOperation } from "../../selectedOp";
import { clearAllLinks } from "../../uiCommands";
import wX from "../../wX";
import { getSignedSpine } from "./algorithm";
import { drawSpine, insertLinks } from "./drawRoutines";
import { AutoDraw } from "./tools";
import { WasabeePortal } from "../../model";

/**
 * Return the spines in set 1, 2 and 3:
 *  - 1: starting from anchorOne, with anchorTwo and last portal of spine 3 as anchors
 *  - 2: starting from anchortwo, with last portals of spines 1/3 as anchors
 *  - 3: in set 3, with anchorOne and anchorTwo as anchors
 * Spines are thrown in order 3-1-2
 * @param {WasabeePortal} anchorOne
 * @param {WasabeePortal} anchorTwo
 * @param {WasabeePortal[]} setOne
 * @param {WasabeePortal[]} setTwo
 * @param {WasabeePortal[]} setThree
 * @returns {[WasabeePortal[], WasabeePortal[], WasabeePortal[]]}
 */
function getSpines(anchorOne, anchorTwo, setOne, setTwo, setThree) {
  const [spineThree] = getSignedSpine(anchorOne, anchorTwo, setThree, false);
  const lastThree = spineThree[spineThree.length - 1];

  const [spineOne] = getSignedSpine(
    anchorTwo,
    lastThree,
    setOne.filter(
      (p) =>
        anchorOne.id == p.id ||
        portalInField(anchorTwo, lastThree, p, anchorOne)
    ),
    false
  );
  const lastOne = spineOne[spineOne.length - 1];

  const [spineTwo] = getSignedSpine(
    lastThree,
    lastOne,
    setTwo.filter(
      (p) =>
        anchorTwo.id == p.id || portalInField(lastThree, lastOne, p, anchorTwo)
    ),
    false
  );

  return [spineOne, spineTwo, spineThree];
}

const MadridDialog = AutoDraw.extend({
  statics: {
    TYPE: "madridDialog",
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

    this._addSetPortal(
      wX("ANCHOR1"),
      "_anchorOne",
      container,
      window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY
    );
    this._addSelectSet(wX("MADRID_SET_1"), "setOne", container, "all");

    this._addSetPortal(
      wX("ANCHOR2"),
      "_anchorTwo",
      container,
      window.plugin.wasabee.static.constants.ANCHOR_TWO_KEY
    );
    this._addSelectSet(wX("MADRID_SET_2"), "setTwo", container, "all");

    const anchorThreeLabel = L.DomUtil.create("label", null, container);
    anchorThreeLabel.textContent = wX("ANCHOR3");
    const anchorThreeDisplay = L.DomUtil.create("span", null, container);
    anchorThreeDisplay.textContent = wX("autodraw.madrid.auto_determined");
    this._addSelectSet(wX("MADRID_SET_3"), "setThree", container, "all");

    this._addCheckbox(
      wX("ADD_BL"),
      "wasabee-madrid-backlink",
      "_flcheck",
      container
    );
    this._addCheckbox(
      wX("autodraw.madrid.balanced"),
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
      const total = this._balancedcheck
        ? this.doBalancedMadrid.call(this)
        : this.doMadrid.call(this);
      displayInfo(wX("autodraw.madrid.result", { count: total }));
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

  doBalancedMadrid: function () {
    // Calculate the multimax
    if (
      !this._anchorOne ||
      !this._anchorTwo ||
      !this._portalSets.setOne.portals.length ||
      !this._portalSets.setTwo.portals.length ||
      !this._portalSets.setThree.portals.length
    ) {
      displayError(wX("INVALID REQUEST"));
      return 0;
    }

    // the set 1 must contain anchor 1 (first back link)
    if (
      this._portalSets.setOne.portals.find((p) => this._anchorOne.id == p.id) ==
      undefined
    )
      this._portalSets.setOne.portals.push(this._anchorOne);
    // the set 2 must contain anchor 2 (first back link)
    if (
      this._portalSets.setTwo.portals.find((p) => this._anchorTwo.id == p.id) ==
      undefined
    )
      this._portalSets.setTwo.portals.push(this._anchorTwo);

    const spines = getSpines(
      this._anchorOne,
      this._anchorTwo,
      this._portalSets.setOne.portals,
      this._portalSets.setTwo.portals,
      this._portalSets.setThree.portals
    );
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
        (!p || !portalInField(p, pTwo, pThree, pOne)) && i < 3;
        i++
      ) {
        this._operation.setPortalComment(pOne, "point of disbalance");

        spineOrder = [spineOrder[1], spineOrder[2], spineOrder[0]];
        p = spines[spineOrder[0]][indices[spineOrder[0]]];
        pOne = spines[spineOrder[0]][indices[spineOrder[0]] - 1];
        pTwo = spines[spineOrder[1]][indices[spineOrder[1]] - 1];
        pThree = spines[spineOrder[2]][indices[spineOrder[2]] - 1];
      }
      if (!portalInField(p, pTwo, pThree, pOne))
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

  doMadrid: function () {
    // Calculate the multimax
    if (
      !this._anchorOne ||
      !this._anchorTwo ||
      !this._portalSets.setOne.portals.length ||
      !this._portalSets.setTwo.portals.length ||
      !this._portalSets.setThree.portals.length
    ) {
      displayError(wX("INVALID REQUEST"));
      return 0;
    }
    // the set 1 must contain anchor 1 (first back link)
    if (
      this._portalSets.setOne.portals.find((p) => this._anchorOne.id == p.id) ==
      undefined
    )
      this._portalSets.setOne.portals.push(this._anchorOne);
    // the set 2 must contain anchor 2 (first back link)
    if (
      this._portalSets.setTwo.portals.find((p) => this._anchorTwo.id == p.id) ==
      undefined
    )
      this._portalSets.setTwo.portals.push(this._anchorTwo);

    const spines = getSpines(
      this._anchorOne,
      this._anchorTwo,
      this._portalSets.setOne.portals,
      this._portalSets.setTwo.portals,
      this._portalSets.setThree.portals
    );

    this._operation.startBatchMode(); // bypass save and crosslinks checks
    let order = insertLinks(
      this._operation,
      [
        this._operation.addLink(this._anchorOne, this._anchorTwo, {
          description: "madrid base",
        }),
      ],
      this._operation.nextOrder - 1
    );

    order = drawSpine(
      this._operation,
      this._anchorOne,
      this._anchorTwo,
      spines[2],
      order,
      {
        commentPrefix: "madrid ",
        backlink: this._flcheck,
      }
    );
    order = drawSpine(
      this._operation,
      this._anchorTwo,
      spines[2][spines[2].length - 1],
      spines[0].slice(1),
      order,
      {
        commentPrefix: "madrid ",
        backlink: this._flcheck,
      }
    );
    /* order = */ drawSpine(
      this._operation,
      spines[2][spines[2].length - 1],
      spines[0][spines[0].length - 1],
      spines[1].slice(1),
      order,
      {
        commentPrefix: "madrid ",
        backlink: this._flcheck,
      }
    );

    this._operation.endBatchMode(); // save and run crosslinks

    return spines[0].length + spines[1].length + spines[2].length - 2;
  },
});

export default MadridDialog;
