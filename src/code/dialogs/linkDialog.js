import { WDialog } from "../leafletClasses";
import { WasabeePortal } from "../model";
import { getSelectedOperation } from "../selectedOp";
import wX from "../wX";
import { constants } from "../static";

import * as PortalUI from "../ui/portal";
import { displayError } from "../error";

const LinkDialog = WDialog.extend({
  statics: {
    TYPE: "linkDialog",
  },

  needWritePermission: true,

  initialize: function (options) {
    WDialog.prototype.initialize.call(this, options);

    let p = localStorage[constants.LINK_SOURCE_KEY];
    if (p) this._source = new WasabeePortal(p);
    p = localStorage[constants.ANCHOR_ONE_KEY];
    if (p) this._anchor1 = new WasabeePortal(p);
    p = localStorage[constants.ANCHOR_TWO_KEY];
    if (p) this._anchor2 = new WasabeePortal(p);
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    // this._operation = getSelectedOperation();
    this._displayDialog();
  },

  _addPortalSet(container, label, thisKey, storageKey, linkLabel) {
    /* Label */
    L.DomUtil.create("label", null, container).textContent = label;

    /* [set] */
    const buttonSet = L.DomUtil.create("button", "set", container);
    buttonSet.textContent = wX("SET");

    /* [add link] */
    if (linkLabel) {
      const buttonAdd = L.DomUtil.create("button", "add", container);
      buttonAdd.textContent = linkLabel;
      L.DomEvent.on(buttonAdd, "click", (ev) => {
        L.DomEvent.stop(ev);
        if (this._source && this[thisKey]) {
          const operation = getSelectedOperation();
          operation.addLink(this._source, this[thisKey], {
            description: this._desc.value,
            order: operation.nextOrder,
          });
        } else {
          displayError("Select both Source and Anchor");
        }
      });
    }

    /* [portal display] */
    const display = L.DomUtil.create("span", "portal", container);
    if (this[thisKey]) {
      display.appendChild(PortalUI.displayFormat(this[thisKey]));
    } else {
      display.textContent = wX("NOT_SET");
    }

    /* set portal */
    L.DomEvent.on(buttonSet, "click", (ev) => {
      L.DomEvent.stop(ev);
      this[thisKey] = PortalUI.getSelected();
      if (this[thisKey]) {
        localStorage[storageKey] = JSON.stringify(this[thisKey]);
        display.textContent = "";
        display.appendChild(PortalUI.displayFormat(this[thisKey]));
      } else {
        displayError(wX("PLEASE_SELECT_PORTAL"));
      }
    });
  },

  _displayDialog: function () {
    const container = L.DomUtil.create("div", "container");

    this._addPortalSet(
      container,
      wX("SOURCE_PORT"),
      "_source",
      constants.LINK_SOURCE_KEY
    );
    this._addPortalSet(
      container,
      wX("ANCHOR1"),
      "_anchor1",
      constants.ANCHOR_ONE_KEY,
      wX("ADD1")
    );
    this._addPortalSet(
      container,
      wX("ANCHOR2"),
      "_anchor2",
      constants.ANCHOR_TWO_KEY,
      wX("ADD2")
    );

    /* [add both] */
    const button = L.DomUtil.create("button", "drawb", container);
    button.textContent = wX("ADD_BUTTON_LINKS");

    /* [comment input] */
    this._desc = L.DomUtil.create("input", "desc", container);
    this._desc.placeholder = wX("DESCRIP_PLACEHOLD");

    /* add both links */
    L.DomEvent.on(button, "click", (ev) => {
      L.DomEvent.stop(ev);
      if (!this._source) displayError(wX("SEL_SRC_PORT"));
      const operation = getSelectedOperation();
      operation.startBatchMode();
      if (this._anchor1) {
        operation.addLink(this._source, this._anchor1, {
          description: this._desc.value,
          order: operation.nextOrder,
        });
      }
      if (this._anchor2) {
        operation.addLink(this._source, this._anchor2, {
          description: this._desc.value,
          order: operation.nextOrder,
        });
      }
      operation.endBatchMode();
    });

    const buttons = {};
    buttons[wX("CLOSE")] = () => {
      this.closeDialog();
    };

    this.createDialog({
      title: wX("ADD_LINKS"),
      html: container,
      width: "auto",
      dialogClass: "link",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.linkDialogButton,
    });
  },
});

export default LinkDialog;
