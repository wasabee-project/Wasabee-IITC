import { WDialog } from "../leafletClasses";
import wX from "../wX";
import { changeSkin } from "../skin";
import Sortable from "sortablejs";

const SkinDialog = WDialog.extend({
  statics: {
    TYPE: "skinDialog",
  },

  initialize: function (options) {
    WDialog.prototype.initialize.call(this, options);

    if (!window.plugin.wasabeeSkins) window.plugin.wasabeeSkins = {};
    this._skinSet = new Set(
      Object.getOwnPropertyNames(window.plugin.wasabeeSkins)
    );
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  _buildContent() {
    const container = L.DomUtil.create("div", "content");

    const desc = L.DomUtil.create("div", "desc", container);
    desc.textContent = wX("SKINS_DESCRIPTION");

    const skinsAvailable = L.DomUtil.create("div", "desc", container);
    skinsAvailable.textContent = wX("SKINS_AVAILABLE", this._skinSet.size);

    const leftList = L.DomUtil.create("ol", "left skin-list", container);
    const rightList = L.DomUtil.create("ul", "right skin-list", container);

    const enabledSkins = [];
    const ss = localStorage[window.plugin.wasabee.static.constants.SKIN_KEY];
    try {
      const l = JSON.parse(ss);
      for (const s of l) if (this._skinSet.has(s)) enabledSkins.push(s);
    } catch {
      if (this._skinSet.has(ss)) enabledSkins.push(ss);
    }

    const rightSet = new Set(this._skinSet);
    for (const s of enabledSkins) {
      const item = L.DomUtil.create("li", "ui-icon-arrow-4", leftList);
      item.textContent = s;
      rightSet.delete(s);
    }
    for (const s of rightSet) {
      const item = L.DomUtil.create("li", "ui-icon-arrow-4", rightList);
      item.textContent = s;
    }

    /* eslint-disable no-new */
    new Sortable(rightList, {
      group: "shared",
    });

    /* eslint-disable no-new */
    new Sortable(leftList, {
      group: "shared",
      onSort: () => {
        enabledSkins.splice(0);
        for (const elm of leftList.children) enabledSkins.push(elm.textContent);
        changeSkin(enabledSkins);
      },
    });

    return container;
  },

  _displayDialog: function () {
    const content = this._buildContent();

    this._dialog = this.createDialog({
      title: wX("SKINS_MANAGE_TITLE"),
      html: content,
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-skin",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.skinDialog,
    });
  },
});

export default SkinDialog;
