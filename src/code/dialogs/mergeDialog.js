import { WDialog } from "../leafletClasses";
import wX from "../wX";
import { postToFirebase } from "../firebaseSupport";
import WasabeeOp from "../operation";
import { getSelectedOperation, makeSelectedOperation } from "../selectedOp";

const MergeDialog = WDialog.extend({
  statics: {
    TYPE: "megeDialog",
  },

  initialize: function (map = window.map, options) {
    this.type = MergeDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
    postToFirebase({ id: "analytics", action: MergeDialog.TYPE });
  },

  addHooks: function () {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.runHooks("wasabeeUIUpdate");
  },

  _displayDialog: function () {
    if (!this._map) return;

    const buttons = [];
    buttons.push({
      text: "Rebase",
      click: () => {
        this._opRebase.store();
        if (getSelectedOperation().ID == this._opRebase.ID)
          makeSelectedOperation(this._opRebase.ID);
        this._dialog.dialog("close");
      },
    });
    buttons.push({
      text: "Replace",
      click: () => {
        this._opRemote.store();
        if (getSelectedOperation().ID == this._opRemote.ID)
          makeSelectedOperation(this._opRemote.ID);
        this._dialog.dialog("close");
      },
    });
    buttons.push({
      text: wX("CANCEL"),
      click: () => {
        this._dialog.dialog("close");
      },
    });
    this._dialog = window.dialog({
      title: wX("MERGE_TITLE"),
      html: this._buildContent(),
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-merge",
      buttons: buttons,
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
    });
  },

  setup: function (own, remote, callback) {
    this._opOwn = own;
    this._opRemote = remote;
    this._opRebase = new WasabeeOp(remote);
    if (callback) this._callback = callback;
  },

  _buildContent: function () {
    const content = L.DomUtil.create("div", "container");
    const desc = L.DomUtil.create("div", "desc", content);
    desc.textContent =
      "Do you want to merge your change with the server OP or to replace the local version by the server version ?";

    const changes = this._opOwn.changes();
    const summary = this._opRebase.applyChanges(changes, this._opOwn);
    this._opRebase.cleanAll();
    this._opRebase.remoteChanged = this._opOwn.remoteChanged;
    this._opRebase.localchanged = this._opOwn.localchanged;

    const rebaseMessage = L.DomUtil.create("div", null, content);
    rebaseMessage.append("Rebase summary:");
    const rebaseList = L.DomUtil.create("ul", null, rebaseMessage);
    if (!summary.compatibility.ok)
      L.DomUtil.create(
        "li",
        null,
        rebaseList
      ).textContent = `old OP detected, merge ${summary.compatibility.rewrite.link} links and ${summary.compatibility.rewrite.marker} markers`;
    for (const li of [
      `add ${summary.addition.link} links, ${summary.addition.marker} markers and ${summary.addition.zone} zones`,
      `delete ${summary.deletion.link} links and ${summary.deletion.marker} markers`,
      `ignore ${summary.edition.duplicate} new duplicates`,
      `edit ${summary.edition.link} links and ${summary.edition.marker} markers`,
      `delete ${summary.edition.singlePortalLink} single portal links`,
      `change ${summary.edition.assignment} assignments`,
    ])
      L.DomUtil.create("li", null, rebaseList).textContent = li;

    return content;
  },
});

export default MergeDialog;
