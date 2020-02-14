import { WButton, WButtonHandler } from "../leafletDrawImports.js";
import WasabeeMe from "../me";
import WasabeeDialog from "../dialogs/wasabeeDialog";
import AuthDialog from "../dialogs/authDialog";
import ConfirmDialog from "../dialogs/confirmDialog";
import NewopDialog from "../dialogs/newopDialog";

const WasabeeButton = WButton.extend({
  statics: {
    TYPE: "wasabeeButton"
  },

  initialize: function(map, container) {
    if (!map) map = window.map;
    this._map = map;

    this.type = WasabeeButton.TYPE;
    this.title = "Wasabee Status";
    this.handler = new WButtonHandler(map);

    this.button = this._createButton({
      container: container,
      buttonImage: this.getIcon(),
      callback: this.handler,
      context: this.handler
    });

    this._lastLoginState = false;

    this._loginAction = {
      title: "Log In",
      text: "Log In",
      callback: () => {
        const ad = new AuthDialog(this._map);
        ad.enable();
      },
      context: this.handler
    };

    this._teamAction = {
      title: "Teams",
      text: "List Wasabee Teams",
      callback: () => {
        const wd = new WasabeeDialog(this._map);
        wd.enable();
      },
      context: this.handler
    };

    this._alwaysActions = [
      {
        title: "Create a new operation",
        text: "New Op",
        callback: () => {
          // closeAllDialogs();
          const nb = new NewopDialog(this._map);
          // this.disable();
          nb.enable();
        },
        context: this.handler
      },
      {
        title: "Clear all locally stored ops",
        text: "Clear Local Ops",
        callback: () => {
          const con = new ConfirmDialog(this._map);
          con.setup(
            "Clear Local Ops",
            "Are you sure you want to remove all operations from the local storage? Ops stored on the server will be restored at the next sync.",
            () => {
              // closeAllDialogs();
              window.plugin.wasabee.resetOps();
              window.plugin.wasabee.setupLocalStorage();
            }
          );
          con.enable();
        },
        context: this.handler
      }
    ];

    this.Wupdate(); // sets the icon and builds the actionsContainer

    // this.actionsContainer.style.top = "26px";
    L.DomUtil.addClass(this.actionsContainer, "leaflet-draw-actions-top");
    container.parentNode.appendChild(this.actionsContainer);

    this.handler.on(
      "enabled",
      function() {
        this.actionsContainer.style.display = "block";
      },
      this.handler
    );
    this.handler.on(
      "disabled",
      function() {
        this.actionsContainer.style.display = "none";
      },
      this.handler
    );

    console.log(this);
  },

  getIcon: function() {
    if (this._lastLoginState) {
      return window.plugin.wasabee.static.images.toolbar_wasabeebutton_in;
    } else {
      return window.plugin.wasabee.static.images.toolbar_wasabeebutton_out;
    }
  },

  getActions: function() {
    let tmp = [];
    if (!this._lastLoginState) {
      tmp = [this._loginAction];
    } else {
      tmp = [this._teamAction];
    }
    return this._createActions(tmp.concat(this._alwaysActions));
  },

  _displayDialog: function() {
    if (this._lastLoginState) {
      this.handler = new WasabeeDialog(this._map);
    } else {
      this.handler = new AuthDialog(this._map);
    }
    this.handler.enable();
  },

  Wupdate: function() {
    const loggedIn = WasabeeMe.get();
    if (loggedIn != this._lastLoginState) {
      this._lastLoginState = loggedIn;
      this.button.children[0].src = this.getIcon();
      this.actionsContainer = this.getActions();
      // replaceChild on this.container.parentNode w/ new actionsContainer
    }
  }
});

export default WasabeeButton;
