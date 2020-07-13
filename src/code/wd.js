// the counter-op / defensive tools are Wasabee-D
import WasabeeMe from "./me";
import { dKeylistPromise } from "./server";
import { getAgent } from "./server";
import wX from "./wX";
import { getPortalDetails } from "./uiCommands";

// setup function
export const initWasabeeD = () => {
  window.plugin.wasabee.defensiveLayers = new L.LayerGroup();
  window.addLayerGroup(
    "Wasabee-D Keys",
    window.plugin.wasabee.defensiveLayers,
    true
  );

  // window.pluginCreateHook("wasabeeDkeys"); // not needed after IITC 0.30
  window.addHook("wasabeeDkeys", () => {
    drawWasabeeDkeys();
  });

  if (!window.plugin.wasabee._Dkey) {
    window.plugin.wasabee._Dkeys = new Map();
  }

  window.map.on("layeradd", obj => {
    if (obj.layer === window.plugin.wasabee.defensiveLayers) {
      window.runHooks("wasabeeDkeys");
    }
  });

  window.map.on("layerremove", obj => {
    if (obj.layer === window.plugin.wasabee.defensiveLayers) {
      // clearLayers doesn't actually remove the data, just hides it from the map
      window.plugin.wasabee.defensiveLayers.clearLayers();
      window.plugin.wasabee._Dkeys.clear();
    }
  });

  window.runHooks("wasabeeDkeys");
};

// This is the primary hook that is called on map refresh
export const drawWasabeeDkeys = () => {
  if (window.isLayerGroupDisplayed("Wasabee-D Keys") === false) return;
  if (!WasabeeMe.isLoggedIn()) return;

  console.log("running drawWasabeeDkeys");
  window.addHook("portalDetailLoaded", dLoadDetails);

  dKeylistPromise().then(
    data => {
      let list = null;
      try {
        list = JSON.parse(data);
      } catch (e) {
        console.log(e);
      }
      if (!list) console.log(data); // what does the server send if recently logged out?
      if (!list || !list.DefensiveKeys || list.DefensiveKeys.length == 0)
        return;
      for (const n of list.DefensiveKeys) {
        if (n.PortalID) {
          let l;
          if (window.plugin.wasabee._Dkeys.has(n.PortalID)) {
            l = window.plugin.wasabee._Dkeys.get(n.PortalID);
          } else {
            l = new Map();
          }
          l.set(n.GID, n); // add user to the sub-map
          window.plugin.wasabee._Dkeys.set(n.PortalID, l);
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
            // if we are here early (after a reload?) IITC spams the logs
            if (!window.requests) {
              console.log(
                "window.requests does not exist yet... expect an error"
              );
            }
            getPortalDetails(n.PortalID); // listener deals with the replies
          }
        }
      }
    },
    err => {
      console.log(err);
    }
  );
};

const dLoadDetails = e => {
  if (!e.success) return; // bad load
  if (window.isLayerGroupDisplayed("Wasabee-D Keys") === false) return; // not enabled
  if (!window.plugin.wasabee._Dkeys.has(e.guid)) return; // not one we are concerned with
  if (
    window.plugin.wasabee.defensiveLayers[e.guid] &&
    window.plugin.wasabee.defensiveLayers[e.guid]._leaflet_id
  )
    window.plugin.wasabee.defensiveLayers.removeLayer(
      window.plugin.wasabee.defensiveLayers[e.guid]
    );

  const submap = window.plugin.wasabee._Dkeys.get(e.guid);
  submap.set("details", e.details);
  window.plugin.wasabee._Dkeys.set(e.guid, submap);

  const icon = window.plugin.wasabee.skin.markerTypes.get("GetKeyPortalMarker")
    .markerIconDone.default;

  const latLng = new L.LatLng(
    (e.details.latE6 / 1e6).toFixed(6),
    (e.details.lngE6 / 1e6).toFixed(6)
  );

  let opacity = 0.3;
  if (e.details && e.details.team == "E") {
    if (e.details.resonators && e.details.resonators.length == 8) {
      opacity = 1.0;
    } else {
      opacity = 0.6;
    }
  }
  const marker = L.marker(latLng, {
    title: e.details.title,
    opacity: opacity,
    icon: L.icon({
      iconUrl: icon,
      shadowUrl: null,
      iconSize: L.point(24, 40),
      iconAnchor: L.point(12, 40),
      popupAnchor: L.point(-1, -48)
    })
  });
  window.plugin.wasabee.defensiveLayers[e.guid] = marker;
  marker.addTo(window.plugin.wasabee.defensiveLayers);

  window.registerMarkerForOMS(marker);
  marker.bindPopup("loading...", {
    className: "wasabee-popup",
    closeButton: false
  });
  marker.on(
    "click spiderfiedclick",
    ev => {
      L.DomEvent.stop(ev);
      if (marker.isPopupOpen && marker.isPopupOpen()) return;
      marker.setPopupContent(getMarkerPopup(e.guid));
      if (marker._popup._wrapper)
        marker._popup._wrapper.classList.add("wasabee-popup");
      marker.update();
      marker.openPopup();
    },
    marker
  );

  let disable = true;
  for (const [k, v] of window.plugin.wasabee._Dkeys) {
    if (!k) disable = false; // silence es-lint
    if (!v.has("details")) disable = false; // still some waiting to be fetched
  }
  if (disable) {
    console.log("disabling portalDetailLoaded listener for WD");
    window.removeHook("portalDetailLoaded", dLoadDetails);
  }
};

const getMarkerPopup = PortalID => {
  if (!window.plugin.wasabee._Dkeys) return;

  const container = L.DomUtil.create("span", null); // leaflet-draw-tooltip would be cool
  if (window.plugin.wasabee._Dkeys.has(PortalID)) {
    const ul = L.DomUtil.create("ul", null, container);
    const l = window.plugin.wasabee._Dkeys.get(PortalID);
    for (const [k, v] of l) {
      if (k != "details") {
        const a = getAgent(v.GID);
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
};
