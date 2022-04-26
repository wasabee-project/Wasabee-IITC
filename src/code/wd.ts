import { WasabeeMe } from "./model";
import { dKeylistPromise } from "./server";
import wX from "./wX";
// import { getPortalDetails } from "./uiCommands";

import * as AgentUI from "./ui/agent";
import type { LayerEvent, LayerGroup } from "leaflet";

import db from "./db";
import { getAgent } from "./model/cache";

export type WDKey = {
  Name: string;
  PortalID: string;
  GID: string;
  Lat: string;
  Lng: string;
  Count: number;
  CapID: string;
};

let defensiveLayer: LayerGroup;

// setup function
export function initWasabeeD() {
  window.plugin.wasabee.defensiveLayers = defensiveLayer = new L.LayerGroup();
  window.addLayerGroup("Wasabee-D Keys", defensiveLayer, false);

  // hook called in init.js after load
  window.map.on("wasabee:defensivekeys", drawWasabeeDkeys);

  window.map.on("layeradd", (obj: LayerEvent) => {
    if (obj.layer === defensiveLayer) {
      window.map.fire("wasabee:defensivekeys");
    }
  });

  window.map.on("layerremove", (obj: LayerEvent) => {
    if (obj.layer === defensiveLayer) {
      // clearLayers doesn't actually remove the data, just hides it from the map
      defensiveLayer.clearLayers();
    }
  });
}

export async function getAllWasabeeDkeys() {
  return (await db).getAll("defensivekeys");
}

export async function getAgentWasabeeDkeys(gid: GoogleID) {
  const dks = await getAllWasabeeDkeys();
  return dks.filter((dk) => dk.GID == gid);
}

export async function getAllPortalWasabeeDkeys(portalid: PortalID) {
  return (await db).getAllFromIndex("defensivekeys", "PortalID", portalid);
}

export async function getAgentPortalWasabeeDkeys(
  gid: GoogleID,
  portalid: PortalID
) {
  return (await db).get("defensivekeys", [gid, portalid]);
}

// This is the primary hook that is called on map refresh
// it clears the UI, updates the cache from the server and redraws the UI
// XXX Triggered BEFORE the IDB store gets setup, so first load fails -- subsequent runs are fine
export async function drawWasabeeDkeys() {
  if (window.isLayerGroupDisplayed("Wasabee-D Keys") === false) return;
  console.debug("running drawWasabeeDkeys");
  defensiveLayer.clearLayers();

  if (WasabeeMe.isLoggedIn()) {
    try {
      const list = await dKeylistPromise();
      if (!list || !list.DefensiveKeys || list.DefensiveKeys.length == 0)
        return;
      window.plugin.wasabee.idb.clear("defensivekeys");
      for (const n of list.DefensiveKeys) {
        try {
          await window.plugin.wasabee.idb.put("defensivekeys", n);
        } catch (e) {
          console.error(e);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }
  // even if not logged in, draw from indexdb
  drawMarkers(); // no need to await
}

// draws each distinct portalID once
async function drawMarkers() {
  const dks = await getAllWasabeeDkeys();
  const done = new Set<PortalID>();
  for (const dk of dks) {
    if (done.has(dk.PortalID)) continue;
    done.add(dk.PortalID);
    drawMarker(dk);
  }
}

// remove and re-add each marker
function drawMarker(dk: WDKey) {
  if (defensiveLayer[dk.PortalID] && defensiveLayer[dk.PortalID]._leaflet_id)
    defensiveLayer.removeLayer(defensiveLayer[dk.PortalID]);

  const marker = L.marker([+dk.Lat, +dk.Lng], {
    title: dk.Name,
    icon: L.divIcon({
      className: "wasabee-defense-icon",
      shadowUrl: null,
      iconSize: L.point(24, 40),
      iconAnchor: L.point(12, 40),
      popupAnchor: L.point(-1, -48),
    }),
  });
  defensiveLayer[dk.PortalID] = marker;
  marker.addTo(defensiveLayer);

  window.registerMarkerForOMS(marker);
  marker.bindPopup("loading...", {
    className: "wasabee-popup",
    closeButton: false,
  });
  marker.on(
    "click spiderfiedclick",
    async (ev) => {
      L.DomEvent.stop(ev);
      try {
        const content = await getMarkerPopup(dk.PortalID);
        marker.setPopupContent(content);
        if (marker._popup._wrapper)
          marker._popup._wrapper.classList.add("wasabee-popup");
        marker.update();
      } catch (e) {
        console.error("getting wd marker popup: ", e);
        marker.setPopupContent(e);
        marker.update();
      }
      marker.openPopup();
    },
    marker
  );
}

// draw the popup, display the individual agents and their counts
async function getMarkerPopup(PortalID: PortalID) {
  const container = L.DomUtil.create("div", "wasabee-wd-popup"); // leaflet-draw-tooltip would be cool
  const ul = L.DomUtil.create("ul", null, container);

  const dks = await getAllPortalWasabeeDkeys(PortalID);

  // since there is an await in here, it can't be in the while loop above
  for (const dk of dks) {
    const a = await getAgent(dk.GID);
    const li = L.DomUtil.create("li", null, ul);
    if (a) {
      li.appendChild(AgentUI.formatDisplay(a));
    } else {
      const fake = L.DomUtil.create("span", null, li);
      fake.textContent = wX("LOADING");
    }
    const c = L.DomUtil.create("span", null, li);
    c.textContent = `:  ${dk.Count} ${dk.CapID}`;
  }

  return container;
}
