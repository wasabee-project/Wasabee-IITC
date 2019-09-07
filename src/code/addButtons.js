import LinkDialog from "./linkDialog";
import { MarkerDialog } from "./markerDialog";
import { OpsDialog } from "./opsDialog";
import WasabeeMe from "./me";
import QuickDrawControl from "./quickDrawLayers";
// import Operation from "./operation";

var Wasabee = window.plugin.Wasabee;

/* This function adds the plugin buttons on the left side of the screen */
export default function() {
  const ButtonsControl = L.Control.extend({
    options: {
      position: "topleft"
    },
    onAdd: function(map) {
      var outerDiv = L.DomUtil.create(
        "div",
        "leaflet-draw leaflet-draw-section"
      );
      var container = L.DomUtil.create("div", "leaflet-arcs leaflet-bar");
      outerDiv.appendChild(container);
      this._modes = {};

      $(container)
        .append(
          '<a id="wasabee_viewopsbutton" href="javascript: void(0);" class="wasabee-control" title="Manage Operations"><img src=' +
            Wasabee.static.images.toolbar_viewOps +
            ' style="vertical-align:middle;align:center;" /></a>'
        )
        .on("click", "#wasabee_viewopsbutton", function() {
          OpsDialog.update(Wasabee.opList);
        });

      this._addQuickDrawButton(map, container, outerDiv);

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
            var me = WasabeeMe.get();
            if (me == null) {
              window.plugin.wasabee.showMustAuthAlert();
            } else {
              me.Ops.forEach(function(op) {
                window.plugin.wasabee.opPromise(op.ID).then(
                  function(newop) {
                    newop.store();
                  },
                  function(err) {
                    console.log(err);
                  }
                );
              });
              alert("Sync Complete");
            }
          } catch (e) {
            window.plugin.wasabee.showMustAuthAlert();
          }
        });

      $(container)
        .append(
          '<a id="wasabee_uploadbutton" href="javascript: void(0);" class="wasabee-control" title="Push To Server"><img src=' +
            Wasabee.static.images.toolbar_upload +
            ' style="vertical-align:middle;align:center;" /></a>'
        )
        .on("click", "#wasabee_uploadbutton", function() {
          var selectedOp = window.plugin.wasabee.getSelectedOperation();
          var isServerOp = window.plugin.wasabee.IsServerOp(selectedOp.ID);

          // upload is different than update -- upload on 1st, update after
          if (isServerOp) {
            try {
              window.plugin.wasabee.updateSingleOp(selectedOp);
            } catch (e) {
              window.plugin.wasabee.showMustAuthAlert();
            }
          } else {
            LinkDialog.closeDialogs();
            OpsDialog.closeDialogs();
            MarkerDialog.closeDialogs();
            try {
              window.plugin.wasabee.uploadSingleOp(selectedOp);
              window.plugin.wasabee.downloadSingleOp(selectedOp.ID);
            } catch (e) {
              window.plugin.wasabee.showMustAuthAlert();
            }
          }
        });

      return outerDiv;
    },
    _addQuickDrawButton: function(map, container, outerDiv) {
      let quickDrawHandler = new QuickDrawControl(map);
      let type = quickDrawHandler.type;
      this._modes[type] = {};
      this._modes[type].handler = quickDrawHandler;
      this._modes[type].button = this._createButton({
        title: "Quick Draw Layers",
        container: container,
        buttonImage: window.plugin.Wasabee.static.images.toolbar_quickdraw,
        callback: quickDrawHandler.enable,
        context: quickDrawHandler
      });
      let actionsContainer = this._createActions([
        {
          title: "Click to stop drawing fields.",
          text: "End",
          callback: quickDrawHandler.disable,
          context: quickDrawHandler
        }
      ]);
      actionsContainer.style.top = "26px";
      L.DomUtil.addClass(actionsContainer, "leaflet-draw-actions-top");

      this._modes[type].actionsContainer = actionsContainer;

      quickDrawHandler.on(
        "enabled",
        function() {
          actionsContainer.style.display = "block";
        },
        this
      );
      quickDrawHandler.on(
        "disabled",
        function() {
          actionsContainer.style.display = "none";
        },
        this
      );
      outerDiv.appendChild(actionsContainer);
    },
    _createActions: function(buttons) {
      var container = L.DomUtil.create("ul", "leaflet-draw-actions"),
        l = buttons.length,
        li;

      for (var i = 0; i < l; i++) {
        li = L.DomUtil.create("li", "", container);

        this._createButton({
          title: buttons[i].title,
          text: buttons[i].text,
          container: li,
          callback: buttons[i].callback,
          context: buttons[i].context
        });
      }

      return container;
    },
    _createButton: function(options) {
      var link = L.DomUtil.create(
        "a",
        options.className || "",
        options.container
      );
      link.href = "#";

      if (options.text) {
        link.innerHTML = options.text;
      }

      if (options.buttonImage) {
        $(link).append(
          $("<img/>")
            .prop("src", options.buttonImage)
            .css("vertical-align", "middle")
            .css("align", "center")
        );
      }

      if (options.title) {
        link.title = options.title;
      }

      L.DomEvent.on(link, "click", L.DomEvent.stopPropagation)
        .on(link, "mousedown", L.DomEvent.stopPropagation)
        .on(link, "dblclick", L.DomEvent.stopPropagation)
        .on(link, "click", L.DomEvent.preventDefault)
        .on(link, "click", options.callback, options.context);

      return link;
    }
  });
  if (typeof Wasabee.buttons === "undefined") {
    Wasabee.buttons = new ButtonsControl();
    window.map.addControl(Wasabee.buttons);
  }
  var selectedOp = window.plugin.wasabee.getSelectedOperation();
  var isServerOp = window.plugin.wasabee.IsServerOp(selectedOp.ID);
  var isWritableOp =
    isServerOp && window.plugin.wasabee.IsWritableOp(selectedOp.ID);
  if (isWritableOp) {
    $("#wasabee_uploadbutton").css("display", "");
  } else {
    $("#wasabee_uploadbutton").css("display", "none");
  }
}
