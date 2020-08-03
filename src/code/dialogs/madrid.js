import { WDialog } from "../leafletClasses";
import WasabeePortal from "../portal";
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

  // addHooks inherited from MultimaxDialog
  // removeHooks inherited from MultimaxDialog
  _displayDialog: function () {
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
        localStorage[
          window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY
        ] = JSON.stringify(this._anchorOne);
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
      this._setOneDisplay.textContent = wX(
        "PORTAL_COUNT",
        this._portalSetOne.length
      );
    } else {
      this._setOneDisplay.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(setOneButton, "click", () => {
      this._portalSetOne = getAllPortalsOnScreen(this._operation);
      // XXX this is not enough, need to cache them in case IITC purges them
      this._setOneDisplay.textContent = wX(
        "PORTAL_COUNT",
        this._portalSetOne.length
      );
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
        localStorage[
          window.plugin.wasabee.static.constants.ANCHOR_TWO_KEY
        ] = JSON.stringify(this._anchorTwo);
        this._anchorTwoDisplay.textContent = "";
        this._anchorTwoDisplay.appendChild(
          this._anchorTwo.displayFormat(this._smallScreen)
        );
      } else {
        alert(wX("PLEASE_SELECT_PORTAL"));
      }
    });

    const setTwoLabel = L.DomUtil.create("label", null, container);
    setTwoLabel.textContent = wX("MADRID_SET_2");
    const setTwoButton = L.DomUtil.create("button", null, container);
    setTwoButton.textContent = wX("SET");
    this._setTwoDisplay = L.DomUtil.create("span", null, container);
    if (this._portalSetTwo) {
      this._setTwoDisplay.textContent = wX(
        "PORTAL_COUNT",
        this._portalSetTwo.length
      );
    } else {
      this._setTwoDisplay.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(setTwoButton, "click", () => {
      this._portalSetTwo = getAllPortalsOnScreen(this._operation);
      // XXX cache
      this._setTwoDisplay.textContent = wX(
        "PORTAL_COUNT",
        this._portalSetTwo.length
      );
    });

    const anchorThreeLabel = L.DomUtil.create("label", null, container);
    anchorThreeLabel.textContent = wX("ANCHOR3");
    const anchorThreeDisplay = L.DomUtil.create("span", null, container);
    anchorThreeDisplay.textContent = "Auto-determined";

    const setThreeLabel = L.DomUtil.create("label", null, container);
    setThreeLabel.textContent = wX("MADRID_SET_3");
    const setThreeButton = L.DomUtil.create("button", null, container);
    setThreeButton.textContent = wX("SET");
    this._setThreeDisplay = L.DomUtil.create("span", null, container);
    if (this._portalSetThree) {
      this._setThreeDisplay.textContent = wX(
        "PORTAL_COUNT",
        this._portalSetThree.length
      );
    } else {
      this._setThreeDisplay.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(setThreeButton, "click", () => {
      this._portalSetThree = getAllPortalsOnScreen(this._operation);
      // XXX cache
      this._setThreeDisplay.textContent = wX(
        "PORTAL_COUNT",
        this._portalSetThree.length
      );
    });

    //Add backlinks after all the rest is set up
    const fllabel = L.DomUtil.create("label", null, container);
    fllabel.textContent = wX("ADD_BL");
    this._flcheck = L.DomUtil.create("input", null, container);
    this._flcheck.type = "checkbox";

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
      const total = this.doMadrid.call(this);
      alert(`Madrid found ${total} layers`);
      // this._dialog.dialog("close");
    });

    const buttons = {};
    buttons[wX("CLOSE")] = () => {
      this._dialog.dialog("close");
    };
    buttons[wX("CLEAR LINKS")] = () => {
      clearAllLinks(getSelectedOperation());
    };

    this._dialog = window.dialog({
      title: wX("MADRID_TITLE"),
      html: container,
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-madrid",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.madrid,
    });
    this._dialog.dialog("option", "buttons", buttons);
  },

  initialize: function (map = window.map, options) {
    this.type = MadridDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
    this.title = wX("MADRID");
    this.label = wX("MADRID");
    this._operation = getSelectedOperation();
    let p = localStorage[window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY];
    if (p) this._anchorOne = WasabeePortal.create(p);
    p = localStorage[window.plugin.wasabee.static.constants.ANCHOR_TWO_KEY];
    if (p) this._anchorTwo = WasabeePortal.create(p);
    this._urp = testPortal();
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
    this._operation.addLink(this._anchorOne, this._anchorTwo, "madrid base", 1);

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
