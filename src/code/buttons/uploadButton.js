import { WButton } from "../leafletDrawImports.js";
import { uploadOpPromise, updateOpPromise } from "../server";
import WasabeeMe from "../me";
import { getSelectedOperation, makeSelectedOperation } from "../selectedOp";
import wX from "../wX";

const UploadButton = WButton.extend({
  statics: {
    TYPE: "uploadButton"
  },

  initialize: function(map = window.map, container) {
    this._map = map;

    this.type = UploadButton.TYPE;
    // this.handler = null;
    this._operation = getSelectedOperation();
    this.title = `Upload ${this._operation.name}`;
    this._container = container;

    this.button = this._createButton({
      title: "Upload",
      container: this._container,
      buttonImage: window.plugin.wasabee.static.images.toolbar_upload.default,
      context: this,
      callback: () => {
        if (this._operation.IsServerOp()) {
          updateOpPromise(this._operation).then(
            () => {
              alert(wX("UPDATED"));
              this.Wupdate(this._container, this._operation);
            },
            reject => {
              console.log(reject);
              alert(`Update Failed: ${reject}`);
            }
          );
          return;
        }
        uploadOpPromise(this._operation).then(
          resolve => {
            // switch to the new version in local store -- uploadOpPromise stores it
            makeSelectedOperation(resolve.ID);
            alert(wX("UPLOADED"));
            this.Wupdate(this._container, this._operation);
            this._invisible();
          },
          reject => {
            // this shouldn't be necessary, but the UI is behind
            updateOpPromise(this._operation).then(
              () => {
                alert(wX("UPDATED"));
                this.Wupdate(this._container, this._operation);
              },
              reject => {
                console.log(reject);
                alert(`Update Failed: ${reject}`);
              }
            );
            console.log(reject);
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
      this.title = wX("NOT LOGGED IN SHORT");
      this.button.title = this.title;
      return;
    }

    if (!operation.IsServerOp()) {
      this._visible();
      this.title = wX("UPLOAD BUTTON HOVER", this._operation.name);
      this.button.title = this.title;
      return;
    }

    if (!operation.IsWritableOp()) {
      this.title = wX("UPDATE PERM DENIED");
      this.button.title = this.title;
      this._invisible();
      return;
    }

    if (!operation.localchanged) {
      this.title = wX("UPDATE HOVER NOT CHANGED", this._operation.name);
      this.button.title = this.title;
      this._invisible();
      return;
    }

    this.title = wX("UPDATE HOVER", this._operation.name);
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
