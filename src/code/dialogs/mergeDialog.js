import { WDialog } from "../leafletClasses";
import wX from "../wX";
import WasabeeAgent from "../model/agent";
import WasabeeOp from "../model/operation";
import { getSelectedOperation, makeSelectedOperation } from "../selectedOp";

import { computeRebaseChanges, applyRebaseChanges } from "../model/changes";

import PortalUI from "../ui/portal";
import LinkUI from "../ui/link";
import MarkerUI from "../ui/marker";
import { sanitizeState } from "../model/task";

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

  rebase: async function (changes) {
    applyRebaseChanges(this._opRebase, this.options.opOwn, changes);
    await this._opRebase.store();
    if (getSelectedOperation().ID == this._opRebase.ID)
      await makeSelectedOperation(this._opRebase.ID);
    if (this.options.updateCallback)
      this.options.updateCallback(this._opRebase);
    this.closeDialog();
  },

  useServer: async function () {
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
    this._origin = this.options.opOwn.getFetchedOp()
      ? new WasabeeOp(this.options.opOwn.getFetchedOp())
      : new WasabeeOp({
          // dummy op
          ID: this.options.opOwn.ID,
          name: this.options.opOwn.name,
          comment: this.options.opOwn.comment,
          color: this.options.opOwn.color,
          referencetime: this.options.opOwn.referencetime,
        });
    const changes = computeRebaseChanges(
      this._origin,
      this._opRebase,
      this.options.opOwn
    );
    console.debug(changes);
    const conflicts = [];

    for (const pc of changes.portals.conflict) {
      if (pc.type === "edition/edition") {
        conflicts.push({
          kind: "portal",
          conflict: pc,
          masterValue: this._opRebase.getPortal(pc.id),
          followerValue: this.options.opOwn.getPortal(pc.id),
        });
      }
    }
    for (const zc of changes.zones.conflict) {
      if (zc.type === "edition/edition") {
        conflicts.push({
          kind: "zone",
          conflict: zc,
          masterValue: this._opRebase.getZone(zc.id),
          followerValue: this.options.opOwn.getZone(zc.id),
        });
      }
    }
    // don't show double addition, caused by old export
    for (const mc of changes.markers.conflict) {
      if (mc.type !== "addition/addition") {
        conflicts.push({
          kind: "marker",
          conflict: mc,
          masterValue: this._opRebase.getMarker(mc.id),
          followerValue: this.options.opOwn.getMarker(mc.id),
        });
      }
    }
    for (const lc of changes.links.conflict) {
      if (lc.type !== "addition/addition") {
        conflicts.push({
          kind: "link",
          conflict: lc,
          masterValue: this._opRebase.getLinkById(lc.id),
          followerValue: this.options.opOwn.getLinkById(lc.id),
        });
      }
    }

    if (conflicts.length === 0) {
      this.rebase(changes);
      return;
    }

    const content = L.DomUtil.create("div", "container");
    const desc = L.DomUtil.create("div", "desc", content);
    desc.textContent = wX("MERGE_MESSAGE", { opName: this.options.opOwn.name });

    L.DomUtil.create("h3", "", content).textContent = wX(
      "dialog.merge.conflicts"
    );

    const details = L.DomUtil.create("table", "conflicts", content);
    const head = L.DomUtil.create("tr", "", details);
    // master head
    const masterHead = L.DomUtil.create("th", "master", head);
    masterHead.textContent = wX("dialog.merge.server");
    const masterRadioHead = L.DomUtil.create(
      "input",
      "",
      L.DomUtil.create("th", "master", head)
    );
    masterRadioHead.type = "radio";
    masterRadioHead.name = this.options.opOwn.ID;
    // follower head
    const followerRadioHead = L.DomUtil.create(
      "input",
      "",
      L.DomUtil.create("th", "follower", head)
    );
    followerRadioHead.type = "radio";
    followerRadioHead.name = this.options.opOwn.ID;
    const followerHead = L.DomUtil.create("th", "follower", head);
    followerHead.textContent = wX("dialog.merge.local");

    L.DomEvent.on(masterRadioHead, "change", () => {
      if (masterRadioHead.checked) {
        details
          .querySelectorAll("td.master input")
          .forEach((el) => (el.checked = true));
        for (const c of conflicts) c.conflict.value = c.masterValue;
      }
    });
    L.DomEvent.on(followerRadioHead, "change", () => {
      if (followerRadioHead.checked) {
        details
          .querySelectorAll("td.follower input")
          .forEach((el) => (el.checked = true));
        for (const c of conflicts) c.conflict.value = c.followerValue;
      }
    });

    for (const c of conflicts) {
      const row = L.DomUtil.create("tr", "", details);
      // master props
      this.formatConflict(
        c,
        c.conflict.master,
        this._opRebase,
        L.DomUtil.create("td", "master", row)
      );
      // master radio
      const masterRadio = L.DomUtil.create(
        "input",
        "",
        L.DomUtil.create("td", "master", row)
      );
      masterRadio.type = "radio";
      masterRadio.name = c.conflict.id;
      masterRadio.value = "master";
      masterRadio.checked = true;
      // follower radio
      const followerRadio = L.DomUtil.create(
        "input",
        "",
        L.DomUtil.create("td", "follower", row)
      );
      followerRadio.type = "radio";
      followerRadio.name = c.conflict.id;
      followerRadio.value = "master";
      // follower props
      this.formatConflict(
        c,
        c.conflict.follower,
        this.options.opOwn,
        L.DomUtil.create("td", "follower", row)
      );

      L.DomEvent.on(masterRadio, "change", () => {
        if (masterRadio.checked) {
          c.conflict.value = c.masterValue;
          followerRadioHead.checked = false;
        }
      });
      L.DomEvent.on(followerRadio, "change", () => {
        if (followerRadio.checked) {
          c.conflict.value = c.followerValue;
          masterRadioHead.checked = false;
        }
      });
    }

    const buttons = [];
    buttons.push({
      text: wX("MERGE_REBASE"),
      click: () => this.rebase(changes),
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

  formatConflict(conflict, change, op, container) {
    // fail safe for now
    try {
      if (conflict.kind === "link") {
        const link = this._origin.getLinkById(change.id);
        const linkDisplay = LinkUI.displayFormat(link, this._origin);
        container.appendChild(linkDisplay);
        if (change.type === "deletion") linkDisplay.classList.add("strike");
        else {
          const list = L.DomUtil.create("ul", "", container);
          for (const k in change.props) {
            this.formatProp(k, link, change.props, op, list);
          }
        }
      } else if (conflict.kind === "marker") {
        const marker = this._origin.getMarker(change.id);
        const markerDisplay = MarkerUI.displayFormat(marker, this._origin);
        container.appendChild(markerDisplay);
        if (change.type === "deletion") markerDisplay.classList.add("strike");
        else {
          const list = L.DomUtil.create("ul", "", container);
          for (const k in change.props) {
            this.formatProp(k, marker, change.props, op, list);
          }
        }
      } else if (conflict.kind === "portal") {
        const portal = this._origin.getPortal(change.id);
        const portalDisplay = PortalUI.displayFormat(portal);
        container.appendChild(portalDisplay);
        // only edition/edition
        const list = L.DomUtil.create("ul", "", container);
        for (const k in change.props) {
          this.formatProp(k, portal, change.props, op, list);
        }
      } else if (conflict.kind === "zone") {
        const zone = this._origin.getZone(change.id);
        const zoneDisplay = L.DomUtil.create("span");
        zoneDisplay.textContent = wX("dialog.merge.zone", { name: zone.name });
        container.appendChild(zoneDisplay);
        // only edition/edition
        const list = L.DomUtil.create("ul", "", container);
        for (const k in change.props) {
          this.formatProp(k, zone, change.props, op, list);
        }
      }
    } catch (e) {
      console.error(e);
      container.append(JSON.stringify(change.props));
    }
  },

  formatProp(key, old, next, op, container) {
    const li = L.DomUtil.create("li", "", container);
    // content with default value
    const keySpan = L.DomUtil.create("span", "diff-label", li);
    keySpan.textContent = key + ":";
    const oldSpan = L.DomUtil.create("span", "strike", li);
    oldSpan.textContent = old[key];
    const newSpan = L.DomUtil.create("span", "", li);
    newSpan.textContent = next[key];

    // TODO wX
    if (key === "hardness") {
      keySpan.textContent = wX("dialog.merge.prop.hardness");
    } else if (key === "comment") {
      keySpan.textContent = wX("dialog.merge.prop.comment");
    } else if (key === "assignedTo") {
      keySpan.textContent = wX("dialog.merge.prop.assignedTo");
    } else if (key === "state") {
      keySpan.textContent = wX("dialog.merge.prop.state");
      oldSpan.textContent = wX(sanitizeState(old[key]));
      newSpan.textContent = wX(sanitizeState(next[key]));
    } else if (key === "color") {
      keySpan.textContent = wX("dialog.merge.prop.color");
    } else if (key === "order") {
      keySpan.textContent = wX("dialog.merge.prop.order");
    } else if (key === "zone") {
      keySpan.textContent = wX("dialog.merge.prop.zone");
    } else if (key === "points") {
      keySpan.textContent = wX("dialog.merge.prop.zone_points");
      oldSpan.textContent = "";
      newSpan.textContent = "";
    } else if (key === "fromPortalId") {
      keySpan.textContent = wX("dialog.merge.prop.fromPortal");
    } else if (key === "toPortalId") {
      keySpan.textContent = wX("dialog.merge.prop.toPortal");
    } else if (key === "deltaminutes") {
      keySpan.textContent = wX("dialog.merge.prop.deltaminutes");
    }

    if (key === "assignedTo" || key === "completedID") {
      if (old[key])
        WasabeeAgent.get(old[key]).then(
          (a) => (oldSpan.textContent = a.getName())
        );
      if (next[key])
        WasabeeAgent.get(next[key]).then(
          (a) => (newSpan.textContent = a.getName())
        );
    }

    if (key === "fromPortalId" || key === "toPortalId") {
      oldSpan.textContent = "";
      oldSpan.appendChild(
        PortalUI.displayFormat(this._origin.getPortal(old[key]))
      );
      newSpan.textContent = "";
      newSpan.appendChild(PortalUI.displayFormat(op.getPortal(next[key])));
    }
  },
});

export default MergeDialog;
