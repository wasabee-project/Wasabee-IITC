import { AutoDraw } from "./tools";
import { WasabeePortal } from "../../model";
import { getSelectedOperation } from "../../selectedOp";
import { getAllPortalsLinked } from "../../ui/link";
import wX from "../../wX";
import { displayError } from "../../error";
import { clearAllLinks } from "../../ui/operation";
import statics from "../../static";

const SaveLinksDialog = AutoDraw.extend({
  statics: {
    TYPE: "SaveLinksDialog",
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
    description.textContent = wX("SEL_SL_ANCHOR");

    this._addSetPortal(
      wX("ANCHOR_PORTAL"),
      "_anchor",
      container,
      window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY
    );

    const button = L.DomUtil.create("button", "drawb", container);
    button.textContent = wX("SAVELINKS_DRAW");
    L.DomEvent.on(button, "click", (ev) => {
      L.DomEvent.stop(ev);
      this.saveLinks.call(this);
    });

    const buttons = {};
    buttons[wX("CLOSE")] = () => {
      this.closeDialog();
    };
    buttons[wX("CLEAR LINKS")] = () => {
      clearAllLinks(getSelectedOperation());
    };

    this.createDialog({
      title: wX("SAVELINKS TITLE"),
      html: container,
      width: "auto",
      dialogClass: "savelinks",
      buttons: buttons,
      id: statics.dialogNames.savelinks,
    });
  },

  saveLinks: function () {
    if (!this._anchor) {
      displayError("Select an anchor portal");
      return;
    }

    const operation = getSelectedOperation();

    operation.startBatchMode();
    for (const p of getAllPortalsLinked(operation, this._anchor)) {
      if (p.id == this._anchor.id) continue;
      if (p.comment === "out") {
        operation.addLink(this._anchor, p, {
          description: "Save Links (Outbound from anchor)",
        });
      } else {
        operation.addLink(p, this._anchor, {
          description: "Save Links (Inbound to anchor)",
        });
      }
    }
    operation.endBatchMode();
  },
});

export default SaveLinksDialog;
