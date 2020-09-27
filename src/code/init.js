import { initCrossLinks } from "./crosslinks";
import initServer from "./server";
import { setupLocalStorage, initSelectedOperation } from "./selectedOp";
import { drawMap, drawAgents } from "./mapDrawing";
import addButtons from "./addButtons";
import { setupToolbox } from "./toolbox";
import { initFirebase } from "./firebaseSupport";
import { initWasabeeD } from "./wd";
import { listenForPortalDetails, sendLocation } from "./uiCommands";
import { initSkin, changeSkin } from "./skin";
import WasabeeMe from "./me";
const Wasabee = window.plugin.wasabee;

window.plugin.wasabee.init = () => {
  if (Wasabee._inited) return;
  Wasabee._inited = true;
  Object.freeze(Wasabee.static);

  if (
    window.iitcBuildDate == undefined ||
    window.iitcBuildDate < "2020-01-18-170317"
  ) {
    alert(
      "Wasabee won't work on this version of IITC; please update to 0.30.1 or newer from iitc.app"
    );
  }

  Wasabee._selectedOp = null; // the in-memory working op;
  Wasabee.teams = new Map();
  Wasabee._agentCache = new Map();
  Wasabee.onlineAgents = new Map();
  Wasabee._updateList = new Map();
  Wasabee.portalDetailQueue = new Array();

  // can this be moved to the auth dialog?
  initGoogleAPI();
  setupLocalStorage();
  initSelectedOperation();
  initServer();
  initSkin();

  const skins = [];
  const ss = localStorage[Wasabee.static.constants.SKIN_KEY];
  try {
    const l = JSON.parse(ss);
    for (const s of l) skins.push(s);
  } catch {
    skins.push(ss);
  }
  if (skins.length > 0) {
    window.addHook("iitcLoaded", () => {
      changeSkin(skins);
    });
  }

  Wasabee.portalLayerGroup = new L.LayerGroup();
  Wasabee.linkLayerGroup = new L.LayerGroup();
  Wasabee.markerLayerGroup = new L.LayerGroup();
  Wasabee.agentLayerGroup = new L.LayerGroup();
  window.addLayerGroup("Wasabee Draw Portals", Wasabee.portalLayerGroup, true);
  window.addLayerGroup("Wasabee Draw Links", Wasabee.linkLayerGroup, true);
  window.addLayerGroup("Wasabee Draw Markers", Wasabee.markerLayerGroup, true);
  window.addLayerGroup("Wasabee Agents", Wasabee.agentLayerGroup, true);

  // standard hook, add our call to it
  window.addHook("mapDataRefreshStart", () => {
    drawAgents(Wasabee._selectedOp);
  });

  window.addHook("portalDetailsUpdated", (e) => {
    listenForPortalDetails({
      success: true,
      guid: e.guid,
      details: e.portalDetails,
    });
  });

  // custom hook for updating our UI
  window.addHook("wasabeeUIUpdate", (caller) => {
    if (caller != null) console.debug("ui update", caller);
    drawMap();
  });

  // IITC-CE, not 0.26
  if (window.addResumeFunction) {
    window.addResumeFunction(() => {
      window.runHooks("wasabeeUIUpdate", "resume");
      sendLocation();
    });
  }

  // hooks called when layers are enabled/disabled
  window.map.on("layeradd", (obj) => {
    if (
      obj.layer === Wasabee.portalLayerGroup ||
      obj.layer === Wasabee.linkLayerGroup ||
      obj.layer === Wasabee.markerLayerGroup
    ) {
      window.runHooks("wasabeeUIUpdate", "layeradd");
    }
  });

  window.map.on("layerremove", (obj) => {
    if (
      obj.layer === Wasabee.portalLayerGroup ||
      obj.layer === Wasabee.linkLayerGroup ||
      obj.layer === Wasabee.markerLayerGroup
    ) {
      obj.layer.clearLayers();
    }
  });

  // late stage initializations
  initFirebase();
  initCrossLinks();
  initWasabeeD();

  // probably redundant now
  const sl = localStorage[Wasabee.static.constants.SEND_LOCATION_KEY];
  if (sl !== "true") {
    localStorage[Wasabee.static.constants.SEND_LOCATION_KEY] = "false";
  }

  // setup UI elements
  addButtons(Wasabee._selectedOp);
  setupToolbox();

  // draw the UI with the op data for the first time
  window.runHooks("wasabeeUIUpdate", "startup");

  // run crosslinks
  window.runHooks("wasabeeCrosslinks");

  // if the browser was restarted and the cookie nuked, but localstorge[me]
  // has not yet expired, we would think we were logged in when really not
  // this forces an update on reload
  if (WasabeeMe.isLoggedIn()) {
    // this updates the UI
    WasabeeMe.waitGet(true);

    // load Wasabee-Defense keys if logged in
    window.runHooks("wasabeeDkeys");
  }
};

// this can be moved to auth dialog, no need to init it for people who never log in
// and use webpack, rather than importing it ourself
function initGoogleAPI() {
  if (typeof window.gapi !== "undefined") {
    alert(
      "Wasabee detected another GAPI instance; there may be authentication issues"
    );
    window.gapi.load("auth2", () => {
      window.gapi.auth2.enableDebugLogs(false);
      console.log("loading GAPI auth2");
    });
    return;
  }
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.async = true;
  script.defer = true;
  script.src = "https://apis.google.com/js/platform.js";
  script.onload = () => {
    window.gapi.load("auth2", () => {
      window.gapi.auth2.enableDebugLogs(false);
    });
  };
  (document.body || document.head || document.documentElement).appendChild(
    script
  );
}
