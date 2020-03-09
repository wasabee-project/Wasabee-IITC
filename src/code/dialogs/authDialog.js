import { Feature } from "../leafletDrawImports";
import { SendAccessTokenAsync, GetWasabeeServer, mePromise } from "../server";
import PromptDialog from "./promptDialog";
import AboutDialog from "./about";
import store from "../../lib/store";
// import WasabeeMe from "../me";
import { getSelectedOperation } from "../selectedOp";
import UiCommands from "../uiCommands";
import wX from "../wX";

const AuthDialog = Feature.extend({
  statics: {
    TYPE: "authDialog"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = AuthDialog.TYPE;
    Feature.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    if (!this._map) return;
    Feature.prototype.addHooks.call(this);
    this._operation = getSelectedOperation();
    this._displayDialog();
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
  },

  _displayDialog: function() {
    const syncLoggedIn = window.gapi.auth2.getAuthInstance();
    if (syncLoggedIn) {
      alert(wX("AUTH INCOMPAT"));
      return;
    }

    const content = L.DomUtil.create("div", "temp-op-dialog");

    const ua = L.DomUtil.create("div", null, content);
    // ua.textContent = "Your IITC shows as: " + navigator.userAgent + " (assuming desktop)";

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
        "<span class='res'>IITC-Mobile-Andorid without fake UA (check the Fake User Agent box in the IITC-Mobile settings)</span><br/>" +
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
        ua.innerHTML =
          "<span class='res'>You must set a custom UserAgent for webviews in the IITC-Mobile settings</span><br/>";
      } else {
        ua.innerHTML =
          "<span class='enl'>IITC-Mobile iOS w/ good custom UserAgent</span><br/>";
      }
    }

    const title = L.DomUtil.create("div", null, content);
    title.className = "desc";
    title.innerHTML = wX("AUTH DESC");

    const buttonSet = L.DomUtil.create("div", "temp-op-dialog", content);

    const sendLocDiv = L.DomUtil.create("div", null, buttonSet);
    const sendLocTitle = L.DomUtil.create("span", null, sendLocDiv);
    sendLocTitle.textContent = "Send Location: ";
    this._sendLocCheck = L.DomUtil.create("input", null, sendLocDiv);
    this._sendLocCheck.type = "checkbox";
    this._sendLocCheck.checked = window.plugin.wasabee.sendLocation
      ? window.plugin.wasabee.sendLocation
      : false;

    if (this._android) {
      const gsapiButtonOLD = L.DomUtil.create("a", null, buttonSet);
      gsapiButtonOLD.innerHTML = "Log In (quick for android)";
      L.DomEvent.on(gsapiButtonOLD, "click", () =>
        this.gsapiAuthImmediate(this)
      );
    }

    const gapiButton = L.DomUtil.create("a", null, buttonSet);
    gapiButton.innerHTML = "Log In";
    const menus = L.DomUtil.create("div", null, buttonSet);
    menus.innerHTML =
      "<span>Experimental Login Settions: <label>Prompt:</label><select id='auth-prompt'><option value='unset'>Auto</option><option value='none' selected='selected'>none (quick)</option><option value='select_account'>select_account</option></select></span>" +
      "<span><label>immediate</label>:<select id='auth-immediate'><option value='unset'>Auto (quick)</option><option value='true'>true</option><option value='false'>false</option></select></span>";
    L.DomEvent.on(gapiButton, "click", () => this.gapiAuth(this));

    // webview cannot work on android IITC-M
    if (this._ios) {
      const webviewButton = L.DomUtil.create("a", null, buttonSet);
      webviewButton.innerHTML = "Webview Log In (iOS)";
      L.DomEvent.on(webviewButton, "click", () => {
        window.open(GetWasabeeServer());
        webviewButton.style.display = "none";
        postwebviewButton.style.display = "block";
      });
      const postwebviewButton = L.DomUtil.create("a", null, buttonSet);
      postwebviewButton.innerHTML = "Verify Webview";
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

    const changeServerButton = L.DomUtil.create("a", "", buttonSet);
    changeServerButton.innerHTML = "Change Server";
    L.DomEvent.on(changeServerButton, "click", () => {
      const serverDialog = new PromptDialog();
      serverDialog.setup("Change Wasabee Server", "New Waasbee Server", () => {
        if (serverDialog.inputField.value) {
          store.set(
            window.plugin.wasabee.static.constants.SERVER_BASE_KEY,
            serverDialog.inputField.value
          );
          store.remove(window.plugin.wasabee.static.constants.AGENT_INFO_KEY);
        }
      });
      serverDialog.current = GetWasabeeServer();
      serverDialog.placeholder = "https://server.wasabee.rocks";
      serverDialog.enable();
    });

    const aboutButton = L.DomUtil.create("a", "", buttonSet);
    aboutButton.innerHTML = "About Wasabee-IITC";
    L.DomEvent.on(aboutButton, "click", () => {
      const ad = new AboutDialog();
      ad.enable();
    });

    this._dialog = window.dialog({
      title: "Authentication Required",
      width: "auto",
      height: "auto",
      html: content,
      dialogClass: "wasabee-dialog-mustauth",
      closeCallback: () => {
        if (this._sendLocCheck && this._sendLocCheck.checked) {
          window.plugin.wasabee.sendLocation = true;
          localStorage[
            window.plugin.wasabee.static.constants.SEND_LOCATION_KEY
          ] = true;
          UiCommands.sendLocation();
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
  gapiAuth: context => {
    console.log("calling new login method");
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
    console.log(options);
    window.gapi.auth2.authorize(options, response => {
      if (response.error) {
        if (response.error == "immediate_failed") {
          options.prompt = "select_account"; // try again, forces prompt but preserves "immediate" selection
          console.log(options);
          window.gapi.auth2.authorize(options, responseSelect => {
            if (responseSelect.error) {
              const err = `error from gapiAuth (select): ${responseSelect.error}: ${responseSelect.error_subtype}`;
              alert(err);
              console.log(err);
              return;
            }
            console.log("sending to Wasabee (select)");
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
                alert(tokErr);
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
          alert(tokErr);
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
            mePromise();
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
