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
  if (Wasabee._inited) return;
  Wasabee._inited = true;
  Object.freeze(Wasabee.static);

  if (window.plugin.sync)
    alert(
      "Wasabee and the stock sync plugin do not get along. Please disable sync to use Wasabee"
    );

  //** LAYER DEFINITIONS */
  Wasabee._selectedOp = null; // the in-memory working op;
  Wasabee.teams = new Map();
  Wasabee._agentCache = new Map();

  initGoogleAPI();
  setupLocalStorage();
  initSelectedOperation();
  initServer();

  addCSS(Wasabee.static.CSS.ui);
  addCSS(Wasabee.static.CSS.main);
  addCSS(Wasabee.static.CSS.toastr);
  addCSS(Wasabee.static.CSS.leafletdraw);

  Wasabee.portalLayerGroup = new L.LayerGroup();
  Wasabee.linkLayerGroup = new L.LayerGroup();
  Wasabee.markerLayerGroup = new L.LayerGroup();
  Wasabee.agentLayerGroup = new L.LayerGroup();
  Wasabee.defensiveLayerGroup = new L.LayerGroup();
  window.addLayerGroup("Wasabee Draw Portals", Wasabee.portalLayerGroup, true);
  window.addLayerGroup("Wasabee Draw Links", Wasabee.linkLayerGroup, true);
  window.addLayerGroup("Wasabee Draw Markers", Wasabee.markerLayerGroup, true);
  window.addLayerGroup("Wasabee Agents", Wasabee.agentLayerGroup, true);
  window.addLayerGroup("Wasabee-D Keys", Wasabee.defensiveLayerGroup, true);

  window.addHook("mapDataRefreshStart", () => {
    drawAgents(Wasabee._selectedOp);
  });

  window.pluginCreateHook("wasabeeDkeys");
  window.addHook("wasabeeDkeys", () => {
    drawWasabeeDkeys();
  });

  window.pluginCreateHook("wasabeeUIUpdate");
  window.addHook("wasabeeUIUpdate", operation => {
    drawThings(operation);
  });
  window.pluginCreateHook("wasabeeCrosslinks");

  // enable and test in 0.15
  window.addResumeFunction(() => {
    window.runHooks("wasabeeUIUpdate", Wasabee._selectedOp);
  });

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
