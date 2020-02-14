import { WButton } from "../leafletDrawImports.js";
import { uploadOpPromise, updateOpPromise } from "../server";
import WasabeeMe from "../me";

const UploadButton = WButton.extend({
  statics: {
    TYPE: "uploadButton"
  },

  initialize: function(map, container) {
    if (!map) map = window.map;
    this._map = map;
    this._lastLoginState = false;

    this.type = UploadButton.TYPE;
    // this.handler = null; // no handler since we do it all in this.Wupdate()
    this.title = "Upload";
    this.Wupdate(container);
  },

  Wupdate: function(container) {
    if (!WasabeeMe.isLoggedIn()) {
      this.button = this._invisible(container);
      return;
    }

    const operation = window.plugin.wasabee.getSelectedOperation();
    if (!operation.IsServerOp()) {
      this.button = this._upload(container, operation);
      return;
    }

    if (!operation.localchanged || !operation.IsWritableOp()) {
      this.button = this._invisible(container);
      return;
    }
    this.button = this._update(container, operation);
  },

  _upload: function(container, operation) {
    return this._createButton({
      title: "Upload Operation",
      container: container,
      buttonImage: window.plugin.Wasabee.static.images.toolbar_upload,
      context: this,
      callback: () => {
        uploadOpPromise(operation).then(
          function(resolve) {
            console.log(resolve);
            window.plugin.wasabee.makeSelectedOperation(operation.ID); // switch to the new version in local store
            // makeSelectedOp takes care of redraw, no need to save since already there
            alert("Upload Successful");
          },
          function(reject) {
            console.log(reject);
            alert(`Upload Failed: ${reject}`);
          }
        );
      }
    });
  },

  _update: function(container, operation) {
    return this._createButton({
      title: "Update Operation",
      container: container,
      buttonImage: window.plugin.Wasabee.static.images.toolbar_upload,
      context: this,
      callback: () => {
        updateOpPromise(operation).then(
          function(resolve) {
            console.log(`server accepted the update: ${resolve}`);
            alert("Update Successful");
            window.runHooks("wasabeeUIUpdate", operation);
          },
          function(reject) {
            console.log(reject);
            alert(`Upload Failed: ${reject}`);
          }
        );
      }
    });
  },

  _invisible: function(container) {
    const l = L.DomUtil.create("a", "leaflet-draw-actions-bottom", container);
    l.style.display = "none";
    return l;
    // return this._createButton({ container: container, title: "cannot upload", context: this });
  }
});

export default UploadButton;
