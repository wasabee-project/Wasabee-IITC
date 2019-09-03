import LinkDialog from "./linkDialog";
import { MarkerDialog } from "./markerDialog";
import { OpsDialog } from "./opsDialog";
// import Operation from "./operation";

var Wasabee = window.plugin.Wasabee;

/* This function adds the plugin buttons on the left side of the screen */
export default function() {
  var selectedOp = window.plugin.wasabee.getSelectedOperation();
  const ButtonsControl = L.Control.extend({
    options: {
      position: "topleft"
    },
    onAdd: function() {
      var container = L.DomUtil.create("div", "leaflet-arcs leaflet-bar");
      $(container)
        .append(
          '<a id="wasabee_viewopsbutton" href="javascript: void(0);" class="wasabee-control" title="Manage Operations"><img src=' +
            Wasabee.static.images.toolbar_viewOps +
            ' style="vertical-align:middle;align:center;" /></a>'
        )
        .on("click", "#wasabee_viewopsbutton", function() {
          OpsDialog.update(Wasabee.opList);
        });
      $(container)
        .append(
          '<a id="wasabee_addlinksbutton" href="javascript: void(0);" class="wasabee-control" title="Add Links"><img src=' +
            Wasabee.static.images.toolbar_addlinks +
            ' style="vertical-align:middle;align:center;" /></a>'
        )
        .on("click", "#wasabee_addlinksbutton", function() {
          var selectedOp = window.plugin.wasabee.getSelectedOperation();
          if (selectedOp != null) {
            LinkDialog.update(selectedOp, true);
          } else {
            window.alert("No selected Operation found.");
          }
        });
      $(container)
        .append(
          '<a id="wasabee_addmarkersbutton" href="javascript: void(0);" class="wasabee-control" title="Add Markers"><img src=' +
            Wasabee.static.images.toolbar_addMarkers +
            ' style="vertical-align:middle;align:center;" /></a>'
        )
        .on("click", "#wasabee_addmarkersbutton", function() {
          var selectedOp = window.plugin.wasabee.getSelectedOperation();
          if (selectedOp != null) {
            MarkerDialog.update(selectedOp);
          } else {
            window.alert("No selected Operation found.");
          }
        });
      $(container)
        .append(
          '<a id="wasabee_addopbutton" href="javascript: void(0);" class="wasabee-control" title="Add Op"><img src=' +
            Wasabee.static.images.toolbar_plus +
            ' style="vertical-align:middle;align:center;" /></a>'
        )
        .on("click", "#wasabee_addopbutton", function() {
          window.plugin.wasabee.showAddOpDialog();
        });

      $(container)
        .append(
          '<a id="wasabee_clearopsbutton" href="javascript: void(0);" class="wasabee-control" title="Clear All Ops"><img src=' +
            Wasabee.static.images.toolbar_delete +
            ' style="vertical-align:middle;align:center;" /></a>'
        )
        .on("click", "#wasabee_clearopsbutton", function() {
          var confirmed = window.confirm(
            "Are you sure you want to clear ALL operations?"
          );
          if (confirmed) {
            window.plugin.wasabee.resetOps();
            window.plugin.wasabee.setupLocalStorage();
            OpsDialog.closeDialogs();
          }
        });

      $(container)
        .append(
          '<a id="wasabee_syncbutton" href="javascript: void(0);" class="wasabee-control" title="Get All Ops"><img src=' +
            Wasabee.static.images.toolbar_download +
            ' style="vertical-align:middle;align:center;" /></a>'
        )
        .on("click", "#wasabee_syncbutton", function() {
          try {
            LinkDialog.closeDialogs();
            OpsDialog.closeDialogs();
            MarkerDialog.closeDialogs();
            window.plugin.wasabee.authWithWasabee();
          } catch (e) {
            window.plugin.wasabee.showMustAuthAlert();
          }
        });

      var IsWritableOp = window.plugin.wasabee.IsWritableOp(selectedOp.ID);
      var IsServerOp = window.plugin.wasabee.IsServerOp(selectedOp.ID);
      if (IsWritableOp || (IsWritableOp !== true && IsServerOp !== true)) {
        $(container)
          .append(
            '<a id="wasabee_uploadbutton" href="javascript: void(0);" class="wasabee-control" title="Push To Server"><img src=' +
              Wasabee.static.images.toolbar_upload +
              ' style="vertical-align:middle;align:center;" /></a>'
          )
          .on("click", "#wasabee_uploadbutton", function() {
            // upload is different than update -- upload on 1st, update after
            if (IsServerOp) {
              window.plugin.wasabee.updateSingleOp(selectedOp);
            } else {
              window.plugin.wasabee.uploadSingleOp(selectedOp);
            }
          });
      }
      return container;
    }
  });
  if (Wasabee.buttons != null) {
    window.map.removeControl(Wasabee.buttons);
  }
  Wasabee.buttons = new ButtonsControl();
  window.map.addControl(Wasabee.buttons);
}
