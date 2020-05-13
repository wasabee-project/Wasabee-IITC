import WasabeeOp from "../operation";
import WasabeePortal from "../portal";
import { WDialog } from "../leafletClasses";
import { getSelectedOperation, makeSelectedOperation } from "../selectedOp";
import OperationChecklistDialog from "./operationChecklistDialog";
import wX from "../wX";

const ImportDialog = WDialog.extend({
  statics: {
    TYPE: "importDialog"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = ImportDialog.TYPE;
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

    this._dialog = window.dialog({
      title: wX("IMP_WAS_OP"),
      width: "auto",
      height: "auto",
      html: container,
      buttons: {
        OK: () => {
          this.importTextareaAsOp();
          this._dialog.dialog("close");
        },
        "Get existing DrawTools draw": () => {
          this.drawToolsFormat();
        }
      },
      dialogClass: "wasabee-dialog wasabee-dialog-import",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
        const newop = getSelectedOperation();
        window.runHooks("wasabeeUIUpdate", newop);
        window.runHooks("wasabeeCrosslinks", newop);
      },
      id: window.plugin.wasabee.static.dialogNames.importDialog
    });
  },

  drawToolsFormat() {
    const dtitems = localStorage["plugin-draw-tools-layer"];
    if (dtitems) {
      this._textarea.value = dtitems;
    } else {
      this._textarea.placeholder = wX("NO_DT_ITEMS");
    }
  },

  importTextareaAsOp() {
    const string = this._textarea.value;
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
      if (this._namefield.value) {
        newop.name = this._namefield.value;
      } else {
        newop.name = wX("IMPORT_OP_TITLE", new Date().toGMTString());
      }

      // force load even if auto-load disabled for checklist
      this.loadFaked(newop).then(
        () => {
          newop.store();
          makeSelectedOperation(newop.ID);
          const checklist = new OperationChecklistDialog();
          checklist.enable();
          this._map.fitBounds(newop.mbr);
        },
        reject => {
          console.log(reject);
          alert(reject);
        }
      );
      return;
    }

    // assume a Wasabee op
    try {
      const data = JSON.parse(string);
      const importedOp = WasabeeOp.create(data);
      importedOp.store();
      makeSelectedOperation(importedOp.ID);
      alert(wX("IMPORT_OP_SUCCESS", importedOp.name));
    } catch (e) {
      console.warn("WasabeeTools: failed to import data: " + e);
      alert(wX("IMP_NOPE"));
    }
  },

  parseDrawTools(string) {
    const newop = new WasabeeOp();
    // Don't check crosslink
    newop.startBatchMode();
    newop.name = wX("IMP_DT_OP") + new Date().toGMTString();

    let data = null;
    try {
      data = JSON.parse(string);
    } catch (e) {
      console.warn("Failed parseDrawTools: " + e);
      alert(e);
      return null;
    }

    // build a hash map for fast searching of window.portals
    const pmap = this.buildWindowPortalMap();

    let faked = 0;
    let found = 0;
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

    // unnecessary since this isn't the selected op yet, but good form
    newop.endBatchMode();
    return newop;
  },

  // since we aren't using the IITC hook, can't use the normal route
  loadFaked(op) {
    const promises = new Array();

    for (const p of op.fakedPortals) {
      if (p.id.length != 35) continue; // ignore our faked
      promises.push(
        window.portalDetail.request(p.id).then(
          res => {
            if (res.title) {
              p.name = res.title;
              p.lat = (res.latE6 / 1e6).toFixed(6);
              p.lng = (res.lngE6 / 1e6).toFixed(6);
            }
          },
          reject => {
            console.log(reject);
          }
        )
      );
    }
    // return one single promise that resolves when all these promises resolve
    return Promise.all(promises);
  },

  // build a fast lookup map of known portals
  buildWindowPortalMap() {
    const pmap = new Map();
    for (const portalID in window.portals) {
      const ll = window.portals[portalID].getLatLng();
      const key = ll.lat + "/" + ll.lng;
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
  }
});

export default ImportDialog;
