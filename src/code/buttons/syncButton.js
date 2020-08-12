import { WButton } from "../leafletClasses";
import { opPromise } from "../server";
import WasabeeMe from "../me";
import AuthDialog from "../dialogs/authDialog";
import { getSelectedOperation, makeSelectedOperation } from "../selectedOp";
import wX from "../wX";

const SyncButton = WButton.extend({
  statics: {
    TYPE: "syncButton",
  },

  Wupdate: function () {
    // takes container & operation, not needed here
    const loggedIn = WasabeeMe.isLoggedIn();
    if (loggedIn) {
      this._syncbutton.style.display = "block";
    } else {
      this._syncbutton.style.display = "none";
    }
  },

  initialize: function (map, container) {
    if (!map) map = window.map;
    this._map = map;

    this.type = SyncButton.TYPE;
    // this.handler = null; // no handler since we do it all in this.Wupdate()
    this.title = wX("SYNC");

    this._syncbutton = this._createButton({
      container: container,
      buttonImage: window.plugin.wasabee.skin.images.toolbar_download.default,
      context: this,
      callback: async () => {
        const so = getSelectedOperation();

        try {
          const me = await WasabeeMe.waitGet(true);
          const promises = new Array();
          const opsID = new Set(me.Ops.map((o) => o.ID));
          for (const opID of opsID) {
            promises.push(opPromise(opID));
          }
          const ops = await Promise.all(promises);
          for (const newop of ops) {
            newop.store();
            if (newop.ID == so.ID) {
              makeSelectedOperation(newop.ID);
            }
          }
          alert(wX("SYNC DONE"));
        } catch (e) {
          console.log(e);
          new AuthDialog().enable();
        }
      },
    });

    // hide or show depeneding on logged in state
    this.Wupdate(); // container & operation not needed
  },
});

export default SyncButton;
