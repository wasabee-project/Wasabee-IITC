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
      context: this
    });

    this.actionsContainer = this._createActions([
      {
        title: "Log In",
        text: "Log In",
        callback: () => {
          const ad = new AuthDialog(this._map);
          ad.enable();
        },
        context: this
      },
      {
        title: "Teams",
        text: "List Wasabee Teams",
        callback: () => {
          const wd = new WasabeeDialog(this._map);
          wd.enable();
        },
        context: this
      },
      {
        title: "Create a new operation",
        text: "New Op",
        callback: () => {
          // closeAllDialogs();
          const nb = new NewopDialog(this._map);
          // this.disable();
          nb.enable();
        },
        context: this
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
        context: this
      }
    ]);
    // this.actionsContainer.style.top = "26px";
    L.DomUtil.addClass(this.actionsContainer, "leaflet-draw-actions-top");
    container.appendChild(this.actionsContainer);

    this.handler.on(
      "enabled",
      () => {
        this.actionsContainer.style.display = "block";
      },
      this
    );
    this.handler.on(
      "disabled",
      () => {
        this.actionsContainer.style.display = "none";
      },
      this
    );
  },

  getIcon: function() {
    if (WasabeeMe.isLoggedIn()) {
      return window.plugin.wasabee.static.images.toolbar_wasabeebutton_in;
    } else {
      return window.plugin.wasabee.static.images.toolbar_wasabeebutton_out;
    }
  },

  _displayDialog: function() {
    if (WasabeeMe.isLoggedIn()) {
      this.handler = new WasabeeDialog(this._map);
    } else {
      this.handler = new AuthDialog(this._map);
    }
    this.handler.enable();
  }

  /* update: function() {
    // const img = this.button. child[0]  // change out the image
    // img = this.getIcon();
    // change out the actions
  }, */
});

export default WasabeeButton;
