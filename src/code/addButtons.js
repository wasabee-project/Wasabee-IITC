import WasabeeMe from "./me";
import QuickDrawControl from "./quickDrawLayers";
import WasabeeButtonControl from "./wasabeeButton";
import opsButtonControl from "./opsButton";
import NewopButtonControl from "./newopButton";
import LinkDialogButtonControl from "./linkDialogButton";
import MarkerButtonControl from "./markerButton";

var Wasabee = window.plugin.Wasabee;

/* This function adds the plugin buttons on the left side of the screen */
export default function(selectedOp) {
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

      this._addWasabeeButton(map, container, outerDiv);
      this._addOpsButton(map, container, outerDiv);
      this._addQuickDrawButton(map, container, outerDiv);
      this._addLinkDialogButton(map, container, outerDiv);
      this._addMarkerButton(map, container, outerDiv);
      this._addNewopButton(map, container, outerDiv);

      // these three buttons need to be converted to the new format as well
      $(container)
        .append(
          '<a id="wasabee_clearopsbutton" href="javascript: void(0);" class="wasabee-control" title="Clear All Ops"><img src=' +
            Wasabee.static.images.toolbar_delete +
            ' style="vertical-align:middle;align:center;" /></a>'
        )
        .on("click", "#wasabee_clearopsbutton", function() {
          var confirmed = window.confirm(
            "Are you sure you want to clear ALL operations? (the currently selected op will remain)"
          );
          if (confirmed) {
            window.plugin.wasabee.closeAllDialogs();
            window.plugin.wasabee.resetOps();
            window.plugin.wasabee.setupLocalStorage();
            // load the new default w/o saving the currently selected op...
          }
        });

      $(container)
        .append(
          '<a id="wasabee_syncbutton" href="javascript: void(0);" class="wasabee-control" title="Get All Ops"><img src=' +
            Wasabee.static.images.toolbar_download +
            ' style="vertical-align:middle;align:center;" /></a>'
        )
        .on("click", "#wasabee_syncbutton", function() {
          window.plugin.wasabee.closeAllDialogs();
          try {
            var me = WasabeeMe.get(true);
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
          window.plugin.wasabee.closeAllDialogs();
          let so = window.plugin.wasabee.getSelectedOperation();
          let isServerOp = so.IsServerOp();

          // upload is different than update -- upload on 1st, update after
          if (isServerOp) {
            try {
              window.plugin.wasabee.updateSingleOp(so);
            } catch (e) {
              window.plugin.wasabee.showMustAuthAlert();
            }
          } else {
            try {
              window.plugin.wasabee.uploadSingleOp(so);
              window.plugin.wasabee.downloadSingleOp(so.ID);
            } catch (e) {
              window.plugin.wasabee.showMustAuthAlert();
            }
          }
        });

      return outerDiv;
    },
    _addWasabeeButton: function(map, container) {
      let wasabeeButtonHandler = new WasabeeButtonControl(map);
      let image = wasabeeButtonHandler.getIcon();
      let type = wasabeeButtonHandler.type;
      this._modes[type] = {};
      this._modes[type].handler = wasabeeButtonHandler;
      this._modes[type].button = this._createButton({
        title: "Wasabee Status",
        container: container,
        buttonImage: image,
        callback: wasabeeButtonHandler.enable,
        context: wasabeeButtonHandler
      });
      var wb = this._modes[type];
      window.addHook("mapDataRefreshStart", function() {
        wb.button = wasabeeButtonHandler.getIcon();
      });
    },
    _addOpsButton: function(map, container) {
      let opsButtonHandler = new opsButtonControl(map);
      let type = opsButtonHandler.type;
      this._modes[type] = {};
      this._modes[type].handler = opsButtonHandler;
      this._modes[type].button = this._createButton({
        title: "Operations",
        container: container,
        buttonImage: window.plugin.Wasabee.static.images.toolbar_viewOps,
        callback: opsButtonHandler.enable,
        context: opsButtonHandler
      });
      return opsButtonHandler;
    },
    _addNewopButton: function(map, container) {
      let newopButtonHandler = new NewopButtonControl(map);
      let type = newopButtonHandler.type;
      this._modes[type] = {};
      this._modes[type].handler = newopButtonHandler;
      this._modes[type].button = this._createButton({
        title: "New Operation",
        container: container,
        buttonImage: window.plugin.Wasabee.static.images.toolbar_plus,
        callback: newopButtonHandler.enable,
        context: newopButtonHandler
      });
    },
    _addLinkDialogButton: function(map, container) {
      let ldButtonHandler = new LinkDialogButtonControl(map);
      let type = ldButtonHandler.type;
      this._modes[type] = {};
      this._modes[type].handler = ldButtonHandler;
      this._modes[type].button = this._createButton({
        title: "Add Links",
        container: container,
        buttonImage: window.plugin.Wasabee.static.images.toolbar_addlinks,
        callback: ldButtonHandler.enable,
        context: ldButtonHandler
      });
    },
    _addMarkerButton: function(map, container) {
      let mButtonHandler = new MarkerButtonControl(map);
      let type = mButtonHandler.type;
      this._modes[type] = {};
      this._modes[type].handler = mButtonHandler;
      this._modes[type].button = this._createButton({
        title: "Add Marker",
        container: container,
        buttonImage: window.plugin.Wasabee.static.images.toolbar_addMarkers,
        callback: mButtonHandler.enable,
        context: mButtonHandler
      });
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
      actionsContainer.style.top = "39px";
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
  var isServerOp = selectedOp.IsServerOp();
  var isWritableOp = isServerOp && selectedOp.IsWritableOp(WasabeeMe.get());
  if (isWritableOp) {
    $("#wasabee_uploadbutton").css("display", "");
  } else {
    $("#wasabee_uploadbutton").css("display", "none");
  }
}
