import WasabeeMe from "./me";
import QuickDrawControl from "./quickDrawLayers";
import WasabeeDialog from "./dialogs/wasabeeDialog";
import OpsDialog from "./dialogs/opsDialog";
import NewopsDialog from "./dialogs/newopDialog";
import LinkDialog from "./dialogs/linkDialog";
import MarkerAddDialog from "./dialogs/markerAddDialog";
import MultimaxButtonControl from "./dialogs/multimaxDialog";
import { opPromise, updateOpPromise, uploadOpPromise } from "./server";
import ConfirmDialog from "./dialogs/confirmDialog";
import AuthDialog from "./dialogs/authDialog";

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
      this._addOpsButton(map, container, outerDiv);
      this._addQuickDrawButton(map, container, outerDiv);
      // this._addMultimaxButton(map, container);
      this._addLinkDialogButton(map, container);
      this._addMarkerButton(map, container);
      this._addSyncButton(map, container);
      this._addUploadButton(map, container);
      return outerDiv;
    },
    _addWasabeeButton: function(map, container) {
      let wasabeeButtonHandler = new WasabeeDialog(map);
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
    },
    _updateWasabeeButton: function() {
      const wb = this._modes["wasabeeButton"]; // yuk hardcoded...
      wb.button.innerHTML =
        '<img src="' +
        wb.handler.getIcon() +
        '" style="vertical-align: middle;">';
    },
    _addOpsButton: function(map, container, outerDiv) {
      let opsButtonHandler = new OpsDialog(map);
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
      let actionsContainer = this._createActions([
        {
          title: "Create a new operation",
          text: "New Op",
          callback: () => {
            closeAllDialogs();
            let nb = new NewopsDialog(map);
            opsButtonHandler.disable();
            nb.enable();
          },
          context: opsButtonHandler
        },
        {
          title: "Clear all locally stored ops",
          text: "Clear Local Ops",
          callback: () => {
            const con = new ConfirmDialog();
            con.setup(
              "Clear Local Ops",
              "Are you sure you want to remove all operations from the local storage? Ops stored on the server will be restored at the next sync.",
              () => {
                closeAllDialogs();
                window.plugin.wasabee.resetOps();
                window.plugin.wasabee.setupLocalStorage();
              }
            );
            con.enable();
          },
          context: opsButtonHandler
        }
      ]);
      actionsContainer.style.top = "26px";
      L.DomUtil.addClass(actionsContainer, "leaflet-draw-actions-top");

      this._modes[type].actionsContainer = actionsContainer;

      opsButtonHandler.on(
        "enabled",
        function() {
          actionsContainer.style.display = "block";
        },
        this
      );
      opsButtonHandler.on(
        "disabled",
        function() {
          actionsContainer.style.display = "none";
        },
        this
      );
      outerDiv.appendChild(actionsContainer);
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
          const so = window.plugin.wasabee.getSelectedOperation();
          try {
            const me = WasabeeMe.get(true); // force update of ops list
            if (me === null) {
              const ad = new AuthDialog();
              ad.enable();
            } else {
              for (const op of me.Ops) {
                opPromise(op.ID).then(
                  function(newop) {
                    if (newop != null) {
                      newop.store();
                      // if the op changed out beneath us, use the new
                      if (newop.ID == so.ID) {
                        window.plugin.wasabee.makeSelectedOperation(newop.ID);
                      }
                    }
                  },
                  function(err) {
                    console.log(err);
                    const ad = new AuthDialog();
                    ad.enable();
                  }
                );
              }
              alert("Sync Complete");
            }
          } catch (e) {
            // ad = new AuthDialog();
            // ad.enable();
            alert(e);
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
          // closeAllDialogs();
          const so = window.plugin.wasabee.getSelectedOperation();
          const id = so.ID;

          if (so.IsServerOp()) {
            updateOpPromise(so).then(
              function(resolve) {
                console.log("server accepted the update: " + resolve);
                alert("Update Successful");
                window.runHooks("wasabeeUIUpdate", so);
              },
              function(reject) {
                console.log(reject);
                alert("Update Failed: " + JSON.stringify(reject));
              }
            );
          } else {
            uploadOpPromise(so).then(
              function(resolve) {
                console.log(resolve);
                window.plugin.wasabee.makeSelectedOperation(id); // switch to the new version in local store
                // makeSelectedOp takes care of redraw, no need to save since already there
                // const newop = window.plugin.wasabee.getSelectedOperation();
                // newop.update();
                alert("Upload Successful");
              },
              function(reject) {
                console.log(reject);
                alert("Upload Failed: " + JSON.stringify(reject));
              }
            );
          }
        }
      });
    },
    _updateUploadButton: function() {
      const operation = window.plugin.wasabee.getSelectedOperation();
      let status = "";
      if (operation.localchanged) {
        status = " (locally modified)";
      }
      this._modes["upload op"].button.title =
        "Upload " + operation.name + status;
    },
    _addLinkDialogButton: function(map, container) {
      let ldButtonHandler = new LinkDialog(map);
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
      let mButtonHandler = new MarkerAddDialog(map);
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
    _addMultimaxButton: function(map, container) {
      let multimaxButtonHandler = new MultimaxButtonControl(map);
      let type = multimaxButtonHandler.type;
      this._modes[type] = {};
      this._modes[type].handler = multimaxButtonHandler;
      this._modes[type].button = this._createButton({
        title: "Multimax Draw",
        container: container,
        buttonImage: window.plugin.Wasabee.static.images.toolbar_multimax,
        callback: multimaxButtonHandler.enable,
        context: multimaxButtonHandler
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
      actionsContainer.style.top = "52px";
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
    update: function(operation) {
      if (operation.IsServerOp() == false || operation.IsWritableOp() == true) {
        $("#wasabee_uploadbutton").css("display", "");
      } else {
        $("#wasabee_uploadbutton").css("display", "none");
      }
      Wasabee.buttons._updateUploadButton();
      Wasabee.buttons._updateWasabeeButton();
    }
  });
  if (typeof Wasabee.buttons === "undefined") {
    Wasabee.buttons = new ButtonsControl();
    window.map.addControl(Wasabee.buttons);
  } else {
    // XXX is this redundant with the hook?
    let type = WasabeeDialog.TYPE;
    let handler = Wasabee.buttons._modes[type].handler;
    let image = handler.getIcon();
    let button = Wasabee.buttons._modes[type].button;
    $(button)
      .children("img")
      .attr("src", image);
    window.addHook("wasabeeUIUpdate", Wasabee.buttons.update);
  }
  Wasabee.buttons.update(selectedOp);
}

const closeAllDialogs = skip => {
  skip = skip || "nothing";
  for (const name of Object.values(window.plugin.Wasabee.static.dialogNames)) {
    if (name != skip) {
      let id = "dialog-" + name;
      if (window.DIALOGS[id]) {
        try {
          let selector = $(window.DIALOGS[id]);
          selector.dialog("close");
          selector.remove();
        } catch (err) {
          console.log("closing dialog: " + err);
        }
      }
    }
  }
};
