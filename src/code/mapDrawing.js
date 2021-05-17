import WasabeeMe from "./me";
import WasabeeAnchor from "./anchor";
import WasabeeTeam from "./team";
import WasabeeAgent from "./agent";
import WasabeeOp from "./operation";
import { newColors } from "./auxiliar";
import { getSelectedOperation, opsList } from "./selectedOp";

const Wasabee = window.plugin.wasabee;

//** This function draws things on the layers */
export function drawMap() {
  const operation = getSelectedOperation();
  updateAnchors(operation);
  updateMarkers(operation);
  resetLinks(operation);
}

function updateMarkers(op) {
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
        L.DomUtil.removeClass(ll._icon, `wasabee-status-${ll.options.state}`);
        L.DomUtil.addClass(ll._icon, `wasabee-status-${m.state}`);
        ll.options.state = m.state;
      }
      layerMap.delete(m.ID);
    } else {
      addMarker(m);
    }
  }

  // remove any that were not processed
  for (const v of layerMap.values()) {
    // for (const v of layerMap) {
    Wasabee.markerLayerGroup.removeLayer(v);
  }
}

/** This function adds a Markers to the target layer group */
function addMarker(target) {
  const operation = getSelectedOperation();
  const targetPortal = operation.getPortal(target.portalId);
  const marker = L.marker(targetPortal.latLng, {
    title: targetPortal.name,
    id: target.ID,
    state: target.state,
    icon: L.divIcon({
      className: `wasabee-marker-icon ${target.type} wasabee-status-${target.state}`,
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
    async (ev) => {
      L.DomEvent.stop(ev);
      if (marker.isPopupOpen()) return;
      const c = await target.popupContent(marker);
      marker.setPopupContent(c);
      marker._popup._wrapper.classList.add("wasabee-popup");
      marker.update();
      marker.openPopup();
    },
    marker
  );
  marker.addTo(Wasabee.markerLayerGroup);
}

/** reset links is consistently 1ms faster than update, and is far safer */
function resetLinks(operation) {
  if (window.isLayerGroupDisplayed("Wasabee Draw Links") === false) return; // yes, === false, undefined == true
  Wasabee.linkLayerGroup.clearLayers();

  if (!operation.links || operation.links.length == 0) return;

  for (const l of operation.links) {
    addLink(l, operation);
  }
}

export async function drawBackgroundOps(opIDs) {
  if (window.isLayerGroupDisplayed("Wasabee Background Ops") === false) return;
  Wasabee.backgroundOpsGroup.clearLayers();

  const sop = getSelectedOperation().ID;
  if (opIDs === undefined) opIDs = await opsList();

  for (const opID of opIDs) {
    if (opID === sop) continue;
    const op = await WasabeeOp.load(opID);
    if (op.background) drawBackgroundOp(op);
  }
}

export function drawBackgroundOp(operation, layerGroup, style) {
  if (!operation) return;
  if (!operation.links || operation.links.length == 0) return;

  if (!layerGroup) layerGroup = Wasabee.backgroundOpsGroup;
  if (!style) style = Wasabee.skin.backgroundLinkStyle;

  for (const link of operation.links) {
    const latLngs = link.getLatLngs(operation);
    if (!latLngs) continue;

    const newlink = new L.GeodesicPolyline(latLngs, style);
    newlink.addTo(layerGroup);
  }
}

/** reset links is consistently 1ms faster than update, and is far safer */
/*
function updateLinks(operation) {
  if (window.isLayerGroupDisplayed("Wasabee Draw Links") === false) return; // yes, === false, undefined == true
  if (!operation.links || operation.links.length == 0) {
    Wasabee.linkLayerGroup.clearLayers();
    return;
  }

  const layerMap = new Map();
  for (const l of Wasabee.linkLayerGroup.getLayers()) {
    layerMap.set(l.options.id, l._leaflet_id);
  }

  for (const l of operation.links) {
    if (layerMap.has(l.ID)) {
      const ll = Wasabee.linkLayerGroup.getLayer(layerMap.get(l.ID));
      if (
        l.color != ll.options.Wcolor ||
        l.fromPortalId != ll.options.fm ||
        l.toPortalId != ll.options.to
      ) {
        Wasabee.linkLayerGroup.removeLayer(ll);
        addLink(l, operation);
      }
      layerMap.delete(l.ID);
    } else {
      addLink(l, operation);
    }
  }

  for (const v of layerMap.values()) {
    Wasabee.linkLayerGroup.removeLayer(v);
  }
}; */

/** This function adds a link to the link layer group */
function addLink(wlink, operation) {
  const latLngs = wlink.getLatLngs(operation);
  if (!latLngs) {
    console.log("LatLngs was null: op missing portal data?");
    return;
  }

  const color = wlink.getColor(operation);

  const style = L.extend(
    {
      color: color,
    },
    Wasabee.skin.linkStyle
  );

  if (wlink.assignedTo) style.dashArray = style.assignedDashArray;

  const newlink = new L.GeodesicPolyline(latLngs, style);
  // these are used for updateLink and can be removed if we get rid of it
  /* newlink.options.id = wlink.ID;
  newlink.options.fm = wlink.fromPortalId;
  newlink.options.to = wlink.toPortalId;
  newlink.options.Wcolor = wlink.color; */

  newlink.bindPopup("loading...", {
    className: "wasabee-popup",
    closeButton: false,
  });

  newlink.on(
    "click",
    (ev) => {
      L.DomEvent.stop(ev);
      if (ev.target._popup._wrapper)
        ev.target._popup._wrapper.classList.add("wasabee-popup");
      const div = wlink.getPopup(operation);
      ev.target.setPopupContent(div);
      ev.target.openPopup(ev.latlng);
      return true;
    },
    newlink
  );
  newlink.addTo(Wasabee.linkLayerGroup);

  // XXX
  // setText only works on polylines, not geodesic ones.
  // newlink.on("mouseover", () => { console.log(newlink); // newlink.setText("  ►  ", { repeat: true, attributes: { fill: "red" } }); });
  // newlink.on("mouseout", () => { newlink.setText(null); });
}

/** this function fetches and displays agent location */
export async function drawAgents() {
  if (window.isLayerGroupDisplayed("Wasabee Agents") === false) return; // yes, === false, undefined == true
  if (!WasabeeMe.isLoggedIn()) return;

  const layerMap = agentLayerMap();

  let doneAgents = new Array();
  const me = await WasabeeMe.waitGet(); // cache hold-time age is 24 hours... not too frequent
  for (const t of me.Teams) {
    const freshlyDone = await drawSingleTeam(t.ID, layerMap, doneAgents);
    doneAgents = doneAgents.concat(freshlyDone);
  }

  // remove those not found in this fetch
  for (const d of doneAgents) layerMap.delete(d);
  for (const agent in layerMap) {
    // console.debug("removing stale agent", agent);
    Wasabee.agentLayerGroup.removeLayer(agent);
  }
}

function agentLayerMap() {
  const layerMap = new Map();
  for (const agent of Wasabee.agentLayerGroup.getLayers()) {
    layerMap.set(agent.options.id, agent._leaflet_id);
  }
  return layerMap;
}

// use alreadyDone to reduce processing when using this in a loop, otherwise leave it unset
export async function drawSingleTeam(teamID, layerMap, alreadyDone) {
  const done = new Array();
  if (window.isLayerGroupDisplayed("Wasabee Agents") === false) return done; // yes, === false, undefined == true
  if (alreadyDone === undefined) alreadyDone = new Array();
  if (layerMap === undefined) layerMap = agentLayerMap();

  /* this also caches the team into Wasabee.teams for uses elsewhere */
  try {
    const team = await WasabeeTeam.get(teamID, 15); // hold time is 15 seconds here, probably too aggressive now that firebase works well
    // common case: team was enabled here, but was since disabled in another client and the pull returned an error
    if (team == null) return done;
    // we don't need to draw if pulled from cache
    if (team.cached === true) return done;

    const agents = team.getAgents();
    for (const agent of agents) {
      if (!alreadyDone.includes(agent.id) && _drawAgent(agent, layerMap))
        done.push(agent.id);
    }
  } catch (err) {
    console.error(err);
  }
  // report the icons successfully drawn to the caller, drawAgents uses this to remove stale icons
  return done;
}

export async function drawSingleAgent(gid) {
  if (window.isLayerGroupDisplayed("Wasabee Agents") === false) return; // yes, === false, undefined == true
  const agent = await WasabeeAgent.get(gid, 10); // cache default is 1 day, we can be faster if firebase tells us of an update
  if (agent != null) _drawAgent(agent);
}

// returns true if drawn, false if ignored
function _drawAgent(agent, layerMap = agentLayerMap()) {
  if (!agent.id || !agent.lat || !agent.lng) {
    return false;
  }

  const zoom = window.map.getZoom();
  if (!layerMap.has(agent.id)) {
    // new, add to map
    const marker = L.marker(agent.latLng, {
      title: agent.name,
      icon: L.divIcon({
        className: "wasabee-agent-icon",
        iconSize: agent.iconSize(zoom),
        iconAnchor: agent.iconAnchor(zoom),
        popupAnchor: L.point(0, -70),
        html: agent.icon(zoom),
      }),
      id: agent.id,
      zoom: zoom,
    });

    window.registerMarkerForOMS(marker);
    marker.bindPopup("Loading...", {
      className: "wasabee-popup",
      closeButton: false,
    });
    // marker.off("click", agent.openPopup, agent);
    marker.on(
      "click spiderfiedclick",
      async (ev) => {
        L.DomEvent.stop(ev);
        if (marker.isPopupOpen && marker.isPopupOpen()) return;
        const a = await WasabeeAgent.get(agent.id);
        marker.setPopupContent(await a.getPopup());
        if (marker._popup._wrapper)
          marker._popup._wrapper.classList.add("wasabee-popup");
        marker.update();
        marker.openPopup();
      },
      marker
    );
    marker.addTo(Wasabee.agentLayerGroup);
  } else {
    // move existing icons, if they actually moved
    const a = layerMap.get(agent.id);
    const al = Wasabee.agentLayerGroup.getLayer(a);
    // if the location is different...
    const ll = al.getLatLng();
    if (agent.lat != ll.lat || agent.lng != ll.lng) {
      // console.debug("moving ", agent.name, agent.latLng, al.getLatLng());
      al.setLatLng(agent.latLng);
      al.update();
    }

    // if the zoom factor changed, refresh the icon
    if (zoom != al.options.zoom) {
      // console.debug("changing icon zoom: ", zoom, al.options.zoom);
      al.setIcon(
        L.divIcon({
          className: "wasabee-agent-icon",
          iconSize: agent.iconSize(zoom),
          iconAnchor: agent.iconAnchor(zoom),
          popupAnchor: L.point(0, -70),
          html: agent.icon(zoom),
        })
      );
      al.options.zoom = zoom;
      al.update();
    }
  }
  return true;
}

function updateAnchors(op) {
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
      addAnchorToMap(a);
    }
  }

  for (const v of layerMap.values()) {
    Wasabee.portalLayerGroup.removeLayer(v);
  }
}

/** This function adds a portal to the portal layer group */
function addAnchorToMap(portalId) {
  const operation = getSelectedOperation();
  const anchor = new WasabeeAnchor(portalId, operation);
  // use newColors(anchor.color) for 0.19
  let layer = anchor.color;
  if (newColors(layer) == layer) layer = "custom";
  let marker;
  if (layer != "custom") {
    marker = L.marker(anchor.latLng, {
      title: anchor.name,
      alt: anchor.name,
      id: portalId,
      color: anchor.color,
      icon: L.divIcon({
        className: `wasabee-anchor-icon wasabee-layer-${layer}`,
        shadowUrl: null,
        iconAnchor: [12, 41],
        iconSize: [25, 41],
        popupAnchor: [0, -35],
      }),
    });
  } else {
    const svg = L.Util.template(
      '<svg style="fill: {color}"><use href="#wasabee-anchor-icon"/></svg>',
      { color: anchor.color }
    );
    marker = L.marker(anchor.latLng, {
      title: anchor.name,
      alt: anchor.name,
      id: portalId,
      color: anchor.color,
      icon: L.divIcon({
        className: "wasabee-anchor-icon",
        shadowUrl: null,
        iconAnchor: [12, 41],
        iconSize: [25, 41],
        popupAnchor: [0, -35],
        html: svg,
      }),
    });
  }

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
      const content = anchor.popupContent(marker);
      marker.setPopupContent(content);
      if (marker._popup._wrapper)
        marker._popup._wrapper.classList.add("wasabee-popup");
      marker.update();
      marker.openPopup();
    },
    marker
  );
  marker.addTo(Wasabee.portalLayerGroup);
}
