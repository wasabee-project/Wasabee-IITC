import { WButton } from "../leafletClasses";
import {
  uploadOpPromise,
  updateOpPromise,
  GetWasabeeServer,
  opPromise,
} from "../server";
import WasabeeMe from "../me";
import { getSelectedOperation, makeSelectedOperation } from "../selectedOp";
import ConfirmDialog from "../dialogs/confirmDialog";
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
          await this.doUpdate(operation);
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
          console.warn(e.toString() + ": trying as update");
          try {
            await updateOpPromise(operation);
            alert(wX("UPDATED"));
            this.Wupdate(this._container, operation);
          } catch (e) {
            console.error(e);
            alert(`Upload + Update Failed: ${e.toString()}`);
          }
        }
      },
    });
  },

  Wupdate: function () {
    if (!WasabeeMe.isLoggedIn()) {
      this._invisible();
      this.title = wX("NOT LOGGED IN SHORT");
      this.button.title = this.title;
      return;
    }

    const operation = getSelectedOperation();
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

  doRebase: function (op) {
    const operation = getSelectedOperation();
    const changes = operation.changes();
    console.debug(changes);
    const summary = op.applyChanges(changes, operation);
    op.cleanAnchorList();
    op.cleanPortalList();

    let rebaseMessage = "Rebase summary:\n";
    if (!summary.compatibility.ok)
      rebaseMessage += `- old OP detected, merge ${summary.compatibility.rewrite.link} links and ${summary.compatibility.rewrite.marker} markers\n`;
    rebaseMessage += `- add ${summary.addition.link} links, ${summary.addition.marker} markers and ${summary.addition.zone} zones\n`;
    rebaseMessage += `- delete ${summary.deletion.link} links and ${summary.deletion.marker} markers\n`;
    rebaseMessage += `- ignore ${summary.edition.duplicate} new duplicates\n`;
    rebaseMessage += `- edit ${summary.edition.link} links and ${summary.edition.marker} markers\n`;
    rebaseMessage += `- delete ${summary.edition.singlePortalLink} single portal links\n`;
    rebaseMessage += `- change ${summary.edition.assignment} assignments\n`;
    return rebaseMessage;
  },

  // update operation that is either
  // - selectedOP if no conflict or rebase is disabled
  // - rebase temp op otherwise
  doUpdate: async function (operation, force = false) {
    const rebaseOnUpdate =
      localStorage[window.plugin.wasabee.static.constants.REBASE_UPDATE_KEY] ===
      "true";
    if (operation.IsServerOp()) {
      try {
        if (force) delete operation.lasteditid;
        const success = await updateOpPromise(operation);
        if (success) {
          operation.localchanged = false;
          operation.fetched = new Date().toUTCString();
          operation.fetchedOp = JSON.stringify(operation);
          operation.store();
          // reload if we use rebase
          if (operation != getSelectedOperation())
            makeSelectedOperation(operation.ID);
          alert(wX("UPDATED"));
          this.Wupdate(this._container, operation);
        } else {
          // need rebase or force
          if (!rebaseOnUpdate) {
            const md = new ConfirmDialog();
            md.setup(
              wX("UPDATE_CONFLICT_TITLE"),
              wX("UPDATE_CONFLICT_DESC"),
              () => this.doUpdate(getSelectedOperation(), true)
            );
            md.enable();
          } else {
            const lastOp = await opPromise(operation.ID);
            const rebaseMessage = this.doRebase(lastOp);
            const message = L.DomUtil.create("p");
            message.innerHTML =
              "Server OP has changed since last sync. Wasabee rebased your changes on top of the server OP. Check the summary (not visible on the map) and confirm in order to push.<br/>" +
              rebaseMessage.replaceAll(/\n/g, "<br/>");
            const md = new ConfirmDialog();
            md.setup(wX("UPDATE_CONFLICT_TITLE"), message, () =>
              this.doUpdate(lastOp)
            );
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
