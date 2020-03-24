import { WButton } from "../leafletClasses";
import WasabeeMe from "../me";
import WasabeeDialog from "../dialogs/wasabeeDialog";
import AuthDialog from "../dialogs/authDialog";
import ConfirmDialog from "../dialogs/confirmDialog";
import NewopDialog from "../dialogs/newopDialog";
import { resetOps, setupLocalStorage } from "../selectedOp";
import DefensiveKeysDialog from "../dialogs/defensiveKeysDialog";
import wX from "../wX";

const WasabeeButton = WButton.extend({
  statics: {
    TYPE: "wasabeeButton"
  },

  initialize: function(map, container) {
    if (!map) map = window.map;
    this._map = map;

    this.type = WasabeeButton.TYPE;
    this.title = wX("WASABEE BUTTON TITLE");
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
      title: wX("LOG IN"),
      text: wX("LOG IN"),
      callback: () => {
        this.disable();
        const ad = new AuthDialog(this._map);
        ad.enable();
      },
      context: this
    };

    this._teamAction = {
      title: wX("TEAMS BUTTON TITLE"),
      text: wX("TEAMS BUTTON"),
      callback: () => {
        this.disable();
        const wd = new WasabeeDialog(this._map);
        wd.enable();
      },
      context: this
    };

    this._alwaysActions = [
      {
        title: wX("NEWOP BUTTON TITLE"),
        text: wX("NEWOP BUTTON"),
        callback: () => {
          this.disable();
          // closeAllDialogs();
          const nb = new NewopDialog(this._map);
          nb.enable();
        },
        context: this
      },
      {
        title: wX("CLEAROPS BUTTON TITLE"),
        text: wX("CLEAROPS BUTTON"),
        callback: () => {
          this.disable();
          const con = new ConfirmDialog(this._map);
          con.setup(wX("CLEAROPS BUTTON TITLE"), wX("CLEAROPS PROMPT"), () => {
            resetOps();
            setupLocalStorage();
          });
          con.enable();
        },
        context: this
      }
    ];

    this._Dactions = [
      {
        title: wX("WD BUTTON TITLE"),
        text: wX("WD BUTTON"),
        callback: () => {
          this.disable();
          const dkd = new DefensiveKeysDialog();
          dkd.enable();
        },
        context: this
      }
    ];

    // build and display as if not logged in
    this.actionsContainer = this._getActions();
    // L.DomUtil.addClass(this.actionsContainer, "leaflet-draw-actions-top");
    this._container.appendChild(this.actionsContainer);

    // check login state and update if necessary
    this.Wupdate(); // takes container and operation, not needed here
  },

  getIcon: function() {
    if (this._lastLoginState) {
      return window.plugin.wasabee.static.images.toolbar_wasabeebutton_in
        .default;
    } else {
      return window.plugin.wasabee.static.images.toolbar_wasabeebutton_out
        .default;
    }
  },

  _getActions: function() {
    let tmp = [];
    if (!this._lastLoginState) {
      tmp = [this._loginAction];
    } else {
      tmp = [this._teamAction];
    }

    tmp = tmp.concat(this._alwaysActions);

    if (this._lastLoginState) {
      tmp = tmp.concat(this._Dactions);
    }

    return this._createSubActions(tmp);
  },

  Wupdate: function() {
    // takes container and operation as args, but we don't need them
    const loggedIn = WasabeeMe.isLoggedIn();

    // only change the icon if the state changes -- may be overkill trying to save a few cycles
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
