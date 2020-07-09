import { WButton } from "../leafletClasses";
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
    const operation = getSelectedOperation();
    this.title = `Upload ${operation.name}`;
    this._container = container;

    this.button = this._createButton({
      title: "Upload",
      container: this._container,
      buttonImage: window.plugin.wasabee.skin.images.toolbar_upload.default,
      context: this,
      callback: () => {
        const operation = getSelectedOperation();
        if (operation.IsServerOp()) {
          updateOpPromise(operation).then(
            () => {
              alert(wX("UPDATED"));
              this.Wupdate(this._container, operation);
            },
            reject => {
              console.log(reject);
              alert(`Update Failed: ${reject}`);
            }
          );
          return;
        }
        uploadOpPromise().then(
          resolve => {
            console.log(resolve);
            // switch to the new version in local store -- uploadOpPromise stores it
            makeSelectedOperation(resolve.ID);
            alert(wX("UPLOADED"));
            this.Wupdate(this._container, resolve);
            this._invisible();
          },
          reject => {
            // this shouldn't be necessary, but the UI is behind
            updateOpPromise(operation).then(
              () => {
                const selop = getSelectedOperation();
                alert(wX("UPDATED"));
                this.Wupdate(this._container, selop);
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
    if (!WasabeeMe.isLoggedIn()) {
      this._invisible();
      this.title = wX("NOT LOGGED IN SHORT");
      this.button.title = this.title;
      return;
    }

    if (!operation.IsServerOp()) {
      this._visible();
      this.title = wX("UPLOAD BUTTON HOVER", operation.name);
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
      this.title = wX("UPDATE HOVER NOT CHANGED", operation.name);
      this.button.title = this.title;
      this._invisible();
      return;
    }

    this.title = wX("UPDATE HOVER", operation.name);
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
