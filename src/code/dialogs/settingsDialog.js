import { WDialog } from "../leafletClasses";
import wX from "../wX";
import WasabeeMe from "../me";
import { GetWasabeeServer, SetWasabeeServer } from "../server";
import PromptDialog from "./promptDialog";
import SkinDialog from "./skinDialog";

const SettingsDialog = WDialog.extend({
  statics: {
    TYPE: "settings",
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    window.map.on("wasabee:uiupdate:settings", this.update, this);
    if (this._smallScreen) {
      this._displaySmallDialog();
    } else {
      this._displayDialog();
    }
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.map.off("wasabee:uiupdate:settings", this.update, this);
  },

  update: function () {
    this.setContent(this._getContent());
    // TODO also update the title
  },

  _addCheckBox(container, label, id, storageKey, onChange) {
    const title = L.DomUtil.create("label", null, container);
    title.textContent = label;
    title.htmlFor = id;
    const check = L.DomUtil.create("input", null, container);
    check.type = "checkbox";
    check.id = id;
    const sl = localStorage[storageKey];
    if (sl === "true") check.checked = true;
    L.DomEvent.on(check, "change", (ev) => {
      L.DomEvent.stop(ev);
      localStorage[storageKey] = check.checked;
      if (onChange) onChange(check.checked);
    });
  },

  _addSelect(container, label, storageKey, options, onChange) {
    const title = L.DomUtil.create("label", null, container);
    title.textContent = label;
    const select = L.DomUtil.create("select", null, container);

    const current = localStorage[storageKey];
    for (const [k, v] of options) {
      const option = L.DomUtil.create("option", null, select);
      option.textContent = k;
      option.value = v;
      if (v == current) option.selected = true;
    }
    L.DomEvent.on(select, "change", (ev) => {
      L.DomEvent.stop(ev);
      localStorage[storageKey] = select.value;
      if (onChange) onChange(select.value);
    });
  },

  _getContent: function () {
    // use leaflet's DOM object creation, not bare DOM or Jquery
    const container = L.DomUtil.create("div", "container");

    const strings = [];
    for (const l in window.plugin.wasabee.skin.strings) {
      strings.push([l, l]);
    }
    this._addSelect(
      container,
      wX("LANG"),
      window.plugin.wasabee.static.constants.LANGUAGE_KEY,
      strings,
      () => {
        // update everything -- if for no other reason than to provide a means for users to force-update everything
        window.map.fire("wasabee:ui:lang");
      }
    );

    this._addCheckBox(
      container,
      wX("SEND LOCATION"),
      "wasabee-setting-sendloc",
      window.plugin.wasabee.static.constants.SEND_LOCATION_KEY
    );

    this._addSelect(
      container,
      wX("SKIP_CONFIRM"),
      window.plugin.wasabee.static.constants.SKIP_CONFIRM,
      [
        [wX("SKIP_CONFIRM_NEVER"), "never"],
        [wX("SKIP_CONFIRM_ENTITY"), "entity"],
        [wX("SKIP_CONFIRM_ALWAYS"), "always"],
      ]
    );

    this._addCheckBox(
      container,
      wX("SEND ANALYTICS"),
      "wasabee-setting-analytics",
      window.plugin.wasabee.static.constants.SEND_ANALYTICS_KEY
    );

    const urpKey =
      window.plugin.wasabee.static.constants.MULTIMAX_UNREACHABLE_KEY;
    if (!localStorage[urpKey]) {
      localStorage[urpKey] = '{"lat": -74.2,"lng:"-143.4}';
    }
    const pairs = [
      ["Antarctic West", '{"lat":-74.2,"lng":-143.4}'],
      ["Antarctic East", '{"lat":-74.2,"lng":30.0}'],
      ["Equatorial Atlantic", '{"lat":-2.66,"lng":-4.28}'],
      ["Arctic West", '{"lat":74.2,"lng":-143.4}'],
      ["Arctic East", '{"lat":78.5,"lng":143.4}'],
    ];
    this._addSelect(container, "Multimax test point", urpKey, pairs);

    this._addCheckBox(
      container,
      "Rebase on update (alpha, may break your op)",
      "wasabee-setting-rebase-update",
      window.plugin.wasabee.static.constants.REBASE_UPDATE_KEY
    );

    this._addCheckBox(
      container,
      wX("AUTOLOAD"),
      "wasabee-setting-autoload",
      window.plugin.wasabee.static.constants.AUTO_LOAD_FAKED
    );

    this._addSelect(
      container,
      wX("AUTOLOAD_RATE"),
      window.plugin.wasabee.static.constants.PORTAL_DETAIL_RATE_KEY,
      [1, 100, 250, 500, 750, 1000].map((v) => [v, v])
    );

    const serverInfo = L.DomUtil.create("button", "server", container);
    serverInfo.textContent = wX("WSERVER", { url: GetWasabeeServer() });
    serverInfo.href = "#";
    L.DomEvent.on(serverInfo, "click", (ev) => {
      L.DomEvent.stop(ev);
      this.setServer();
    });

    this._addSelect(
      container,
      "Trawl Skip Tiles",
      window.plugin.wasabee.static.constants.TRAWL_SKIP_STEPS,
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((v) => [v, v])
    );

    if (window.isSmartphone()) {
      this._addCheckBox(
        container,
        "Use panes (need reload)",
        "wasabee-setting-usepanes",
        window.plugin.wasabee.static.constants.USE_PANES
      );
    }

    const skinsButton = L.DomUtil.create("button", null, container);
    skinsButton.textContent = wX("SKINS_BUTTON");
    L.DomEvent.on(skinsButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      const skinDialog = new SkinDialog(window.map);
      skinDialog.enable();
    });

    return container;
  },

  setServer: function () {
    const serverDialog = new PromptDialog({
      title: wX("CHANGE_WAS_SERVER"),
      label: wX("NEW_WAS_SERVER"),
      suggestions: window.plugin.wasabee.static.publicServers.map((e) => ({
        text: `${e.name} (${e.url})`,
        value: e.url,
      })),
      callback: () => {
        if (serverDialog.inputField.value) {
          SetWasabeeServer(serverDialog.inputField.value);
          WasabeeMe.purge();
        }
      },
      placeholder: GetWasabeeServer(),
    });
    serverDialog.enable();
  },

  // define our work in _displayDialog
  _displayDialog: function () {
    const container = this._getContent();

    const buttons = {};
    buttons[wX("OK")] = () => {
      this.closeDialog();
    };

    this.createDialog({
      title: wX("SETTINGS"),
      html: container,
      width: "auto",
      dialogClass: "settings",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.settings,
    });
  },

  // small-screen versions go in _displaySmallDialog
  _displaySmallDialog: function () {
    // for this dialog, the small screen is the same as the normal
    this._displayDialog();
  },
});

// this line allows other files to import our dialog
export default SettingsDialog;
