import { Feature } from "../leafletDrawImports";
import multimax from "../multimax";
import store from "../../lib/store";
import WasabeePortal from "../portal";
// generic prompt screen

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

    const container = document.createElement("div");
    const rdnTable = container.appendChild(document.createElement("table"));

    ["A", "B"].forEach(string => {
      const tr = rdnTable.insertRow();
      tr.setAttribute("AB", string);
      // Name
      const node = tr.insertCell();
      node.textContent = string;
      // Set button
      const nodethree = tr.insertCell();
      const button = nodethree.appendChild(document.createElement("button"));
      button.textContent = "set";
      button.addEventListener("click", arg => this.setPortal(arg), false);
      // Portal link
      const nodetwo = tr.insertCell();
      nodetwo.className = "portal portal-" + string;
      this._portals[string] = nodetwo;
      this.updatePortal(string);
    });

    // Bottom buttons bar
    const element = container.appendChild(document.createElement("div"));
    element.className = "buttonbar";
    const div = element.appendChild(document.createElement("span"));

    // Enter arrow
    const opt = div.appendChild(document.createElement("span"));
    opt.className = "arrow";
    opt.textContent = "\u21b3";

    // Go button
    const button = div.appendChild(document.createElement("button"));
    button.textContent = "Multimax!";
    button.addEventListener(
      "click",
      () => {
        this.doMultimax(this._operation);
      },
      false
    );

    // Close button
    const closebutton = element.appendChild(document.createElement("button"));
    closebutton.textContent = "close";
    closebutton.addEventListener(
      "click",
      () => this._dialog.dialog("close"),
      false
    );

    const context = this;

    this._dialog = window.dialog({
      title: "Multimax",
      width: "auto",
      height: "auto",
      html: container,
      dialogClass: "wasabee-dialog-mustauth",
      closeCallback: function() {
        context.disable();
        delete context._dialog;
      },
      id: window.plugin.Wasabee.static.dialogNames.multimaxButton
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
    this._operation = window.plugin.wasabee.getSelectedOperation();
  },

  //***Function to clear local selections of portals for the dialog
  clearLocalPortalSelections: function() {
    store.remove("wasabee-multimax-A");
    store.remove("wasabee-multimax-B");
  },

  //***Function to set portal -- called from 'Set' Button
  setPortal: function(event) {
    const AB = event.currentTarget.parentNode.parentNode.getAttribute("AB");
    const selectedPortal = WasabeePortal.getSelected();
    if (selectedPortal) {
      store.set("wasabee-multimax-" + AB, JSON.stringify(selectedPortal));
    } else {
      alert("No Portal Selected.");
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

  doMultimax: function() {
    const portalsOnScreen = this._getAllPortalsOnScreen();
    const A = this.getPortal("A");
    const B = this.getPortal("B");
    // Both anchors must have been selected
    if (!A || !B) {
      alert("Please select anchor portals first!");
      return;
    }
    // Calculate the multimax
    const sequence = multimax(A, B, portalsOnScreen);
    if (!Array.isArray(sequence) || !sequence.length) {
      alert("No portals on screen!");
      return;
    }
    this._operation.addLink(A, B, "multimax base");

    console.log(sequence);

    sequence.forEach(node => {
      const p = node.getLatLng();
      if (typeof p["lat"] == "number") {
        p["lat"] = p["lat"].toString();
        p["lng"] = p["lng"].toString();
      }
      p["name"] = node.options.data.title;
      p["id"] = node.options.guid;
      this._operation.addLink(p, A, "multimax generated link");
      this._operation.addLink(p, B, "multimax generated link");
    });
    this._operation.update();
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
        x.push(window.portals[portal]);
      }
    }
    return x;
  }
});

export default MultimaxDialog;
