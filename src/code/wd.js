import WasabeeMe from "./me";
import WasabeePortal from "./portal";
import { dKeylistPromise, dKeyPromise } from "./server";
import WasabeeAgent from "./agent";
import wX from "./wX";
import { getPortalDetails } from "./uiCommands";

// setup function
export function initWasabeeD() {
  window.plugin.wasabee.defensiveLayers = new L.LayerGroup();
  window.addLayerGroup(
    "Wasabee-D Keys",
    window.plugin.wasabee.defensiveLayers,
    false
  );

  // hook called in init.js after load
  window.map.on("wasabeeDkeys", drawWasabeeDkeys);

  if (!window.plugin.wasabee._Dkey) {
    window.plugin.wasabee._Dkeys = new Map();
  }

  window.map.on("layeradd", (obj) => {
    if (obj.layer === window.plugin.wasabee.defensiveLayers) {
      window.map.fire("wasabeeDkeys", { reason: "init D" }, false);
    }
  });

  window.map.on("layerremove", (obj) => {
    if (obj.layer === window.plugin.wasabee.defensiveLayers) {
      // clearLayers doesn't actually remove the data, just hides it from the map
      window.plugin.wasabee.defensiveLayers.clearLayers();
      window.plugin.wasabee._Dkeys.clear();
    }
  });
}

// This is the primary hook that is called on map refresh
export async function drawWasabeeDkeys() {
  if (window.isLayerGroupDisplayed("Wasabee-D Keys") === false) return;
  if (!WasabeeMe.isLoggedIn()) return;

  console.debug("running drawWasabeeDkeys");
  window.addHook("portalDetailLoaded", dLoadDetails);

  try {
    const data = await dKeylistPromise();
    const list = JSON.parse(data);

    window.plugin.wasabee.defensiveLayers.clearLayers();
    window.plugin.wasabee._Dkeys.clear();

    if (!list) console.debug(data); // what does the server send if recently logged out?
    if (!list || !list.DefensiveKeys || list.DefensiveKeys.length == 0) return;
    for (const n of list.DefensiveKeys) {
      if (n.PortalID) {
        let submap;
        if (window.plugin.wasabee._Dkeys.has(n.PortalID)) {
          submap = window.plugin.wasabee._Dkeys.get(n.PortalID);
        } else {
          submap = new Map();
        }
        submap.set(n.GID, n); // add user to the sub-map
        window.plugin.wasabee._Dkeys.set(n.PortalID, submap);

        // new format, no more work to be done
        if (n.Name) {
          submap.set("loaded", true);
          window.plugin.wasabee._Dkeys.set(n.PortalID, submap);
          continue;
        }

        // old format, look it up and upgrade
        if (
          window.portals[n.PortalID] &&
          window.portals[n.PortalID].options.data.title
        ) {
          // already fully fetched
          const e = window.portals[n.PortalID].options;
          e.success = true; // make this look like an event
          e.details = e.data;
          dLoadDetails(e);
        } else {
          getPortalDetails(n.PortalID); // listener deals with the replies
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
  drawMarkers();
}

function dLoadDetails(e) {
  if (!e.success) return; // bad load
  if (window.plugin.wasabee._Dkeys.has(e.guid)) {
    const submap = window.plugin.wasabee._Dkeys.get(e.guid);
    if (!submap.has("loaded")) {
      const me = WasabeeMe.cacheGet(86400);
      submap.set("loaded", true);

      // TODO: don't overwrite those that are already set...
      for (const [id, data] of submap.entries()) {
        if (id == "loaded") continue;
        data.Lat = (e.details.latE6 / 1e6).toFixed(6);
        data.Lng = (e.details.lngE6 / 1e6).toFixed(6);
        data.Name = e.details.title;
        submap.set(id, data);
        if (id == me.GoogleID) upgradeOnServer(data); // async, no need to await here
      }
      window.plugin.wasabee._Dkeys.set(e.guid, submap);
    }
  }

  let disable = true;
  for (const v of window.plugin.wasabee._Dkeys.values()) {
    if (!v.has("loaded")) disable = false; // still some waiting to be fetched
  }
  if (disable) {
    console.debug("disabling portalDetailLoaded listener for WD");
    window.removeHook("portalDetailLoaded", dLoadDetails);
    drawMarkers();
  }
}

function drawMarkers() {
  for (const [portalID, submap] of window.plugin.wasabee._Dkeys.entries()) {
    drawMarker(portalID, submap);
  }
}

function drawMarker(portalID, submap) {
  if (
    window.plugin.wasabee.defensiveLayers[portalID] &&
    window.plugin.wasabee.defensiveLayers[portalID]._leaflet_id
  )
    window.plugin.wasabee.defensiveLayers.removeLayer(
      window.plugin.wasabee.defensiveLayers[portalID]
    );

  let portal = null;
  for (const [id, p] of submap) {
    if (id == "loaded") continue;
    if (p.Name == null || p.Name == "") continue;
    portal = new WasabeePortal({
      ID: portalID,
      name: p.Name,
      lat: p.Lat,
      lng: p.Lng,
    });
    break; // first one is fine
  }
  if (portal == null) {
    console.debug("awaiting data for old format", portalID);
    return;
  }

  const marker = L.marker(portal.latLng, {
    title: portal.name,
    icon: L.divIcon({
      className: "wasabee-defense-icon",
      shadowUrl: null,
      iconSize: L.point(24, 40),
      iconAnchor: L.point(12, 40),
      popupAnchor: L.point(-1, -48),
    }),
  });
  window.plugin.wasabee.defensiveLayers[portalID] = marker;
  marker.addTo(window.plugin.wasabee.defensiveLayers);

  window.registerMarkerForOMS(marker);
  marker.bindPopup("loading...", {
    className: "wasabee-popup",
    closeButton: false,
  });
  marker.on(
    "click spiderfiedclick",
    async (ev) => {
      L.DomEvent.stop(ev);
      if (marker.isPopupOpen && marker.isPopupOpen()) return;
      try {
        const content = await getMarkerPopup(portalID);
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

async function getMarkerPopup(PortalID) {
  if (!window.plugin.wasabee._Dkeys) return null;
  const container = L.DomUtil.create("span", null); // leaflet-draw-tooltip would be cool
  if (window.plugin.wasabee._Dkeys.has(PortalID)) {
    const ul = L.DomUtil.create("ul", null, container);
    const submap = window.plugin.wasabee._Dkeys.get(PortalID);
    for (const [k, v] of submap) {
      if (k != "loaded") {
        const a = await WasabeeAgent.waitGet(v.GID);
        const li = L.DomUtil.create("li", null, ul);
        if (a) {
          li.appendChild(a.formatDisplay());
        } else {
          const fake = L.DomUtil.create("span", null, li);
          fake.textContent = wX("LOADING");
        }
        const c = L.DomUtil.create("span", null, li);
        c.textContent = `:  ${v.Count} ${v.CapID}`;
      }
    }
  } else {
    container.textContent = wX("NO_DATA");
  }
  return container;
}

async function upgradeOnServer(data) {
  console.log("wd key upgradeOnServer", data);

  const restoreCount = data.Count;
  // remove old
  try {
    data.Count = 0;
    await dKeyPromise(JSON.stringify(data));
  } catch (e) {
    console.log(e);
    return;
  }

  // restore as new
  try {
    data.Count = restoreCount;
    await dKeyPromise(JSON.stringify(data));
  } catch (e) {
    console.log(e);
  }
}
