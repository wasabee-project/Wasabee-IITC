import arc from "arc";
import { initCrossLinks } from "./crosslinks";
import { drawThings } from "./mapDrawing";
import addButtons from "./addButtons";

var Wasabee = window.plugin.Wasabee;

export default function () {
    //** LAYER DEFINITIONS */
    window.plugin.wasabee.portalLayers = {};
    window.plugin.wasabee.portalLayerGroup = null;
    window.plugin.wasabee.linkLayers = {};
    window.plugin.wasabee.linkLayerGroup = null;
    window.plugin.wasabee.targetLayers = {};
    window.plugin.wasabee.targetLayerGroup = null;

    window.plugin.wasabee.loadExternals = function () {

        window.plugin.wasabee.arc = arc;
        Wasabee.opList = Array();
        Wasabee.pasteList = Array();

        window.plugin.wasabee.addCSS(Wasabee.CSS.ui);
        window.plugin.wasabee.addCSS(Wasabee.CSS.main);
        window.plugin.wasabee.addCSS(Wasabee.CSS.toastr);

        window.plugin.wasabee.setupLocalStorage();
        addButtons();

        window.plugin.wasabee.portalLayerGroup = new L.LayerGroup();
        window.plugin.wasabee.linkLayerGroup = new L.LayerGroup();
        window.plugin.wasabee.targetLayerGroup = new L.LayerGroup();
        window.addLayerGroup("Wasabee Draw Portals", window.plugin.wasabee.portalLayerGroup, true);
        window.addLayerGroup("Wasabee Draw Links", window.plugin.wasabee.linkLayerGroup, true);
        window.addLayerGroup("Wasabee Draw Targets", window.plugin.wasabee.targetLayerGroup, true);
        initCrossLinks();
        drawThings();
        require("./paste")();
        //window.plugin.wasabee.addScriptToBase(Wasabee.Constants.SCRIPT_URL_NOTY)

        var shareKey = window.plugin.wasabee.getUrlParams("wasabeeShareKey", null);
        if (shareKey != null) {
            window.plugin.wasabee.qbin_get(shareKey);
        }
    };
}
