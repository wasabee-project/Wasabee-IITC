import { WDialog } from "../leafletClasses";
import {
  SendAccessTokenAsync,
  GetWasabeeServer,
  mePromise,
  SetWasabeeServer,
} from "../server";
import PromptDialog from "./promptDialog";
import { getSelectedOperation } from "../selectedOp";
import { sendLocation } from "../uiCommands";
import { wX, getLanguage } from "../wX";
import WasabeeMe from "../me";

const AuthDialog = WDialog.extend({
  statics: {
    TYPE: "authDialog",
  },

  initialize: function (map = window.map, options) {
    this.type = AuthDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
  },

  addHooks: function () {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    this._operation = getSelectedOperation();
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
  },

  randomTip: function () {
    const lang = getLanguage();
    if (!window.plugin.wasabee.static.tips[lang]) return;
    const tips = window.plugin.wasabee.static.tips[lang];
    const keys = Object.keys(tips);
    // XXX use prompt dialog?
    alert(tips[keys[(keys.length * Math.random()) << 0]]);
  },

  _displayDialog: function () {
    const syncLoggedIn = window.gapi.auth2.getAuthInstance();
    if (syncLoggedIn) {
      alert(wX("AUTH INCOMPAT"));
      return;
    }

    console.log(document.cookie);

    const content = L.DomUtil.create("div", "content");

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
    if (this._andoroid) {
      title.textContent = wX("AUTH ANDROID");
    }

    if (this._android) {
      const gsapiButtonOLD = L.DomUtil.create("button", "andriod", content);
      gsapiButtonOLD.textContent = wX("LOG IN QUICK");
      L.DomEvent.on(gsapiButtonOLD, "click", (ev) => {
        L.DomEvent.stop(ev);
        this.gsapiAuthImmediate.call(this);
      });
      // XXX until people test the other
      gsapiButtonOLD.style.display = "none";
    }

    const gapiButton = L.DomUtil.create("button", "gapi", content);
    gapiButton.textContent = wX("LOG IN");
    // XXX until we can figure out why IITC-M iOS doesn't set the cookie very often
    if (this._ios) gapiButton.style.display = "none";

    // XXX this needs to go away
    const menus = L.DomUtil.create("div", "options", content);
    menus.innerHTML =
      "<span>Login Settings: <label>Prompt:</label><select id='auth-prompt'><option value='unset'>Auto</option><option value='none' selected='selected'>none (quick)</option><option value='select_account'>select_account</option></select></span> &nbsp; " +
      "<span><label>Immediate</label>: <select id='auth-immediate'><option value='unset'>Auto (quick)</option><option value='true'>true</option><option value='false'>false</option></select></span>";
    if (!this._android) menus.style.display = "none";

    L.DomEvent.on(gapiButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      this.gapiAuth.call(this);
    });

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
        mePromise().then(
          () => {
            this._dialog.dialog("close");
          },
          (err) => {
            alert(err);
          }
        );
      });
    }

    const changeServerButton = L.DomUtil.create("button", "server", content);
    changeServerButton.textContent = wX("CHANGE SERVER");
    L.DomEvent.on(changeServerButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      const serverDialog = new PromptDialog();
      serverDialog.setup(
        wX("CHANGE SERVER"),
        wX("CHANGE SERVER PROMPT"),
        () => {
          if (serverDialog.inputField.value) {
            SetWasabeeServer(serverDialog.inputField.value);
            WasabeeMe.purge();
          }
        }
      );
      serverDialog.current = GetWasabeeServer();
      serverDialog.placeholder = "https://server.wasabee.rocks";
      serverDialog.enable();
    });

    const buttons = {};
    buttons[wX("OK")] = () => {
      this._dialog.dialog("close");
    };

    this._dialog = window.dialog({
      title: wX("AUTH REQUIRED"),
      html: content,
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-auth",
      closeCallback: () => {
        if (
          localStorage[
            window.plugin.wasabee.static.constants.SEND_LOCATION_KEY
          ] === "true"
        )
          sendLocation();
        this.randomTip();
        window.runHooks("wasabeeUIUpdate", getSelectedOperation());
        window.runHooks("wasabeeDkeys");
      },
      id: window.plugin.wasabee.static.dialogNames.mustauth,
    });
    this._dialog.dialog("option", "buttons", buttons);
  },

  gsapiAuthImmediate: function () {
    window.gapi.auth2.authorize(
      {
        prompt: "none",
        client_id: window.plugin.wasabee.static.constants.OAUTH_CLIENT_ID,
        scope: "email profile openid",
        response_type: "id_token permission",
      },
      (response) => {
        if (response.error) {
          // on immediate_failed, try again with "select_account" settings
          if (response.error == "immediate_failed") {
            console.log("switching to gsapiAuthChoose");
            this.gsapiAuthChoose.call(this);
          } else {
            // error but not immediate_failed
            this._dialog.dialog("close");
            const err = `error from gsapiAuthImmediate: ${response.error}: ${response.error_subtype}`;
            alert(err);
            return;
          }
        }
        SendAccessTokenAsync(response.access_token).then(
          async () => {
            // could be const me = WasabeeMe.get();
            // but do this by hand to 'await' it
            // not changing to WasabeeMe.waitGet(); because this needs to die
            // eslint-disable-next-line
            const me = await mePromise();
            // me.store(); // mePromise calls WasabeeMe.create, which calls .store()
            this._dialog.dialog("close");
          },
          (reject) => {
            console.log(reject);
            alert(`send access token failed: $(reject)`);
          }
        );
      }
    );
  },

  // this is probably the most correct, but doesn't seem to work properly
  // does making it async change anything?
  gapiAuth: async function () {
    // console.log("calling main log in method");
    const options = {
      client_id: window.plugin.wasabee.static.constants.OAUTH_CLIENT_ID,
      scope: "email profile openid",
      response_type: "id_token permission",
    };
    const immediate = document.getElementById("auth-immediate");
    if (immediate && immediate.value != "unset")
      options.immediate = immediate.value;
    const gPrompt = document.getElementById("auth-prompt");
    if (gPrompt && gPrompt.value != "unset") options.prompt = gPrompt.value;
    window.gapi.auth2.authorize(options, (response) => {
      if (response.error) {
        if (response.error == "immediate_failed") {
          options.prompt = "select_account"; // try again, forces prompt but preserves "immediate" selection
          window.gapi.auth2.authorize(options, (responseSelect) => {
            if (responseSelect.error) {
              const err = `error from gapiAuth (immediate_failed): ${responseSelect.error}: ${responseSelect.error_subtype}`;
              alert(err);
              console.log(err);
              return;
            }
            // console.log("sending to Wasabee (immediate_failed)");
            SendAccessTokenAsync(responseSelect.access_token).then(
              () => {
                if (this._ios) {
                  window.setTimeout(() => {
                    this._dialog.dialog("close");
                  }, 1500); // give time for the cookie to settle
                } else {
                  this._dialog.dialog("close");
                }
              },
              (tokErr) => {
                console.log(tokErr);
                alert(tokErr);
                this._dialog.dialog("close");
              }
            );
          });
        } else {
          this._dialog.dialog("close");
          const err = `error from gapiAuth: ${response.error}: ${response.error_subtype}`;
          console.log(err);
          alert(err);
        }
        return;
      }
      // console.log("sending to Wasabee");
      SendAccessTokenAsync(response.access_token).then(
        () => {
          if (this._ios) {
            window.setTimeout(() => {
              this._dialog.dialog("close");
            }, 1500); // give time for the cookie to settle
          } else {
            this._dialog.dialog("close");
          }
        },
        (tokErr) => {
          console.log(tokErr);
          alert(tokErr);
          this._dialog.dialog("close");
        }
      );
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
      (response) => {
        if (response.error) {
          this._dialog.dialog("close");
          const err = `error from gsapiAuthChoose: ${response.error}: ${response.error_subtype}`;
          alert(err);
          return;
        }
        SendAccessTokenAsync(response.access_token).then(
          () => {
            mePromise(); // needs .then...
            this._dialog.dialog("close");
          },
          (reject) => {
            console.log(reject);
            alert(`send access token failed (gsapiAuthChoose): $(reject)`);
          }
        );
      }
    );
  },
});

export default AuthDialog;
