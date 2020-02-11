import { Feature } from "../leafletDrawImports";
import { SendAccessTokenAsync, GetWasabeeServer } from "../server";
import PromptDialog from "./promptDialog";
import store from "../../lib/store";

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
    this._operation = window.plugin.wasabee.getSelectedOperation();
    this._displayDialog();
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
  },

  _displayDialog: function() {
    const content = document.createElement("div");
    const title = content.appendChild(document.createElement("div"));
    title.className = "desc";
    title.innerHTML =
      "In order to use the server functionality, you must log in.<br/>";
    const buttonSet = content.appendChild(document.createElement("div"));
    buttonSet.className = "temp-op-dialog";
    const visitButton = buttonSet.appendChild(document.createElement("a"));
    const isMobile = "undefined" != typeof window.android && window.android;
    const isiOS = navigator.userAgent.match(/iPhone|iPad|iPod/i);
    visitButton.innerHTML = "Log In";
    if (!isiOS) {
      visitButton.addEventListener(
        "click",
        async () => {
          window.gapi.auth2.authorize(
            {
              prompt: isMobile ? "none" : "select_account",
              client_id: window.plugin.Wasabee.Constants.OAUTH_CLIENT_ID,
              scope: "email profile openid",
              response_type: "id_token permission"
            },
            async response => {
              if (response.error) {
                console.error(response.error, response.error_subtype);
                return;
              }
              await SendAccessTokenAsync(response.access_token);
              // WasabeeMe.get(); // UIUpdate does this too
              this._dialog.dialog("close");
              window.runHooks(
                "wasabeeUIUpdate",
                window.plugin.wasabee.getSelectedOperation()
              ); // or addButtons()?
            }
          );
        },
        false
      );
    } else {
      const server = GetWasabeeServer();
      visitButton.addEventListener("click", window.open(server), false);
    }

    const changeServerButton = buttonSet.appendChild(
      document.createElement("a")
    );
    changeServerButton.innerHTML = "Change Server";
    changeServerButton.addEventListener("click", () => {
      const serverDialog = new PromptDialog();
      serverDialog.setup("Change Wasabee Server", "New Waasbee Server", () => {
        if (serverDialog.inputField.value) {
          store.set(
            window.plugin.Wasabee.Constants.SERVER_BASE_KEY,
            serverDialog.inputField.value
          );
          store.remove(window.plugin.Wasabee.Constants.AGENT_INFO_KEY);
        }
      });
      serverDialog.current = GetWasabeeServer();
      serverDialog.placeholder = "https://server.wasabee.rocks/";
      serverDialog.enable();
    });

    this._dialog = window.dialog({
      title: "Authentication Required",
      width: "auto",
      height: "auto",
      html: content,
      dialogClass: "wasabee-dialog-mustauth",
      closeCallback: () => {
        const selectedOperation = window.plugin.wasabee.getSelectedOperation();
        window.runHooks("wasabeeUIUpdate", selectedOperation);
        // remove/delete this._dialog
      },
      id: window.plugin.Wasabee.static.dialogNames.mustauth
    });
  }
});

export default AuthDialog;
