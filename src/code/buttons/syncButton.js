import { WButton } from "../leafletDrawImports.js";
import { opPromise } from "../server";
import WasabeeMe from "../me";
import AuthDialog from "../dialogs/authDialog";
import { getSelectedOperation, makeSelectedOperation } from "../selectedOp";
import wX from "../wX";

const SyncButton = WButton.extend({
  statics: {
    TYPE: "syncButton"
  },

  Wupdate: function() {
    // takes container & operation, not needed here
    const loggedIn = WasabeeMe.isLoggedIn();
    if (loggedIn) {
      this._syncbutton.style.display = "block";
    } else {
      this._syncbutton.style.display = "none";
    }
  },

  initialize: function(map, container) {
    if (!map) map = window.map;
    this._map = map;

    this.type = SyncButton.TYPE;
    // this.handler = null; // no handler since we do it all in this.Wupdate()
    this.title = wX("SYNC");

    this._syncbutton = this._createButton({
      container: container,
      buttonImage: window.plugin.wasabee.static.images.toolbar_download.default,
      context: this,
      callback: async () => {
        const so = getSelectedOperation();
        try {
          const me = await WasabeeMe.waitGet(true); // force update of ops list
          if (!me) {
            const ad = new AuthDialog();
            ad.enable();
          } else {
            for (const op of me.Ops) {
              opPromise(op.ID).then(
                function(newop) {
                  if (newop) {
                    newop.store();
                    if (newop.ID == so.ID) {
                      makeSelectedOperation(newop.ID);
                    }
                  }
                },
                function(err) {
                  console.log(err);
                  alert(err);
                }
              );
            }
            alert(wX("SYNC DONE"));
          }
        } catch (e) {
          alert(e);
        }
      }
    });

    // hide or show depeneding on logged in state
    this.Wupdate(); // container & operation not needed
  }
});

export default SyncButton;
