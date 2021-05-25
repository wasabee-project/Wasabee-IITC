import { WDialog } from "../leafletClasses";
import {
  SendAccessTokenAsync,
  GetWasabeeServer,
  SetWasabeeServer,
  oneTimeToken,
  setIntelID,
} from "../server";
import PromptDialog from "./promptDialog";
import { sendLocation, fullSync } from "../uiCommands";
import { wX } from "../wX";
import { postToFirebase } from "../firebaseSupport";
import WasabeeMe from "../me";

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

  _displayDialog: function () {
    const syncLoggedIn = window.gapi.auth2.getAuthInstance();
    if (syncLoggedIn) {
      alert(wX("AUTH INCOMPAT"));
      return;
    }

    const content = L.DomUtil.create("div", "content");
    this._server = L.DomUtil.create("div", null, content);
    this._server.textContent = GetWasabeeServer();

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

    const title = L.DomUtil.create("div", "desc", content);
    if (this._ios) {
      title.textContent = wX("AUTH IOS");
    }
    if (this._android) {
      title.textContent = wX("AUTH ANDROID");
    }

    const gapiButton = L.DomUtil.create("button", "gapi", content);
    gapiButton.textContent = wX("LOG IN");
    // XXX until we can figure out why IITC-M iOS doesn't set the cookie very often
    if (this._ios) gapiButton.style.display = "none";

    L.DomEvent.on(gapiButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      gapiButton.disabled = true;
      gapiButton.textContent = "... loading ...";
      this.gapiAuth.call(this);
    });

    // XXX this needs to go away
    const menus = L.DomUtil.create("div", "options", content);
    menus.innerHTML =
      "<span>Login Settings: <label>Prompt:</label><select id='auth-prompt'><option value='unset'>Auto</option><option value='none' selected='selected'>none (quick)</option><option value='select_account'>select_account</option></select></span> &nbsp; " +
      "<span><label>Immediate</label>: <select id='auth-immediate'><option value='unset'>Auto (quick)</option><option value='true'>true</option><option value='false'>false</option></select>" +
      "</span><span><label>ux_mode</label>: <select id='ux-mode'><option value='unset'>Unset</option><option value='popup'>Popup</option><option value='redirect'>Redirect</option></select>";
    if (!this._android) menus.style.display = "none";

    if (!this._android && !this._ios) {
      const gapiSelectButton = L.DomUtil.create("button", "gapi", content);
      gapiSelectButton.textContent = wX("AUTH_SELECT_ACCOUNT");
      L.DomEvent.on(gapiSelectButton, "click", (ev) => {
        L.DomEvent.stop(ev);
        gapiSelectButton.disabled = true;
        gapiSelectButton.textContent = "... loading ...";
        this.gsapiAuthChoose.call(this);
      });
    }

    // webview cannot work on android IITC-M
    if (this._ios) {
      const webviewButton = L.DomUtil.create("button", "webview", content);
      webviewButton.textContent = wX("WEBVIEW");
      L.DomEvent.on(webviewButton, "click", (ev) => {
        L.DomEvent.stop(ev);
        window.open(GetWasabeeServer());
        webviewButton.style.display = "none";
        postwebviewButton.style.display = "block";
      });
      const postwebviewButton = L.DomUtil.create("button", "webview", content);
      postwebviewButton.textContent = wX("WEBVIEW VERIFY");
      postwebviewButton.style.display = "none";
      L.DomEvent.on(postwebviewButton, "click", async (ev) => {
        L.DomEvent.stop(ev);
        try {
          const newme = await WasabeeMe.waitGet(true);
          newme.store();
          window.map.fire("wasabee:login");
          this.closeDialog();
          fullSync();
          setIntelID(
            window.PLAYER.nickname,
            window.PLAYER.team,
            newme.querytoken
          ); // no need to await
          postToFirebase({ id: "wasabeeLogin", method: "iOS" });
        } catch (e) {
          console.error(e);
          alert(e.toString());
        }
        window.map.fire("wasabee:defensivekeys");
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
            this._server.textContent = GetWasabeeServer();
            WasabeeMe.purge();
          }
          window.map.fire("wasabee:defensivekeys");
        },
        placeholder: GetWasabeeServer(),
      });
      serverDialog.enable();
    });

    const oneTimeButton = L.DomUtil.create("button", "server", content);
    oneTimeButton.textContent = "One Time Token Login";
    L.DomEvent.on(oneTimeButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      const ottDialog = new PromptDialog({
        title: "One Time Token",
        label: "One Time Token",
        callback: async () => {
          if (ottDialog.inputField.value) {
            try {
              await oneTimeToken(ottDialog.inputField.value);
              const newme = await WasabeeMe.waitGet(true);
              newme.store();
              window.map.fire("wasabee:login");
              this.closeDialog();
              fullSync();
              setIntelID(
                window.PLAYER.nickname,
                window.PLAYER.team,
                newme.querytoken
              ); // no need to await
              postToFirebase({ id: "wasabeeLogin", method: "One Time Token" });
            } catch (e) {
              console.error(e);
              alert(e.toString());
            }
          }
          window.map.fire("wasabee:defensivekeys");
        },
        placeholder: "smurf-tears-4twn",
      });
      ottDialog.enable();
    });

    const buttons = {};
    buttons[wX("OK")] = () => {
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
  gapiAuth: function () {
    const options = {
      client_id: window.plugin.wasabee.static.constants.OAUTH_CLIENT_ID,
      scope: "email profile openid",
      response_type: "id_token permission",
    };
    const immediate = document.getElementById("auth-immediate");
    if (immediate && immediate.value != "unset")
      options.immediate = immediate.value;
    const uxmode = document.getElementById("ux-mode");
    if (uxmode && uxmode.value != "unset") options.ux_mode = uxmode.value;
    const gPrompt = document.getElementById("auth-prompt");
    if (gPrompt && gPrompt.value != "unset") options.prompt = gPrompt.value;
    window.gapi.auth2.authorize(options, async (response) => {
      if (response.error) {
        postToFirebase({ id: "exception", error: response.error });
        if (response.error === "idpiframe_initialization_failed") {
          alert("You need enable cookies or allow [*.]google.com");
        }
        if (
          response.error == "user_logged_out" ||
          response.error == "immediate_failed"
        ) {
          options.prompt = "select_account"; // try again, forces prompt but preserves "immediate" selection
          window.gapi.auth2.authorize(options, async (responseSelect) => {
            if (responseSelect.error) {
              postToFirebase({ id: "exception", error: response.error });
              const err = `error from gapiAuth (immediate_failed): ${responseSelect.error}: ${responseSelect.error_subtype}`;
              alert(err);
              console.log(err);
              return;
            }
            try {
              const r = await SendAccessTokenAsync(responseSelect.access_token);
              const newme = new WasabeeMe(r);
              newme.store();
              window.map.fire("wasabee:login");
              this.closeDialog();
              fullSync(); // draws map and teams
              setIntelID(
                window.PLAYER.nickname,
                window.PLAYER.team,
                newme.querytoken
              ); // no need to await
              postToFirebase({
                id: "wasabeeLogin",
                method: "gsapiAuth (immediate_failed)",
              });
            } catch (e) {
              alert(wX("AUTH TOKEN REJECTED", { error: e.toString() }));
              console.error(e);
              this.closeDialog();
            }
          });
        } else {
          this.closeDialog();
          const err = `error from gapiAuth: ${response.error}: ${response.error_subtype}`;
          postToFirebase({ id: "exception", error: err });
          console.log(err);
          alert(err);
        }
        return;
      }
      try {
        const r = await SendAccessTokenAsync(response.access_token);
        const newme = new WasabeeMe(r);
        newme.store();
        window.map.fire("wasabee:login");
        this.closeDialog();
        fullSync(); // draws map and teams
        postToFirebase({ id: "wasabeeLogin", method: "gsapiAuth" });
        setIntelID(
          window.PLAYER.nickname,
          window.PLAYER.team,
          newme.querytoken
        ); // no need to await
      } catch (e) {
        postToFirebase({ id: "exception", error: e.toString() });
        console.error(e);
        alert(e.toString());
        this.closeDialog();
      }
    });
  },

  gsapiAuthChoose: function () {
    window.gapi.auth2.authorize(
      {
        prompt: "select_account",
        client_id: window.plugin.wasabee.static.constants.OAUTH_CLIENT_ID,
        scope: "email profile openid",
        response_type: "id_token permission",
        // immediate: false // this seems to break everything
      },
      async (response) => {
        if (response.error) {
          this.closeDialog();
          const err = `error from gsapiAuthChoose: ${response.error}: ${response.error_subtype}`;
          alert(err);
          postToFirebase({ id: "exception", error: err });
          return;
        }
        try {
          const r = await SendAccessTokenAsync(response.access_token);
          const newme = new WasabeeMe(r);
          newme.store();
          window.map.fire("wasabee:login");
          this.closeDialog();
          fullSync();
          postToFirebase({ id: "wasabeeLogin", method: "gsapiAuthChoose" });
          setIntelID(
            window.PLAYER.nickname,
            window.PLAYER.team,
            newme.querytoken
          ); // no need to await
        } catch (e) {
          console.error(e);
          alert(`send access token failed (gsapiAuthChoose): ${e.toString()}`);
          postToFirebase({ id: "exception", error: e.toString() });
        }
      }
    );
  },
});

export default AuthDialog;
