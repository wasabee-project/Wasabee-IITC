var markdown = require("markdown").markdown;
import UiCommands from "./uiCommands.js";
import Operation from "./operation";
import { getColorMarker, drawThings } from "./mapDrawing";

var Wasabee = window.plugin.Wasabee;
export default function() {
  //** This function adds all the portals to the layer */
  window.plugin.wasabee.addAllPortals = function(operation) {
    var portalList = operation.anchors;
    if (portalList != null) {
      portalList.forEach(function(portalId) {
        //{"id":"b460fd49ee614b0892388272a5542696.16","name":"Outer Loop Old Road Trail Crossing","lat":"33.052057","lng":"-96.853656"}
        window.plugin.wasabee.addPortal(portalId, operation);
        //console.log("ADDING PORTAL: " + JSON.stringify(portal));
      });
    }
  };

  //** This function resets all the portals and calls addAllPortals to add them */
  window.plugin.wasabee.resetAllPortals = function(operation) {
    for (var guid in window.plugin.wasabee.portalLayers) {
      var portalInLayer = window.plugin.wasabee.portalLayers[guid];
      window.plugin.wasabee.portalLayerGroup.removeLayer(portalInLayer);
      delete window.plugin.wasabee.portalLayers[guid];
    }
    window.plugin.wasabee.addAllPortals(operation);
  };

  /** This function adds a portal to the portal layer group */
  window.plugin.wasabee.addPortal = function(portalId, operation) {
    var portal = operation.getPortal(portalId);
    var colorMarker = getColorMarker(operation.color);
    var latLng = new L.LatLng(portal.lat, portal.lng);
    var marker = L.marker(latLng, {
      title: portal.name,
      icon: L.icon({
        iconUrl: colorMarker
          ? colorMarker
          : Wasabee.static.images.marker_layer_groupa,
        iconAnchor: [12, 41],
        iconSize: [25, 41],
        popupAnchor: [0, -35]
      })
    });

    window.registerMarkerForOMS(marker);
    marker.bindPopup(
      window.plugin.wasabee.getPortalPopup(marker, portal, latLng, operation)
    );
    marker.off("click", marker.togglePopup, marker);
    marker.on("spiderfiedclick", marker.togglePopup, marker);
    window.plugin.wasabee.portalLayers[portal.id] = marker;
    marker.addTo(window.plugin.wasabee.portalLayerGroup);
  };

  //** This function gets the portal popup content */
  window.plugin.wasabee.getPortalPopup = function(
    marker,
    portal,
    latLng,
    operation
  ) {
    marker.className = "wasabee-dialog wasabee-dialog-ops";
    var content = document.createElement("div");
    var title = content.appendChild(document.createElement("div"));
    title.className = "desc";
    title.innerHTML = markdown.toHTML(portal.name);
    var buttonSet = content.appendChild(document.createElement("div"));
    buttonSet.className = "temp-op-dialog";
    var linksButton = buttonSet.appendChild(document.createElement("a"));
    linksButton.textContent = "Links";
    linksButton.addEventListener(
      "click",
      function() {
        UiCommands.showLinksDialog(operation, portal);
        marker.closePopup();
      },
      false
    );
    var swapButton = buttonSet.appendChild(document.createElement("a"));
    swapButton.textContent = "Swap";
    swapButton.addEventListener(
      "click",
      function() {
        UiCommands.swapPortal(operation, portal);
        marker.closePopup();
      },
      false
    );
    var deleteButton = buttonSet.appendChild(document.createElement("a"));
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener(
      "click",
      function() {
        UiCommands.deletePortal(operation, portal);
        marker.closePopup();
      },
      false
    );
    var popup = L.popup()
      .setLatLng(latLng)
      .setContent(content);
    return popup;
  };

  //** This function opens a dialog with a text field to copy */
  window.plugin.wasabee.importString = function() {
    var promptAction = prompt("Press CTRL+V to paste (Wasabee data only).", "");
    if (promptAction !== null && promptAction !== "") {
      window.plugin.wasabee.saveImportString(promptAction);
    }
  };

  window.plugin.wasabee.saveImportString = function(string) {
    try {
      var keyIdentifier = "wasabeeShareKey=";
      if (
        string.match(
          new RegExp("^(https?://)?(www\\.)?intel.ingress.com/intel.*")
        ) &&
        string.includes(keyIdentifier)
      ) {
        var key = string.substring(
          string.lastIndexOf(keyIdentifier) + keyIdentifier.length
        );
        window.plugin.wasabee.qbin_get(key);
      } else if (
        string.match(
          new RegExp("^(https?://)?(www\\.)?intel.ingress.com/intel.*")
        )
      ) {
        alert("Wasabee doesn't support stock intel draw imports");
      } else {
        var data = JSON.parse(string);
        var importedOp = Operation.create(data);
        importedOp.store();
        window.plugin.wasabee.loadOp(importedOp.ID);
        console.log("WasabeeTools: reset and imported drawn items");
        alert("Imported Operation: " + importedOp.name + " Successfuly.");
      }
    } catch (e) {
      console.warn("WasabeeTools: failed to import data: " + e);
      alert("Import Failed.");
    }
  };

  window.plugin.wasabee.showMustAuthAlert = () => {
    var content = document.createElement("div");
    var title = content.appendChild(document.createElement("div"));
    title.className = "desc";
    title.innerHTML = "In order to sync operations, you must log in.<br/>";
    var buttonSet = content.appendChild(document.createElement("div"));
    buttonSet.className = "temp-op-dialog";
    var visitButton = buttonSet.appendChild(document.createElement("a"));
    visitButton.innerHTML = "Visit Site";
    visitButton.addEventListener(
      "click",
      () => window.open("https://server.wasabee.rocks"),
      false
    );
    window.dialog({
      title: "You Must Authenticate",
      width: "auto",
      height: "auto",
      html: content,
      dialogClass: "wasabee-dialog-mustauth",
      id: window.plugin.Wasabee.static.dialogNames.mustauth
    });
  };

  // this is just a kludge until I can figure out how to make
  // operation.update() call drawThings directly
  // DO NOT USE THIS
  window.plugin.wasabee.updateVisual = op => {
    drawThings(op);
  };

  window.plugin.wasabee.closeAllDialogs = () => {
    Object.values(window.plugin.Wasabee.static.dialogNames).forEach(function(
      name
    ) {
      if (name != window.plugin.Wasabee.static.dialogNames.opsButton) {
        let id = "dialog-" + name;
        if (window.DIALOGS[id]) {
          try {
            let selector = $(window.DIALOGS[id]);
            selector.dialog("close");
            selector.remove();
          } catch (err) {
            console.log("closing dialog: " + err);
          }
        }
      }
    });
  };
}
