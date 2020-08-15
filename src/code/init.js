import { initCrossLinks } from "./crosslinks";
import initServer from "./server";
import { setupLocalStorage, initSelectedOperation } from "./selectedOp";
import { drawThings, drawAgents } from "./mapDrawing";
import addButtons from "./addButtons";
import { setupToolbox } from "./toolbox";
import { initFirebase } from "./firebaseSupport";
import { initWasabeeD } from "./wd";
import { listenForPortalDetails, sendLocation } from "./uiCommands";
import { initSkin, changeSkin } from "./skin";
import wX from "./wX";
import WasabeeMe from "./me";
const Wasabee = window.plugin.wasabee;

window.plugin.wasabee.init = function () {
  if (Wasabee._inited) return;
  Wasabee._inited = true;
  Object.freeze(Wasabee.static);

  if (window.plugin.sync) alert(wX("DISABLE_SYNC"));

  // check if using 'old' iitc
  const hookLength = window.VALID_HOOKS.hookLength;
  // no longer necessary on IITC-CE, but still needed on 0.26
  window.pluginCreateHook("wasabeeUIUpdate");
  if (window.VALID_HOOKS.hookLength > hookLength) {
    alert("Wasabee probably won't work on this old version of IITC");
  }

  Wasabee._selectedOp = null; // the in-memory working op;
  Wasabee.teams = new Map();
  Wasabee._agentCache = new Map();
  Wasabee.onlineAgents = new Map();
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
  window.addHook("wasabeeUIUpdate", (operation) => {
    drawThings(operation);
  });

  // IITC-CE, not 0.26
  if (window.addResumeFunction) {
    window.addResumeFunction(() => {
      window.runHooks("wasabeeUIUpdate", Wasabee._selectedOp);
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
      window.runHooks("wasabeeUIUpdate", Wasabee._selectedOp);
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
  window.runHooks("wasabeeUIUpdate", Wasabee._selectedOp);

  // run crosslinks
  window.runHooks("wasabeeCrosslinks", Wasabee._selectedOp);

  // if the browser was restarted and the cookie nuked, but localstorge[me]
  // has not yet expired, we would think we were logged in when really not
  // this forces an update on reload
  if (WasabeeMe.isLoggedIn()) {
    // this updates the UI
    // since we don't need the result, we can use the properly async version w/o awaiting it
    WasabeeMe.waitGet(true);
  }

  window.runHooks("wasabeeDkeys");
};

// this can be moved to auth dialog, no need to init it for people who never log in
// and use webpack, rather than importing it ourself
const initGoogleAPI = () => {
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
      window.gapi.auth2.enableDebugLogs(true);
    });
  };
  (document.body || document.head || document.documentElement).appendChild(
    script
  );
};
