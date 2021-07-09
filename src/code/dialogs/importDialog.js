import WasabeeOp from "../model/operation";
import WasabeePortal from "../model/portal";
import { WDialog } from "../leafletClasses";
import OperationChecklistDialog from "./checklist";
import wX from "../wX";
import { makeSelectedOperation } from "../selectedOp";
import PromptDialog from "./promptDialog";
import { zoomToOperation } from "../uiCommands";

const ImportDialog = WDialog.extend({
  statics: {
    TYPE: "importDialog",
  },

  addHooks: function () {
    this._autoload = false;
    if (
      localStorage[window.plugin.wasabee.static.constants.AUTO_LOAD_FAKED] ===
      "true"
    ) {
      this._autoload = true;
    }
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
  },

  _displayDialog: function () {
    const container = L.DomUtil.create("div", null);
    container.style.width = "420px";

    const nameblock = L.DomUtil.create("span", null, container);
    const label = L.DomUtil.create("label", null, nameblock);
    label.textContent = wX("NAME");
    this._namefield = L.DomUtil.create("input", null, label);
    this._namefield.value = wX("IMPORT_OP") + new Date().toGMTString();
    this._namefield.placeholder = "noodles";
    const note = L.DomUtil.create("span", null, nameblock);
    note.textContent = wX("ONLY_DT_IMP");

    // Input area
    this._textarea = L.DomUtil.create("textarea", null, container);
    this._textarea.placeholder = wX("PASTE_INSTRUCT");

    const buttons = {};
    buttons[wX("OK")] = () => {
      this.importTextareaAsOp();
      window.map.fire("wasabee:crosslinks");
      this.closeDialog();
    };
    buttons[wX("GET DT")] = () => {
      this.drawToolsFormat();
    };
    // wX
    buttons["Fill from URL"] = () => {
      this.fillFromURL();
    };

    this.createDialog({
      title: wX("IMP_WAS_OP"),
      html: container,
      width: "auto",
      dialogClass: "import",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.importDialog,
    });
  },

  drawToolsFormat() {
    const dtitems = window.plugin.drawTools
      ? localStorage[window.plugin.drawTools.KEY_STORAGE]
      : undefined;
    if (dtitems) {
      this._textarea.value = dtitems;
    } else {
      this._textarea.placeholder = wX("NO_DT_ITEMS");
    }
  },

  fillFromURL() {
    // todo: wX
    const prompt = new PromptDialog({
      title: "Fill from URL",
      label: "URL",
      callback: async () => {
        try {
          const url = new URL(prompt.inputField.value.trim());
          const rq = await fetch(url, { mode: "cors" });
          this._textarea.value = await rq.text();
        } catch (e) {
          alert("Unable to fetch data from the given url.");
          return;
        }
      },
    });
    prompt.enable();
  },

  async importTextareaAsOp() {
    let string = this._textarea.value;
    if (
      string.match(
        new RegExp("^(https?://)?(www\\.)?intel.ingress.com/intel.*")
      )
    ) {
      alert(wX("NO_STOCK_INTEL"));
      return;
    }

    // check to see if it is drawtools
    if (string.match(new RegExp(".*(polyline|polygon).*"))) {
      console.log("trying to import IITC Drawtools format... wish me luck");

      const newop = this.parseDrawTools(string);
      if (this._namefield.value) {
        newop.name = this._namefield.value;
      } else {
        newop.name = wX("IMPORT_OP_TITLE", { date: new Date().toGMTString() });
      }

      // needs to be saved, but not update UI
      await newop.store();
      // this updates the UI and runs crosslinks
      await makeSelectedOperation(newop.ID);
      // open the checklist to get a pass at loading portals
      // although that is now off-by-default, at least let the user
      // see which portals need attention
      const checklist = new OperationChecklistDialog();
      checklist.enable();
      // zoom to it
      // OR use pointTileDataRequest to try to load faked portals?
      zoomToOperation(newop);

      return;
    }

    // assume a Wasabee op
    try {
      const data = JSON.parse(string);
      const importedOp = new WasabeeOp(data);
      await importedOp.store();
      await makeSelectedOperation(importedOp.ID);
      alert(wX("IMPORT_OP_SUCCESS", { opName: importedOp.name }));
    } catch (e) {
      console.error("WasabeeTools: failed to import data", e);
      alert(wX("IMP_NOPE"));
    }
  },

  parseDrawTools(string) {
    // name is overwritten above
    const newop = new WasabeeOp({
      creator: PLAYER.nickname,
      name: "draw tools imported",
    });
    // Don't check crosslink or save on each portal/link add
    newop.startBatchMode();

    let data = null;
    try {
      data = JSON.parse(string);
    } catch (e) {
      console.error("Failed parseDrawTools", e);
      alert(e.toString());
      return null;
    }

    // build a hash map for fast searching of window.portals
    const pmap = this.buildWindowPortalMap();

    let faked = 0;
    let found = 0;
    for (const line of data) {
      if (line.type != "polyline" && line.type != "polygon") continue;

      let prev = false;
      let first = false;

      for (const point of line.latLngs) {
        // use fixed precision
        const truncPoint = {
          lat: point.lat.toFixed(6),
          lng: point.lng.toFixed(6),
        };
        // check the op first
        let portal = newop.getPortalByLatLng(truncPoint.lat, truncPoint.lng);

        // look to see if it is known to IITC
        if (!portal) {
          portal = this.searchWindowPortals(truncPoint, pmap);
          if (portal) {
            newop.addPortal(portal);
            found++;
          }
        }

        // worst case: fake it
        if (!portal) {
          const p = WasabeePortal.fake(truncPoint.lat, truncPoint.lng);
          newop.addPortal(p);
          portal = p;
          faked++;
        }
        if (portal && prev) {
          newop.addLink(prev, portal);
        }
        prev = portal;
        if (!first) first = portal;
      }
      if (line.type == "polygon" && first && prev && first != prev) {
        newop.addLink(prev, first);
      }
    }
    alert(
      wX("IMP_COMP") + found + wX("PORT_FAKE") + faked + wX("USE_SWAP_INSTRUCT")
    );

    // get the op out of batchmode, but do not update UI or run crosslinks yet
    newop._batchmode = false;
    return newop;
  },

  // build a fast lookup map of known portals
  buildWindowPortalMap() {
    const pmap = new Map();
    for (const portalID in window.portals) {
      const ll = window.portals[portalID].getLatLng();
      const key = ll.lat.toFixed(6) + "/" + ll.lng.toFixed(6);
      pmap.set(key, portalID);
    }
    return pmap;
  },

  searchWindowPortals(latLng, pmap) {
    const key = latLng.lat + "/" + latLng.lng;
    if (pmap.has(key)) {
      const portalID = pmap.get(key);
      const np = WasabeePortal.fake(latLng.lat, latLng.lng, portalID);
      return np;
    }
    return false;
  },
});

export default ImportDialog;
