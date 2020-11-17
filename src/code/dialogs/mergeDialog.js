import { WDialog } from "../leafletClasses";
import wX from "../wX";
import WasabeeOp from "../operation";
import { getSelectedOperation, makeSelectedOperation } from "../selectedOp";

const MergeDialog = WDialog.extend({
  statics: {
    TYPE: "megeDialog",
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  _displayDialog: function () {
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
        this.options.opRemote.store();
        if (getSelectedOperation().ID == this.options.opRemote.ID)
          makeSelectedOperation(this.options.opRemote.ID);
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

  _buildContent: function () {
    const content = L.DomUtil.create("div", "container");
    const desc = L.DomUtil.create("div", "desc", content);
    desc.textContent =
      "Do you want to merge your change with the server OP or to replace the local version by the server version ?";

    this._opRebase = new WasabeeOp(this.options.opRemote);
    const changes = this.options.opOwn.changes();
    const summary = this._opRebase.applyChanges(changes, this.options.opOwn);
    this._opRebase.cleanAll();
    this._opRebase.remoteChanged = this.options.opOwn.remoteChanged;
    this._opRebase.localchanged = this.options.opOwn.localchanged;

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
