var markdown = require("markdown").markdown;
import UiCommands from "./uiCommands.js";
import WasabeeMe from "./me";
import WasabeeAnchor from "./anchor";
import { agentPromise, teamPromise } from "./server";
import AssignDialog from "./dialogs/assignDialog";

var Wasabee = window.plugin.wasabee;

//** This function draws things on the layers */
export const drawThings = op => {
  resetAnchors(op);
  resetMarkers(op);
  resetLinks(op);
};

//** This function resets all the markers ; not too expensive to remove and re-add them all for small number of markers. But this could be smarter */
const resetMarkers = op => {
  for (var guid in window.plugin.wasabee.markerLayers) {
    var m = window.plugin.wasabee.markerLayers[guid];
    window.plugin.wasabee.markerLayerGroup.removeLayer(m);
    delete window.plugin.wasabee.markerLayers[guid];
  }
  var markerList = op.markers;
  if (markerList != null) {
    markerList.forEach(marker => addMarker(marker, op));
  }
};

/** This function adds a Markers to the target layer group */
const addMarker = (target, operation) => {
  var targetPortal = operation.getPortal(target.portalId);
  var latLng = new L.LatLng(targetPortal.lat, targetPortal.lng);
  var wMarker = L.marker(latLng, {
    title: targetPortal.name,
    icon: L.icon({
      iconUrl: target.icon,
      shadowUrl: null,
      iconSize: L.point(24, 40),
      iconAnchor: L.point(12, 40),
      popupAnchor: L.point(-1, -48)
    })
  });

  // register the marker for spiderfied click
  window.registerMarkerForOMS(wMarker);
  wMarker.bindPopup("loading...");
  wMarker.off("click", wMarker.openPopup, wMarker);
  wMarker.on(
    "click",
    () => {
      // IITCs version of leaflet does not have marker.isPopupOpen()
      wMarker.setPopupContent(getMarkerPopup(wMarker, target, operation));
      wMarker.update();
      wMarker.openPopup();
    },
    wMarker
  );
  wMarker.on(
    "spiderfiedclick",
    () => {
      wMarker.setPopupContent(getMarkerPopup(wMarker, target, operation));
      wMarker.update();
      wMarker.openPopup();
    },
    wMarker
  );
  window.plugin.wasabee.markerLayers[target["ID"]] = wMarker;
  wMarker.addTo(window.plugin.wasabee.markerLayerGroup);
};

// this belongs in the marker class
const getMarkerPopup = (marker, target, operation) => {
  const portal = operation.getPortal(target.portalId);
  marker.className = "wasabee-dialog wasabee-dialog-ops";
  const content = L.DomUtil.create("div", "");
  const title = L.DomUtil.create("div", "desc", content);
  title.innerHTML = markdown.toHTML(getPopupBodyWithType(portal, target));

  const assignment = L.DomUtil.create("div", "", content);
  if (target.state != "completed" && target.assignedTo) {
    agentPromise(target.assignedTo, false).then(
      function(a) {
        assignment.innerHTML = "Assigned To: ";
        assignment.appendChild(a.formatDisplay());
      },
      function(err) {
        console.log(err);
      }
    );
  }
  if (target.state == "completed" && target.completedBy) {
    assignment.innerHTML = "Completed By: " + target.completedBy;
  }

  const buttonSet = L.DomUtil.create("div", "temp-op-dialog", content);
  const deleteButton = L.DomUtil.create("a", "", buttonSet);
  deleteButton.textContent = "Delete";
  L.DomEvent.on(deleteButton, "click", () => {
    UiCommands.deleteMarker(operation, target, portal);
    marker.closePopup();
  });

  if (operation.IsServerOp()) {
    const assignButton = L.DomUtil.create("a", "", buttonSet);
    assignButton.textContent = "Assign";
    L.DomEvent.on(assignButton, "click", () => {
      const ad = new AssignDialog();
      ad.setup(target, operation);
      ad.enable();
      marker.closePopup();
    });
  }

  return content;
};

export const getPopupBodyWithType = (portal, target) => {
  if (!Wasabee.static.markerTypes.has(target.type)) {
    target.type = Wasabee.static.constants.DEFAULT_MARKER_TYPE;
  }
  const marker = Wasabee.static.markerTypes.get(target.type);
  let title = `${marker.label}: ${portal.name}`;
  if (target.comment) title = title + "\n" + target.comment;
  return title;
};

/** this could be smarter */
const resetLinks = operation => {
  for (const guid in window.plugin.wasabee.linkLayers) {
    const linkInLayer = window.plugin.wasabee.linkLayers[guid];
    window.plugin.wasabee.linkLayerGroup.removeLayer(linkInLayer);
    delete window.plugin.wasabee.linkLayers[guid];
  }

  if (!operation.links || operation.links.length == 0) return;
  // pick the right style for the links
  let lt = Wasabee.static.layerTypes.get("main");
  if (Wasabee.static.layerTypes.has(operation.color)) {
    lt = Wasabee.static.layerTypes.get(operation.color);
  }
  lt.link.color = lt.color;

  operation.links.forEach(link => addLink(link, lt.link, operation));
};

