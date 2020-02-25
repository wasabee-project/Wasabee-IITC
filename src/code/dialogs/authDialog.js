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
    const content = L.DomUtil.create("div", "temp-op-dialog");
    const title = L.DomUtil.create("div", "", content);
    title.className = "desc";
    title.innerHTML =
      "In order to use the server functionality, you must log in.<br/>";
    const buttonSet = L.DomUtil.create("div", "temp-op-dialog", content);

    const gsapiButton = L.DomUtil.create("a", "", buttonSet);
    gsapiButton.innerHTML = "Log In (quick)";
    L.DomEvent.on(gsapiButton, "click", () => this.gsapiAuth(this));

    const gsapiButtonToo = L.DomUtil.create("a", "", buttonSet);
    gsapiButtonToo.innerHTML = "Log In (choose account)";
    L.DomEvent.on(gsapiButtonToo, "click", () => this.gsapiAuthToo(this));

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
        // await WasabeeMe.get(); // check one more time, required for webview method
        window.runHooks("wasabeeUIUpdate", getSelectedOperation());
        window.runHooks("wasabeeDkeys");
      },
      id: window.plugin.wasabee.static.dialogNames.mustauth
    });
  },

  gsapiAuth: context => {
    const syncLoggedIn = window.gapi.auth2.getAuthInstance();
    if (syncLoggedIn) {
      alert(
        "You have logged in to another plugin--one that uses a method incompatable with Wasabee"
      );
    }

    window.gapi.auth2.authorize(
      {
        prompt: "none",
        client_id: window.plugin.wasabee.static.constants.OAUTH_CLIENT_ID,
        scope: "email profile openid",
        response_type: "id_token permission"
      },
      response => {
        if (response.error) {
          // on immediate_failed, try again with slightly different settings
          if (response.error == "immediate_failed") {
            window.gapi.auth2.authorize(
              {
                // prompt: "select_account",
                scope: "email profile openid",
                response_type: "id_token permission"
                // immediate: true
              },
              response => {
                if (response.error) {
                  context._dialog.dialog("close");
                  const err = `error from authorize (depth 2): ${response.error}: ${response.error_subtype}`;
                  alert(err);
                  return;
                }
                SendAccessTokenAsync(response.access_token).then(
                  async () => {
                    const me = await mePromise();
                    console.debug(me);
                    context._dialog.dialog("close");
                  },
                  reject => {
                    console.log(reject);
                    alert(`send access token failed (depth 2): $(reject)`);
                  }
                );
              }
            );
          } else {
            // error but not immediate_failed
            context._dialog.dialog("close");
            const err = `error from authorize: ${response.error}: ${response.error_subtype}`;
            alert(err);
            return;
          }
        }
        SendAccessTokenAsync(response.access_token).then(
          async () => {
            // could be const me = WasabeeMe.get();
            // but do this by hand to 'await' it
            const me = await mePromise();
            // me.store(); // mePromise calls WasabeeMe.create, which calls .store()
            console.debug(me);
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

  gsapiAuthToo: context => {
    const syncLoggedIn = window.gapi.auth2.getAuthInstance();
    if (syncLoggedIn) {
      alert(
        "You have logged in to another plugin--one that uses a method incompatable with Wasabee"
      );
    }

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
          const err = `error from authorize: ${response.error}: ${response.error_subtype}`;
          alert(err);
          return;
        }
        SendAccessTokenAsync(response.access_token).then(
          async () => {
            const me = await mePromise();
            console.debug(me);
            context._dialog.dialog("close");
          },
          reject => {
            console.log(reject);
            alert(`send access token failed: $(reject)`);
          }
        );
      }
    );
  }
});

export default AuthDialog;
