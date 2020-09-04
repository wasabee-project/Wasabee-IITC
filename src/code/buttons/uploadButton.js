import { WButton } from "../leafletClasses";
import { uploadOpPromise, updateOpPromise, GetWasabeeServer } from "../server";
import WasabeeMe from "../me";
import { getSelectedOperation, makeSelectedOperation } from "../selectedOp";
import wX from "../wX";

const UploadButton = WButton.extend({
  statics: {
    TYPE: "uploadButton",
  },

  initialize: function (map = window.map, container) {
    this._map = map;

    this.type = UploadButton.TYPE;
    // this.handler = null;
    const operation = getSelectedOperation();
    this.title = wX("UPLOAD BUTTON HOVER", operation.name);
    this._container = container;

    this.button = this._createButton({
      title: this.title,
      container: this._container,
      className: "wasabee-toolbar-upload",
      context: this,
      callback: async () => {
        const operation = getSelectedOperation();
        if (operation.IsServerOp()) {
          try {
            await updateOpPromise(operation);
            alert(wX("UPDATED"));
            this.Wupdate(this._container, operation);
          } catch (e) {
            console.log(e);
            alert(`Update Failed: ${e}`);
          }
          return;
        }

        try {
          const r = await uploadOpPromise();
          // switch to the new version in local store -- uploadOpPromise stores it
          makeSelectedOperation(r.ID);
          alert(wX("UPLOADED"));
          this.Wupdate(this._container, r);
          // this._invisible();
        } catch (e) {
          // not triggered this in a while...
          console.log(e + ": trying as update");
          try {
            await updateOpPromise(operation);
            alert(wX("UPDATED"));
            this.Wupdate(this._container, operation);
          } catch (e) {
            console.log(e);
            alert(`Upload + Update Failed: ${e}`);
          }
        }
      },
    });
  },

  Wupdate: function (container, operation) {
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
      this._invisible();
      this.title = wX("UPDATE PERM DENIED");
      this.button.title = this.title;
      return;
    }

    if (!operation.localchanged) {
      this._invisible();
      this.title = wX("UPDATE HOVER NOT CHANGED", operation.name);
      this.button.title = this.title;
      return;
    }

    if (operation.server && operation.server != GetWasabeeServer()) {
      this._invisible();
      this.title = wX("UPDATE HOVER WRONG SERVER", operation.name);
      this.button.title = this.title;
      return;
    }

    this._visible();
    this.title = wX("UPDATE HOVER", operation.name);
    this.button.title = this.title;
  },

  _visible: function () {
    this.button.style.display = "block";
  },

  _invisible: function () {
    this.button.style.display = "none";
  },
});

export default UploadButton;
