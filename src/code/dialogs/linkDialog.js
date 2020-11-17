import { WDialog } from "../leafletClasses";
import WasabeePortal from "../portal";
import { getSelectedOperation } from "../selectedOp";
import wX from "../wX";

const LinkDialog = WDialog.extend({
  statics: {
    TYPE: "linkDialog",
  },

  initialize: function (options) {
    WDialog.prototype.initialize.call(this, options);

    let p =
      localStorage[window.plugin.wasabee.static.constants.LINK_SOURCE_KEY];
    if (p) this._source = new WasabeePortal(p);
    p = localStorage[window.plugin.wasabee.static.constants.ANCHOR_ONE_KEY];
    if (p) this._anchor1 = new WasabeePortal(p);
    p = localStorage[window.plugin.wasabee.static.constants.ANCHOR_TWO_KEY];
    if (p) this._anchor2 = new WasabeePortal(p);
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    // this._operation = getSelectedOperation();
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
  },

  _displayDialog: function () {
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
        const operation = getSelectedOperation();
        operation.addLink(
          this._source,
          this._anchor1,
          this._desc.value,
          operation.nextOrder
        );
      } else {
        alert("Select both Source and Anchor 1");
      }
    });

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
        const operation = getSelectedOperation();
        operation.addLink(
          this._source,
          this._anchor2,
          this._desc.value,
          operation.nextOrder
        );
      } else {
        alert(wX("SEL_SRC_ANC2"));
      }
    });

    // Go button
    const button = L.DomUtil.create("button", "drawb", container);
    button.textContent = wX("ADD_BUTTON_LINKS");
    L.DomEvent.on(button, "click", (ev) => {
      L.DomEvent.stop(ev);
      if (!this._source) alert(wX("SEL_SRC_PORT"));
      const operation = getSelectedOperation();
      if (this._anchor1) {
        operation.addLink(
          this._source,
          this._anchor1,
          this._desc.value,
          operation.nextOrder
        );
      }
      if (this._anchor2) {
        operation.addLink(
          this._source,
          this._anchor2,
          this._desc.value,
          operation.nextOrder
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
