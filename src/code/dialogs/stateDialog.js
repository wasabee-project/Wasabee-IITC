import { WDialog } from "../leafletClasses";
import { WasabeeLink, WasabeeMarker } from "../model";
import wX from "../wX";
import { getSelectedOperation } from "../selectedOp";

import * as PortalUI from "../ui/portal";
import * as LinkUI from "../ui/link";

const StateDialog = WDialog.extend({
  statics: {
    TYPE: "stateDialog",
  },

  needWritePermission: true,

  options: {
    // target
    // opID
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  _displayDialog: function () {
    const buttons = {};
    buttons[wX("OK")] = () => {
      this.closeDialog();
    };

    // for this._name and this._html
    this._buildContent();

    this.createDialog({
      title: this._name,
      html: this._html,
      width: "auto",
      dialogClass: "state",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.state,
      autofocus: true,
    });
  },

  _buildContent: function () {
    this._targetID = this.options.target.ID;
    this._html = L.DomUtil.create("div", null);
    const divtitle = L.DomUtil.create("div", "desc", this._html);
    const menu = this._getStateMenu(this.options.target);

    const operation = getSelectedOperation();
    if (this.options.opID != operation.ID) {
      console.log("operation changed between create/setup?!");
      this.options.opID = operation.ID;
    }

    if (this.options.target instanceof WasabeeLink) {
      this._type = "Link";
      this._name = wX("LINK STATE PROMPT");
      divtitle.appendChild(
        LinkUI.displayFormat(this.options.target, operation)
      );
      const t = L.DomUtil.create("label", null);
      t.textContent = wX("LINK STATE");
      menu.prepend(t);
    }

    if (this.options.target instanceof WasabeeMarker) {
      const portal = operation.getPortal(this.options.target.portalId);
      this._type = "Marker";
      this._name = wX("MARKER STATE PROMPT");
      divtitle.appendChild(PortalUI.displayFormat(portal));
      const t = L.DomUtil.create("label", null);
      t.textContent = wX("MARKER STATE");
      menu.prepend(t);
    }

    this._html.appendChild(menu);
  },

  _getStateMenu: function (current) {
    const container = L.DomUtil.create("div", "wasabee-state-menu");
    const menu = L.DomUtil.create("select", null, container);

    const states = ["pending", "acknowledged", "completed"];
    for (const s of states) {
      const option = menu.appendChild(L.DomUtil.create("option", null));
      option.value = s;
      option.textContent = wX(s);
      if (current.state == s) option.selected = true;
    }

    menu.addEventListener("change", (value) => {
      this.setState(value);
    });

    return container;
  },

  setState: function (value) {
    const operation = getSelectedOperation();
    if (this.options.opID != operation.ID) {
      console.log("operation changed -- bailing");
      return;
    }
    if (this._type == "Marker") {
      operation.setMarkerState(this._targetID, value.srcElement.value);
    }
    // link states are different, but the WasabeeLink object knows what to do...
    if (this._type == "Link") {
      operation.setLinkState(this._targetID, value.srcElement.value);
    }
  },
});

export default StateDialog;
