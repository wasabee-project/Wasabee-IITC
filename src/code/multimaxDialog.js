import { Feature } from "./leafletDrawImports";
import multimax from "./multimax";
import store from "../lib/store";
import WasabeePortal from "./portal";

const MultimaxButtonControl = Feature.extend({
  statics: {
    TYPE: "multimaxButton"
  },

  initialize: function(map, options) {
    this.type = MultimaxButtonControl.TYPE;
    Feature.prototype.initialize.call(this, map, options);
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
    this.mmd = new MultimaxDialog();
    const mmhandler = this;
    this._dialog = window.dialog({
      title: "Multimax",
      width: "auto",
      height: "auto",
      html: this.mmd.container,
      dialogClass: "wasabee-dialog-mustauth",
      closeCallback: function() {
        window.runHooks(
          "wasabeeUIUpdate",
          window.plugin.wasabee.getSelectedOperation()
        );
        mmhandler.disable();
        delete mmhandler._dialog;
      },
      id: window.plugin.Wasabee.static.dialogNames.multimaxButton
    });
  }
});

export default MultimaxButtonControl;

class MultimaxDialog {
  constructor() {
    var self = this;
    self.clearLocalPortalSelections();
    this._portals = {};
    this._links = [];
    this._operation = window.plugin.wasabee.getSelectedOperation();
    this.container = document.createElement("div");
    var tr;
    var node;
    var button;
    var rdnTable = this.container.appendChild(document.createElement("table"));

    // Anchors
    ["A", "B"].forEach(string => {
      tr = rdnTable.insertRow();
      tr.setAttribute("AB", string);
      // Name
      node = tr.insertCell();
      node.textContent = string;
      // Set button
      node = tr.insertCell();
      button = node.appendChild(document.createElement("button"));
      button.textContent = "set";
      button.addEventListener("click", arg => self.setPortal(arg), false);
      // Portal link
      node = tr.insertCell();
      node.className = "portal portal-" + string;
      self._portals[string] = node;
      self.updatePortal(string);
    });

    // Bottom buttons bar
    var element = this.container.appendChild(document.createElement("div"));
    element.className = "buttonbar";
    var div = element.appendChild(document.createElement("span"));

    // Enter arrow
    var opt = div.appendChild(document.createElement("span"));
    opt.className = "arrow";
    opt.textContent = "\u21b3";

    // Go button
    button = div.appendChild(document.createElement("button"));
    button.textContent = "Multimax!";
    button.addEventListener(
      "click",
      () => self.doMultimax(self._operation),
      false
    );

    // Close button
    button = element.appendChild(document.createElement("button"));
    button.textContent = "close";
    button.addEventListener("click", () => self._dialog.dialog("close"), false);
  }

  //***Function to clear local selections of portals for the dialog
  clearLocalPortalSelections() {
    store.remove("wasabee-multimax-A");
    store.remove("wasabee-multimax-B");
  }

  //***Function to set portal -- called from 'Set' Button
  setPortal(event) {
    const AB = event.currentTarget.parentNode.parentNode.getAttribute("AB");
    const selectedPortal = WasabeePortal.getSelected();
    if (selectedPortal) {
      store.set("wasabee-multimax-" + AB, JSON.stringify(selectedPortal));
    } else {
      alert("No Portal Selected.");
      store.remove("wasabee-multimax-" + AB);
    }
    this.updatePortal(AB);
  }

  //***Function to get portal -- called in doMultimax
  getPortal(AB) {
    try {
      return JSON.parse(store.get("wasabee-multimax-" + AB));
    } catch (b) {
      return null;
    }
  }

  //***Function to update portal in the dialog
  updatePortal(AB) {
    const i = this.getPortal(AB);
    const viewContainer = this._portals[AB];
    $(viewContainer).empty();
    if (i) {
      viewContainer.appendChild(i.displayFormat());
    }
  }

  doMultimax() {
    const portalsOnScreen = getAllPortalsOnScreen();
    const A = this.getPortal("A");
    const B = this.getPortal("B"); //mmmm
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
  }
}

const isOnScreen = (ll, bounds) => {
  return (
    ll.lat < bounds._northEast.lat &&
    ll.lng < bounds._northEast.lng &&
    ll.lat > bounds._southWest.lat &&
    ll.lng > bounds._southWest.lng
  );
};

const getAllPortalsOnScreen = () => {
  const bounds = window.clampLatLngBounds(window.map.getBounds());
  const x = [];
  // XXX should just convert from leaflet to wasabee portal format here
  for (let portal in window.portals) {
    if (isOnScreen(window.portals[portal].getLatLng(), bounds)) {
      x.push(window.portals[portal]);
    }
  }
  return x;
};