/** This function adds a portal to the portal layer group */
const addLink = (link, style, operation) => {
  if (link.color != "main" && Wasabee.static.layerTypes.has(link.color)) {
    const linkLt = Wasabee.static.layerTypes.get(link.color);
    style = linkLt.link;
    style.color = linkLt.color;
  }

  const latLngs = link.getLatLngs(operation);
  if (latLngs != null) {
    const link_ = new L.GeodesicPolyline(latLngs, style);
    window.plugin.wasabee.linkLayers[link["ID"]] = link_;
    link_.addTo(window.plugin.wasabee.linkLayerGroup);
  } else {
    console.log("LatLngs was null: op missing portal data?");
  }
};

/** this function fetches and displays agent location */
export const drawAgents = op => {
  if (window.isLayerGroupDisplayed("Wasabee Agents") === false) return; // yes, === false, undefined == true

  if (!WasabeeMe.isLoggedIn()) {
    return;
  }
  const me = WasabeeMe.get();
  /* const myTeams = me.Teams.filter(t => {
    return t.State == "On";
  }); */
  const myTeams = new Array();
  for (const team of me.Teams) {
    if (team.State == "On") {
      myTeams.push(team.ID);
    }
  }

  /* each pull resets these teams  -- put rate limiting here, don't fetch if less than 60 seconds old */
  for (const t of op.teamlist) {
    // skip a team if we are not on it & enabled
    if (myTeams.indexOf(t.teamid) == -1) {
      continue;
    }
    // purge what we have
    if (Wasabee.teams.size != 0 && Wasabee.teams.has(t.teamid)) {
      Wasabee.teams.delete(t.teamid);
    }

    /* this fetches the team into Wasabee.teams */
    teamPromise(t.teamid).then(
      function(team) {
        for (const agent of team.agents) {
          const agentInLayer = window.plugin.wasabee.agentLayers[agent.id];
          if (agentInLayer) {
            window.plugin.wasabee.agentLayerGroup.removeLayer(agentInLayer);
            delete window.plugin.wasabee.agentLayers[agent.id];
          }
          if (agent.lat && agent.lng) {
            const marker = L.marker(agent.latLng, {
              title: agent.name,
              icon: L.icon({
                iconUrl: agent.pic,
                shadowUrl: null,
                iconSize: L.point(41, 41),
                iconAnchor: L.point(25, 41),
                popupAnchor: L.point(-1, -48)
              })
            });

            window.registerMarkerForOMS(marker);
            marker.bindPopup(agent.getPopup());
            marker.off("click", agent.openPopup, agent);
            marker.on(
              "click",
              () => {
                marker.setPopupContent(agent.getPopup());
                marker.update();
                marker.openPopup();
              },
              agent
            );
            marker.on(
              "spiderfiedclick",
              () => {
                marker.setPopupContent(agent.getPopup());
                marker.update();
                marker.openPopup();
              },
              marker
            );

            window.plugin.wasabee.agentLayers[agent.id] = marker;
            marker.addTo(window.plugin.wasabee.agentLayerGroup);
          }
        }
      },
      function(err) {
        console.log(err);
      }
    );
  } // for t of op.teamlist
};

const addAllAnchors = operation => {
  for (const portalId of operation.anchors) {
    addAnchorToMap(portalId, operation);
  }
};

//** This function resets all the portals and calls addAllPortals to add them */
const resetAnchors = operation => {
  for (const guid in window.plugin.wasabee.portalLayers) {
    const a = window.plugin.wasabee.portalLayers[guid];
    // console.log("removing: " + a);
    window.plugin.wasabee.portalLayerGroup.removeLayer(a);
    delete window.plugin.wasabee.portalLayers[guid];
  }
  addAllAnchors(operation);
};

/** This function adds a portal to the portal layer group */
const addAnchorToMap = (portalId, operation) => {
  const anchor = new WasabeeAnchor(portalId);
  const marker = L.marker(anchor.latLng, {
    title: anchor.name,
    alt: anchor.name,
    icon: L.icon({
      iconUrl: anchor.icon,
      shadowUrl: null,
      iconAnchor: [12, 41],
      iconSize: [25, 41],
      popupAnchor: [0, -35]
    })
  });

  window.registerMarkerForOMS(marker);
  const content = anchor.popupContent(marker, operation);
  marker.bindPopup(content);
  marker.off("click", marker.openPopup, marker);
  marker.on(
    "click",
    () => {
      marker.setPopupContent(content);
      marker.update();
      marker.openPopup();
    },
    marker
  );
  marker.on(
    "spiderfiedclick",
    () => {
      marker.setPopupContent(content);
      marker.update();
      marker.openPopup();
    },
    marker
  );
  window.plugin.wasabee.portalLayers[portalId] = marker;
  marker.addTo(window.plugin.wasabee.portalLayerGroup);
};
