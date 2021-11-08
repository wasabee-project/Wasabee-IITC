import { AutoDraw } from "./tools";
import WasabeePortal from "../../model/portal";
import { getSelectedOperation } from "../../selectedOp";
import { clearAllLinks, getAllPortalsOnScreen } from "../../uiCommands";
import wX from "../../wX";

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

  _displayDialog: function () {
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

    const button = L.DomUtil.create("button", "drawb", container);
    button.textContent = wX("STARBURST_DRAW");
    L.DomEvent.on(button, "click", (ev) => {
      L.DomEvent.stop(ev);
      this.starburst.call(this);
    });

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
      id: window.plugin.wasabee.static.dialogNames.starburst,
    });
  },

  starburst: function () {
    if (!this._anchor) {
      alert("Select an anchor portal");
      return;
    }

    const operation = getSelectedOperation();

    operation.startBatchMode();
    for (const p of getAllPortalsOnScreen(operation)) {
      if (p.id == this._anchor.id) continue;
      operation.addLink(p, this._anchor, { description: "auto starburst" });
    }
    operation.endBatchMode();
  },
});

export default StarburstDialog;
