import { Feature } from "../leafletDrawImports";
import WasabeePortal from "../portal";
import WasabeeMe from "../me";
import { getSelectedOperation } from "../selectedOp";

const DefensiveKeysDialog = Feature.extend({
  statics: {
    TYPE: "defensiveKeysDialog"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = DefensiveKeysDialog.TYPE;
    Feature.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    if (!this._map) return;
    Feature.prototype.addHooks.call(this);
    this._me = WasabeeMe.get();
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
    Feature.prototype.removeHooks.call(this);
    window.removeHook("portalSelected", this._pch);
  },

  _portalClickedHook: function() {
    this._selectedPortal = WasabeePortal.getSelected();
    if (this._selectedPortal) {
      this._portal.innerHTML = "";
      this._portal.appendChild(this._selectedPortal.displayFormat());
      const mine = this._getMyData(this._selectedPortal.id);
      if (mine) {
        this._count.value = mine.count;
        this._capID.value = mine.capID;
      } else {
        this._count.value = "";
        this._capID.value = "";
      }
    } else {
      this._portal.innerHTML = "Please select a portal";
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
    addDKeyButton.innerHTML = "Update Count";
    L.DomEvent.on(addDKeyButton, "click", () => {
      this._addDKey();
    });

    this._portalClickedHook();
  },

  _displayDialog: function() {
    this._dialog = window.dialog({
      title: "Input Defensive Key Count",
      width: "auto",
      height: "auto",
      position: {
        my: "center top",
        at: "center center+30"
      },
      html: this._content,
      dialogClass: "wasabee-dialog-alerts",
      closeCallback: function() {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.wasabeeDKeyButton
    });
  },

  _addDKey: function() {
    if (!window.plugin.wasabee._Dkey) {
      window.plugin.wasabee._Dkey = new Array();
    }

    const tmp = new Array();
    let updating = false;
    for (const k of window.plugin.wasabee._Dkey) {
      if (
        k.portalID == this._selectedPortal.id &&
        k.GoogleID == this._me.GoogleID
      ) {
        console.log("updating");
        updating = true;
      } else {
        tmp.push(k);
      }
    }
    window.plugin.wasabee._Dkey = tmp;

    window.plugin.wasabee._Dkey.push({
      portalID: this._selectedPortal.id,
      GoogleID: this._me.GoogleID,
      count: this._count.value,
      capID: this._capID.value
    });
    alert("added");
    if (!updating) {
      // XXX add to map
    }
  },

  _getMyData(portalID) {
    if (!window.plugin.wasabee._Dkey) return;
    for (const k of window.plugin.wasabee._Dkey) {
      if (k.portalID == portalID && k.GoogleID == this._me.GoogleID) {
        return k;
      }
    }
    return;
  }
});

export default DefensiveKeysDialog;
