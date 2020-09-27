import { WDialog } from "../leafletClasses";
import wX from "../wX";
import { postToFirebase } from "../firebaseSupport";

// generic confirmation screen w/ ok and cancel buttons

const MergeDialog = WDialog.extend({
  statics: {
    TYPE: "megeDialog",
  },

  initialize: function (map = window.map, options) {
    this.type = MergeDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
    this._title = wX("MERGE_TITLE");
    this._label = wX("MERGE_DESC");
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
      text: wX("MERGE_UPDATE"),
      click: () => {
        this.doMerge();
        if (this._callback) this._callback(this._opDest);
        this._dialog.dialog("close");
      },
    });
    buttons.push({
      text: wX("MERGE_ONLY"),
      click: () => {
        this.doMerge();
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
      title: this._title,
      html: this._buildContent(),
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-merge",
      buttons: buttons,
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      // id: window.plugin.wasabee.static.dialogNames.XXX
    });
  },

  setup: function (opDest, opSrc, callback) {
    this._opDest = opDest;
    this._opSrc = opSrc;
    if (callback) this._callback = callback;
  },

  doMerge: function () {
    const options = {
      server: true,
      portal: {
        comment: true,
        hardness: true,
      },
      marker: {
        comment: true,
        assign: true,
        order: true,
        zone: true,
      },
      link: {
        direction: true,
        assign: true,
        order: true,
        zone: true,
      },
    };
    for (const name of [
      "Portal Comment",
      "Portal Hardness",
      "Marker Comment",
      "Marker Assign",
      "Marker Order",
      "Marker Zone",
      "Link Direction",
      "Link Assign",
      "Link Order",
      "Link Zone",
    ]) {
      const path = name.split(" ").map((s) => s.toLowerCase());
      options[path[0]][path[1]] = this[name].checked;
    }

    this._opDest.mergeOp(this._opSrc, options);
  },

  _buildContent: function () {
    const content = L.DomUtil.create("div", "container");
    const desc = L.DomUtil.create("div", "description", content);
    desc.textContent = "Use server data for:";
    for (const name of [
      "Portal Comment",
      "Portal Hardness",
      "Marker Comment",
      "Marker Assign",
      "Marker Order",
      "Marker Zone",
      "Link Direction",
      "Link Assign",
      "Link Order",
      "Link Zone",
    ]) {
      const label = L.DomUtil.create("label", null, content);
      label.textContent = name;
      this[name] = L.DomUtil.create("input", null, content);
      this[name].type = "checkbox";
    }
    return content;
  },
});

export default MergeDialog;
