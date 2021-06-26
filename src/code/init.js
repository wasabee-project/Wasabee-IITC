import { initCrossLinks } from "./crosslinks";
import initServer from "./server";
import { setupLocalStorage, initSelectedOperation } from "./selectedOp";
import {
  drawMap,
  drawAgents,
  drawBackgroundOps,
  drawBackgroundOp,
} from "./mapDrawing";
import addButtons from "./addButtons";
import { setupToolbox } from "./toolbox";
import { initFirebase, postToFirebase } from "./firebaseSupport";
import { initWasabeeD } from "./wd";
import { listenForPortalDetails, sendLocation } from "./uiCommands";
import { initSkin, changeSkin } from "./skin";
import { WPane } from "./leafletClasses";
import OperationChecklist from "./dialogs/checklist";
import WasabeeMe from "./model/me";
import WasabeeOp from "./model/operation";
import db from "./db";
import polyfill from "./polyfill";

const Wasabee = window.plugin.wasabee;

window.plugin.wasabee.init = async () => {
  // polyfill
  polyfill();

  if (Wasabee._inited) return;
  Wasabee._inited = true;
  Object.freeze(Wasabee.static);

  if (
    window.iitcBuildDate == undefined ||
    window.iitcBuildDate < "2020-01-18-170317"
  ) {
    alert(
      "Wasabee won't work on this version of IITC; please <a href='https://iitc.app'>update to 0.30.1 or newer from https://iitc.app</a>. On desktop, <strong>do not use the IITC button</strong>, use the TamperMonkey/GreaseMonkey method."
    );
    return;
  }

  Wasabee.idb = await db;
  Wasabee._selectedOp = null; // the in-memory working op;
  Wasabee._updateList = new Map();
  Wasabee.portalDetailQueue = new Array();

  initSkin();
  // can this be moved to the auth dialog?
  initGoogleAPI();
  await setupLocalStorage();
  await initSelectedOperation();
  initServer();

  const skins = [];
  const ss = localStorage[Wasabee.static.constants.SKIN_KEY];
  try {
    const l = JSON.parse(ss);
    for (const s of l) skins.push(s);
  } catch {
    skins.push(ss);
  }
  if (skins.length > 0) {
    if (window.iitcLoaded) changeSkin(skins);
    else {
      window.addHook("iitcLoaded", () => {
        changeSkin(skins);
      });
    }
  }

  Wasabee.portalLayerGroup = new L.LayerGroup();
  Wasabee.linkLayerGroup = new L.LayerGroup();
  Wasabee.markerLayerGroup = new L.LayerGroup();
  Wasabee.agentLayerGroup = new L.LayerGroup();
  Wasabee.zoneLayerGroup = new L.FeatureGroup();
  window.addLayerGroup("Wasabee Draw Portals", Wasabee.portalLayerGroup, true);
  window.addLayerGroup("Wasabee Draw Links", Wasabee.linkLayerGroup, true);
  window.addLayerGroup("Wasabee Draw Markers", Wasabee.markerLayerGroup, true);
  window.addLayerGroup("Wasabee Agents", Wasabee.agentLayerGroup, true);
  window.addLayerGroup("Wasabee Zones", Wasabee.zoneLayerGroup, true);
  Wasabee.zoneLayerGroup.bringToBack();

  Wasabee.backgroundOpsGroup = new L.LayerGroup();
  window.addLayerGroup(
    "Wasabee Background Ops",
    Wasabee.backgroundOpsGroup,
    true
  );

  // standard hook, add our call to it
  window.addHook("mapDataRefreshStart", () => {
    window.map.fire("wasabee:agentlocations");
  });

  window.addHook("portalDetailsUpdated", (e) => {
    listenForPortalDetails({
      success: true,
      guid: e.guid,
      details: e.portalDetails,
    });
  });

  // use our own hook on portal click
  // note: do not build WasabeePortal here, we only need one for QD
  function propagateClick(e) {
    window.map.fire("wasabee:portal:click", e.target);
  }
  window.addHook("portalAdded", (e) => e.portal.on("click", propagateClick));

  window.map.on("wasabee:ui:skin", drawMap);

  window.map.on("wasabee:op:change", drawMap);
  window.map.on("wasabee:op:select", drawMap);
  window.map.on("wasabee:agentlocations", drawAgents);
  window.map.on("wasabee:logout", drawAgents);

  // when the UI is woken from sleep on many devices
  window.addResumeFunction(() => {
    // check if still logged in
    if (WasabeeMe.isLoggedIn()) {
      // refresh agent locations
      window.map.fire("wasabee:agentlocations");
      sendLocation();
    }
  });

  window.map.on("wasabee:op:select", () => {
    drawBackgroundOps();
  });
  window.map.on("wasabee:op:background", (data) => {
    if (data.background) {
      if (Wasabee._selectedOp && Wasabee._selectedOp.ID !== data.opID)
        WasabeeOp.load(data.opID).then(drawBackgroundOp);
    } else {
      drawBackgroundOps();
    }
  });

  // Android panes
  const usePanes = localStorage[Wasabee.static.constants.USE_PANES] === "true";
  if (window.isSmartphone() && usePanes) {
    /* eslint-disable no-new */
    new WPane({
      paneId: "wasabee",
      paneName: "Wasabee",
      default: () => new OperationChecklist(),
    });
  }

  // hooks called when layers are enabled/disabled
  window.map.on("layeradd", (obj) => {
    if (
      obj.layer === Wasabee.portalLayerGroup ||
      obj.layer === Wasabee.linkLayerGroup ||
      obj.layer === Wasabee.markerLayerGroup ||
      obj.layer === Wasabee.zoneLayerGroup
    ) {
      drawMap();
    }
    if (obj.layer === Wasabee.backgroundOpsGroup) {
      drawBackgroundOps();
    }
  });

  window.map.on("layerremove", (obj) => {
    if (
      obj.layer === Wasabee.portalLayerGroup ||
      obj.layer === Wasabee.linkLayerGroup ||
      obj.layer === Wasabee.markerLayerGroup ||
      obj.layer === Wasabee.zoneLayerGroup
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
  addButtons();
  setupToolbox();

  // draw the UI with the op data for the first time -- buttons are fresh, no need to update
  window.map.fire("wasabee:agentlocations");

  // initial draw
  drawMap();
  drawBackgroundOps();

  // run crosslinks
  window.map.fire("wasabee:crosslinks");

  // if the browser was restarted and the cookie nuked, but localstorge[me]
  // has not yet expired, we would think we were logged in when really not
  // this forces an update on reload
  if (WasabeeMe.isLoggedIn()) {
    WasabeeMe.waitGet(true);

    // load Wasabee-Defense keys if logged in
    window.map.fire("wasabee:defensivekeys");
  }

  window.map.on("wdialog", (dialog) => {
    postToFirebase({ id: "analytics", action: dialog.constructor.TYPE });
  });
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
