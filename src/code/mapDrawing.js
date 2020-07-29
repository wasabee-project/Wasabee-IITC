import WasabeeMe from "./me";
import WasabeeAnchor from "./anchor";
import { teamPromise } from "./server";
import { wX } from "./wX";

const Wasabee = window.plugin.wasabee;

//** This function draws things on the layers */
export const drawThings = (op) => {
  updateAnchors(op);
  updateMarkers(op);
  resetLinks(op);
};

const updateMarkers = (op) => {
  if (window.isLayerGroupDisplayed("Wasabee Draw Markers") === false) return; // yes, === false, undefined == true
  if (!op.markers || op.markers.length == 0) {
    Wasabee.markerLayerGroup.clearLayers();
    return;
  }

  // this seems to wrongly assume one marker per portal -- or something
  // XXX TODO find why markers duplicate if too many on one portal

  // get a list of every currently drawn marker
  const layerMap = new Map();
  for (const l of Wasabee.markerLayerGroup.getLayers()) {
    layerMap.set(l.options.id, l._leaflet_id);
  }

  // add any new ones, remove any existing from the list
  // markers don't change, so this doesn't need to be too smart
  for (const m of op.markers) {
    if (layerMap.has(m.ID)) {
      const ll = Wasabee.markerLayerGroup.getLayer(layerMap.get(m.ID));
      if (m.state != ll.options.state) {
        // state changed, update icon
        Wasabee.markerLayerGroup.removeLayer(ll);
        const newicon = L.icon({
          iconUrl: m.icon,
          shadowUrl: null,
          iconSize: L.point(24, 40),
          iconAnchor: L.point(12, 40),
          popupAnchor: L.point(-1, -48),
        });
        ll.setIcon(newicon);
        ll.addTo(Wasabee.markerLayerGroup);
      }
      layerMap.delete(m.ID);
    } else {
      addMarker(m, op);
    }
  }

  // remove any that were not processed
  // eslint-disable-next-line
  for (const [k, v] of layerMap) {
    Wasabee.markerLayerGroup.removeLayer(v);
  }
};

/** This function adds a Markers to the target layer group */
const addMarker = (target, operation) => {
  const targetPortal = operation.getPortal(target.portalId);
  const marker = L.marker(targetPortal.latLng, {
    title: targetPortal.name,
    id: target.ID,
    state: target.state,
    icon: L.icon({
      iconUrl: target.icon,
      shadowUrl: null,
      iconSize: L.point(24, 40),
      iconAnchor: L.point(12, 40),
      popupAnchor: L.point(-1, -48),
    }),
  });

  // register the marker for spiderfied click
  window.registerMarkerForOMS(marker);
  marker.bindPopup("loading...", {
    className: "wasabee-popup",
    closeButton: false,
  });
  // marker.off("click", marker.openPopup, marker);
  marker.on(
    "click spiderfiedclick",
    (ev) => {
      L.DomEvent.stop(ev);
      // IITC 0.26's leaflet doesn't have this, just deal
      if (marker.isPopupOpen && marker.isPopupOpen()) return;
      marker.setPopupContent(target.getMarkerPopup(marker, operation));
      // IITC 0.26's leaflet doesn't have this, just deal
      if (marker._popup._wrapper)
        marker._popup._wrapper.classList.add("wasabee-popup");
      marker.update();
      marker.openPopup();
    },
    marker
  );
  marker.addTo(Wasabee.markerLayerGroup);
};

/** reset links is consistently 1ms faster than update, and is far safer */
const resetLinks = (operation) => {
  if (window.isLayerGroupDisplayed("Wasabee Draw Links") === false) return; // yes, === false, undefined == true
  Wasabee.linkLayerGroup.clearLayers();

  if (!operation.links || operation.links.length == 0) return;

  // pre-fetch the op color outside the loop -- is this actually helpful?
  let style = Wasabee.skin.layerTypes.get("main");
  if (Wasabee.skin.layerTypes.has(operation.color)) {
    style = Wasabee.skin.layerTypes.get(operation.color);
  }
  style.link.color = style.color;

  for (const l of operation.links) {
    addLink(l, style.link, operation);
  }
};

