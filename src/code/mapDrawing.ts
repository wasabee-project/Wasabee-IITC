import type WasabeeAgent from "./model/agent";
import { WasabeeMe, WasabeeOp } from "./model";
import { getSelectedOperation, opsList } from "./selectedOp";

import { WLAnchor, WLAgent, WLLink, WLMarker, WLZone } from "./map";
import type { PathOptions } from "leaflet";
import { getAgent, getMe, getTeam } from "./model/cache";
import { isFiltered } from "./filter";

const Wasabee = window.plugin.wasabee;

// draws all anchors, markers, and links
export function drawMap() {
  const operation = getSelectedOperation();
  updateAnchors(operation);
  updateMarkers(operation);
  resetLinks(operation);
  resetZones(operation);
}

// updates all existing markers, adding any that need to be added, removing any that need to be removed
function updateMarkers(op: WasabeeOp) {
  if (window.isLayerGroupDisplayed("Wasabee Draw Markers") === false) return; // yes, === false, undefined == true
  if (!op.markers || op.markers.length == 0) {
    Wasabee.markerLayerGroup.clearLayers();
    return;
  }

  // get a list of every currently drawn marker
  const layerMap = new Map();
  for (const l of Wasabee.markerLayerGroup.getLayers()) {
    layerMap.set(l.options.id, l._leaflet_id);
  }

  // add any new ones, remove any existing from the list
  // markers don't change, so this doesn't need to be too smart
  for (const m of op.markers) {
    if (!isFiltered(m)) continue;
    if (layerMap.has(m.ID)) {
      const ll = Wasabee.markerLayerGroup.getLayer(layerMap.get(m.ID));
      ll.setState(m.state);
      layerMap.delete(m.ID);
    } else {
      const lMarker = new WLMarker(m);
      lMarker.addTo(Wasabee.markerLayerGroup);
    }
  }

  // remove any that were not processed
  for (const v of layerMap.values()) {
    // for (const v of layerMap) {
    Wasabee.markerLayerGroup.removeLayer(v);
  }
}

// resetting is consistently 1ms faster than trying to update
function resetLinks(operation: WasabeeOp) {
  if (window.isLayerGroupDisplayed("Wasabee Draw Links") === false) return; // yes, === false, undefined == true
  Wasabee.linkLayerGroup.clearLayers();

  if (!operation.links || operation.links.length == 0) return;

  for (const l of operation.links) {
    if (!isFiltered(l)) continue;
    const link = new WLLink(l, operation);
    link.addTo(Wasabee.linkLayerGroup);
  }
}

export async function drawBackgroundOps(opIDs?: OpID[]) {
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

export function drawBackgroundOp(
  operation?: WasabeeOp,
  layerGroup?: L.LayerGroup,
  style?: PathOptions
) {
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

function resetZones(operation: WasabeeOp) {
  Wasabee.zoneLayerGroup.clearLayers();

  if (!operation.zones || operation.zones.length == 0) return;

  for (const z of operation.zones) {
    const l = new WLZone(z);
    l.addTo(Wasabee.zoneLayerGroup);
  }
  Wasabee.zoneLayerGroup.bringToBack();
}

// fetch and draw agent locations
export async function drawAgents() {
  if (window.isLayerGroupDisplayed("Wasabee Agents") === false) return; // yes, === false, undefined == true
  if (!WasabeeMe.isLoggedIn()) return;

  const layerMap = agentLayerMap();

  let doneAgents = [];
  const me = await getMe(); // cache hold-time age is 24 hours... not too frequent
  for (const t of me.Teams) {
    const freshlyDone = await drawSingleTeam(t.ID, layerMap, doneAgents);
    doneAgents = doneAgents.concat(freshlyDone);
  }

  // remove those not found in this fetch
  for (const d of doneAgents) layerMap.delete(d);
  for (const [aid, lid] of layerMap) {
    console.debug("removing stale agent", aid);
    Wasabee.agentLayerGroup.removeLayer(lid);
  }
}

// map agent GID to leaflet layer ID
function agentLayerMap() {
  const layerMap = new Map<GoogleID, number>();
  for (const marker of Wasabee.agentLayerGroup.getLayers()) {
    layerMap.set(marker.options.id, Wasabee.agentLayerGroup.getLayerId(marker));
  }
  return layerMap;
}

// use alreadyDone to reduce processing when using this in a loop, otherwise leave it unset
export async function drawSingleTeam(
  teamID: TeamID,
  layerMap?: Map<GoogleID, number>,
  alreadyDone?: GoogleID[]
) {
  const done = [];
  if (window.isLayerGroupDisplayed("Wasabee Agents") === false) return done; // yes, === false, undefined == true
  if (alreadyDone === undefined) alreadyDone = [];
  if (layerMap === undefined) layerMap = agentLayerMap();

  /* this also caches the team into Wasabee.teams for uses elsewhere */
  try {
    const team = await getTeam(teamID, 15); // hold time is 15 seconds here, probably too aggressive now that firebase works well
    // common case: team was enabled here, but was since disabled in another client and the pull returned an error
    if (team == null) return done;

    for (const agent of team.agents) {
      if (!alreadyDone.includes(agent.id) && _drawAgent(agent, layerMap))
        done.push(agent.id);
    }
  } catch (err) {
    console.error(err);
  }
  // report the icons successfully drawn to the caller, drawAgents uses this to remove stale icons
  return done;
}

// draws a single agent -- can be triggered by firebase
export async function drawSingleAgent(gid: GoogleID) {
  if (window.isLayerGroupDisplayed("Wasabee Agents") === false) return; // yes, === false, undefined == true
  const agent = await getAgent(gid, 10); // cache default is 1 day, we can be faster if firebase tells us of an update
  if (agent != null) _drawAgent(agent);
}

// returns true if drawn, false if ignored
function _drawAgent(agent: WasabeeAgent, layerMap = agentLayerMap()) {
  if (!agent.id || (!agent.lat && !agent.lng)) {
    return false;
  }

  if (!layerMap.has(agent.id)) {
    // new, add to map
    const marker = new WLAgent(agent);
    marker.addTo(Wasabee.agentLayerGroup);
    layerMap.set(agent.id, Wasabee.agentLayerGroup.getLayerId(marker));
  } else {
    // move existing icons, if they actually moved
    const a = layerMap.get(agent.id);
    const al = Wasabee.agentLayerGroup.getLayer(a);
    // if the location is different...
    const ll = al.getLatLng();
    if (agent.lat != ll.lat || agent.lng != ll.lng) {
      // console.debug("moving ", agent.name, agent.latLng, al.getLatLng());
      al.setLatLng(agent.latLng);
    }
  }
  return true;
}

// update all anchors, adding missing and removing unneeded
function updateAnchors(op: WasabeeOp) {
  if (window.isLayerGroupDisplayed("Wasabee Draw Portals") === false) return; // yes, === false, undefined == true
  if (!op.anchors || op.anchors.length == 0) {
    Wasabee.portalLayerGroup.clearLayers();
    return;
  }

  const anchors = new Set<PortalID>();
  for (const l of op.links) {
    if (!isFiltered(l)) continue;
    anchors.add(l.fromPortalId);
    anchors.add(l.toPortalId);
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

  for (const a of anchors) {
    if (layerMap.has(a)) {
      layerMap.delete(a);
    } else {
      const lAnchor = new WLAnchor(a, op);
      lAnchor.addTo(Wasabee.portalLayerGroup);
    }
  }

  for (const v of layerMap.values()) {
    Wasabee.portalLayerGroup.removeLayer(v);
  }
}
