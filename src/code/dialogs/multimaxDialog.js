import { Feature } from "../leafletDrawImports";
import multimax from "../multimax";
import store from "../../lib/store";
import WasabeePortal from "../portal";
import { getSelectedOperation } from "../selectedOp";
import wX from "../wX";

const MultimaxDialog = Feature.extend({
  statics: {
    TYPE: "multimaxDialog"
  },

  addHooks: function() {
    if (!this._map) return;
    Feature.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
  },

  _displayDialog: function() {
    if (!this._map) return;

    const container = L.DomUtil.create("div", null);
    const description = L.DomUtil.create("div", null, container);
    description.textContent = wX("SELECT_INSTRUCTIONS");
    const rdnTable = L.DomUtil.create("table", null, container);

    ["A", "B"].forEach(string => {
      const tr = rdnTable.insertRow();
      tr.setAttribute("AB", string);
      // Name
      const node = tr.insertCell();
      node.textContent = string;
      // Set button
      const nodethree = tr.insertCell();
      const button = L.DomUtil.create("button", null, nodethree);
      button.textContent = "set";
      button.addEventListener("click", arg => this.setPortal(arg), false);
      // Portal link
      const nodetwo = tr.insertCell();
      nodetwo.className = "portal portal-" + string;
      this._portals[string] = nodetwo;
      this.updatePortal(string);
    });

    // Bottom buttons bar
    const element = L.DomUtil.create("div", "buttonbar", container);
    const div = L.DomUtil.create("span", null, element);

    // Enter arrow
    const opt = L.DomUtil.create("span", "arrow", div);
    opt.textContent = "\u21b3";

    // Go button
    const button = L.DomUtil.create("button", null, div);
    button.textContent = wX("MULTIMAX");
    L.DomEvent.on(button, "click", async () => {
      const context = this;

      this.doMultimax(context).then(
        total => {
          alert(`Multimax found ${total} layers`);
          this._dialog.dialog("close");
        },
        reject => {
          console.log(reject);
          alert(reject);
        }
      );
    });

    const flylinks = L.DomUtil.create("span", null, div);
    const fllabel = L.DomUtil.create("label", null, flylinks);
    fllabel.textContent = wX("ADD_BL");
    this._flcheck = L.DomUtil.create("input", null, flylinks);
    this._flcheck.type = "checkbox";

    const context = this;
    this._dialog = window.dialog({
      title: wX("MULTI_M"),
      width: "auto",
      height: "auto",
      html: container,
      dialogClass: "wasabee-dialog-mustauth",
      closeCallback: function() {
        context.disable();
        delete context._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.multimaxButton
    });
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = MultimaxDialog.TYPE;
    Feature.prototype.initialize.call(this, map, options);
    this.title = "Multimax";
    this.label = "Multimax";
    this._portals = {};
    this._links = [];
    this._operation = getSelectedOperation();
  },

  //***Function to clear local selections of portals for the dialog
  /* clearLocalPortalSelections: function() {
    store.remove("wasabee-multimax-A");
    store.remove("wasabee-multimax-B");
  }, */

  //***Function to set portal -- called from 'Set' Button
  setPortal: function(event) {
    const AB = event.currentTarget.parentNode.parentNode.getAttribute("AB");
    const selectedPortal = WasabeePortal.getSelected();
    if (selectedPortal) {
      store.set("wasabee-multimax-" + AB, JSON.stringify(selectedPortal));
    } else {
      alert(wX("NO_PORT_SEL"));
      store.remove("wasabee-multimax-" + AB);
    }
    this.updatePortal(AB);
  },

  //***Function to get portal -- called in doMultimax
  getPortal: function(AB) {
    try {
      const p = JSON.parse(store.get("wasabee-multimax-" + AB));
      return WasabeePortal.create(p);
    } catch (err) {
      console.log(err);
      return null;
    }
  },

  //***Function to update portal in the dialog
  updatePortal: function(AB) {
    const i = this.getPortal(AB);
    const viewContainer = this._portals[AB];
    $(viewContainer).empty();
    if (i) {
      viewContainer.appendChild(i.displayFormat(this._operation));
    }
  },

  doMultimax: context => {
    return new Promise((resolve, reject) => {
      const portalsOnScreen = context._getAllPortalsOnScreen();
      const A = context.getPortal("A");
      const B = context.getPortal("B");
      if (!A || !B) reject(wX("SEL_PORT_FIRST"));

      // Calculate the multimax
      multimax(A, B, portalsOnScreen).then(
        sequence => {
          if (!Array.isArray(sequence) || !sequence.length)
            reject("No layers found");

          let order = sequence.length * (context._flcheck ? 3 : 2);
          let prev = null;

          context._operation.startBatchMode(); // bypass save and crosslinks checks
          context._operation.addLink(A, B, "multimax base", 1);

          for (const node of sequence) {
            let p = WasabeePortal.get(node);
            if (context._flcheck.checked && prev) {
              context._operation.addLink(
                prev,
                p,
                "multimax generated back link",
                order + 3
              );
              order--;
            }
            if (!p) {
              console.log("skipping: " + node);
              continue;
              // const ll = node.getLatLng(); p = WasabeePortal.fake(ll.lat, ll.lng, node);
            }
            context._operation.addLink(
              p,
              A,
              "multimax generated link",
              order--
            );
            context._operation.addLink(
              p,
              B,
              "multimax generated link",
              order--
            );
            prev = p;
          }
          context._operation.endBatchMode(); // save and run crosslinks
          resolve(sequence.length);
        },
        err => {
          console.log(err);
          reject(err);
        }
      );
    });
  },

  _isOnScreen: function(ll, bounds) {
    return (
      ll.lat < bounds._northEast.lat &&
      ll.lng < bounds._northEast.lng &&
      ll.lat > bounds._southWest.lat &&
      ll.lng > bounds._southWest.lng
    );
  },

  _getAllPortalsOnScreen: function() {
    const bounds = window.clampLatLngBounds(window.map.getBounds());
    const x = [];
    for (const portal in window.portals) {
      if (this._isOnScreen(window.portals[portal].getLatLng(), bounds)) {
        if (
          this._hasMarker(
            window.portals[portal].options.guid,
            window.plugin.wasabee.static.constants.MARKER_TYPE_EXCLUDE
          )
        ) {
          console.log("skipping ", window.portals[portal].options.guid);
          continue;
        }
        x.push(window.portals[portal]);
      }
    }
    return x;
  },

  // operation.constainsMarker expects a WasabeePortal
  _hasMarker(portalid, markerType) {
    if (this._operation.markers.length == 0) return false;
    for (const m of this._operation.markers) {
      if (m.portalId == portalid && m.type == markerType) {
        return true;
      }
    }
    return false;
  }
});

export default MultimaxDialog;
