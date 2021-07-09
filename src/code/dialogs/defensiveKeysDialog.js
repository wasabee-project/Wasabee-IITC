import { WDialog } from "../leafletClasses";
import WasabeeMe from "../model/me";
import { dKeyPromise } from "../server";
import wX from "../wX";
import WasabeeDList from "./wasabeeDlist";
import { getAgentPortalWasabeeDkeys } from "../wd";

import PortalUI from "../ui/portal";

const DefensiveKeysDialog = WDialog.extend({
  statics: {
    TYPE: "defensiveKeysDialog",
  },

  addHooks: async function () {
    WDialog.prototype.addHooks.call(this);
    this._me = await WasabeeMe.waitGet();
    this._pch = (portal) => {
      this._portalClickedHook(portal);
    };
    window.addHook("portalSelected", this._pch);

    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.removeHook("portalSelected", this._pch);
  },

  _portalClickedHook: async function () {
    this._selectedPortal = PortalUI.getSelected();
    if (this._selectedPortal) {
      this._portal.textContent = "";
      this._portal.appendChild(
        PortalUI.displayFormat(this._selectedPortal, this._smallScreen)
      );
      const mine = await getAgentPortalWasabeeDkeys(
        this._me.GoogleID,
        this._selectedPortal.id
      );
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
    const content = L.DomUtil.create("div", "container");
    this._portal = L.DomUtil.create("div", "portal", content);

    this._count = L.DomUtil.create("input", null, content);
    this._count.placeholder = "number of keys";
    this._count.size = 3;
    this._capID = L.DomUtil.create("input", null, content);
    this._capID.placeholder = "Capsule ID";
    this._capID.size = 8;
    const addDKeyButton = L.DomUtil.create("button", null, content);
    addDKeyButton.textContent = wX("UPDATE_COUNT");
    L.DomEvent.on(addDKeyButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      this._addDKey(); // async, but no need to await it
    });

    const showDKeyButton = L.DomUtil.create("button", null, content);
    showDKeyButton.textContent = wX("D_SHOW_LIST");
    L.DomEvent.on(showDKeyButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      const dl = new WasabeeDList();
      dl.enable();
    });

    this._portalClickedHook();
    return content;
  },

  _displayDialog: function () {
    const content = this._buildContent();

    const buttons = {};
    buttons[wX("OK")] = () => {
      this.closeDialog();
    };

    this.createDialog({
      title: wX("INPUT_DT_KEY_COUNT"),
      // position: { my: "center top", at: "center center+30" },
      html: content,
      width: "auto",
      dialogClass: "wdkeys",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.wasabeeDKeyButton,
    });
  },

  _addDKey: async function () {
    const dk = {
      PortalID: this._selectedPortal.id,
      Count: Number(this._count.value),
      CapID: this._capID.value,
      Name: this._selectedPortal.name,
      Lat: this._selectedPortal.lat,
      Lng: this._selectedPortal.lng,
    };
    try {
      const j = JSON.stringify(dk);
      console.log(j);
      await dKeyPromise(j);
      alert("Registered with server");
      window.map.fire("wasabee:defensivekeys");
    } catch (e) {
      console.error(e);
      alert(e.toString());
    }
  },
});

export default DefensiveKeysDialog;
