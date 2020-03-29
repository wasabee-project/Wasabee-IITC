import { WDialog } from "../leafletClasses";
import {
  SendAccessTokenAsync,
  GetWasabeeServer,
  mePromise,
  SetWasabeeServer
} from "../server";
import PromptDialog from "./promptDialog";
import AboutDialog from "./about";
import { getSelectedOperation } from "../selectedOp";
import { sendLocation } from "../uiCommands";
import wX from "../wX";
import WasabeeMe from "../me";

const AuthDialog = WDialog.extend({
  statics: {
    TYPE: "authDialog"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = AuthDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    this._operation = getSelectedOperation();
    this._displayDialog();
  },

  removeHooks: function() {
    WDialog.prototype.removeHooks.call(this);
  },

  _displayDialog: function() {
    const syncLoggedIn = window.gapi.auth2.getAuthInstance();
    if (syncLoggedIn) {
      alert(wX("AUTH INCOMPAT"));
      return;
    }

    const content = L.DomUtil.create("div", null);

    const ua = L.DomUtil.create(
      "div",
      "wasabee-dialog-auth-useragent",
      content
    );
    this._android = false;
    this._ios = false;

    // "Mozilla/5.0 (X11; Linux x86_64; rv:17.0) Gecko/20130810 Firefox/17.0 Iceweasel/17.0.8"
    if (navigator.userAgent.search("Iceweasel/") != -1) {
      this._android = true;
      ua.innerHTML =
        "<span class='enl'>IITC-Mobile-Android with fake user agent</span><br/>" +
        navigator.userAgent;
    }
    if (navigator.userAgent.search("Linux; Android") != -1) {
      this._android = true;
      ua.innerHTML =
        "<span class='res'>IITC-Mobile-Andorid without fake user agent</span><br/>" +
        navigator.userAgent;
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
      title.innerHTML = wX("AUTH IOS");
    }
    if (this._andoroid) {
      title.innerHTML = wX("AUTH ANDROID");
    }

    const buttonSet = L.DomUtil.create(
      "div",
      "wasabee-dialog-auth-buttonset",
      content
    );

    const sendLocDiv = L.DomUtil.create("div", null, buttonSet);
    const sendLocTitle = L.DomUtil.create("span", null, sendLocDiv);
    sendLocTitle.textContent = wX("SEND LOCATION");
    this._sendLocCheck = L.DomUtil.create("input", null, sendLocDiv);
    this._sendLocCheck.type = "checkbox";
    this._sendLocCheck.checked = window.plugin.wasabee.sendLocation
      ? window.plugin.wasabee.sendLocation
      : false;

    if (this._android) {
      const gsapiButtonOLD = L.DomUtil.create("button", null, buttonSet);
      gsapiButtonOLD.innerHTML = wX("LOG IN QUICK");
      L.DomEvent.on(gsapiButtonOLD, "click", () =>
        this.gsapiAuthImmediate(this)
      );
    }

    const gapiButton = L.DomUtil.create("button", null, buttonSet);
    gapiButton.innerHTML = wX("LOG IN");
    const menus = L.DomUtil.create("div", null, buttonSet);
    menus.innerHTML =
      "<span>Login Settings: <label>Prompt:</label><select id='auth-prompt'><option value='unset'>Auto</option><option value='none' selected='selected'>none (quick)</option><option value='select_account'>select_account</option></select></span> &nbsp; " +
      "<span><label>Immediate</label>: <select id='auth-immediate'><option value='unset'>Auto (quick)</option><option value='true'>true</option><option value='false'>false</option></select></span>";
    L.DomEvent.on(gapiButton, "click", () => this.gapiAuth(this));

    // webview cannot work on android IITC-M
    if (this._ios) {
      const webviewButton = L.DomUtil.create("button", null, buttonSet);
      webviewButton.innerHTML = wX("WEBVIEW");
      L.DomEvent.on(webviewButton, "click", () => {
        window.open(GetWasabeeServer());
        webviewButton.style.display = "none";
        postwebviewButton.style.display = "block";
      });
      const postwebviewButton = L.DomUtil.create("button", null, buttonSet);
      postwebviewButton.innerHTML = wX("WEBVIEW VERIFY");
      postwebviewButton.style.display = "none";
      L.DomEvent.on(postwebviewButton, "click", async () => {
        mePromise().then(
          () => {
            this._dialog.dialog("close");
          },
          err => {
            alert(err);
          }
        );
      });
    }

    const changeServerButton = L.DomUtil.create("button", null, buttonSet);
    changeServerButton.innerHTML = wX("CHANGE SERVER");
    L.DomEvent.on(changeServerButton, "click", () => {
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

    const aboutButton = L.DomUtil.create("button", null, buttonSet);
    aboutButton.innerHTML = wX("ABOUT WASABEE-IITC");
    L.DomEvent.on(aboutButton, "click", () => {
      const ad = new AboutDialog();
      ad.enable();
    });

    this._dialog = window.dialog({
      title: wX("AUTH REQUIRED"),
      width: "auto",
      height: "auto",
      html: content,
      dialogClass: "wasabee-dialog wasabee-dialog-auth",
      closeCallback: () => {
        if (this._sendLocCheck && this._sendLocCheck.checked) {
          window.plugin.wasabee.sendLocation = true;
          localStorage[
            window.plugin.wasabee.static.constants.SEND_LOCATION_KEY
          ] = true;
          sendLocation();
        } else {
          window.plugin.wasabee.sendLocation = false;
          localStorage[
            window.plugin.wasabee.static.constants.SEND_LOCATION_KEY
          ] = false;
        }
        window.runHooks("wasabeeUIUpdate", getSelectedOperation());
        window.runHooks("wasabeeDkeys");
      },
      id: window.plugin.wasabee.static.dialogNames.mustauth
    });
  },

  gsapiAuthImmediate: context => {
    window.gapi.auth2.authorize(
      {
        prompt: "none",
        client_id: window.plugin.wasabee.static.constants.OAUTH_CLIENT_ID,
        scope: "email profile openid",
        response_type: "id_token permission"
      },
      response => {
        if (response.error) {
          // on immediate_failed, try again with "select_account" settings
          if (response.error == "immediate_failed") {
            console.log("switching to gsapiAuthChoose");
            context.gsapiAuthChoose(context);
          } else {
            // error but not immediate_failed
            context._dialog.dialog("close");
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
            context._dialog.dialog("close");
          },
          reject => {
            console.log(reject);
            alert(`send access token failed: $(reject)`);
          }
        );
      }
    );
  },

  // this is probably the most correct, but doesn't seem to work properly
  // does making it async change anything?
  gapiAuth: async context => {
    console.log("calling main log in method");
    const options = {
      client_id: window.plugin.wasabee.static.constants.OAUTH_CLIENT_ID,
      scope: "email profile openid",
      response_type: "id_token permission"
    };
    const immediate = document.getElementById("auth-immediate");
    if (immediate && immediate.value != "unset")
      options.immediate = immediate.value;
    const gPrompt = document.getElementById("auth-prompt");
    if (gPrompt && gPrompt.value != "unset") options.prompt = gPrompt.value;
    window.gapi.auth2.authorize(options, response => {
      if (response.error) {
        if (response.error == "immediate_failed") {
          options.prompt = "select_account"; // try again, forces prompt but preserves "immediate" selection
          window.gapi.auth2.authorize(options, responseSelect => {
            if (responseSelect.error) {
              const err = `error from gapiAuth (immediate_failed): ${responseSelect.error}: ${responseSelect.error_subtype}`;
              alert(err);
              console.log(err);
              return;
            }
            console.log("sending to Wasabee (immediate_failed)");
            SendAccessTokenAsync(responseSelect.access_token).then(
              () => {
                if (context._ios) {
                  window.setTimeout(() => {
                    context._dialog.dialog("close");
                  }, 1500); // give time for the cookie to settle
                } else {
                  context._dialog.dialog("close");
                }
              },
              tokErr => {
                console.log(tokErr);
                alert(tokErr);
                context._dialog.dialog("close");
              }
            );
          });
        } else {
          context._dialog.dialog("close");
          const err = `error from gapiAuth: ${response.error}: ${response.error_subtype}`;
          console.log(err);
          alert(err);
        }
        return;
      }
      console.log("sending to Wasabee");
      SendAccessTokenAsync(response.access_token).then(
        () => {
          if (context._ios) {
            window.setTimeout(() => {
              context._dialog.dialog("close");
            }, 1500); // give time for the cookie to settle
          } else {
            context._dialog.dialog("close");
          }
        },
        tokErr => {
          console.log(tokErr);
          alert(tokErr);
          context._dialog.dialog("close");
        }
      );
    });
  },

  gsapiAuthChoose: context => {
    window.gapi.auth2.authorize(
      {
        prompt: "select_account",
        client_id: window.plugin.wasabee.static.constants.OAUTH_CLIENT_ID,
        scope: "email profile openid",
        response_type: "id_token permission"
        // immediate: false // this seems to break everything
      },
      response => {
        if (response.error) {
          context._dialog.dialog("close");
          const err = `error from gsapiAuthChoose: ${response.error}: ${response.error_subtype}`;
          alert(err);
          return;
        }
        SendAccessTokenAsync(response.access_token).then(
          () => {
            mePromise(); // needs .then...
            context._dialog.dialog("close");
          },
          reject => {
            console.log(reject);
            alert(`send access token failed (gsapiAuthChoose): $(reject)`);
          }
        );
      }
    );
  }
});

export default AuthDialog;
