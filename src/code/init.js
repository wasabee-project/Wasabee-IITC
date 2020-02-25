import { initCrossLinks } from "./crosslinks";
import initServer from "./server";
import { setupLocalStorage, initSelectedOperation } from "./selectedOp";
import { drawThings, drawAgents } from "./mapDrawing";
import addButtons from "./addButtons";
import { initFirebase } from "./firebaseSupport";
import { checkAllLinks } from "./crosslinks";
import { initWasabeeD, drawWasabeeDkeys } from "./wd";

const Wasabee = window.plugin.wasabee;

window.plugin.wasabee.init = function() {
  Object.freeze(Wasabee.static);

  if (window.plugin.sync)
    alert(
      "Wasabee and the stock sync plugin do not get along. Please disable sync to use Wasabee"
    );

  //** LAYER DEFINITIONS */
  window.plugin.wasabee.portalLayers = {};
  window.plugin.wasabee.portalLayerGroup = null;
  window.plugin.wasabee.linkLayers = {};
  window.plugin.wasabee.linkLayerGroup = null;
  window.plugin.wasabee.markerLayers = {};
  window.plugin.wasabee.markerLayerGroup = null;
  window.plugin.wasabee.agentLayers = {};
  window.plugin.wasabee.agentLayerGroup = null;
  window.plugin.wasabee.defensiveLayers = {};
  window.plugin.wasabee.defensiveLayerGroup = null;

  Wasabee._selectedOp = null; // the in-memory working op;
  Wasabee.teams = new Map();
  Wasabee._agentCache = new Map();
  window.pluginCreateHook("wasabeeUIUpdate");
  window.pluginCreateHook("wasabeeCrosslinks");
  window.pluginCreateHook("wasabeeDkeys");

  initGoogleAPI();
  setupLocalStorage();
  initSelectedOperation();
  initServer();

  addCSS(Wasabee.static.CSS.ui);
  addCSS(Wasabee.static.CSS.main);
  addCSS(Wasabee.static.CSS.toastr);
  addCSS(Wasabee.static.CSS.leafletdraw);

  window.plugin.wasabee.portalLayerGroup = new L.LayerGroup();
  window.plugin.wasabee.linkLayerGroup = new L.LayerGroup();
  window.plugin.wasabee.markerLayerGroup = new L.LayerGroup();
  window.plugin.wasabee.agentLayerGroup = new L.LayerGroup();
  window.plugin.wasabee.defensiveLayerGroup = new L.LayerGroup();
  window.addLayerGroup(
    "Wasabee Draw Portals",
    window.plugin.wasabee.portalLayerGroup,
    true
  );
  window.addLayerGroup(
    "Wasabee Draw Links",
    window.plugin.wasabee.linkLayerGroup,
    true
  );
  window.addLayerGroup(
    "Wasabee Draw Markers",
    window.plugin.wasabee.markerLayerGroup,
    true
  );
  window.addLayerGroup(
    "Wasabee Agents",
    window.plugin.wasabee.agentLayerGroup,
    true
  );
  window.addLayerGroup(
    "Wasabee-D Keys",
    window.plugin.wasabee.defensiveLayerGroup,
    true
  );

  window.addHook("mapDataRefreshStart", () => {
    drawAgents(Wasabee._selectedOp);
  });

  window.addHook("wasabeeDkeys", () => {
    drawWasabeeDkeys();
  });

  window.addHook("wasabeeUIUpdate", operation => {
    drawThings(operation);
  });

  // enable and test in 0.15
  //window.addResumeFunction(runHooks("wasabeeUIUpdate", window.plugin.wasabee._selectedOp));

  addButtons(Wasabee._selectedOp);

  initFirebase();
  initCrossLinks();
  initWasabeeD();

  window.addHook("wasabeeCrosslinks", operation => {
    checkAllLinks(operation);
  });

  // once everything else is done, do the initial draw
  window.runHooks("wasabeeUIUpdate", Wasabee._selectedOp);
  window.runHooks("wasabeeCrosslinks", Wasabee._selectedOp);
  window.runHooks("wasabeeDkeys");
};

const addCSS = content => {
  $("head").append('<style type="text/css">\n' + content + "\n</style>");
};

const initGoogleAPI = () => {
  if (typeof window.gapi !== "undefined") return;
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.async = true;
  script.src = "https://apis.google.com/js/client:platform:auth2.js";
  (document.body || document.head || document.documentElement).appendChild(
    script
  );
};
