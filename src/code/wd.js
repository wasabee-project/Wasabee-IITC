// the counter-op / defensive tools are Wasabee-D
import WasabeeMe from "./me";
import { dKeylistPromise } from "./server";
import { getAgent } from "./server";

// setup function
export const initWasabeeD = () => {
  if (!window.plugin.wasabee._Dkey) {
    window.plugin.wasabee._Dkeys = new Map();
  }
};

export const isDenabled = () => {
  return window.isLayerGroupDisplayed("Wasabee-D Keys");
};

// This is the primary hook that is called on map refresh
export const drawWasabeeDkeys = () => {
  // if (!isDenabled()) return;
  if (!WasabeeMe.isLoggedIn()) return;

  console.log("running drawWasabeeDkeys");
  window.addHook("portalDetailLoaded", dLoadDetails);

  dKeylistPromise().then(
    function(data) {
      const list = JSON.parse(data);
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
          // if we are here early (after a reload?) IITC spams the logs
          window.portalDetail.request(n.PortalID); // listener deals with the replies
        }
      }
    },
    function(err) {
      console.log(err);
    }
  );
};

const dLoadDetails = e => {
  if (!e.success) return; // bad load
  if (window.plugin.wasabee.defensiveLayers[e.guid]) return; // already drawn
  if (!window.plugin.wasabee._Dkeys.has(e.guid)) return; // not one we are concerned with

  const l = window.plugin.wasabee._Dkeys.get(e.guid);
  l.set("details", e.details);
  window.plugin.wasabee._Dkeys.set(e.guid, l);

  const icon = window.plugin.wasabee.static.markerTypes.get(
    "GetKeyPortalMarker"
  ).markerIconDone;

  const latLng = new L.LatLng(
    (e.details.latE6 / 1e6).toFixed(6),
    (e.details.lngE6 / 1e6).toFixed(6)
  );
  const marker = L.marker(latLng, {
    title: e.details.title,
    icon: L.icon({
      iconUrl: icon,
      shadowUrl: null,
      iconSize: L.point(24, 40),
      iconAnchor: L.point(12, 40),
      popupAnchor: L.point(-1, -48)
    })
  });
  window.plugin.wasabee.defensiveLayers[e.guid] = marker;
  marker.addTo(window.plugin.wasabee.defensiveLayerGroup);

  window.registerMarkerForOMS(marker);
  marker.bindPopup("loading...");
  marker.off("click", marker.openPopup, marker);
  marker.on(
    "click",
    () => {
      marker.setPopupContent(getMarkerPopup(e.guid));
      marker.update();
      marker.openPopup();
    },
    marker
  );
  marker.on(
    "spiderfiedclick",
    () => {
      marker.setPopupContent(getMarkerPopup(e.guid));
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

  const container = L.DomUtil.create("span", ""); // leaflet-draw-tooltip would be cool
  if (window.plugin.wasabee._Dkeys.has(PortalID)) {
    const ul = L.DomUtil.create("ul", "", container);
    const l = window.plugin.wasabee._Dkeys.get(PortalID);
    for (const [k, v] of l) {
      if (k != "details") {
        const a = getAgent(v.GID);
        const li = L.DomUtil.create("li", "", ul);
        if (a) {
          li.appendChild(a.formatDisplay());
        } else {
          const fake = L.DomUtil.create("span", "", li);
          fake.innerHTML = "[loading]";
        }
        const c = L.DomUtil.create("span", "", li);
        c.innerHTML = `:  ${v.Count} ${v.CapID}`;
      }
    }
  } else {
    container.innerHTML = "No data";
  }
  return container;
};
