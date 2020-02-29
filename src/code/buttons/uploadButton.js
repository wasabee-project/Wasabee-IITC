import { WButton } from "../leafletDrawImports.js";
import { uploadOpPromise, updateOpPromise } from "../server";
import WasabeeMe from "../me";
import { getSelectedOperation, makeSelectedOperation } from "../selectedOp";

const UploadButton = WButton.extend({
  statics: {
    TYPE: "uploadButton"
  },

  initialize: function(map, container) {
    if (!map) map = window.map;
    this._map = map;

    this.type = UploadButton.TYPE;
    // this.handler = null;
    this._operation = getSelectedOperation();
    this.title = `Upload ${this._operation.name}`;

    this.button = this._createButton({
      title: "Upload",
      container: container,
      buttonImage: window.plugin.wasabee.static.images.toolbar_upload.default,
      context: this,
      callback: () => {
        if (this._operation.IsServerOp()) {
          updateOpPromise(this._operation).then(
            function(resolve) {
              console.log(`server accepted the update: ${resolve}`);
              window.runHooks("wasabeeUIUpdate", this._operation);
              alert("Update Successful");
            },
            function(reject) {
              console.log(reject);
              alert(`Update Failed: ${reject}`);
            }
          );
          return;
        }
        uploadOpPromise(this._operation).then(
          function(resolve) {
            // switch to the new version in local store -- uploadOpPromise stores it
            makeSelectedOperation(resolve.ID);
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

  Wupdate: function(container, operation) {
    if (this._operation.ID != operation.ID) {
      this._operation = operation;
    }

    if (!WasabeeMe.isLoggedIn()) {
      this._invisible();
      this.title = "not logged in";
      this.button.title = this.title;
      return;
    }

    if (!operation.IsServerOp()) {
      this._visible();
      this.title = `UPLOAD ${this._operation.name} (not currently on server)`;
      this.button.title = this.title;
      return;
    }

    if (!operation.IsWritableOp()) {
      this.title = `You do not have permission to modify ${this._operation.name} on the server`;
      this.button.title = this.title;
      this._invisible();
      return;
    }

    if (!operation.localchanged) {
      this.title = `${this._operation.name} not changed locally`;
      this.button.title = this.title;
      this._invisible();
      return;
    }

    this.title = `Update ${this._operation.name} on server`;
    this.button.title = this.title;
    this._visible();
  },

  _visible: function() {
    this.button.style.display = "block";
  },

  _invisible: function() {
    this.button.style.display = "none";
  }
});

export default UploadButton;
