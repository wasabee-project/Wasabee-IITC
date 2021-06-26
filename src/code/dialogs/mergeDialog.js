import { WDialog } from "../leafletClasses";
import wX from "../wX";
import WasabeeAgent from "../model/agent";
import WasabeeOp from "../model/operation";
import Sortable from "../sortable";
import { getSelectedOperation, makeSelectedOperation } from "../selectedOp";
import { drawBackgroundOp } from "../mapDrawing";

import PortalUI from "../ui/portal";
import LinkUI from "../ui/link";

const MergeDialog = WDialog.extend({
  statics: {
    TYPE: "mergeDialog",
  },

  options: {
    // title
    // opOwn
    // opRemote
    // updateCallback
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    this._layer = new L.LayerGroup();
    this._layer.addTo(window.map);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.addHooks.call(this);
    this._layer.remove();
  },

  rebase: async function () {
    await this._opRebase.store();
    if (getSelectedOperation().ID == this._opRebase.ID)
      await makeSelectedOperation(this._opRebase.ID);
    if (this.options.updateCallback)
      this.options.updateCallback(this._opRebase);
    this.closeDialog();
  },

  useServer: async function () {
    // merge blockers and related portals
    this.options.opRemote.mergeBlockers(this.options.opOwn);
    await this.options.opRemote.store();
    if (getSelectedOperation().ID == this.options.opRemote.ID)
      await makeSelectedOperation(this.options.opRemote.ID);
    this.closeDialog();
  },

  useLocal: function () {
    // nothing to do except upload
    if (this.options.updateCallback)
      this.options.updateCallback(this.options.opOwn);
    this.closeDialog();
  },

  _displayDialog: function () {
    this._opRebase = new WasabeeOp(this.options.opRemote);
    const origin = new WasabeeOp(this.options.opOwn.fetchedOp);
    const changes = this.options.opOwn.changes(origin);
    const summary = this._opRebase.applyChanges(changes, this.options.opOwn);
    this._opRebase.cleanAll();
    this._opRebase.remoteChanged = this.options.opOwn.remoteChanged;
    this._opRebase.localchanged = this.options.opOwn.localchanged;

    const remoteChanges = this.options.opRemote.changes(origin);
    const rebaseChanges = this._opRebase.changes(origin);

    // if nothing was deleted on the server,
    // and if portal swaps do not end up to 1-portal link
    // auto merge
    if (
      remoteChanges.deletion.length === 0 &&
      summary.edition.singlePortalLink === 0
    ) {
      this.rebase();
      return;
    }

    const style = {
      dashArray: [2, 8],
      opacity: 0.86,
      weight: 4,
      color: "blue",
      interactive: false,
    };
    drawBackgroundOp(this._opRebase, this._layer, style);

    const content = L.DomUtil.create("div", "container");
    const desc = L.DomUtil.create("div", "desc", content);
    desc.textContent = wX("MERGE_MESSAGE", { opName: this.options.opOwn.name });
    content.appendChild(this.formatSummary(summary));

    const details = L.DomUtil.create("div", "details", content);
    {
      const div = L.DomUtil.create("div", "local", details);
      div.innerHTML = "<span>" + wX("MERGE_CHANGES_LOCAL") + "</span>";
      div.appendChild(this.formatChanges(changes, origin, this.options.opOwn));
    }
    {
      const div = L.DomUtil.create("div", "merge", details);
      div.innerHTML = "<span>" + wX("MERGE_CHANGES_MERGE") + "</span>";
      div.appendChild(
        this.formatChanges(rebaseChanges, origin, this._opRebase)
      );
    }
    {
      const div = L.DomUtil.create("div", "server", details);
      div.innerHTML = "<span>" + wX("MERGE_CHANGES_REMOTE") + "</span>";
      div.appendChild(
        this.formatChanges(remoteChanges, origin, this.options.opRemote)
      );
    }

    const buttons = [];
    buttons.push({
      text: wX("MERGE_REBASE"),
      click: () => this.rebase(),
    });
    buttons.push({
      text: wX("MERGE_REPLACE"),
      click: () => this.useServer(),
    });
    buttons.push({
      text: wX("MERGE_LOCAL"),
      click: () => this.useLocal(),
    });
    buttons.push({
      text: wX("CANCEL"),
      click: () => this.closeDialog(),
    });
    this.createDialog({
      title: this.options.title || wX("MERGE_TITLE"),
      html: content,
      width: "auto",
      dialogClass: "merge",
      buttons: buttons,
    });
  },

  formatSummary: function (summary) {
    // wX
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
      rebaseMessage.textContent =
        "The local changes don't alter the server version.";
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
        format: async (cell, value, e) => {
          const op = e.type === "-" ? origin : operation;
          if (e.data.type === "link") {
            cell.appendChild(LinkUI.displayFormat(e.data.link, op));
          } else if (e.data.type === "portal") {
            cell.appendChild(PortalUI.displayFormat(e.data.portal));
          } else if (e.data.type === "marker") {
            const portal = op.getPortal(e.data.marker.portalId);
            cell.appendChild(PortalUI.displayFormat(portal));
          } else {
            cell.textContent = value;
          }
          if (e.type === "~") {
            const pre = L.DomUtil.create("code", null, cell);
            const diff = [];
            for (const [k, v] of e.data.diff) {
              let item = e.data.link || e.data.portal || e.data.marker;
              let prev = v;
              let cur = item[k];
              if (k.endsWith("ortalId")) {
                prev = origin.getPortal(prev).name;
                cur = operation.getPortal(cur).name;
              } else if (k === "assignedTo") {
                if (prev !== "") prev = await WasabeeAgent.get(prev);
                if (cur !== "") cur = await WasabeeAgent.get(cur);
                if (prev) prev = prev.name;
                if (cur) cur = cur.name;
              }
              diff.push([k, prev, cur]);
            }
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
