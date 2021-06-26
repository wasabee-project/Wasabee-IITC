import { WDialog } from "../leafletClasses";
import WasabeePortal from "../model/portal";
import { getSelectedOperation } from "../selectedOp";
import { clearAllLinks, getAllPortalsLinked } from "../uiCommands";
import wX from "../wX";

const SaveLinksDialog = WDialog.extend({
  statics: {
    TYPE: "SaveLinksDialog",
  },

  needWritePermission: true,

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  _displayDialog: function () {
    //Instructions
    const container = L.DomUtil.create("div", "container");
    const description = L.DomUtil.create("div", "desc", container);
    description.textContent = wX("SEL_SL_ANCHOR");

    //anchor portal text
    const anchorLabel = L.DomUtil.create("label", null, container);
    anchorLabel.textContent = wX("ANCHOR_PORTAL");

    //Set Button
    const anchorButton = L.DomUtil.create("button", null, container);
    anchorButton.textContent = wX("SET");
    this._anchorDisplay = L.DomUtil.create("div", "anchor", container);

    //do magic
    if (this._anchor) {
      this._anchorDisplay.appendChild(
        this._anchor.displayFormat(this._smallScreen)
      );
    } else {
      this._anchorDisplay.textContent = wX("NOT_SET");
    }

    L.DomEvent.on(anchorButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      this._anchor = WasabeePortal.getSelected();
      if (this._anchor) {
        localStorage[window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY] =
          JSON.stringify(this._anchor);
        this._anchorDisplay.textContent = "";
        this._anchorDisplay.appendChild(
          this._anchor.displayFormat(this._smallScreen)
        );
      } else {
        alert(wX("PLEASE_SELECT_PORTAL"));
      }
    });

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
      id: window.plugin.wasabee.static.dialogNames.savelinks,
    });
  },

  initialize: function (options) {
    WDialog.prototype.initialize.call(this, options);
    const p =
      localStorage[window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY];
    if (p) this._anchor = new WasabeePortal(p);
  },

  saveLinks: function () {
    if (!this._anchor) {
      alert("Select an anchor portal");
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
