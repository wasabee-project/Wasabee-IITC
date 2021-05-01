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
        const operation = await getSelectedOperation();
        if (operation.IsServerOp()) {
          await this.doUpdate(operation);
          return;
        }

        try {
          const r = await uploadOpPromise();
          // switch to the new version in local store -- uploadOpPromise stores it
          await makeSelectedOperation(r.ID);
          alert(wX("UPLOADED"));
          this.Wupdate();
          // this._invisible();
        } catch (e) {
          // not triggered this in a while...
          console.warn(e.toString() + ": trying as update");
          try {
            await updateOpPromise(operation);
            alert(wX("UPDATED"));
            this.Wupdate();
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
      this.title = wX("UPLOAD BUTTON HOVER", { opName: operation.name });
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

  formatSummary(summary) {
    const list = [];
    if (!summary.compatibility.ok)
      list.push(
        `old OP detected, merge ${summary.compatibility.rewrite.link} links and ${summary.compatibility.rewrite.marker} markers`
      );
    if (
      summary.addition.link + summary.addition.marker + summary.addition.zone >
      0
    )
      list.push(
        `add ${summary.addition.link} links, ${summary.addition.marker} markers and ${summary.addition.zone} zones`
      );
    if (summary.addition.ignored > 0)
      list.push(
        `ignore ${summary.addition.ignored} new portals/links/markers already present on remote`
      );
    if (summary.deletion.link + summary.deletion.marker > 0)
      list.push(
        `delete ${summary.deletion.link} links and ${summary.deletion.marker} markers`
      );
    if (
      summary.edition.portal + summary.edition.link + summary.edition.marker >
      0
    )
      list.push(
        `edit ${summary.edition.portal} portals, ${summary.edition.link} links and ${summary.edition.marker} markers`
      );
    if (summary.edition.duplicate > 0)
      list.push(`ignore ${summary.edition.duplicate} new duplicates`);
    if (summary.edition.removed > 0)
      list.push(
        `ignore ${summary.edition.removed} links and markers removed from remote`
      );
    if (summary.edition.singlePortalLink > 0)
      list.push(
        `delete ${summary.edition.singlePortalLink} single portal links`
      );
    if (summary.edition.assignment > 0)
      list.push(`change ${summary.edition.assignment} assignments`);

    const rebaseMessage = L.DomUtil.create("div");
    rebaseMessage.append("Rebase summary:");

    if (list.length > 0) {
      const rebaseList = L.DomUtil.create("ul", null, rebaseMessage);
      for (const item of list)
        L.DomUtil.create("li", null, rebaseList).textContent = item;
    } else {
      rebaseMessage.textContent = "No local change detected...";
    }

    return rebaseMessage;
  },

  doRebase: function (op) {
    const operation = getSelectedOperation();
    const changes = operation.changes();
    console.debug(changes);
    const summary = op.applyChanges(changes, operation);
    op.cleanAnchorList();
    op.cleanPortalList();

    return summary;
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
          await operation.store();
          // reload if we use rebase
          if (operation != getSelectedOperation())
            await makeSelectedOperation(operation.ID);
          alert(wX("UPDATED"));
          this.Wupdate();
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
            const summary = this.doRebase(lastOp);
            const message = L.DomUtil.create("div");
            message.textContent =
              "Server OP has changed since last sync. Wasabee rebased your changes on top of the server OP. Check the summary (not visible on the map) and confirm in order to push.";
            message.appendChild(this.formatSummary(summary));
            const md = new ConfirmDialog({
              title: wX("UPDATE_CONFLICT_TITLE"),
              label: message,
              type: "operation",
              callback: () => this.doUpdate(lastOp),
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
