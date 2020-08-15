import { WDialog } from "../leafletClasses";
import wX from "../wX";
import { postToFirebase } from "../firebaseSupport";
import { changeSkin } from "../skin";

const SkinDialog = WDialog.extend({
  statics: {
    TYPE: "skinDialog",
  },

  initialize: function (map = window.map, options) {
    this.type = SkinDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
    postToFirebase({ id: "analytics", action: SkinDialog.TYPE });

    if (!window.plugin.wasabeeSkins) window.plugin.wasabeeSkins = {};
    this._skinSet = new Set(
      Object.getOwnPropertyNames(window.plugin.wasabeeSkins)
    );
  },

  addHooks: function () {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
  },

  update: function () {},

  _buildContent() {
    const container = L.DomUtil.create("div", "content");

    const desc = L.DomUtil.create("div", "desc", container);
    desc.textContent = wX("SKINS_DESCRIPTION");

    const skinsAvailable = L.DomUtil.create("div", "desc", container);
    skinsAvailable.textContent = wX("SKINS_AVAILABLE", this._skinSet.size);

    const leftList = L.DomUtil.create("ul", "left skin-list", container);
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

    $(rightList)
      .sortable({
        connectWith: ".skin-list",
      })
      .disableSelection();
    $(leftList)
      .sortable({
        connectWith: ".skin-list",
      })
      .disableSelection()
      .on("sortupdate", () => {
        enabledSkins.splice(0);
        for (const elm of leftList.children) enabledSkins.push(elm.textContent);
        changeSkin(enabledSkins);
      });

    return container;
  },

  _displayDialog: function () {
    const content = this._buildContent();

    this._dialog = window.dialog({
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
