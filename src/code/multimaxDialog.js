import UiCommands from "./uiCommands.js";
import UiHelper from "./uiHelper.js";
import multimax from "./multimax.js";

var _dialogs = [];

export default class LinkDialog {
  constructor(op) {
    var self = this;
    self.clearLocalPortalSelections();
    this._broadcast = new BroadcastChannel("wasabee-multimaxdialog");
    this._portals = {};
    this._links = [];
    this._operation = op;
    _dialogs.push(this);
    var container = document.createElement("div");
    var tr;
    var node;
    var button;
    var rdnTable = container.appendChild(document.createElement("table"));

    // Anchors
    ["A", "B"].forEach(string => {
      tr = rdnTable.insertRow();
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
    var element = container.appendChild(document.createElement("div"));
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

    // Broadcast message about dialog being open and open the dialog
    var sendMessage = name => self.onMessage(name);
    this._broadcast.addEventListener("message", sendMessage, false);
    this._dialog = window.dialog({
      title: this._operation.name + " - Wasabee Multimax",
      width: "auto",
      height: "auto",
      html: container,
      dialogClass: "wasabee-dialog wasabee-dialog-links",
      closeCallback: () => {
        self._broadcast.removeEventListener("message", sendMessage, false);
        var paneIndex = _dialogs.indexOf(self);
        if (-1 !== paneIndex) {
          _dialogs.splice(paneIndex, 1);
        }
        self.clearLocalPortalSelections();
      }
    });
    // don't use default buttons, we defined our own
    this._dialog.dialog("option", "buttons", {});
  }

  focus() {
    this._dialog.dialog("open");
  }

  // This redirects button clicks to methods
  onMessage(command) {
    if ("setPortal" === command.data.type) {
      this.updatePortal(command.data.name);
    }
  }

  //***Function to clear local selections of portals for the dialog
  clearLocalPortalSelections() {
    delete localStorage["wasabee-multimax-A"];
    delete localStorage["wasabee-multimax-B"];
  }

  //***Function to set portal -- called from 'Set' Button
  setPortal(event) {
    var updateID = event.currentTarget.parentNode.parentNode.getAttribute(
      "data-portal"
    );
    var selectedPortal = UiHelper.getSelectedPortal();
    if (selectedPortal) {
      localStorage["wasabee-multimax-" + updateID] = JSON.stringify(
        selectedPortal
      );
    } else {
      alert("No Portal Selected.");
      delete localStorage["wasabee-multimax-" + updateID];
    }
    this.updatePortal(updateID);
    this._broadcast.postMessage({
      type: "setPortal",
      name: updateID
    });
  }

  //***Function to get portal -- called in doMultimax
  getPortal(name) {
    try {
      return JSON.parse(localStorage["wasabee-multimax-" + name]);
    } catch (b) {
      return null;
    }
  }

  //***Function to update portal in the dialog
  updatePortal(key) {
    var i = this.getPortal(key);
    var viewContainer = this._portals[key];
    $(viewContainer).empty();
    if (i) {
      viewContainer.appendChild(UiHelper.getPortalLink(i));
    }
  }

  doMultimax(operation) {
    let portalsOnScreen = getAllPortalsOnScreen();
    let A = this.getPortal("A");
    let B = this.getPortal("B"); //mmmm
    // Both anchors must have been selected
    if (!A || !B) {
      alert("Please select anchor portals first!");
      return;
    }
    // Calculate the multimax
    let sequence = multimax(A, B, portalsOnScreen);
    if (!Array.isArray(sequence) || !sequence.length) {
      alert("No portals on screen!");
      return;
    }
  }

  //***Function to add a portal -- called in addLinkTo and addAllLinks functions
  addPortal(sentPortal) {
    var resolvedLocalData = Promise.resolve(this._operation.opportals);
    return sentPortal
      ? this._operation.opportals.some(
          gotPortal => gotPortal.id == sentPortal.id
        )
        ? resolvedLocalData
        : UiCommands.addPortal(this._operation, sentPortal, "", true)
      : Promise.reject("no portal given");
  }

  //***Function to add a single link -- called in addLinkTo and addAllLinks functions
  addLink(fromPortal, toPortal) {
    var description = this._desc.value;
    if (!toPortal || !fromPortal) {
      return Promise.reject("no portal given");
    }
    return this._operation.addLink(fromPortal, toPortal, description);
  }

  static update(operation, show) {
    var p = 0;
    var parameters = _dialogs;
    for (; p < parameters.length; p++) {
      var page = parameters[p];
      if (page._operation.ID == operation.ID) {
        page._operation = operation;
        return page.focus(), page;
      } else {
        return page._dialog.dialog("close");
      }
    }
    if (show) {
      return new LinkDialog(operation);
    } else {
      return;
    }
  }

  static closeDialogs() {
    var parameters = _dialogs;
    for (let p = 0; p < parameters.length; p++) {
      var page = parameters[p];
      page._dialog.dialog("close");
    }
  }
}

const isOnScreen = portal => {
  let ll = portal.getLatLng();
  let bounds = window.clampLatLngBounds(window.map.getBounds());
  return (
    ll.lat < bounds._northEast.lat &&
    ll.lng < bounds._northEast.lng &&
    ll.lat > bounds._southWest.lat &&
    ll.lng > bounds._southWest.lng
  );
};

const getAllPortalsOnScreen = () => window.portals.filter(isOnScreen);

let links = sequence
  .map(c => new Link(operation, a.guid, c.guid, "Multimax-generated link"))
  .concat(
    sequence.map(
      c => new Link(operation, b.guid, c.guid, "Multimax-generated link")
    )
  );
