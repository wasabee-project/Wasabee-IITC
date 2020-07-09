import { WDialog } from "../leafletClasses";
import WasabeePortal from "../portal";
import { getSelectedOperation } from "../selectedOp";
// import WasabeeLink from "../link";
import { clearAllLinks, getAllPortalsOnScreen } from "../uiCommands";
import wX from "../wX";
import { postToFirebase } from "../firebaseSupport";

const StarburstDialog = WDialog.extend({
  statics: {
    TYPE: "StarburstDialog"
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

    //Instructions
    const container = L.DomUtil.create("div", "container");
    const description = L.DomUtil.create("div", "desc", container);
    description.textContent = wX("SEL_SB_ANCHOR");
    const description2 = L.DomUtil.create("div", "desc2", container);
    description2.textContent = wX("SEL_SB_ANCHOR2");

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

    L.DomEvent.on(anchorButton, "click", ev => {
      L.DomEvent.stop(ev);
      this._anchor = WasabeePortal.getSelected();
      if (this._anchor) {
        localStorage[
          window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY
        ] = JSON.stringify(this._anchor);
        this._anchorDisplay.textContent = "";
        this._anchorDisplay.appendChild(
          this._anchor.displayFormat(this._smallScreen)
        );
      } else {
        alert(wX("PLEASE_SELECT_PORTAL"));
      }
    });

    const newLine = L.DomUtil.create("label", "newline", container);
    newLine.textContent = "\u0000";
    const placeholder = L.DomUtil.create("label", "placeholder", container);
    placeholder.textContent = "\u2063";
    const placeholder2 = L.DomUtil.create("label", "placeholder", container);
    placeholder2.textContent = "\u2063";

    const button = L.DomUtil.create("button", "drawb", container);
    button.textContent = wX("STARBURST_DRAW");
    L.DomEvent.on(button, "click", ev => {
      L.DomEvent.stop(ev);
      this.starburst.call(this);
    });

    const buttons = {};
    buttons[wX("CLOSE")] = () => {
      this._dialog.dialog("close");
    };
    buttons[wX("CLEAR LINKS")] = () => {
      clearAllLinks(getSelectedOperation());
    };

    this._dialog = window.dialog({
      title: wX("STARBURST TITLE"),
      html: container,
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-starburst",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.starburst
    });
    this._dialog.dialog("option", "buttons", buttons);
  },

  initialize: function(map = window.map, options) {
    this.type = StarburstDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
    this.title = wX("STARBURST");
    this.label = wX("STARBURST TITLE");
    this._operation = getSelectedOperation();
    const p =
      localStorage[window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY];
    if (p) this._anchor = WasabeePortal.create(p);
    postToFirebase({ id: "analytics", action: StarburstDialog.TYPE });
  },

  starburst: function() {
    if (!this._anchor) {
      alert("Select an anchor portal");
      return;
    }

    this._operation.startBatchMode();
    for (const p of getAllPortalsOnScreen(this._operation)) {
      if (p.id == this._anchor.id) continue;
      this._operation.addLink(p, this._anchor, "auto starburst");
    }
    this._operation.endBatchMode();
  }
});

export default StarburstDialog;
