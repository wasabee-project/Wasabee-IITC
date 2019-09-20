import WasabeeMe from "./me";
import QuickDrawControl from "./quickDrawLayers";
import WasabeeButtonControl from "./wasabeeButton";
import opsButtonControl from "./opsButton";
import NewopButtonControl from "./newopButton";
import LinkDialogButtonControl from "./linkDialogButton";
import MarkerButtonControl from "./markerButton";

const Wasabee = window.plugin.Wasabee;

/* This function adds the plugin buttons on the left side of the screen */
export default function(selectedOp) {
  selectedOp = selectedOp || window.plugin.wasabee.getSelectedOperation();

  const ButtonsControl = L.Control.extend({
    options: {
      position: "topleft"
    },
    onAdd: function(map) {
      const outerDiv = L.DomUtil.create(
        "div",
        "leaflet-draw leaflet-draw-section"
      );
      const container = L.DomUtil.create("div", "leaflet-arcs leaflet-bar");
      outerDiv.appendChild(container);
      this._modes = {};

      this._addWasabeeButton(map, container);
      this._addOpsButton(map, container);
      this._addQuickDrawButton(map, container, outerDiv);
      this._addLinkDialogButton(map, container);
      this._addMarkerButton(map, container);
      this._addNewopButton(map, container);
      this._addClearButton(map, container);
      this._addSyncButton(map, container);
      this._addUploadButton(map, container);
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
      const wb = this._modes[type];
      window.addHook("wasabeeUIUpdate", function() {
        wb.button.innerHTML =
          '<img src="' +
          wasabeeButtonHandler.getIcon() +
          '" style="vertical-align: middle;">';
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
    },
    _addSyncButton: function(map, container) {
      const tmp = {};
      tmp.type = "download all ops";
      let type = tmp.type;
      this._modes[type] = {};
      this._modes[type].handler = () => {
        // Feature.prototype.addHooks.call(tmp);
      };
      this._modes[type].button = this._createButton({
        title: "Download Available Operations",
        container: container,
        buttonImage: window.plugin.Wasabee.static.images.toolbar_download,
        callback: () => {
          window.plugin.wasabee.closeAllDialogs("nothing");
          const so = window.plugin.wasabee.getSelectedOperation();
          try {
            const me = WasabeeMe.get(true);
            if (me == null) {
              window.plugin.wasabee.showMustAuthAlert();
            } else {
              me.Ops.forEach(function(op) {
                window.plugin.wasabee.opPromise(op.ID).then(
                  function(newop) {
                    if (newop != null) {
                      newop.store();
                      // if the op changed out beneath us, use the new
                      if (newop.ID == so.ID) {
                        window.plugin.wasabee.makeSelectedOperation(newop.ID);
                        newop.update();
                        window.runHooks("wasabeeUIUpdate");
                      }
                    } else {
                      console.log("opPromise returned null op but no err?");
                      window.plugin.wasabee.showMustAuthAlert();
                    }
                  },
                  function(err) {
                    console.log(err);
                    window.plugin.wasabee.showMustAuthAlert();
                  }
                );
              });
              alert("Sync Complete");
            }
          } catch (e) {
            window.plugin.wasabee.showMustAuthAlert();
          }
        }
      });
    },
    _addClearButton: function(map, container) {
      const tmp = {};
      tmp.type = "clear ops";
      let type = tmp.type;
      this._modes[type] = {};
      this._modes[type].handler = () => {
        // Feature.prototype.addHooks.call(tmp);
      };
      this._modes[type].button = this._createButton({
        title: "Clear All Operations",
        container: container,
        buttonImage: window.plugin.Wasabee.static.images.toolbar_delete,
        callback: () => {
          const confirmed = window.confirm(
            "Are you sure you want to clear ALL operations? (the currently selected op will remain)"
          );
          if (confirmed) {
            window.plugin.wasabee.closeAllDialogs("nothing");
            window.plugin.wasabee.resetOps();
            window.plugin.wasabee.setupLocalStorage();
          }
        }
      });
    },
    _addUploadButton: function(map, container) {
      const tmp = {};
      tmp.type = "upload op";
      let type = tmp.type;
      this._modes[type] = {};
      this._modes[type].handler = () => {
        // Feature.prototype.addHooks.call(tmp);
      };
      this._modes[type].button = this._createButton({
        title: "Upload Operation",
        container: container,
        buttonImage: window.plugin.Wasabee.static.images.toolbar_upload,
        callback: () => {
          window.plugin.wasabee.closeAllDialogs("nothing");
          const so = window.plugin.wasabee.getSelectedOperation();
          const id = so.ID;

          if (so.IsServerOp()) {
            window.plugin.wasabee.updateOpPromise(so).then(
              function(resolve) {
                console.log("server accepted the update: " + resolve);
                alert("Update Successful");
              },
              function(reject) {
                console.log(reject);
                window.plugin.wasabee.showMustAuthAlert();
              }
            );
          } else {
            window.plugin.wasabee.uploadOpPromise(so).then(
              function(resolve) {
                console.log(resolve);
                window.plugin.wasabee.makeSelectedOperation(id); // switch to the new version in local store
                const newop = window.plugin.wasabee.getSelectedOperation();
                newop.update();
                window.runHooks("wasabeeUIUpdate");
                alert("Upload Successful");
              },
              function(reject) {
                console.log(reject);
                window.plugin.wasabee.showMustAuthAlert();
              }
            );
          }
        }
      });
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
        title: "Add Markers",
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
      const link = L.DomUtil.create(
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
    },
    update: function() {
      if (
        selectedOp.IsServerOp() == false ||
        selectedOp.IsWritableOp(WasabeeMe.get()) == true
      ) {
        $("#wasabee_uploadbutton").css("display", "");
      } else {
        $("#wasabee_uploadbutton").css("display", "none");
      }
    }
  });
  if (typeof Wasabee.buttons === "undefined") {
    Wasabee.buttons = new ButtonsControl();
    window.map.addControl(Wasabee.buttons);
    window.addHook("wasabeeUIUpdate", Wasabee.buttons.update);
  }
  Wasabee.buttons.update();
}
