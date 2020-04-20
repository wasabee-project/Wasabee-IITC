import { WDialog } from "../leafletClasses";
import WasabeePortal from "../portal";
import WasabeeMe from "../me";
import { getSelectedOperation } from "../selectedOp";
import { dKeyPromise } from "../server";
import wX from "../wX";
import WasabeeDList from "./wasabeeDlist";

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
    this._pch = portal => {
      this._portalClickedHook(portal);
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
      this._portal.textContent = "";
      this._portal.appendChild(
        this._selectedPortal.displayFormat(this._smallScreen)
      );
      const mine = this._getMyData(this._selectedPortal.id);
      if (mine) {
        this._count.value = mine.Count;
        this._capID.value = mine.CapID;
      } else {
        this._count.value = "";
        this._capID.value = "";
      }
    } else {
      this._portal.textContent = wX("PLEASE_SELECT_PORTAL");
    }
  },

  _buildContent: function() {
    this._content = L.DomUtil.create("div", "container");
    this._portal = L.DomUtil.create("div", "portal", this._content);

    this._count = L.DomUtil.create("input", null, this._content);
    this._count.placeholder = "number of keys";
    this._count.size = 3;
    this._capID = L.DomUtil.create("input", null, this._content);
    this._capID.placeholder = "Capsule ID";
    this._capID.size = 8;
    const addDKeyButton = L.DomUtil.create("button", null, this._content);
    addDKeyButton.textContent = wX("UPDATE_COUNT");
    L.DomEvent.on(addDKeyButton, "click", ev => {
      L.DomEvent.stop(ev);
      this._addDKey();
    });

    const showDKeyButton = L.DomUtil.create("button", null, this._content);
    showDKeyButton.textContent = wX("D_SHOW_LIST");
    L.DomEvent.on(showDKeyButton, "click", ev => {
      L.DomEvent.stop(ev);
      const dl = new WasabeeDList();
      dl.enable();
    });

    this._portalClickedHook();
  },

  _displayDialog: function() {
    this._dialog = window.dialog({
      title: wX("INPUT_DT_KEY_COUNT"),
      width: "auto",
      height: "auto",
      // position: { my: "center top", at: "center center+30" },
      html: this._content,
      dialogClass: "wasabee-dialog wasabee-dialog-wdkeys",
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
