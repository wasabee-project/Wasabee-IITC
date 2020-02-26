import { Feature } from "../leafletDrawImports";
import { SendAccessTokenAsync, GetWasabeeServer, mePromise } from "../server";
import PromptDialog from "./promptDialog";
import store from "../../lib/store";
import WasabeeMe from "../me";
import { getSelectedOperation } from "../selectedOp";

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
      alert(
        "You have logged in to a plugin that uses a method incompatable with Wasabee"
      );
      return;
    }

    const content = L.DomUtil.create("div", "temp-op-dialog");
    const title = L.DomUtil.create("div", "", content);
    title.className = "desc";
    title.innerHTML =
      "In order to use the server functionality, you must log in.<br/>";
    const buttonSet = L.DomUtil.create("div", "temp-op-dialog", content);

    const gsapiButton = L.DomUtil.create("a", "", buttonSet);
    gsapiButton.innerHTML = "Log In (quick)";
    L.DomEvent.on(gsapiButton, "click", () => this.gsapiAuthImmediate(this));

    const gsapiButtonToo = L.DomUtil.create("a", "", buttonSet);
    gsapiButtonToo.innerHTML = "Log In (choose account)";
    L.DomEvent.on(gsapiButtonToo, "click", () => this.gsapiAuthChoose(this));

    // webview cannot work on android IITC-M
    if (!L.Browser.android) {
      const webviewButton = L.DomUtil.create("a", "", buttonSet);
      webviewButton.innerHTML = "Log In (webview)";
      L.DomEvent.on(webviewButton, "click", () => {
        window.open(GetWasabeeServer());
        webviewButton.style.display = "none";
        postwebviewButton.style.display = "block";
      });
      const postwebviewButton = L.DomUtil.create("a", "", buttonSet);
      postwebviewButton.innerHTML = "Verify Webview";
      postwebviewButton.style.display = "none";
      L.DomEvent.on(postwebviewButton, "click", async () => {
        window.runHooks("waabeeUIUpdate", this._operation);
        const me = await WasabeeMe.get();
        if (me) {
          alert("server data: " + JSON.stringify(me));
        } else {
          alert("server data: [pending]");
        }
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

    this._dialog = window.dialog({
      title: "Authentication Required",
      width: "auto",
      height: "auto",
      html: content,
      dialogClass: "wasabee-dialog-mustauth",
      closeCallback: () => {
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
            this.gsapiAuthChoose(context);
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
            const me = await mePromise();
            console.debug(me);
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
