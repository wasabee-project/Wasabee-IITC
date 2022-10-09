import { WButton } from "../leafletClasses";
import {
  uploadOpPromise,
  updateOpPromise,
  GetWasabeeServer,
  opPromise,
} from "../server";
import { WasabeeMe } from "../model";
import { getSelectedOperation, makeSelectedOperation } from "../selectedOp";
import ConfirmDialog from "../dialogs/confirmDialog";
import ConflictDialog from "../dialogs/conflictDialog";
import wX from "../wX";
import { displayError, displayInfo, ServerError } from "../error";

const UploadButton = WButton.extend({
  statics: {
    TYPE: "uploadButton",
  },

  needWritePermission: true,

  initialize: function (container) {
    this.type = UploadButton.TYPE;
    // this.handler = null;
    const operation = getSelectedOperation();
    this.title = wX("UPLOAD BUTTON HOVER", { opName: operation.name });
    this._container = container;

    this.button = this._createButton({
      title: this.title,
      container: this._container,
      className: "wasabee-toolbar-upload",
      context: this,
      callback: async () => {
        const operation = await getSelectedOperation();
        if (operation.isServerOp()) {
          this.doUpdate(operation);
        } else {
          this.doUpload(operation);
        }
      },
    });

    window.map.on("wasabee:ui:skin wasabee:ui:lang", this.update, this);
  },

  update: function () {
    if (!WasabeeMe.isLoggedIn()) {
      this._invisible();
      this.title = "";
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
      this.title = "";
      this.button.title = this.title;
      return;
    }

    if (!operation.localchanged) {
      this._invisible();
      this.title = "";
      this.button.title = this.title;
      return;
    }

    if (operation.server && operation.server != GetWasabeeServer()) {
      this._invisible();
      this.title = "";
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
    this.button.classList.remove("loading");
  },

  //
  doUpload: async function (operation) {
    this.button.classList.add("loading");
    try {
      const r = await uploadOpPromise();
      // switch to the new version in local store -- uploadOpPromise stores it
      await makeSelectedOperation(r.ID);
      displayInfo(wX("UPLOADED"));
      this.button.classList.remove("loading");
      this.update();
    } catch (e) {
      if (e instanceof ServerError) {
        if (e.code == 406) {
          displayError(`Upload Failed: ${e.toString()}`);
          return;
        }
      }
      // not triggered this in a while...
      console.warn(e.toString() + ": trying as update");
      this.doUpdate(operation);
    }
  },

  // update operation that is either
  // - selectedOP if no conflict or rebase is disabled
  // - rebase temp op otherwise
  doUpdate: async function (operation, force = false) {
    const rebaseOnUpdate =
      localStorage[window.plugin.wasabee.static.constants.REBASE_UPDATE_KEY] !==
      "false";

    try {
      if (force) delete operation.lasteditid;
      this.button.classList.add("loading");
      const success = await updateOpPromise(operation);
      if (success) {
        await operation.store();
        // reload if we use rebase
        if (operation != getSelectedOperation())
          await makeSelectedOperation(operation.ID);
        this.update();
      } else {
        // need rebase or force
        if (!rebaseOnUpdate) {
          const md = new ConfirmDialog({
            title: wX("UPDATE_CONFLICT_TITLE"),
            label: wX("UPDATE_CONFLICT_DESC"),
            type: "operation",
            callback: () => this.doUpdate(operation, true),
          });
          md.enable();
        } else {
          const lastOp = await opPromise(operation.ID);
          const md = new ConflictDialog({
            title: wX("UPDATE_CONFLICT_TITLE"),
            opOwn: getSelectedOperation(),
            opRemote: lastOp,
            updateCallback: (op) => this.doUpdate(op, true),
            cancelText: wX("dialog.conflict.cancel_upload"),
          });
          md.enable();
        }
      }
    } catch (e) {
      console.error(e);
      displayError(`Update Failed: ${e.toString()}`);
    }
    this.button.classList.remove("loading");
    return;
  },
});

export default UploadButton;
