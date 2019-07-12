import store from "store";
import markdown from "markdown";
import UiCommands from "./uiCommands.js";
import { getColorHex } from "./markerDialog";

var Wasabee = window.plugin.Wasabee;
export default function () {
    //** This function adds all the portals to the layer */
    window.plugin.wasabee.addAllPortals = function () {
        var operation = window.plugin.wasabee.getSelectedOperation();
        var portalList = operation.anchors;
        if (portalList != null) {
            portalList.forEach(function (portalId) {
                //{"id":"b460fd49ee614b0892388272a5542696.16","name":"Outer Loop Old Road Trail Crossing","lat":"33.052057","lng":"-96.853656"}
                window.plugin.wasabee.addPortal(portalId, operation.color);
                //console.log("ADDING PORTAL: " + JSON.stringify(portal));
            });
        }
    };

    //** This function resets all the portals and calls addAllPortals to add them */
    window.plugin.wasabee.resetAllPortals = function () {
        for (var guid in window.plugin.wasabee.portalLayers) {
            var portalInLayer = window.plugin.wasabee.portalLayers[guid];
            window.plugin.wasabee.portalLayerGroup.removeLayer(portalInLayer);
            delete window.plugin.wasabee.portalLayers[guid];
        }
        window.plugin.wasabee.addAllPortals();
    };

    /** This function adds a portal to the portal layer group */
    window.plugin.wasabee.addPortal = function (portalId, color) {
        var portal = window.plugin.wasabee.getSelectedOperation().getPortal([portalId]);
        var colorMarker = getColorMarker(color);
        var latLng = new L.LatLng(portal.lat, portal.lng);
        var marker = L.marker(latLng, {
            title: portal.name,
            icon: L.icon({
                iconUrl: colorMarker ? colorMarker : Wasabee.Images.marker_layer_groupa,
                iconAnchor: [12, 41],
                iconSize: [25, 41],
                popupAnchor: [0, -35]
            })
        });

        window.registerMarkerForOMS(marker);
        marker.bindPopup(window.plugin.wasabee.getPortalPopup(marker, portal, latLng));
        marker.off("click", marker.togglePopup, marker);
        marker.on("spiderfiedclick", marker.togglePopup, marker);
        window.plugin.wasabee.portalLayers[portal.id] = marker;
        marker.addTo(window.plugin.wasabee.portalLayerGroup);
    };

    //** This function gets the portal popup content */
    window.plugin.wasabee.getPortalPopup = function (marker, portal, latLng) {
        marker.className = "wasabee-dialog wasabee-dialog-ops";
        var content = document.createElement("div");
        var title = content.appendChild(document.createElement("div"));
        title.className = "desc";
        title.innerHTML = markdown.toHTML(portal.name);
        buttonSet = content.appendChild(document.createElement("div"));
        buttonSet.className = "temp-op-dialog";
        var linksButton = buttonSet.appendChild(document.createElement("a"));
        linksButton.textContent = "Links";
        linksButton.addEventListener("click", function () {
            UiCommands.showLinksDialog(window.plugin.wasabee.getSelectedOperation(), portal);
            marker.closePopup();
        }, false);
        var swapButton = buttonSet.appendChild(document.createElement("a"));
        swapButton.textContent = "Swap";
        swapButton.addEventListener("click", function () {
            UiCommands.swapPortal(window.plugin.wasabee.getSelectedOperation(), portal);
            marker.closePopup();
        }, false);
        var deleteButton = buttonSet.appendChild(document.createElement("a"));
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function () {
            UiCommands.deletePortal(window.plugin.wasabee.getSelectedOperation(), portal);
            marker.closePopup();
        }, false);
        var popup = L.popup().setLatLng(latLng).setContent(content);
        return popup;
    };

    //** This function opens a dialog with a text field to copy */
    window.plugin.wasabee.importString = function () {
        var promptAction = prompt("Press CTRL+V to paste (Wasabee data only).", "");
        if (promptAction !== null && promptAction !== "") {
            window.plugin.wasabee.saveImportString(promptAction);
        }
    };

    window.plugin.wasabee.saveImportString = function (string) {
        try {
            var keyIdentifier = "wasabeeShareKey=";
            if (string.match(new RegExp("^(https?:\/\/)?(www\\.)?intel.ingress.com\/intel.*")) && string.includes(keyIdentifier)) {
                var key = string.substring(string.lastIndexOf(keyIdentifier) + keyIdentifier.length);
                window.plugin.wasabee.qbin_get(key);

            } else if (string.match(new RegExp("^(https?:\/\/)?(www\\.)?intel.ingress.com\/intel.*"))) {
                alert("Wasabee doesn't support stock intel draw imports");
            } else {
                var data = JSON.parse(string);
                var importedOp = Operation.create(data);
                window.plugin.wasabee.updateOperationInList(importedOp, true);
                console.log("WasabeeTools: reset and imported drawn items");
                alert("Imported Operation: " + importedOp.name + " Successfuly.");
            }
        } catch (e) {
            console.warn("WasabeeTools: failed to import data: " + e);
            alert("Import Failed.");
        }
    };

    //** This function copies whatever value is sent into the function to the clipboard */
    //** Also, this is very hacky, find some better way? (ALSO IT DOESN'T WORK!? */
    window.plugin.wasabee.copyToClipboard = function (val) {
        var dummy = document.createElement("input");
        document.body.appendChild(dummy);
        $(dummy).css("display", "none");
        dummy.setAttribute("id", "dummy_id");
        document.getElementById("dummy_id").value = val;
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
        alert("Copied to clipboard.");
    };

    //*** This function resets the local op list
    window.plugin.wasabee.resetOpList = function () {
        store.set(Wasabee.Constants.OP_LIST_KEY, null);
    };

    //** This function does something for the generate ID function */
    window.plugin.wasabee.dec2hex = function (dec) {
        return ("0" + dec.toString(16)).substr(-2);
    };

    //** This function generates a unique ID for an object */
    window.plugin.wasabee.generateId = function (len) {
        var arr = new Uint8Array((len || 40) / 2);
        window.crypto.getRandomValues(arr);
        return Array.from(arr, window.plugin.wasabee.dec2hex).join("");
    };

    /** This function gets a usable paste link from an operation */
    window.plugin.wasabee.getPasteLink = function (operation) {
        if (operation.pasteKey != null) {
            return Wasabee.Constants.INTEL_BASE_KEY + "?wasabeeShareKey=" + operation.pasteKey;
        } else {
            return null;
        }
    };
}