import WasabeeMe from "./me";
import WasabeeAnchor from "./anchor";
import { teamPromise } from "./server";

var Wasabee = window.plugin.wasabee;

//** This function draws things on the layers */
export const drawThings = op => {
  resetAnchors(op);

  // for smaller ops, just redraw every time; for ops with lots of markers, be smarter
  // XXX do real testing to decide where the cost/benefit kicks in
  if (op.markers && op.markers.length < 10) {
    resetMarkers(op);
  } else {
    updateMarkers(op);
  }

  resetLinks(op);
};

//** This function resets all the markers ; not too expensive to remove and re-add them all for small number of markers. But this could be smarter */
const resetMarkers = op => {
  Wasabee.markerLayerGroup.clearLayers();
  if (op.markers && op.markers.length > 0) {
    for (const m of op.markers) {
      addMarker(m, op);
    }
  }
};

/* smarter than resetMarkers, but is it faster in the real-world */
const updateMarkers = op => {
  // get a list of every currently drawn marker
  const layerMap = new Map();
  for (const l of Wasabee.markerLayerGroup.getLayers()) {
    layerMap.set(l.options.id, l._leaflet_id);
  }

  // add any new ones, remove any existing from the list
  // markers don't change, so this doesn't need to be too smart
  if (op.markers && op.markers.length > 0) {
    for (const m of op.markers) {
      if (layerMap.has(m.portalId)) {
        const ll = Wasabee.markerLayerGroup.getLayer(layerMap.get(m.portalId));
        Wasabee.markerLayerGroup.removeLayer(ll);
        const newicon = L.icon({
          iconUrl: m.icon,
          shadowUrl: null,
          iconSize: L.point(24, 40),
          iconAnchor: L.point(12, 40),
          popupAnchor: L.point(-1, -48)
        });
        ll.setIcon(newicon);
        layerMap.delete(m.portalId);
        ll.addTo(Wasabee.markerLayerGroup);
      } else {
        addMarker(m, op);
      }
    }
  }

  // remove any that were not processed
  for (const [k, v] of layerMap) {
    console.log("removing marker: " + k);
    Wasabee.markerLayerGroup.removeLayer(v);
  }
};

/** This function adds a Markers to the target layer group */
const addMarker = (target, operation) => {
  const targetPortal = operation.getPortal(target.portalId);
  const wMarker = L.marker(targetPortal.latLng, {
    title: targetPortal.name,
    id: target.portalId,
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
  wMarker.addTo(Wasabee.markerLayerGroup);
};

/** this could be smarter */
const resetLinks = operation => {
  Wasabee.linkLayerGroup.clearLayers();

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
    link_.addTo(Wasabee.linkLayerGroup);
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
  for (const l of Wasabee.agentLayerGroup.getLayers()) {
    layerMap.set(l.options.id, l._leaflet_id);
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

              marker.addTo(Wasabee.agentLayerGroup);
            }
          } else {
            // just move existing
            const a = layerMap.get(agent.id);
            const al = Wasabee.agentLayerGroup.getLayer(a.id);
            al.setLatLng(agent.latLng);
            layerMap.delete(agent.id);
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
    Wasabee.agentLayerGroup.removeLayer(l);
  }
};

//** This function resets all the portals and calls addAllPortals to add them */
// XXX make smarter like updateMarkers -- anchors don't change, just add/remove
const resetAnchors = operation => {
  Wasabee.portalLayerGroup.clearLayers();

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
  marker.addTo(Wasabee.portalLayerGroup);
};
