import { WButton } from "../leafletDrawImports.js";
import { opPromise } from "../server";
import WasabeeMe from "../me";
import AuthDialog from "../dialogs/authDialog";
import { getSelectedOperation, makeSelectedOperation } from "../selectedOp";

const SyncButton = WButton.extend({
  statics: {
    TYPE: "syncButton"
  },

  Wupdate: function() {
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
    this.title = "Download Available Operations";

    this._syncbutton = this._createButton({
      container: container,
      buttonImage: window.plugin.wasabee.static.images.toolbar_download,
      context: this,
      callback: () => {
        const so = getSelectedOperation();
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
                      makeSelectedOperation(newop.ID);
                    }
                  }
                },
                function(err) {
                  console.log(err);
                  // const ad = new AuthDialog();
                  // ad.enable();
                  alert(err);
                  window.runHooks("wasabeeUIUpdate", so);
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

    // hide or show depeneding on logged in state
    this.Wupdate();
  }
});

export default SyncButton;
