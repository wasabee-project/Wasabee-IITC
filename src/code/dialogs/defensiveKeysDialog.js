import { WDialog } from "../leafletClasses";
import WasabeePortal from "../portal";
import WasabeeMe from "../me";
import { dKeyPromise } from "../server";
import wX from "../wX";
import WasabeeDList from "./wasabeeDlist";
import { postToFirebase } from "../firebaseSupport";

const DefensiveKeysDialog = WDialog.extend({
  statics: {
    TYPE: "defensiveKeysDialog",
  },

  initialize: function (map = window.map, options) {
    this.type = DefensiveKeysDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
    postToFirebase({ id: "analytics", action: DefensiveKeysDialog.TYPE });
  },

  addHooks: async function () {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    this._me = await WasabeeMe.waitGet();
    this._pch = (portal) => {
      this._portalClickedHook(portal);
    };
    window.addHook("portalSelected", this._pch);

    this._buildContent();
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.removeHook("portalSelected", this._pch);
  },

  _portalClickedHook: function () {
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

  _buildContent: function () {
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
    L.DomEvent.on(addDKeyButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      this._addDKey(); // async, but no need to await it
    });

    const showDKeyButton = L.DomUtil.create("button", null, this._content);
    showDKeyButton.textContent = wX("D_SHOW_LIST");
    L.DomEvent.on(showDKeyButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      const dl = new WasabeeDList();
      dl.enable();
    });

    this._portalClickedHook();
  },

  _displayDialog: function () {
    const buttons = {};
    buttons[wX("OK")] = () => {
      this._dialog.dialog("close");
    };

    this._dialog = window.dialog({
      title: wX("INPUT_DT_KEY_COUNT"),
      // position: { my: "center top", at: "center center+30" },
      html: this._content,
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-wdkeys",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.wasabeeDKeyButton,
    });
    this._dialog.dialog("option", "buttons", buttons);
  },

  _addDKey: async function () {
    const dk = {
      PortalID: this._selectedPortal.id,
      Count: Number(this._count.value),
      CapID: this._capID.value,
      Name: this._selectedPortal.name,
      Lat: this._selectedPortal.lat,
      Lng: this._selectedPortal.lat,
    };
    try {
      const j = JSON.stringify(dk);
      console.log(j);
      await dKeyPromise(j);
      alert("Registered with server");
      window.runHooks("wasabeeDkeys");
    } catch (e) {
      console.error(e);
      alert(e.toString());
    }
  },

  _getMyData(portalID) {
    if (!window.plugin.wasabee._Dkeys) return null;
    if (!window.plugin.wasabee._Dkeys.has(portalID)) return null;
    const l = window.plugin.wasabee._Dkeys.get(portalID);
    if (l.has(this._me.GoogleID)) return l.get(this._me.GoogleID);
    return null;
  },
});

export default DefensiveKeysDialog;
