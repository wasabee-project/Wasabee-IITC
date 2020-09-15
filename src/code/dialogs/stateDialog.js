import { WDialog } from "../leafletClasses";
import WasabeeLink from "../link";
import WasabeeMarker from "../marker";
import { SetMarkerState, SetLinkState } from "../server";
import wX from "../wX";
import { postToFirebase } from "../firebaseSupport";

const StateDialog = WDialog.extend({
  statics: {
    TYPE: "stateDialog",
  },

  initialize: function (map = window.map, options) {
    this.type = StateDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
    postToFirebase({ id: "analytics", action: StateDialog.TYPE });
  },

  addHooks: function () {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
  },

  _displayDialog: function () {
    const buttons = {};
    buttons[wX("OK")] = () => {
      this._dialog.dialog("close");
    };

    this._dialog = window.dialog({
      title: this._name,
      html: this._html,
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-state",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.state,
    });
    this._dialog.dialog("option", "buttons", buttons);
  },

  setup: function (target, opID) {
    this._opID = opID;
    this._dialog = null;
    this._targetID = target.ID;
    this._html = L.DomUtil.create("div", null);
    const divtitle = L.DomUtil.create("div", "desc", this._html);
    const menu = this._getStateMenu(target);

    if (target instanceof WasabeeLink) {
      const portal = operation.getPortal(target.fromPortalId);
      this._type = "Link";
      this._name = wX("LINK STATE PROMPT", portal.name);
      divtitle.appendChild(target.displayFormat(operation, this._smallScreen));
      const t = L.DomUtil.create("label", null);
      t.textContent = wX("LINK STATE");
      menu.prepend(t);
    }

    if (target instanceof WasabeeMarker) {
      const portal = operation.getPortal(target.portalId);
      this._type = "Marker";
      this._name = wX("MARKER STATE PROMPT", portal.name);
      divtitle.appendChild(portal.displayFormat(this._smallScreen));
      const t = L.DomUtil.create("label", null);
      t.textContent = wX("MARKER STATE");
      menu.prepend(t);
    }

    this._html.appendChild(menu);
  },

  _buildContent: function () {
    const content = L.DomUtil.create("div");
    if (typeof this._label == "string") {
      content.textContent = this._label;
    } else {
      content.appendChild(this._label);
    }
    return content;
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

    const mode = localStorage[window.plugin.wasabee.static.constants.MODE_KEY];
    if (mode == "active") {
      menu.addEventListener("change", (value) => {
        // async/await not necessary since this doesn't return a value
        this.activeSetState(value);
      });
    } else {
      menu.addEventListener("change", (value) => {
        this.designSetState(value);
      });
    }

    return container;
  },

  designSetState: function (value) {
    const operation = getSelectedOperation();
    if (this._opID != operation.ID) {
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

  activeSetState: async function (value) {
	const operation = getSelectedOperation();
	if (operation.ID != this._opID) {
          console.log("operation changed, bailing");
	  return;
	}

    if (this._type == "Marker") {
      try {
        await SetMarkerState(
          this._opID,
          this._targetID,
          value.srcElement.value
        );
        // changing it locally in battle mode will push the entire draw...
        operation.setMarkerState(this._targetID, value.srcElement.value);
      } catch (e) {
        console.log(e);
      }
    }

    if (this._type == "Link") {
      try {
        await SetLinkState(
          this._opID,
          this._targetID,
          value.srcElement.value
        );
        // changing it locally in battle mode will push the entire draw...
        operation.setLinkState(this._targetID, value.srcElement.value);
      } catch (e) {
        console.log(e);
      }
    }
  },
});

export default StateDialog;
