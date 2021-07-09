import { WButton } from "../leafletClasses";
import {
  uploadOpPromise,
  updateOpPromise,
  GetWasabeeServer,
  opPromise,
} from "../server";
import WasabeeMe from "../model/me";
import { getSelectedOperation, makeSelectedOperation } from "../selectedOp";
import ConfirmDialog from "../dialogs/confirmDialog";
import MergeDialog from "../dialogs/mergeDialog";
import wX from "../wX";

const UploadButton = WButton.extend({
  statics: {
    TYPE: "uploadButton",
  },

  needWritePermission: true,

  initialize: function (container) {
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
        const operation = await getSelectedOperation();
        if (operation.isServerOp()) {
          await this.doUpdate(operation);
          return;
        }

        try {
          const r = await uploadOpPromise();
          // switch to the new version in local store -- uploadOpPromise stores it
          await makeSelectedOperation(r.ID);
          alert(wX("UPLOADED"));
          this.update();
          // this._invisible();
        } catch (e) {
          // not triggered this in a while...
          console.warn(e.toString() + ": trying as update");
          try {
            await updateOpPromise(operation);
            alert(wX("UPDATED"));
            this.update();
          } catch (e) {
            console.error(e);
            alert(`Upload + Update Failed: ${e.toString()}`);
          }
        }
      },
    });

    window.map.on("wasabee:ui:skin wasabee:ui:lang", this.update, this);
  },

  update: function () {
    if (!WasabeeMe.isLoggedIn()) {
      this._invisible();
      this.title = wX("NOT LOGGED IN SHORT");
      this.button.title = this.title;
      return;
    }

    const operation = getSelectedOperation();
    if (!operation.isServerOp()) {
      this._visible();
      this.title = wX("UPLOAD BUTTON HOVER", { opName: operation.name });
      this.button.title = this.title;
      return;
    }

    if (!operation.canWriteServer()) {
      this._invisible();
      this.title = wX("UPDATE PERM DENIED");
      this.button.title = this.title;
      return;
    }

    if (!operation.localchanged) {
      this._invisible();
      this.title = wX("UPDATE HOVER NOT CHANGED", { opName: operation.name });
      this.button.title = this.title;
      return;
    }

    if (operation.server && operation.server != GetWasabeeServer()) {
      this._invisible();
      this.title = wX("UPDATE HOVER WRONG SERVER", { opName: operation.name });
      this.button.title = this.title;
      return;
    }

    this._visible();
    this.title = wX("UPDATE HOVER", { opName: operation.name });
    this.button.title = this.title;
  },

  _visible: function () {
    this.button.style.display = "block";
  },

  _invisible: function () {
    this.button.style.display = "none";
  },

  // update operation that is either
  // - selectedOP if no conflict or rebase is disabled
  // - rebase temp op otherwise
  doUpdate: async function (operation, force = false) {
    const rebaseOnUpdate =
      localStorage[window.plugin.wasabee.static.constants.REBASE_UPDATE_KEY] !==
      "false";
    if (operation.isServerOp()) {
      try {
        if (force) delete operation.lasteditid;
        const success = await updateOpPromise(operation);
        if (success) {
          operation.localchanged = false;
          operation.fetched = new Date().toUTCString();
          operation.fetchedOp = JSON.stringify(operation);
          await operation.store();
          // reload if we use rebase
          if (operation != getSelectedOperation())
            await makeSelectedOperation(operation.ID);
          alert(wX("UPDATED"));
          this.update();
        } else {
          // need rebase or force
          if (!rebaseOnUpdate) {
            const md = new ConfirmDialog({
              title: wX("UPDATE_CONFLICT_TITLE"),
              label: wX("UPDATE_CONFLICT_DESC"),
              type: "operation",
              callback: () => this.doUpdate(getSelectedOperation(), true),
            });
            md.enable();
          } else {
            const lastOp = await opPromise(operation.ID);
            const md = new MergeDialog({
              title: wX("UPDATE_CONFLICT_TITLE"),
              opOwn: getSelectedOperation(),
              opRemote: lastOp,
              updateCallback: (op) => this.doUpdate(op, true),
            });
            md.enable();
          }
        }
      } catch (e) {
        console.error(e);
        alert(`Update Failed: ${e.toString()}`);
      }
      return;
    }
  },
});

export default UploadButton;
