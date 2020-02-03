const markdown = require("markdown").markdown;
import UiCommands from "./uiCommands.js";
import WasabeeOp from "./operation";
import { getColorMarker } from "./mapDrawing";
import { SendAccessTokenAsync, GetWasabeeServer, agentPromise } from "./server";
import addButtons from "./addButtons";
import store from "../lib/store";

const Wasabee = window.plugin.Wasabee;
export default function() {
  //** This function adds all the portals to the layer */
  window.plugin.wasabee.addAllPortals = operation => {
    const portalList = operation.anchors;
    if (portalList != null) {
      for (const portalId of portalList) {
        window.plugin.wasabee.addPortal(portalId, operation);
      }
    }
  };

  //** This function resets all the portals and calls addAllPortals to add them */
  window.plugin.wasabee.resetAllPortals = operation => {
    for (var guid in window.plugin.wasabee.portalLayers) {
      var portalInLayer = window.plugin.wasabee.portalLayers[guid];
      window.plugin.wasabee.portalLayerGroup.removeLayer(portalInLayer);
      delete window.plugin.wasabee.portalLayers[guid];
    }
    window.plugin.wasabee.addAllPortals(operation);
  };

  /** This function adds a portal to the portal layer group */
  window.plugin.wasabee.addPortal = (portalId, operation) => {
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

    const content = window.plugin.wasabee.getAnchorPopupContent(
      marker,
      portalId,
      operation
    );
    marker.bindPopup(content).on("click", marker.openPopup, marker);

    // spiderfied clicks
    // why is this throwing nulls?
    window.registerMarkerForOMS(marker);
    marker.on("spiderfiedclick", marker.openPopup, marker);
    window.plugin.wasabee.portalLayers[portal.id] = marker;
    marker.addTo(window.plugin.wasabee.portalLayerGroup);
  };

  //** This function gets the portal popup content */
  window.plugin.wasabee.getAnchorPopupContent = (
    marker,
    portalID,
    operation
  ) => {
    const portal = operation.getPortal(portalID);

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
    return content;
  };

  //** This function opens a dialog with a text field to copy */
  window.plugin.wasabee.importString = () => {
    const promptAction = prompt(
      "Press CTRL+V to paste (Wasabee data only).",
      ""
    );
    if (promptAction !== null && promptAction !== "") {
      window.plugin.wasabee.saveImportString(promptAction);
    }
  };

  window.plugin.wasabee.saveImportString = string => {
    try {
      if (
        string.match(
          new RegExp("^(https?://)?(www\\.)?intel.ingress.com/intel.*")
        )
      ) {
        alert("Wasabee doesn't support stock intel draw imports");
      } else {
        const data = JSON.parse(string);
        const importedOp = WasabeeOp.create(data);
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
    const isMobile = "undefined" != typeof window.android && window.android;
    const isiOS = navigator.userAgent.match(/iPhone|iPad|iPod/i);
    visitButton.innerHTML = "Log In";
    if (!isiOS) {
      visitButton.addEventListener(
        "click",
        async () => {
          window.gapi.auth2.authorize(
            {
              prompt: isMobile ? "none" : "select_account",
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
              // WasabeeMe.get(); // UIUpdate does this too
              _dialog.dialog("close");
              window.runHooks("wasabeeUIUpdate", this); // or addButtons()?
            }
          );
        },
        false
      );
    } else {
      const server = GetWasabeeServer();
      visitButton.addEventListener("click", window.open(server), false);
    }

    const changeServerButton = buttonSet.appendChild(
      document.createElement("a")
    );
    changeServerButton.innerHTML = "Change Server";
    changeServerButton.addEventListener("click", () => {
      const promptAction = prompt("Change WASABEE server", GetWasabeeServer());
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
        // WasabeeMe.get(); // addButtons calls this too
        const selectedOperation = window.plugin.wasabee.getSelectedOperation();
        selectedOperation.update();
        addButtons(selectedOperation);
      },
      id: window.plugin.Wasabee.static.dialogNames.mustauth
    });
  };

  window.plugin.wasabee.closeAllDialogs = skip => {
    skip = skip || "nothing";
    for (const name of Object.values(
      window.plugin.Wasabee.static.dialogNames
    )) {
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
    }
  };

  // don't use this unless you just can't use the promise directly
  window.plugin.wasabee.getAgent = gid => {
    // when a team is loaded from the server, all agents are pushed into the cache
    if (window.plugin.Wasabee._agentCache.has(gid)) {
      return window.plugin.Wasabee._agentCache.get(gid);
    }

    let agent = null;
    agentPromise(gid, false).then(
      function(resolve) {
        agent = resolve;
        window.plugin.Wasabee._agentCache.set(gid, agent);
      },
      function(reject) {
        console.log(reject);
      }
    );
    return agent;
  };
}