/** reset links is consistently 1ms faster than update, and is far safer */
// eslint-disable-next-line
const updateLinks = (operation) => {
  if (window.isLayerGroupDisplayed("Wasabee Draw Links") === false) return; // yes, === false, undefined == true
  if (!operation.links || operation.links.length == 0) {
    Wasabee.linkLayerGroup.clearLayers();
    return;
  }

  const layerMap = new Map();
  for (const l of Wasabee.linkLayerGroup.getLayers()) {
    layerMap.set(l.options.id, l._leaflet_id);
  }

  // pre-fetch the op color outside the loop
  let style = Wasabee.skin.layerTypes.get("main");
  if (Wasabee.skin.layerTypes.has(operation.color)) {
    style = Wasabee.skin.layerTypes.get(operation.color);
  }
  // because ... reasons?
  style.link.color = style.color;

  for (const l of operation.links) {
    if (layerMap.has(l.ID)) {
      const ll = Wasabee.linkLayerGroup.getLayer(layerMap.get(l.ID));
      if (
        l.color != ll.options.Wcolor ||
        l.fromPortalId != ll.options.fm ||
        l.toPortalId != ll.options.to
      ) {
        Wasabee.linkLayerGroup.removeLayer(ll);
        addLink(l, style.link, operation);
      }
      layerMap.delete(l.ID);
    } else {
      addLink(l, style.link, operation);
    }
  }

  // eslint-disable-next-line
  for (const [k, v] of layerMap) {
    Wasabee.linkLayerGroup.removeLayer(v);
  }
};

/** This function adds a link to the link layer group */
const addLink = (wlink, style, operation) => {
  // determine per-link color
  if (wlink.color != "main" && Wasabee.skin.layerTypes.has(wlink.color)) {
    const linkLt = Wasabee.skin.layerTypes.get(wlink.color);
    style = linkLt.link;
    style.color = linkLt.color;
  }

  if (wlink.assignedTo) style.dashArray = style.assignedDashArray;

  const latLngs = wlink.getLatLngs(operation);
  if (!latLngs) {
    console.log("LatLngs was null: op missing portal data?");
    return;
  }
  const newlink = new L.GeodesicPolyline(latLngs, style);
  // these are used for updateLink and can be removed if we get rid of it
  newlink.options.id = wlink.ID;
  newlink.options.fm = wlink.fromPortalId;
  newlink.options.to = wlink.toPortalId;
  newlink.options.Wcolor = wlink.Wcolor;

  newlink.bindPopup("loading...", {
    className: "wasabee-popup",
    closeButton: false,
  });

  newlink.on(
    "click",
    (ev) => {
      if (ev.target._popup._wrapper)
        ev.target._popup._wrapper.classList.add("wasabee-popup");
      const div = L.DomUtil.create("div", null);
      const del = L.DomUtil.create("button", null, div);
      del.textContent = wX("DELETE_LINK");
      L.DomEvent.on(del, "click", () => {
        operation.removeLink(wlink.fromPortalId, wlink.toPortalId);
      });
      const rev = L.DomUtil.create("button", null, div);
      rev.textContent = wX("REVERSE");
      L.DomEvent.on(rev, "click", () => {
        operation.reverseLink(wlink.fromPortalId, wlink.toPortalId);
      });
      ev.target.setPopupContent(div);
      ev.target.openPopup();
      L.DomEvent.stop(ev);
      return true;
    },
    newlink
  );
  newlink.addTo(Wasabee.linkLayerGroup);

  // XXX
  // setText only works on polylines, not geodesic ones.
  // newlink.on("mouseover", () => { console.log(newlink); // newlink.setText("  ►  ", { repeat: true, attributes: { fill: "red" } }); });
  // newlink.on("mouseout", () => { newlink.setText(null); });
};

