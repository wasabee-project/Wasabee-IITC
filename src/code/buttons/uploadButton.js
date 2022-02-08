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
import { displayError, displayInfo } from "../error";

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
          this.button.classList.add("loading");
          const r = await uploadOpPromise();
          // switch to the new version in local store -- uploadOpPromise stores it
          await makeSelectedOperation(r.ID);
          displayInfo(wX("UPLOADED"));
          this.update();
          // this._invisible();
        } catch (e) {
          // not triggered this in a while...
          console.warn(e.toString() + ": trying as update");
          try {
            await updateOpPromise(operation);
            displayInfo(wX("UPDATED"));
            this.update();
          } catch (e) {
            console.error(e);
            displayError(`Upload + Update Failed: ${e.toString()}`);
          }
          this.button.classList.remove("loading");
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
        this.button.classList.add("loading");
        const success = await updateOpPromise(operation);
        if (success) {
          operation.localchanged = false;
          operation.fetched = new Date().toUTCString();
          operation.fetchedOp = JSON.stringify(operation);
          await operation.store();
          // reload if we use rebase
          if (operation != getSelectedOperation())
            await makeSelectedOperation(operation.ID);
          displayInfo(wX("UPDATED"));
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
              cancelText: wX("dialog.merge.cancel_upload"),
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
    }
  },
});

export default UploadButton;
