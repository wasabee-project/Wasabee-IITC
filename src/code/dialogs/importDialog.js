import WasabeeOp from "../operation";
import WasabeePortal from "../portal";
import { WDialog } from "../leafletClasses";
import { getSelectedOperation, makeSelectedOperation } from "../selectedOp";
import OperationChecklistDialog from "./operationChecklistDialog";
import wX from "../wX";

const ImportDialogControl = WDialog.extend({
  statics: {
    TYPE: "importDialog"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = ImportDialogControl.TYPE;
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
    if (!this._map) return;
    this.idialog = new ImportDialog();
    const idhandler = this;
    this._dialog = window.dialog({
      title: wX("IMP_WAS_OP"),
      width: "auto",
      height: "auto",
      html: this.idialog.container,
      buttons: {
        OK: () => {
          this.idialog.importTextareaAsOp();
          this._dialog.dialog("close");
        },
        "Get existing DrawTools draw": () => {
          this.idialog.drawToolsFormat();
        }
      },
      dialogClass: "wasabee-dialog wasabee-dialog-import",
      closeCallback: () => {
        idhandler.disable();
        delete idhandler._dialog;
        const newop = getSelectedOperation();
        window.runHooks("wasabeeUIUpdate", newop);
        window.runHooks("wasabeeCrosslinks", newop);
      },
      id: window.plugin.wasabee.static.dialogNames.importDialog
    });
  }
});

export default ImportDialogControl;

// XXX move all this into the main class, no need for a sub class for this
class ImportDialog {
  constructor() {
    this.container = L.DomUtil.create("div", null);
    this.container.style.width = "420px";

    const nameblock = L.DomUtil.create("span", null, this.container);
    const label = L.DomUtil.create("label", null, nameblock);
    label.textContent = wX("NAME");
    this._namefield = L.DomUtil.create("input", null, label);
    this._namefield.value = wX("IMPORT_OP") + new Date().toGMTString();
    this._namefield.placeholder = "noodles";
    // this._namefield.width = 16;
    const note = L.DomUtil.create("span", null, nameblock);
    note.textContent = wX("ONLY_DT_IMP");

    // Input area
    this.textarea = L.DomUtil.create("textarea", null, this.container);
    this.textarea.placeholder = wX("PASTE_INSTRUCT");
  }

  drawToolsFormat() {
    if (window.plugin.drawTools.drawnItems) {
      /* const tmp = new Array();
      for (const l of window.plugin.drawTools.drawnItems._layers) {
        if (layer instanceof L.GeodesicPolyline || layer instanceof L.Polyline) {
	}
      } */
      // this.textarea.value = JSON.stringify(tmp);
      this.textarea.value = localStorage["plugin-draw-tools-layer"];
    } else {
      this.textarea.placeholder = wX("NO_DT_ITEMS");
    }
  }

  importTextareaAsOp() {
    const string = this.textarea.value;
    if (
      string.match(
        new RegExp("^(https?://)?(www\\.)?intel.ingress.com/intel.*")
      )
    ) {
      alert(wX("NO_STOCK_INTEL"));
      return;
    }

    // check to see if it is drawtools
    if (string.match(new RegExp(".*polyline.*"))) {
      console.log("trying to import IITC Drawtools format... wish me luck");
      const newop = this.parseDrawTools(string);
      newop.updatePortalsFromIITCData();
      if (this._namefield.value) {
        newop.name = this._namefield.value;
      } else {
        newop.name = wX("IMPORT_OP") + new Date().toGMTString();
      }
      newop.store();
      makeSelectedOperation(newop.ID);
      const checklist = new OperationChecklistDialog();
      checklist.enable();
      this._map.fitBounds(newop.mbr);
      return;
    }

    // assume a Wasabee op
    try {
      const data = JSON.parse(string);
      const importedOp = WasabeeOp.create(data);
      importedOp.store();
      makeSelectedOperation(importedOp.ID);
      alert(wX("IMPORT_OP2") + importedOp.name + wX("SUCCESS"));
    } catch (e) {
      console.warn("WasabeeTools: failed to import data: " + e);
      alert(wX("IMP_NOPE"));
    }
  }

  parseDrawTools(string) {
    const newop = new WasabeeOp();
    newop.name = wX("IMP_DT_OP") + new Date().toGMTString();
    const data = JSON.parse(string);

    // pass one, try to prime the pump
    /* for (const line of data) {
      if (line.type == "polyline") {
        for (const point of line.latLngs) {
          window.selectPortalByLatLng(point.lat, point.lng);
        }
      }
    } */

    // build a hash map for fast searching of window.portals
    const pmap = this.buildWindowPortalMap();

    let faked = 0;
    let found = 0;
    // pass two, convert points to portals
    for (const line of data) {
      if (line.type != "polyline") {
        continue;
      }

      let prev = false;

      for (const point of line.latLngs) {
        // try the op first
        let portal = newop.getPortalByLatLng(point.lat, point.lng);

        // look to see if it is known
        if (!portal) {
          portal = this.searchWindowPortals(point, pmap);
          if (portal) {
            newop.addPortal(portal);
            found++;
          }
        }

        // worst case: fake it
        if (!portal) {
          const p = WasabeePortal.fake(point.lat, point.lng);
          newop.addPortal(p);
          portal = p;
          faked++;
        }
        if (portal && prev) {
          newop.addLink(prev, portal);
        }
        prev = portal;
      }
    }
    alert(
      wX("IMP_COMP") + found + wX("PORT_FAKE") + faked + wX("USE_SWAP_INSTRUCT")
    );
    return newop;
  }

  // build a fast lookup map of known portals
  buildWindowPortalMap() {
    const pmap = new Map();
    for (const portalID in window.portals) {
      const ll = window.portals[portalID].getLatLng();
      const key = ll.lat + "/" + ll.lng;
      pmap.set(key, portalID);
    }
    return pmap;
  }

  searchWindowPortals(latLng, pmap) {
    const key = latLng.lat + "/" + latLng.lng;
    if (pmap.has(key)) {
      const portalID = pmap.get(key);
      const np = new WasabeePortal(
        portalID,
        wX("LOADING1") + portalID + wX("LOADING2"),
        latLng.lat,
        latLng.lng
      );
      return np;
    }
    return false;
  }
}
