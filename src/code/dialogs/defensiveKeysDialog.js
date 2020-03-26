import { WDialog } from "../leafletClasses";
import WasabeePortal from "../portal";
import WasabeeMe from "../me";
import { getSelectedOperation } from "../selectedOp";
import { dKeyPromise } from "../server";
import wX from "../wX";

const DefensiveKeysDialog = WDialog.extend({
  statics: {
    TYPE: "defensiveKeysDialog"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = DefensiveKeysDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
  },

  addHooks: async function() {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    this._me = await WasabeeMe.waitGet();
    this._operation = getSelectedOperation();
    const context = this;
    this._pch = portal => {
      context._portalClickedHook(portal);
    };
    window.addHook("portalSelected", this._pch);

    this._buildContent();
    this._displayDialog();
  },

  removeHooks: function() {
    WDialog.prototype.removeHooks.call(this);
    window.removeHook("portalSelected", this._pch);
  },

  _portalClickedHook: function() {
    this._selectedPortal = WasabeePortal.getSelected();
    if (this._selectedPortal) {
      this._portal.innerHTML = "";
      this._portal.appendChild(this._selectedPortal.displayFormat());
      const mine = this._getMyData(this._selectedPortal.id);
      if (mine) {
        this._count.value = mine.Count;
        this._capID.value = mine.CapID;
      } else {
        this._count.value = "";
        this._capID.value = "";
      }
    } else {
      this._portal.innerHTML = wX("PLEASE_SELECT_PORTAL");
    }
  },

  _buildContent: function() {
    this._content = L.DomUtil.create("div", "temp-op-dialog");
    this._portal = L.DomUtil.create("div", "", this._content);

    const d = L.DomUtil.create("div", "", this._content);
    this._count = L.DomUtil.create("input", "", d);
    this._count.setAttribute("placeholder", "number of keys");
    this._count.size = 3;
    const dd = L.DomUtil.create("div", "", this._content);
    this._capID = L.DomUtil.create("input", "", dd);
    this._capID.setAttribute("placeholder", "Capsule ID");
    this._capID.size = 8;
    const addDKeyButton = L.DomUtil.create("a", "", this._content);
    addDKeyButton.innerHTML = wX("UPDATE_COUNT");
    L.DomEvent.on(addDKeyButton, "click", () => {
      this._addDKey();
    });

    this._portalClickedHook();
  },

  _displayDialog: function() {
    this._dialog = window.dialog({
      title: wX("INPUT_DT_KEY_COUNT"),
      width: "auto",
      height: "auto",
      position: {
        my: "center top",
        at: "center center+30"
      },
      html: this._content,
      dialogClass: "wasabee-dialog",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.wasabeeDKeyButton
    });
  },

  _addDKey: function() {
    // send it to the server
    dKeyPromise(
      this._selectedPortal.id,
      this._count.value,
      this._capID.value
    ).then(
      function() {
        alert("Registered with server");
        window.runHooks("wasabeeDkeys");
      },
      function(reject) {
        console.log(reject);
        alert(reject);
      }
    );
  },

  _getMyData(portalID) {
    if (!window.plugin.wasabee._Dkeys) return;
    if (!window.plugin.wasabee._Dkeys.has(portalID)) return;
    const l = window.plugin.wasabee._Dkeys.get(portalID);
    if (l.has(this._me.GoogleID)) return l.get(this._me.GoogleID);
    return;
  }
});

export default DefensiveKeysDialog;
