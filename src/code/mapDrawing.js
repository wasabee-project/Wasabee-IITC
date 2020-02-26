import WasabeeMe from "./me";
import WasabeeAnchor from "./anchor";
import { teamPromise } from "./server";

var Wasabee = window.plugin.wasabee;

//** This function draws things on the layers */
export const drawThings = op => {
  resetAnchors(op);
  resetMarkers(op);
  resetLinks(op);
};

//** This function resets all the markers ; not too expensive to remove and re-add them all for small number of markers. But this could be smarter */
const resetMarkers = op => {
  window.plugin.wasabee.markerLayerGroup.clearLayers();
  if (op.markers && op.markers.length > 0) {
    for (const m of op.markers) {
      addMarker(m, op);
    }
  }
};

/** This function adds a Markers to the target layer group */
const addMarker = (target, operation) => {
  const targetPortal = operation.getPortal(target.portalId);
  const wMarker = L.marker(targetPortal.latLng, {
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
      wMarker.setPopupContent(target.getMarkerPopup(wMarker, operation));
      wMarker.update();
      wMarker.openPopup();
    },
    wMarker
  );
  wMarker.on(
    "spiderfiedclick",
    () => {
      wMarker.setPopupContent(target.getMarkerPopup(wMarker, operation));
      wMarker.update();
      wMarker.openPopup();
    },
    wMarker
  );
  wMarker.addTo(window.plugin.wasabee.markerLayerGroup);
};

/** this could be smarter */
const resetLinks = operation => {
  window.plugin.wasabee.linkLayerGroup.clearLayers();

  if (!operation.links || operation.links.length == 0) return;
  // pick the right style for the links
  let lt = Wasabee.static.layerTypes.get("main");
  if (Wasabee.static.layerTypes.has(operation.color)) {
    lt = Wasabee.static.layerTypes.get(operation.color);
  }
  lt.link.color = lt.color;

  for (const l of operation.links) {
    addLink(l, lt.link, operation);
  }
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
  const myTeams = new Array();
  for (const team of me.Teams) {
    if (team.State == "On") {
      myTeams.push(team.ID);
    }
  }

  const layerMap = new Map();
  for (const l of window.plugin.wasabee.agentLayerGroup.getLayers()) {
    layerMap.set(l.options.id, {
      id: l._leaflet_id,
      moved: false
    });
  }

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
          if (!layerMap.has(agent.id)) {
            // new, add to map
            if (agent.lat && agent.lng) {
              const marker = L.marker(agent.latLng, {
                title: agent.name,
                icon: L.icon({
                  iconUrl: agent.pic,
                  shadowUrl: null,
                  iconSize: L.point(41, 41),
                  iconAnchor: L.point(25, 41),
                  popupAnchor: L.point(-1, -48)
                }),
                id: agent.id
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

              layerMap.set(agent.id, {
                id: 0, // not needed in the next pass
                moved: true
              });
              marker.addTo(window.plugin.wasabee.agentLayerGroup);
            }
          } else {
            // just move existing
            const a = layerMap.get(agent.id);
            const al = window.plugin.wasabee.agentLayerGroup.getLayer(a.id);
            al.setLatLng(agent.latLng);
            layerMap.set(agent.id, {
              id: a.id,
              moved: true
            });
          }
        }
      },
      function(err) {
        console.log(err);
      }
    );
  } // for t of op.teamlist

  // remove those not found in this fetch
  for (const l in layerMap) {
    console.log(l);
    if (!l.moved) {
      window.plugin.wasabee.agentLayerGroup.removeLayer(l.id);
    }
  }
};

//** This function resets all the portals and calls addAllPortals to add them */
const resetAnchors = operation => {
  window.plugin.wasabee.portalLayerGroup.clearLayers();

  for (const pid of operation.anchors) {
    addAnchorToMap(pid, operation);
  }
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
  marker.addTo(window.plugin.wasabee.portalLayerGroup);
};
