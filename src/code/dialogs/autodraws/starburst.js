import { AutoDraw } from "./tools";
import { WasabeePortal } from "../../model";
import { getSelectedOperation } from "../../selectedOp";
import { clearAllLinks } from "../../ui/operation";
import wX from "../../wX";
import { displayError } from "../../error";
import statics from "../../static";

const StarburstDialog = AutoDraw.extend({
  statics: {
    TYPE: "StarburstDialog",
  },

  initialize: function (options) {
    AutoDraw.prototype.initialize.call(this, options);
    const p =
      localStorage[window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY];
    if (p) this._anchor = new WasabeePortal(p);
  },

  addHooks: function () {
    AutoDraw.prototype.addHooks.call(this);
    this._displayDialog();
  },

  _buildContent: function () {
    //Instructions
    const container = L.DomUtil.create("div", "container");
    const description = L.DomUtil.create("div", "desc", container);
    description.textContent = wX("SEL_SB_ANCHOR");

    this._addSetPortal(
      wX("ANCHOR_PORTAL"),
      "_anchor",
      container,
      window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY
    );

    const description2 = L.DomUtil.create("div", "desc secondary", container);
    description2.textContent = wX("SEL_SB_ANCHOR2");

    this._addSelectSet(wX("MM_SPINE"), "spine", container, "all");

    // Go button
    const button = L.DomUtil.create("button", "drawb", container);
    button.textContent = wX("STARBURST_DRAW");
    L.DomEvent.on(button, "click", (ev) => {
      L.DomEvent.stop(ev);
      this.starburst.call(this);
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
      title: wX("STARBURST TITLE"),
      html: container,
      width: "auto",
      dialogClass: "starburst",
      buttons: buttons,
      id: statics.dialogNames.starburst,
    });
  },

  starburst: function () {
    if (!this._anchor) {
      displayError(wX("SEL_SB_ANCHOR"));
      return;
    }

    const operation = getSelectedOperation();

    operation.startBatchMode();
    const portals = this._portalSets.spine.portals;
    for (const p of portals) {
      if (p.id == this._anchor.id) continue;
      operation.addLink(p, this._anchor, { description: "auto starburst" });
    }
    operation.endBatchMode();
  },
});

export default StarburstDialog;
