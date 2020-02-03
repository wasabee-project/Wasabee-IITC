import store from "../lib/store";
import WasabeeOp from "./operation";

// needs Wasabee.Constants from scopes.js

var Wasabee = window.plugin.Wasabee;

export default function() {
  window.plugin.wasabee.setRestoreOpID = opID => {
    store.set(Wasabee.Constants.SELECTED_OP_KEY, opID);
  };

  window.plugin.wasabee.getRestoreOpID = () => {
    return store.get(Wasabee.Constants.SELECTED_OP_KEY);
  };

  window.plugin.wasabee.getSelectedOperation = () => {
    // javascript is pass-by-values for objects
    return Wasabee._selectedOp;
  };

  window.plugin.wasabee.initSelectedOperation = () => {
    if (Wasabee._selectedOp == null) {
      const toLoad = window.plugin.wasabee.getRestoreOpID();
      if (toLoad == null) {
        window.plugin.wasabee.loadNewDefaultOp();
      } else {
        // verify it exists before trying to load
        var tmp = window.plugin.wasabee.getOperationByID(toLoad);
        if (tmp == null) {
          console.log(
            "most recently loaded up not present in local store, starting with new default op"
          );
          window.plugin.wasabee.loadNewDefaultOp();
        } else {
          window.plugin.wasabee.makeSelectedOperation(toLoad);
        }
      }
    }
    return Wasabee._selectedOp;
  };

  window.plugin.wasabee.loadNewDefaultOp = () => {
    const newOp = new WasabeeOp(PLAYER.nickname, "Default Op", true);
    newOp.store();
    const op = window.plugin.wasabee.makeSelectedOperation(newOp.ID);
    return op;
  };

  // this is the function that loads an op from the store, makes it the selected op and draws it to the screen
  // only this should write to _selectedOp
  window.plugin.wasabee.makeSelectedOperation = opID => {
    if (Wasabee._selectedOp != null) {
      if (opID == Wasabee._selectedOp.ID) {
        console.log(
          "makeSelectedOperation called on the current op; replacing with version from local store. not saving live changes first"
        );
      } else {
        Wasabee._selectedOp.store();
      }
    }
    const op = window.plugin.wasabee.getOperationByID(opID);
    if (op == null) {
      console.log("makeSelectedOperation called on invalid opID");
      throw "attempted to load invalid opID";
    }
    // the only place we should change the selected op.
    Wasabee._selectedOp = op;
    window.plugin.wasabee.setRestoreOpID(Wasabee._selectedOp.ID);
    return Wasabee._selectedOp;
  };

  // use this to pull an op from local store by ID
  // wrap it in a try/catch
  window.plugin.wasabee.getOperationByID = opID => {
    let op = null;
    try {
      const v = store.get(opID);
      if (v == null) {
        console.log("getOperationByID: no such op in local store: " + opID);
      } else {
        // we can pass v directly, but this catches if the json is malformed
        const o = JSON.parse(v);
        op = WasabeeOp.create(o);
      }
    } catch (e) {
      console.log(e);
      alert(e);
    }
    return op;
  };

  // called when loaded for the first time or when all ops are purged
  window.plugin.wasabee.initOps = () => {
    const newop = window.plugin.wasabee.loadNewDefaultOp();
    window.plugin.wasabee.resetOps(); // deletes everything including newop
    newop.update(); // re-saves newop
  };

  //*** This function creates an op list if one doesn't exist and sets the op list for the plugin
  window.plugin.wasabee.setupLocalStorage = () => {
    if (store.get(Wasabee.Constants.OP_RESTRUCTURE_KEY) == null) {
      window.plugin.wasabee.initOps();
      store.set(Wasabee.Constants.OP_RESTRUCTURE_KEY, true);
    }

    // make sure we have at least one op
    var ops = window.plugin.wasabee.opsList();
    if (ops == undefined || ops.length == 0) {
      window.plugin.wasabee.initOps();
      ops = window.plugin.wasabee.opsList();
    }

    // if the restore ID is not set, set it to the first thing we find
    var rID = window.plugin.wasabee.getRestoreOpID();
    if (rID == null) {
      rID = ops[0]; // ops cannot be empty due to previous block
      window.plugin.wasabee.setRestoreOpID(rID);
    }
  };

  //** This function removes an operation from the main list */
  window.plugin.wasabee.removeOperation = opID => {
    try {
      store.remove(opID);
    } catch (e) {
      console.log(e);
    }
  };

  //*** This function resets the local op list
  window.plugin.wasabee.resetOps = () => {
    var ops = window.plugin.wasabee.opsList();
    ops.forEach(function(opID) {
      window.plugin.wasabee.removeOperation(opID);
    });
  };

  window.plugin.wasabee.opsList = () => {
    var out = new Array();

    store.each(function(value, key) {
      if (key.length == 40) {
        out.push(key);
      }
    });
    return out;
  };
}
