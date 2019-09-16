import { initCrossLinks } from "./crosslinks";
import initWasabee from "./wasabee";
import initPaste from "./paste";
import initServer from "./server";
import initSelectedOp from "./selectedOp";
import initOverflowMenu from "./overflowMenu";
import { drawThings, drawAgents } from "./mapDrawing";
import addButtons from "./addButtons";
import initScopes from "./scopes";
import { initFirebase } from "./firebaseSupport";

var Wasabee = window.plugin.Wasabee;

window.plugin.wasabee.init = function() {
  //** LAYER DEFINITIONS */
  window.plugin.wasabee.portalLayers = {};
  window.plugin.wasabee.portalLayerGroup = null;
  window.plugin.wasabee.linkLayers = {};
  window.plugin.wasabee.linkLayerGroup = null;
  window.plugin.wasabee.markerLayers = {};
  window.plugin.wasabee.markerLayerGroup = null;
  window.plugin.wasabee.agentLayers = {};
  window.plugin.wasabee.agentLayerGroup = null;

  Wasabee._selectedOp = null; // the in-memory working op;
  Wasabee.pasteList = Array();
  Wasabee.teams = new Map();

  // All of these should eventually export functions.
  // We do this because they still assign them to the global scope.
  initScopes();
  initSelectedOp(); // loads the next two
  window.plugin.wasabee.setupLocalStorage();
  window.plugin.wasabee.initSelectedOperation();

  initWasabee();
  initOverflowMenu();
  initPaste();
  initServer();

  window.plugin.wasabee.addCSS(Wasabee.static.CSS.ui);
  window.plugin.wasabee.addCSS(Wasabee.static.CSS.main);
  window.plugin.wasabee.addCSS(Wasabee.static.CSS.toastr);
  window.plugin.wasabee.addCSS(Wasabee.static.CSS.leafletdraw);

  addButtons(Wasabee._selectedOp);

  window.plugin.wasabee.portalLayerGroup = new L.LayerGroup();
  window.plugin.wasabee.linkLayerGroup = new L.LayerGroup();
  window.plugin.wasabee.markerLayerGroup = new L.LayerGroup();
  window.plugin.wasabee.agentLayerGroup = new L.LayerGroup();
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

  window.addHook("mapDataRefreshStart", function() {
    drawAgents(Wasabee._selectedOp);
  });

  initFirebase();
  initCrossLinks();
  drawThings(Wasabee._selectedOp);
  //window.plugin.wasabee.addScriptToBase(Wasabee.Constants.SCRIPT_URL_NOTY)

  var shareKey = window.plugin.wasabee.getUrlParams("wasabeeShareKey", null);
  if (shareKey != null) {
    window.plugin.wasabee.qbin_get(shareKey);
  }
};

window.plugin.wasabee.addCSS = content => {
  $("head").append('<style type="text/css">\n' + content + "\n</style>");
};
