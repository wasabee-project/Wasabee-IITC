import { WButton } from "../leafletClasses";
import { opPromise, GetWasabeeServer } from "../server";
import WasabeeMe from "../me";
import AuthDialog from "../dialogs/authDialog";
import {
  getSelectedOperation,
  makeSelectedOperation,
  opsList,
  getOperationByID,
  removeOperation,
  changeOpIfNeeded,
  duplicateOperation,
} from "../selectedOp";
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
      className: "wasabee-toolbar-sync",
      context: this,
      title: this.title,
      callback: async () => {
        const so = getSelectedOperation();
        const server = GetWasabeeServer();

        try {
          const me = await WasabeeMe.waitGet(true);
          const promises = new Array();
          const opsID = new Set(me.Ops.map((o) => o.ID));

          // delete operations absent from server unless the owner
          const serverOps = new Set(
            opsList()
              .map(getOperationByID)
              .filter((op) => op)
              .filter((op) => op.server == server && !opsID.has(op.ID))
          );
          for (const op of serverOps) {
            // if owned, duplicate the OP
            if (op.IsOwnedOp()) {
              const newop = duplicateOperation(op.ID);
              newop.name = op.name;
              newop.store();
            }
            removeOperation(op.ID);
          }
          if (serverOps.size > 0)
            console.log(
              "remove",
              Array.from(serverOps).map((op) => op.ID)
            );

          for (const opID of opsID) {
            promises.push(opPromise(opID));
          }
          const ops = await Promise.all(promises);
          for (const newop of ops) newop.store();

          // replace current op by the server version if any
          if (ops.some((op) => op.ID == so.ID)) makeSelectedOperation(so.ID);
          // change op if the current does not exist anymore
          else if (!opsList().includes(so.ID)) changeOpIfNeeded();
          // update UI to reflect new ops list
          else window.runHooks("wasabeeUIUpdate");

          alert(wX("SYNC DONE"));
        } catch (e) {
          console.error(e);
          new AuthDialog().enable();
        }
      },
    });

    // hide or show depeneding on logged in state
    this.Wupdate(); // container & operation not needed
  },
});

export default SyncButton;
