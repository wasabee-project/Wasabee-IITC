import { WDialog } from "../leafletClasses";
import wX from "../wX";
import WasabeeOp from "../operation";
import { getSelectedOperation, makeSelectedOperation } from "../selectedOp";

const MergeDialog = WDialog.extend({
  statics: {
    TYPE: "megeDialog",
  },

  options: {
    // opOwn
    // opRemote
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  _displayDialog: function () {
    const buttons = [];
    buttons.push({
      text: "Rebase",
      click: async () => {
        await this._opRebase.store();
        if (getSelectedOperation().ID == this._opRebase.ID)
          await makeSelectedOperation(this._opRebase.ID);
        this.closeDialog();
      },
    });
    buttons.push({
      text: "Replace",
      click: async () => {
        await this.options.opRemote.store();
        if (getSelectedOperation().ID == this.options.opRemote.ID)
          await makeSelectedOperation(this.options.opRemote.ID);
        this.closeDialog();
      },
    });
    buttons.push({
      text: wX("CANCEL"),
      click: () => {
        this.closeDialog();
      },
    });
    this.createDialog({
      title: wX("MERGE_TITLE"),
      html: this._buildContent(),
      width: "auto",
      dialogClass: "merge",
      buttons: buttons,
    });
  },

  _buildContent: function () {
    const content = L.DomUtil.create("div", "container");
    const desc = L.DomUtil.create("div", "desc", content);
    desc.textContent =
      `It seems that ${this.options.opOwn.name} has local changes. ` +
      "Do you want to merge your modifications with the server OP or to replace the local version by the server version? " +
      "(or leave it for later)";

    this._opRebase = new WasabeeOp(this.options.opRemote);
    const changes = this.options.opOwn.changes();
    const summary = this._opRebase.applyChanges(changes, this.options.opOwn);
    this._opRebase.cleanAll();
    this._opRebase.remoteChanged = this.options.opOwn.remoteChanged;
    this._opRebase.localchanged = this.options.opOwn.localchanged;

    content.appendChild(this.formatSummary(summary));
    return content;
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
});

export default MergeDialog;
