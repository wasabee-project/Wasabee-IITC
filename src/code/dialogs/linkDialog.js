import { WDialog } from "../leafletClasses";
import WasabeePortal from "../portal";
import { getSelectedOperation } from "../selectedOp";
import wX from "../wX";
import { postToFirebase } from "../firebaseSupport";

const LinkDialog = WDialog.extend({
  statics: {
    TYPE: "linkDialog",
  },

  initialize: function (map = window.map, options) {
    this.type = LinkDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);

    let p =
      localStorage[window.plugin.wasabee.static.constants.LINK_SOURCE_KEY];
    if (p) this._source = WasabeePortal.create(p);
    p = localStorage[window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY];
    if (p) this._anchor1 = WasabeePortal.create(p);
    p = localStorage[window.plugin.wasabee.static.constants.ANCHOR_TWO_KEY];
    if (p) this._anchor2 = WasabeePortal.create(p);
    postToFirebase({ id: "analytics", action: LinkDialog.TYPE });
  },

  addHooks: function () {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    this._operation = getSelectedOperation();
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
  },

  _displayDialog: function () {
    if (!this._map) return;
    const container = L.DomUtil.create("div", "container");

    const sourceLabel = L.DomUtil.create("label", null, container);
    sourceLabel.textContent = wX("SOURCE_PORT");
    const sourceButton = L.DomUtil.create("button", "set", container);
    sourceButton.textContent = wX("SET");
    this._sourceDisplay = L.DomUtil.create("span", "portal", container);
    if (this._source) {
      this._sourceDisplay.appendChild(
        this._source.displayFormat(this._smallScreen)
      );
    } else {
      this._sourceDisplay.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(sourceButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      this._source = WasabeePortal.getSelected();
      if (this._source) {
        localStorage[
          window.plugin.wasabee.static.constants.LINK_SOURCE_KEY
        ] = JSON.stringify(this._source);
        this._sourceDisplay.textContent = "";
        this._sourceDisplay.appendChild(
          this._source.displayFormat(this._smallScreen)
        );
      } else {
        alert(wX("PLEASE_SELECT_PORTAL"));
      }
    });
    // const clearSourceButton = L.DomUtil.create("button", "clear", container);
    // clearSourceButton.textContent = wX("CLEAR");
    // L.DomEvent.on(clearSourceButton, "click", (ev) => {
    //   L.DomEvent.stop(ev);
    //   delete localStorage[
    //     window.plugin.wasabee.static.constants.LINK_SOURCE_KEY
    //   ];
    //   this._sourceDisplay.textContent = wX("NOT_SET");
    // });

    const anchor1Label = L.DomUtil.create("label", null, container);
    anchor1Label.textContent = wX("ANCHOR1");
    const anchor1Button = L.DomUtil.create("button", "set", container);
    anchor1Button.textContent = wX("SET");
    this._anchor1Display = L.DomUtil.create("span", "portal", container);
    if (this._anchor1) {
      this._anchor1Display.appendChild(
        this._anchor1.displayFormat(this._smallScreen)
      );
    } else {
      this._anchor1Display.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(anchor1Button, "click", (ev) => {
      L.DomEvent.stop(ev);
      this._anchor1 = WasabeePortal.getSelected();
      if (this._anchor1) {
        localStorage[
          window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY
        ] = JSON.stringify(this._anchor1);
        this._anchor1Display.textContent = "";
        this._anchor1Display.appendChild(
          this._anchor1.displayFormat(this._smallScreen)
        );
      } else {
        alert(wX("PLEASE_SELECT_PORTAL"));
      }
    });
    const anchor1AddButton = L.DomUtil.create("button", "add", container);
    anchor1AddButton.textContent = wX("ADD1");
    L.DomEvent.on(anchor1AddButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      if (this._source && this._anchor1) {
        this._operation.addLink(
          this._source,
          this._anchor1,
          this._desc.value,
          this._operation.nextOrder
        );
      } else {
        alert("Select both Source and Anchor 1");
      }
    });
    // const clearAnchor1Button = L.DomUtil.create("button", "clear", container);
    // clearAnchor1Button.textContent = wX("CLEAR");
    // L.DomEvent.on(clearAnchor1Button, "click", (ev) => {
    //   L.DomEvent.stop(ev);
    //   delete localStorage[
    //     window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY
    //   ];
    //   this._anchor1Display.textContent = wX("NOT_SET");
    // });

    const anchor2Label = L.DomUtil.create("label", null, container);
    anchor2Label.textContent = wX("ANCHOR2");
    const anchor2Button = L.DomUtil.create("button", "set", container);
    anchor2Button.textContent = wX("SET");
    this._anchor2Display = L.DomUtil.create("span", "portal", container);
    if (this._anchor2) {
      this._anchor2Display.appendChild(
        this._anchor2.displayFormat(this._smallScreen)
      );
    } else {
      this._anchor2Display.textContent = wX("NOT_SET");
    }
    L.DomEvent.on(anchor2Button, "click", (ev) => {
      L.DomEvent.stop(ev);
      this._anchor2 = WasabeePortal.getSelected();
      if (this._anchor2) {
        localStorage[
          window.plugin.wasabee.static.constants.ANCHOR_TWO_KEY
        ] = JSON.stringify(this._anchor2);
        this._anchor2Display.textContent = "";
        this._anchor2Display.appendChild(
          this._anchor2.displayFormat(this._smallScreen)
        );
      } else {
        alert(wX("PLEASE_SELECT_PORTAL"));
      }
    });
    const anchor2AddButton = L.DomUtil.create("button", "add", container);
    anchor2AddButton.textContent = wX("ADD2");
    L.DomEvent.on(anchor2AddButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      if (this._source && this._anchor2) {
        this._operation.addLink(
          this._source,
          this._anchor2,
          this._desc.value,
          this._operation.nextOrder
        );
      } else {
        alert(wX("SEL_SRC_ANC2"));
      }
    });
    // const clearAnchor2Button = L.DomUtil.create("button", "clear", container);
    // clearAnchor2Button.textContent = wX("CLEAR");
    // L.DomEvent.on(clearAnchor2Button, "click", (ev) => {
    //   L.DomEvent.stop(ev);
    //   delete localStorage[
    //     window.plugin.wasabee.static.constants.ANCHOR_TWO_KEY
    //   ];
    //   this._anchor2Display.textContent = wX("NOT_SET");
    // });

    // Bottom buttons bar
    // Enter arrow
    //const opt = L.DomUtil.create("label", "arrow", container);
    //opt.textContent = "\uD83E\uDCA7";

    // Go button
    const button = L.DomUtil.create("buttonall", null, container);
    button.textContent = "\uD83D\uDC1D" + wX("ADD_BUTTON_LINKS");
    L.DomEvent.on(button, "click", (ev) => {
      L.DomEvent.stop(ev);
      if (!this._source) alert(wX("SEL_SRC_PORT"));
      if (this._anchor1) {
        this._operation.addLink(
          this._source,
          this._anchor1,
          this._desc.value,
          this._operation.nextOrder
        );
      }
      if (this._anchor2) {
        this._operation.addLink(
          this._source,
          this._anchor2,
          this._desc.value,
          this._operation.nextOrder
        );
      }
    });
    this._desc = L.DomUtil.create("input", "desc", container);
    this._desc.placeholder = wX("DESCRIP_PLACEHOLD");

    const buttons = {};
    buttons[wX("CLOSE")] = () => {
      this._dialog.dialog("close");
    };

    this._dialog = window.dialog({
      title: wX("ADD_LINKS"),
      html: container,
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-link",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.linkDialogButton,
    });
    this._dialog.dialog("option", "buttons", buttons);
  },
});

export default LinkDialog;
