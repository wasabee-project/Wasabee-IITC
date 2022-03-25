import { WDialog } from "../leafletClasses";
import { GetWasabeeServer, SetWasabeeServer, setIntelID } from "../server";
import PromptDialog from "./promptDialog";
import { sendLocation, fullSync } from "../uiCommands";
import { wX } from "../wX";
import { postToFirebase } from "../firebaseSupport";
import WasabeeMe from "../model/me";
import { displayError, ServerError } from "../error";
import {
  isAuthAvailable,
  getAccessToken,
  sendAccessToken,
  sendOneTimeToken,
} from "../auth";
import { constants } from "../static";

const AuthDialog = WDialog.extend({
  statics: {
    TYPE: "authDialog",
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    if (
      localStorage[window.plugin.wasabee.static.constants.SEND_LOCATION_KEY] ===
      "true"
    )
      sendLocation();
  },

  _successLogin: function (me) {
    me.store();
    window.map.fire("wasabee:login");
    this.closeDialog();
    fullSync();
    if (me.querytoken)
      setIntelID(window.PLAYER.nickname, window.PLAYER.team, me.querytoken);
  },

  _displayDialog: function () {
    if (isAuthAvailable()) {
      displayError(wX("AUTH INCOMPAT"));
      return;
    }

    const content = L.DomUtil.create("div", "content");
    this._server = L.DomUtil.create("input", "", content);
    this._server.readOnly = true;
    this._server.value = GetWasabeeServer();

    const ua = L.DomUtil.create("div", "useragent", content);
    this._android = false;
    this._ios = false;

    // "Mozilla/5.0 (X11; Linux x86_64; rv:17.0) Gecko/20130810 Firefox/17.0 Iceweasel/17.0.8"
    if (navigator.userAgent.search("Iceweasel/") != -1) {
      this._android = true;
      // ua.innerHTML = "<span class='enl'>IITC-Mobile-Android with fake user agent</span><br/>" + navigator.userAgent;
    }
    if (navigator.userAgent.search("Linux; Android") != -1) {
      this._android = true;
      // ua.innerHTML = "<span class='res'>IITC-Mobile-Andorid without fake user agent</span><br/>" + navigator.userAgent;
    }

    if (
      navigator.userAgent.search("iPhone") != -1 ||
      navigator.userAgent.search("iPad") != -1
    ) {
      this._ios = true;
      this._android = false;
      if (navigator.userAgent.search("Safari/") == -1) {
        // bad ones do not contain "Safari/
        ua.textContent = wX("IOS NEED FAKE UA");
      }
    }

    const gapiButton = L.DomUtil.create("button", "gapi", content);
    gapiButton.textContent = wX("LOG IN");

    L.DomEvent.on(gapiButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      gapiButton.disabled = true;
      gapiButton.textContent = "... loading ...";
      this.gapiAuth();
    });

    if (!this._android && !this._ios) {
      const gapiSelectButton = L.DomUtil.create("button", "gapi", content);
      gapiSelectButton.textContent = wX("AUTH_SELECT_ACCOUNT");
      L.DomEvent.on(gapiSelectButton, "click", (ev) => {
        L.DomEvent.stop(ev);
        gapiSelectButton.disabled = true;
        gapiSelectButton.textContent = "... loading ...";
        this.gsapiAuthChoose();
      });
    }

    const changeServerButton = L.DomUtil.create("button", "server", content);
    changeServerButton.textContent = wX("CHANGE SERVER");
    L.DomEvent.on(changeServerButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      const serverDialog = new PromptDialog({
        title: wX("CHANGE SERVER"),
        label: wX("CHANGE SERVER PROMPT"),
        suggestions: window.plugin.wasabee.static.publicServers.map((e) => ({
          text: `${e.name} (${e.url})`,
          value: e.url,
        })),
        callback: () => {
          if (serverDialog.inputField.value) {
            SetWasabeeServer(serverDialog.inputField.value);
            this._server.value = GetWasabeeServer();
            WasabeeMe.purge();
          }
          window.map.fire("wasabee:defensivekeys");
        },
        placeholder: GetWasabeeServer(),
      });
      serverDialog.enable();
    });

    const oneTimeButton = L.DomUtil.create("button", "server", content);
    oneTimeButton.textContent = wX("dialog.auth.ott.button");
    L.DomEvent.on(oneTimeButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      const text = L.DomUtil.create("span");
      text.innerHTML = wX("dialog.auth.ott.text", {
        url: `${constants.WEBUI_DEFAULT}/#/settings`,
      });
      const ottDialog = new PromptDialog({
        title: wX("dialog.auth.ott.title"),
        label: text,
        callback: async () => {
          if (ottDialog.inputField.value) {
            try {
              const me = await sendOneTimeToken(ottDialog.inputField.value);
              this._successLogin(me);
              postToFirebase({ id: "wasabeeLogin", method: "One Time Token" });
            } catch (e) {
              console.error(e);
              displayError(e);
            }
          }
          window.map.fire("wasabee:defensivekeys");
        },
        placeholder: "smurf-tears-4twn",
      });
      ottDialog.enable();
    });

    const buttons = {};
    buttons[wX("CLOSE")] = () => {
      this.closeDialog();
    };

    this.createDialog({
      title: wX("AUTH REQUIRED"),
      html: content,
      width: "auto",
      dialogClass: "auth",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.mustauth,
    });
  },

  // this works in most cases
  // but fails on android if the account logged into intel is different than the one used for Wasabee
  gapiAuth: async function () {
    try {
      const token = await getAccessToken(false);
      const me = await sendAccessToken(token);
      postToFirebase({ id: "wasabeeLogin", method: "gapiAuth" });
      this._successLogin(me);
    } catch (e) {
      this.disable();
      this.enable();
      if (e instanceof ServerError) {
        displayError(wX("AUTH TOKEN REJECTED", { error: e.toString() }));
      } else {
        displayError(e);
        postToFirebase({ id: "exception", error: e });
      }
    }
  },

  gsapiAuthChoose: async function () {
    try {
      const token = await getAccessToken(true);
      const me = await sendAccessToken(token);
      postToFirebase({ id: "wasabeeLogin", method: "gsapiAuthChoose" });
      this._successLogin(me);
    } catch (e) {
      this.disable();
      this.enable();
      if (e instanceof ServerError) {
        displayError(wX("AUTH TOKEN REJECTED", { error: e.toString() }));
      } else {
        displayError(e);
        postToFirebase({ id: "exception", error: e });
      }
    }
  },
});

export default AuthDialog;
