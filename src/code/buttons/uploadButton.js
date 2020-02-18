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
    this._lastLoginState = false;

    this.type = UploadButton.TYPE;
    // this.handler = null;
    this._operation = getSelectedOperation();
    this.title = `Upload ${this._operation.name}`;

    this.button = this._createButton({
      title: "Upload",
      container: container,
      buttonImage: window.plugin.wasabee.static.images.toolbar_upload,
      context: this,
      callback: () => {
        if (this._operation.IsServerOp()) {
          updateOpPromise(this._operation).then(
            function(resolve) {
              console.log(`server accepted the update: ${resolve}`);
              alert("Update Successful");
              // window.runHooks("wasabeeUIUpdate", this._operation);
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
      this.title = `Upload ${this._operation.name}`;
      this.button.title = this.title;
    }

    if (!WasabeeMe.isLoggedIn()) {
      this._invisible();
      return;
    }

    if (!operation.IsServerOp()) {
      this._visible();
      return;
    }

    if (!operation.localchanged || !operation.IsWritableOp()) {
      this._invisible();
      return;
    }

    this.title = `Update ${this._operation.name}`;
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
