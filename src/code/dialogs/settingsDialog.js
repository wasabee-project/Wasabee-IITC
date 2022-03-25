import { WDialog } from "../leafletClasses";
import wX from "../wX";
import WasabeeMe from "../model/me";
import { GetWasabeeServer, SetWasabeeServer } from "../server";
import PromptDialog from "./promptDialog";
import SkinDialog from "./skinDialog";
import { clearAllData } from "../uiCommands";

const SettingsDialog = WDialog.extend({
  statics: {
    TYPE: "settings",
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
  },

  update: function () {
    this.setContent(this._getContent());
    this.setTitle(wX("SETTINGS_TITLE"));
  },

  _addCheckBox(container, label, id, storageKey, onChange, defValue) {
    const title = L.DomUtil.create("label", "checkbox", container);
    const check = L.DomUtil.create("input", "", title);
    check.type = "checkbox";
    check.id = id;
    L.DomUtil.create("span", "", title).textContent = label;
    const sl = localStorage[storageKey];
    if (!defValue && sl === "true") check.checked = true;
    if (defValue && sl !== "false") check.checked = true;
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

    // send location on mobile
    if (window.plugin.userLocation) {
      this._addCheckBox(
        container,
        wX("SEND LOCATION"),
        "wasabee-setting-sendloc",
        window.plugin.wasabee.static.constants.SEND_LOCATION_KEY
      );
    }

    this._addCheckBox(
      container,
      wX("MERGE ON UPDATE"),
      "wasabee-setting-rebase-update",
      window.plugin.wasabee.static.constants.REBASE_UPDATE_KEY,
      null,
      true
    );

    this._addCheckBox(
      container,
      wX("AUTOLOAD"),
      "wasabee-setting-autoload",
      window.plugin.wasabee.static.constants.AUTO_LOAD_FAKED
    );

    if (window.isSmartphone()) {
      this._addCheckBox(
        container,
        wX("USE PANES ON MOBILE"),
        "wasabee-setting-usepanes",
        window.plugin.wasabee.static.constants.USE_PANES
      );
    }

    this._addCheckBox(
      container,
      wX("SEND ANALYTICS"),
      "wasabee-setting-analytics",
      window.plugin.wasabee.static.constants.SEND_ANALYTICS_KEY
    );

    this._addSelect(
      container,
      wX("AUTOLOAD_RATE"),
      window.plugin.wasabee.static.constants.PORTAL_DETAIL_RATE_KEY,
      [1, 100, 250, 500, 750, 1000].map((v) => [v, v])
    );

    this._addSelect(
      container,
      wX("TRAWL SKIP TILES"),
      window.plugin.wasabee.static.constants.TRAWL_SKIP_STEPS,
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((v) => [v, v])
    );

    const serverInfo = L.DomUtil.create("button", "server", container);
    serverInfo.textContent = wX("WSERVER", { url: GetWasabeeServer() });
    serverInfo.href = "#";
    L.DomEvent.on(serverInfo, "click", (ev) => {
      L.DomEvent.stop(ev);
      this.setServer();
    });

    const skinsButton = L.DomUtil.create("button", null, container);
    skinsButton.textContent = wX("SKINS_BUTTON");
    L.DomEvent.on(skinsButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      const skinDialog = new SkinDialog();
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
    buttons[wX("CLEAROPS BUTTON")] = () => {
      this.closeDialog();
      clearAllData();
    };

    this.createDialog({
      title: wX("SETTINGS_TITLE"),
      html: container,
      width: "auto",
      dialogClass: "settings",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.settings,
    });
  },
});

// this line allows other files to import our dialog
export default SettingsDialog;
