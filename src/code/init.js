//PLUGIN START
window.plugin.wasabee = function() {};

//** LAYER DEFINITIONS */
window.plugin.wasabee.portalLayers = {};
window.plugin.wasabee.portalLayerGroup = null;
window.plugin.wasabee.linkLayers = {};
window.plugin.wasabee.linkLayerGroup = null;
window.plugin.wasabee.targetLayers = {};
window.plugin.wasabee.targetLayerGroup = null;

window.plugin.wasabee.loadExternals = function() {
    try {

    } catch (e) {
        alert(JSON.stringify(e));
    }

    Wasabee.opList = Array();
    Wasabee.pasteList = Array();

    window.plugin.wasabee.addCSS(Wasabee.static.CSS.ui);
    window.plugin.wasabee.addCSS(Wasabee.static.CSS.main);
    //window.plugin.wasabee.addCSS(Wasabee.static.CSS.toastr);

    window.plugin.wasabee.setupLocalStorage();
    window.plugin.wasabee.addButtons();

    window.plugin.wasabee.portalLayerGroup = new L.LayerGroup();
    window.plugin.wasabee.linkLayerGroup = new L.LayerGroup();
    window.plugin.wasabee.targetLayerGroup = new L.LayerGroup();
    window.addLayerGroup("Wasabee Draw Portals", window.plugin.wasabee.portalLayerGroup, true);
    window.addLayerGroup("Wasabee Draw Links", window.plugin.wasabee.linkLayerGroup, true);
    window.addLayerGroup("Wasabee Draw Targets", window.plugin.wasabee.targetLayerGroup, true);
    initCrossLinks();
    drawThings();
    //window.plugin.wasabee.addScriptToBase(Wasabee.Constants.SCRIPT_URL_NOTY)

    var shareKey = window.plugin.wasabee.getUrlParams("wasabeeShareKey", null);
    if (shareKey != null) {
        window.plugin.wasabee.qbin_get(shareKey);
    }
};