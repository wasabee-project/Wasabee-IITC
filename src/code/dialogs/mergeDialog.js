import { WDialog } from "../leafletClasses";
import wX from "../wX";
import WasabeeOp from "../operation";
import Sortable from "../sortable";
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
    this._opRebase = new WasabeeOp(this.options.opRemote);
    const origin = new WasabeeOp(this.options.opOwn.fetchedOp);
    const changes = this.options.opOwn.changes(origin);
    const summary = this._opRebase.applyChanges(changes, this.options.opOwn);
    this._opRebase.cleanAll();
    this._opRebase.remoteChanged = this.options.opOwn.remoteChanged;
    this._opRebase.localchanged = this.options.opOwn.localchanged;

    const content = L.DomUtil.create("div", "container");
    const desc = L.DomUtil.create("div", "desc", content);
    desc.textContent =
      `It seems that ${this.options.opOwn.name} has local changes. ` +
      "Do you want to merge your modifications with the server OP or to replace the local version by the server version? " +
      "(or leave it for later)";
    content.appendChild(this.formatSummary(summary));

    const details = L.DomUtil.create("div", "details", content);
    {
      const div = L.DomUtil.create("div", "local", details);
      div.innerHTML = "<span>My changes</span>";
      div.appendChild(this.formatChanges(changes, origin, this.options.opOwn));
    }
    {
      const div = L.DomUtil.create("div", "merge", details);
      div.innerHTML = "<span>Merge changes</span>";
      div.appendChild(
        this.formatChanges(
          this._opRebase.changes(origin),
          origin,
          this._opRebase
        )
      );
    }
    {
      const div = L.DomUtil.create("div", "server", details);
      div.innerHTML = "<span>Server changes</span>";
      div.appendChild(
        this.formatChanges(
          this.options.opRemote.changes(origin),
          origin,
          this.options.opRemote
        )
      );
    }

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
      html: content,
      width: "auto",
      dialogClass: "merge",
      buttons: buttons,
    });
  },

  formatSummary: function (summary) {
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

  formatChanges: function (changes, origin, operation) {
    const sortable = new Sortable();
    sortable.fields = [
      {
        name: " ",
        value: (e) => e.type,
        format: (cell, value) => {
          cell.textContent = value;
        },
      },
      {
        name: " ",
        value: (e) => {
          let v = "";
          if (e.data.type === "link") {
            v = e.data.link.ID;
          } else if (e.data.type === "portal") {
            v = e.data.portal.id;
          } else if (e.data.type === "marker") {
            v = e.data.marker.ID;
          }
          return v.slice(0, 4);
        },
        format: (cell, value) => {
          cell.innerHTML = `<code>${value}</code>`;
        },
      },
      {
        name: "Entry",
        value: (e) => e.data.type,
        format: (cell, value, e) => {
          const op = e.type === "-" ? origin : operation;
          if (e.data.type === "link") {
            cell.appendChild(e.data.link.displayFormat(op));
          } else if (e.data.type === "portal") {
            cell.appendChild(e.data.portal.displayFormat());
          } else if (e.data.type === "marker") {
            const portal = op.getPortal(e.data.marker.portalId);
            cell.appendChild(portal.displayFormat());
          } else {
            cell.textContent = value;
          }
          if (e.type === "~") {
            const pre = L.DomUtil.create("code", null, cell);
            const diff = e.data.diff.map((a) =>
              a[0].endsWith("ortalId") ? [a[0], origin.getPortal(a[1]).name] : a
            );
            pre.textContent = JSON.stringify(diff);
          }
        },
      },
    ];

    const items = [];
    for (const a of changes.addition) {
      items.push({
        type: "+",
        data: a,
      });
    }
    for (const e of changes.edition) {
      items.push({
        type: "~",
        data: e,
      });
    }
    for (const d of changes.deletion) {
      items.push({
        type: "-",
        data: d,
      });
    }

    sortable.items = items;
    return sortable.table;
  },
});

export default MergeDialog;
