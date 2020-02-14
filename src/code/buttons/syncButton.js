import { WButton } from "../leafletDrawImports.js";
import { opPromise } from "../server";
import WasabeeMe from "../me";
import AuthDialog from "../dialogs/authDialog";

const SyncButton = WButton.extend({
  statics: {
    TYPE: "syncButton"
  },

  initialize: function(map, container) {
    if (!map) map = window.map;
    this._map = map;
    this._lastLoginState = false;

    this.type = SyncButton.TYPE;
    // this.handler = null; // no handler since we do it all in this.update()
    this.title = "Download Available Operations";
    this.update(container);
  },

  update: function(container) {
    const loggedIn = WasabeeMe.isLoggedIn();
    if (loggedIn != this._lastLoginState) {
      delete this.button;
      this._lastLoginState = loggedIn;
      if (loggedIn) {
        this.button = this._loggedInButton(container);
      } else {
        this.button = this._loggedOutButton(container);
      }
    }
  },

  _loggedInButton: function(container) {
    return this._createButton({
      container: container,
      buttonImage: window.plugin.Wasabee.static.images.toolbar_download,
      context: this,
      callback: () => {
        const so = window.plugin.wasabee.getSelectedOperation();
        try {
          const me = WasabeeMe.get(true); // force update of ops list
          if (me === null) {
            const ad = new AuthDialog();
            ad.enable();
          } else {
            for (const op of me.Ops) {
              opPromise(op.ID).then(
                function(newop) {
                  if (newop != null) {
                    newop.store();
                    // if the op changed out beneath us, use the new
                    if (newop.ID == so.ID) {
                      window.plugin.wasabee.makeSelectedOperation(newop.ID);
                    }
                  }
                },
                function(err) {
                  console.log(err);
                  const ad = new AuthDialog();
                  ad.enable();
                }
              );
            }
            alert("Sync Complete");
          }
        } catch (e) {
          alert(e);
        }
      }
    });
  },

  _loggedOutButton: function(container) {
    return this._createButton({
      container: container,
      title: "not logged in",
      context: this
    });
  }
});

export default SyncButton;
