import { WDialog } from "../leafletClasses";
import WasabeeLink from "../link";
import WasabeeMarker from "../marker";
// import { stateLinkPromise, stateMarkerPromise } from "../server";
import wX from "../wX";

const StateDialog = WDialog.extend({
  statics: {
    TYPE: "stateDialog"
  },

  initialize: function(map = window.map, options) {
    this.type = StateDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
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
    const buttons = {};
    buttons[wX("OK")] = () => {
      this._dialog.dialog("close");
    };

    this._dialog = window.dialog({
      title: this._name,
      html: this._html,
      dialogClass: "wasabee-dialog wasabee-dialog-state",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.state
    });
    this._dialog.dialog("option", "buttons", buttons);
  },

  setup: function(target, operation) {
    this._operation = operation;
    this._dialog = null;
    this._targetID = target.ID;
    this._html = L.DomUtil.create("div", null);
    const divtitle = L.DomUtil.create("div", "desc", this._html);

    if (target instanceof WasabeeLink) {
      const portal = operation.getPortal(target.fromPortalId);
      this._type = "Link";
      divtitle.appendChild(
        target.displayFormat(this._operation, this._smallScreen)
      );
      const t = L.DomUtil.create("span", null, divtitle);
      t.textContent = wX("LINK STATE");
      this._name = wX("LINK STATE PROMPT", portal.name);
    }

    if (target instanceof WasabeeMarker) {
      const portal = operation.getPortal(target.portalId);
      this._type = "Marker";
      divtitle.appendChild(portal.displayFormat(this._smallScreen));
      const t = L.DomUtil.create("span", null, divtitle);
      t.textContent = wX("MARKER STATE");
      this._name = wX("MARKER STATE PROMPT", portal.name);
    }

    const menu = this._getStateMenu(target);
    this._html.appendChild(menu);
  },

  _buildContent: function() {
    const content = L.DomUtil.create("div");
    if (typeof this._label == "string") {
      content.textContent = this._label;
    } else {
      content.appendChild(this._label);
    }
    return content;
  },

  // TODO this should return a promise so the draw routine can .then() it...
  _getStateMenu: function(current) {
    const container = L.DomUtil.create("div", "wasabee-state-menu");
    const menu = L.DomUtil.create("select", null, container);

    // const states = ['pending','assigned','acknowledged','completed'];
    const states = ["pending", "acknowledged", "completed"];
    for (const s of states) {
      const option = menu.appendChild(L.DomUtil.create("option", null));
      option.value = s;
      option.textContent = wX(s);
      if (current.state == s) option.selected = true;
    }

    const mode = localStorage[window.plugin.wasabee.static.constants.MODE_KEY];
    if (mode == "active") {
      menu.addEventListener("change", value => {
        this.activeSetState(value);
      });
    } else {
      menu.addEventListener("change", value => {
        this.designSetState(value);
      });
    }

    return container;
  },

  designSetState: function(value) {
    if (this._type == "Marker") {
      this._operation.setMarkerState(this._targetID, value.srcElement.value);
    }
    // link states are different, but the WasabeeLink object knows what to do...
    if (this._type == "Link") {
      this._operation.setLinkState(this._targetID, value.srcElement.value);
    }
  },

  activeSetState: function(value) {
    alert("Active mode set state not written yet");
    console.log("not written yet", value);
  }
});

export default StateDialog;
