var markdown = require("markdown").markdown;
import UiCommands from "./uiCommands.js";
import Operation from "./operation";
import { getColorMarker } from "./mapDrawing";
import WasabeeMe from "./me";
import { SendAccessTokenAsync } from "./server";
import addButtons from "./addButtons";
import store from "../lib/store";

const Wasabee = window.plugin.Wasabee;
export default function() {
  //** This function adds all the portals to the layer */
  window.plugin.wasabee.addAllPortals = function(operation) {
    const portalList = operation.anchors;
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
    const portal = operation.getPortal(portalId);
    const colorMarker = getColorMarker(operation.color);
    const latLng = new L.LatLng(portal.lat, portal.lng);
    const marker = L.marker(latLng, {
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
    marker.on("click", marker.togglePopup, marker);
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
    const content = document.createElement("div");
    const title = content.appendChild(document.createElement("div"));
    title.className = "desc";
    title.innerHTML = markdown.toHTML(portal.name);
    const buttonSet = content.appendChild(document.createElement("div"));
    buttonSet.className = "temp-op-dialog";
    const linksButton = buttonSet.appendChild(document.createElement("a"));
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
    const promptAction = prompt(
      "Press CTRL+V to paste (Wasabee data only).",
      ""
    );
    if (promptAction !== null && promptAction !== "") {
      window.plugin.wasabee.saveImportString(promptAction);
    }
  };

  window.plugin.wasabee.saveImportString = function(string) {
    try {
      const keyIdentifier = "wasabeeShareKey=";
      if (
        string.match(
          new RegExp("^(https?://)?(www\\.)?intel.ingress.com/intel.*")
        ) &&
        string.includes(keyIdentifier)
      ) {
        const key = string.substring(
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
        const data = JSON.parse(string);
        const importedOp = Operation.create(data);
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
    const content = document.createElement("div");
    const title = content.appendChild(document.createElement("div"));
    title.className = "desc";
    title.innerHTML =
      "In order to use the server functionality, you must log in.<br/>";
    const buttonSet = content.appendChild(document.createElement("div"));
    buttonSet.className = "temp-op-dialog";
    const visitButton = buttonSet.appendChild(document.createElement("a"));
    visitButton.innerHTML = "Log In";
    visitButton.addEventListener(
      "click",
      async () => {
        const isMobile = "undefined" != typeof window.android && window.android;
        const isiOS = navigator.userAgent.match(/iPhone|iPad|iPod/i);
        window.gapi.auth2.authorize(
          {
            prompt: isMobile && !isiOS ? "none" : "select_account",
            client_id: window.plugin.Wasabee.Constants.OAUTH_CLIENT_ID,
            scope: "email profile openid",
            response_type: "id_token permission"
          },
          async response => {
            console.debug("gapi.auth2.authorize response: ", response);
            if (response.error) {
              console.error(response.error, response.error_subtype);
              return;
            }
            await SendAccessTokenAsync(response.access_token);
            WasabeeMe.get(false);
            _dialog.dialog("close");
          }
        );
        //window.open("https://server.wasabee.rocks/")
      },
      false
    );

    const changeServerButton = buttonSet.appendChild(
      document.createElement("a")
    );
    changeServerButton.innerHTML = "Change Server";
    changeServerButton.addEventListener("click", () => {
      const promptAction = prompt(
        "Change WASABEE server",
        store.get(window.plugin.Wasabee.Constants.SERVER_BASE_KEY)
      );
      if (promptAction !== null && promptAction !== "") {
        store.set(
          window.plugin.Wasabee.Constants.SERVER_BASE_KEY,
          promptAction
        );
        store.remove(window.plugin.Wasabee.Constants.AGENT_INFO_KEY);
      }
    });

    var _dialog = window.dialog({
      title: "Authentication Required",
      width: "auto",
      height: "auto",
      html: content,
      dialogClass: "wasabee-dialog-mustauth",
      closeCallback: function() {
        // prime the pump
        WasabeeMe.get();
        const selectedOperation = window.plugin.wasabee.getSelectedOperation();
        selectedOperation.update();
        addButtons(selectedOperation);
      },
      id: window.plugin.Wasabee.static.dialogNames.mustauth
    });
  };

  window.plugin.wasabee.closeAllDialogs = skip => {
    skip = skip || "nothing";
    Object.values(window.plugin.Wasabee.static.dialogNames).forEach(function(
      name
    ) {
      if (name != skip) {
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

  // how to make this async? I get a syntax error on the obvious decls
  window.plugin.wasabee.getAgent = gid => {
    // prime update the cache with any known teams
    // probably better to do this on team fetch... doesn't seem too expensive here
    window.plugin.Wasabee.teams.forEach(function(t) {
      t.agents.forEach(function(a) {
        if (!window.plugin.Wasabee._agentCache.has(a.id)) {
          window.plugin.Wasabee._agentCache.set(a.id, a);
        }
      });
    });

    if (window.plugin.Wasabee._agentCache.has(gid)) {
      // console.log("found agent in _agentCache");
      return window.plugin.Wasabee._agentCache.get(gid);
    }

    let agent = null;
    window.plugin.wasabee.agentPromise(gid).then(
      function(resolve) {
        agent = resolve;
        window.plugin.Wasabee._agentCache.set(gid, agent);
      },
      function(reject) {
        console.log(reject);
        // alert(reject);
      }
    );
    // this returns early from the promise, giving false nulls. await?
    return agent;
  };
}
