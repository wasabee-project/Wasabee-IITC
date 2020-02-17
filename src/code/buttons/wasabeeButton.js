import { WButton } from "../leafletDrawImports.js";
import WasabeeMe from "../me";
import WasabeeDialog from "../dialogs/wasabeeDialog";
import AuthDialog from "../dialogs/authDialog";
import ConfirmDialog from "../dialogs/confirmDialog";
import NewopDialog from "../dialogs/newopDialog";
import { mePromise } from "../server";

const WasabeeButton = WButton.extend({
  statics: {
    TYPE: "wasabeeButton"
  },

  initialize: function(map, container) {
    if (!map) map = window.map;
    this._map = map;

    this.type = WasabeeButton.TYPE;
    this.title = "Wasabee";
    this.handler = this._toggleActions;
    this._container = container;

    this.button = this._createButton({
      container: container,
      buttonImage: this.getIcon(),
      callback: this.handler,
      context: this
    });

    this._lastLoginState = false;

    this._loginAction = {
      title: "Log In",
      text: "Log In",
      callback: () => {
        this.disable();
        const ad = new AuthDialog(this._map);
        ad.enable();
      },
      context: this
    };

    this._teamAction = {
      title: "Teams",
      text: "List Wasabee Teams",
      callback: () => {
        this.disable();
        const wd = new WasabeeDialog(this._map);
        wd.enable();
      },
      context: this
    };

    this._alwaysActions = [
      {
        title: "Create a new operation",
        text: "New Op",
        callback: () => {
          this.disable();
          // closeAllDialogs();
          const nb = new NewopDialog(this._map);
          nb.enable();
        },
        context: this
      },
      {
        title: "Clear all locally stored ops",
        text: "Clear Local Ops",
        callback: () => {
          this.disable();
          const con = new ConfirmDialog(this._map);
          con.setup(
            "Clear Local Ops",
            "Are you sure you want to remove all operations from the local storage? Ops stored on the server will be restored at the next sync.",
            () => {
              window.plugin.wasabee.resetOps();
              window.plugin.wasabee.setupLocalStorage();
            }
          );
          con.enable();
        },
        context: this
      },
      {
        title: "Force pull of /me from server (TESTING ONLY)",
        text: "/me",
        callback: async () => {
          try {
            const me = await mePromise();
            alert(JSON.stringify(me));
          } catch (e) {
            alert(e);
          }
          this.disable();
        },
        context: this
      }
    ];

    // build and display as if not logged in
    this.actionsContainer = this._getActions();
    // L.DomUtil.addClass(this.actionsContainer, "leaflet-draw-actions-top");
    this._container.appendChild(this.actionsContainer);

    // check login state and update if necessary
    this.Wupdate(this._container);
  },

  getIcon: function() {
    if (this._lastLoginState) {
      return window.plugin.wasabee.static.images.toolbar_wasabeebutton_in;
    } else {
      return window.plugin.wasabee.static.images.toolbar_wasabeebutton_out;
    }
  },

  _getActions: function() {
    let tmp = [];
    if (!this._lastLoginState) {
      tmp = [this._loginAction];
    } else {
      tmp = [this._teamAction];
    }
    return this._createSubActions(tmp.concat(this._alwaysActions));
  },

  Wupdate: function() {
    const loggedIn = WasabeeMe.isLoggedIn();
    if (loggedIn != this._lastLoginState) {
      this._lastLoginState = loggedIn;
      this.button.children[0].src = this.getIcon();

      const old = this.actionsContainer;
      this.actionsContainer = this._getActions();
      old.parentNode.replaceChild(this.actionsContainer, old);
    }
  }
});

export default WasabeeButton;
