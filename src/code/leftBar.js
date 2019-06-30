//** This function adds the plugin buttons on the left side of the screen */
window.plugin.wasabee.addButtons = function () {
    var selectedOp = window.plugin.wasabee.getSelectedOperation();
    window.plugin.wasabee.buttons = L.Control.extend({
        options: {
            position: "topleft"
        },
        onAdd: function (map) {
            var container = L.DomUtil.create("div", "leaflet-arcs leaflet-bar");
            $(container).append("<a id=\"wasabee_viewopsbutton\" href=\"javascript: void(0);\" class=\"wasabee-control\" title=\"Manage Operations\"><img src=" + Wasabee.Images.toolbar_viewOps + " style=\"vertical-align:middle;align:center;\" /></a>").on("click", "#wasabee_viewopsbutton", function () {
                Wasabee.OpsDialog.update(Wasabee.opList);
            });
            $(container).append("<a id=\"wasabee_addlinksbutton\" href=\"javascript: void(0);\" class=\"wasabee-control\" title=\"Add Links\"><img src=" + Wasabee.Images.toolbar_addlinks + " style=\"vertical-align:middle;align:center;\" /></a>").on("click", "#wasabee_addlinksbutton", function () {
                var selectedOp = window.plugin.wasabee.getSelectedOperation();
                if (selectedOp != null) { Wasabee.LinkDialog.update(selectedOp, true); }
                else { alert("No selected Operation found."); }
            });
            $(container).append("<a id=\"wasabee_addmarkersbutton\" href=\"javascript: void(0);\" class=\"wasabee-control\" title=\"Add Markers\"><img src=" + Wasabee.Images.toolbar_addMarkers + " style=\"vertical-align:middle;align:center;\" /></a>").on("click", "#wasabee_addmarkersbutton", function () {
                var selectedOp = window.plugin.wasabee.getSelectedOperation();
                if (selectedOp != null) { Wasabee.MarkerDialog.update(selectedOp); }
                else { alert("No selected Operation found."); }
            });
            $(container).append("<a id=\"wasabee_addopbutton\" href=\"javascript: void(0);\" class=\"wasabee-control\" title=\"Add Op\"><img src=" + Wasabee.Images.toolbar_plus + " style=\"vertical-align:middle;align:center;\" /></a>").on("click", "#wasabee_addopbutton", function () {
                window.plugin.wasabee.showAddOpDialog();
            });

            $(container).append("<a id=\"wasabee_clearopsbutton\" href=\"javascript: void(0);\" class=\"wasabee-control\" title=\"Clear All Ops\"><img src=" + Wasabee.Images.toolbar_delete + " style=\"vertical-align:middle;align:center;\" /></a>").on("click", "#wasabee_clearopsbutton", function () {
                var confirmed = confirm("Are you sure you want to clear ALL operations?");
                if (confirmed) {
                    window.plugin.wasabee.resetOpList();
                    window.plugin.wasabee.setupLocalStorage();
                    Wasabee.OpsDialog.closeDialogs();
                }
            });

            $(container).append("<a id=\"wasabee_syncbutton\" href=\"javascript: void(0);\" class=\"wasabee-control\" title=\"Get All Ops\"><img src=" + Wasabee.Images.toolbar_download + " style=\"vertical-align:middle;align:center;\" /></a>").on("click", "#wasabee_syncbutton", function () {
                try {
                    Wasabee.LinkDialog.closeDialogs();
                    Wasabee.OpsDialog.closeDialogs();
                    Wasabee.MarkerDialog.closeDialogs();
                    window.plugin.wasabee.authWithWasabee();
                } catch (e) {
                    window.plugin.wasabee.showMustAuthAlert();
                }
            });

            var opIsOwnedServerOp = window.plugin.wasabee.opIsOwnedServerOp(selectedOp.ID);
            var opIsServerOp = window.plugin.wasabee.opIsServerOp(selectedOp.ID);
            if (opIsOwnedServerOp || (opIsOwnedServerOp != true && opIsServerOp != true)) {
                $(container).append("<a id=\"wasabee_uploadbutton\" href=\"javascript: void(0);\" class=\"wasabee-control\" title=\"Push To Server\"><img src=" + Wasabee.Images.toolbar_upload + " style=\"vertical-align:middle;align:center;\" /></a>").on("click", "#wasabee_uploadbutton", function () {
                    var opIsInLocalStorage = window.plugin.wasabee.opIsServerOp(selectedOp.ID);
                    if (opIsInLocalStorage) {
                        window.plugin.wasabee.updateSingleOp(Operation.create(selectedOp));
                    } else {
                        window.plugin.wasabee.uploadSingleOp(Operation.create(selectedOp));
                    }
                });
            }
            var v = latlngs[0];
            return container;
        }
    });
    if (Wasabee.buttons != null) {
        map.removeControl(Wasabee.buttons);
    }
    Wasabee.buttons = new window.plugin.wasabee.buttons();
    map.addControl(Wasabee.buttons);
};