/** this function fetches and displays agent location */
export const drawAgents = async () => {
  if (window.isLayerGroupDisplayed("Wasabee Agents") === false) return; // yes, === false, undefined == true

  if (!WasabeeMe.isLoggedIn()) {
    return;
  }

  const layerMap = new Map();
  for (const agent of Wasabee.agentLayerGroup.getLayers()) {
    layerMap.set(agent.options.id, agent._leaflet_id);
  }

  const doneAgents = new Array();
  const me = await WasabeeMe.waitGet();
  const now = Date.now();
  for (const t of me.Teams) {
    // must be older than 15 seconds
    if (t.fetched && now - t.fetched < 15000) {
      console.log("skipping team");
      continue;
    }

    // remove whatever data we have for this team, start fresh
    if (Wasabee.teams.size != 0 && Wasabee.teams.has(t.ID)) {
      Wasabee.teams.delete(t.ID);
    }

    // only display enabled teams
    if (t.State != "On") continue;

    /* this also caches the team into Wasabee.teams for uses elsewhere */
    teamPromise(t.ID).then(
      (team) => {
        for (const agent of team.agents) {
          if (!layerMap.has(agent.id) && !doneAgents.includes(agent.id)) {
            // new, add to map
            doneAgents.push(agent.id);
            if (agent.lat && agent.lng) {
              const marker = L.marker(agent.latLng, {
                title: agent.name,
                icon: L.icon({
                  iconUrl: agent.pic,
                  shadowUrl: null,
                  iconSize: L.point(41, 41),
                  iconAnchor: L.point(25, 41),
                  popupAnchor: L.point(-1, -48),
                }),
                id: agent.id,
              });

              window.registerMarkerForOMS(marker);
              marker.bindPopup("Loading...", {
                className: "wasabee-popup",
                closeButton: false,
              });
              // marker.off("click", agent.openPopup, agent);
              marker.on(
                "click spiderfiedclick",
                (ev) => {
                  L.DomEvent.stop(ev);
                  if (marker.isPopupOpen && marker.isPopupOpen()) return;
                  const a = window.plugin.wasabee._agentCache.get(agent.id);
                  marker.setPopupContent(a.getPopup());
                  if (marker._popup._wrapper)
                    marker._popup._wrapper.classList.add("wasabee-popup");
                  marker.update();
                  marker.openPopup();
                },
                marker
              );
              marker.addTo(Wasabee.agentLayerGroup);
            }
          } else {
            // just move existing if not already moved
            if (!doneAgents.includes(agent.id)) {
              const a = layerMap.get(agent.id);
              const al = Wasabee.agentLayerGroup.getLayer(a);
              if (agent.lat && agent.lng) {
                al.setLatLng(agent.latLng);
                layerMap.delete(agent.id);
                doneAgents.push(agent.id);
                al.update();
              }
            }
          }
        }
      },
      (err) => {
        console.log(err);
      }
    );
  } // for t of whichlist

  // remove those not found in this fetch
  for (const agent in layerMap) {
    console.log("removing stale agent", agent);
    Wasabee.agentLayerGroup.removeLayer(agent);
  }
};

const updateAnchors = (op) => {
  if (window.isLayerGroupDisplayed("Wasabee Draw Portals") === false) return; // yes, === false, undefined == true
  if (!op.anchors || op.anchors.length == 0) {
    Wasabee.portalLayerGroup.clearLayers();
    return;
  }

  const layerMap = new Map();
  for (const l of Wasabee.portalLayerGroup.getLayers()) {
    if (l.options.color != op.color) {
      // if the op color changed, remove and re-add
      Wasabee.portalLayerGroup.removeLayer(l._leaflet_id);
    } else {
      layerMap.set(l.options.id, l._leaflet_id);
    }
  }

  for (const a of op.anchors) {
    if (layerMap.has(a)) {
      layerMap.delete(a);
    } else {
      addAnchorToMap(a, op);
    }
  }

  // XXX use "in" instead of "of" and the first value
  // eslint-disable-next-line
  for (const [k, v] of layerMap) {
    Wasabee.portalLayerGroup.removeLayer(v);
  }
};

/** This function adds a portal to the portal layer group */
const addAnchorToMap = (portalId, operation) => {
  const anchor = new WasabeeAnchor(portalId, operation);
  const marker = L.marker(anchor.latLng, {
    title: anchor.name,
    alt: anchor.name,
    id: portalId,
    color: anchor.color,
    icon: L.icon({
      iconUrl: anchor.icon,
      shadowUrl: null,
      iconAnchor: [12, 41],
      iconSize: [25, 41],
      popupAnchor: [0, -35],
    }),
  });

  window.registerMarkerForOMS(marker);
  marker.bindPopup("loading...", {
    className: "wasabee-popup",
    closeButton: false,
  });
  // marker.off("click", marker.openPopup, marker);
  marker.on(
    "click spiderfiedclick",
    (ev) => {
      L.DomEvent.stop(ev);
      if (marker.isPopupOpen && marker.isPopupOpen()) return;
      const content = anchor.popupContent(marker, operation);
      marker.setPopupContent(content);
      if (marker._popup._wrapper)
        marker._popup._wrapper.classList.add("wasabee-popup");
      marker.update();
      marker.openPopup();
    },
    marker
  );
  marker.addTo(Wasabee.portalLayerGroup);
};
