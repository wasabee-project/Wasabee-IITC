import store from "../lib/store";
import WasabeeOp from "./operation";

const setRestoreOpID = opID => {
  store.set(window.plugin.wasabee.static.constants.SELECTED_OP_KEY, opID);
};

const getRestoreOpID = () => {
  return store.get(window.plugin.wasabee.static.constants.SELECTED_OP_KEY);
};

export const getSelectedOperation = () => {
  return window.plugin.wasabee._selectedOp;
};

// I use this all the time in debugging, leave it globally visible
window.plugin.wasabee.getSelectedOperation = getSelectedOperation;

export const initSelectedOperation = () => {
  if (window.plugin.wasabee._selectedOp == null) {
    const toLoad = getRestoreOpID();
    if (toLoad == null) {
      loadNewDefaultOp();
    } else {
      // verify it exists before trying to load
      let tmp = getOperationByID(toLoad);
      if (tmp == null) {
        console.log(
          "most recently loaded up not present in local store, starting with new default op"
        );
        window.plugin.wasabee.loadNewDefaultOp();
      } else {
        makeSelectedOperation(toLoad);
      }
    }
  }
  return window.plugin.wasabee._selectedOp;
};

const loadNewDefaultOp = () => {
  const newOp = new WasabeeOp(PLAYER.nickname, "Default Op", true);
  newOp.store();
  const op = makeSelectedOperation(newOp.ID);
  return op;
};

// this is the function that loads an op from the store, makes it the selected op and draws it to the screen
// only this should write to _selectedOp
export const makeSelectedOperation = opID => {
  if (window.plugin.wasabee._selectedOp != null) {
    if (opID == window.plugin.wasabee._selectedOp.ID) {
      console.log(
        "makeSelectedOperation called on the current op; replacing with version from local store. not saving live changes first"
      );
    } else {
      window.plugin.wasabee._selectedOp.store();
    }
  }
  const op = getOperationByID(opID);
  if (op == null) {
    console.log("makeSelectedOperation called on invalid opID");
    throw "attempted to load invalid opID";
  }
  // the only place we should change the selected op.
  window.plugin.wasabee._selectedOp = op;
  setRestoreOpID(window.plugin.wasabee._selectedOp.ID);
  window.runHooks("wasabeeUIUpdate", window.plugin.wasabee._selectedOp);
  return window.plugin.wasabee._selectedOp;
};

// use this to pull an op from local store by ID
export const getOperationByID = opID => {
  let op = null;
  try {
    const v = store.get(opID);
    if (v == null) {
      console.log("getOperationByID: no such op in local store: " + opID);
    } else {
      // we can pass v directly, but this catches if the json is malformed
      op = WasabeeOp.create(JSON.parse(v));
    }
  } catch (e) {
    console.log(e);
    alert(JSON.stringify(e));
  }
  return op;
};

// called when loaded for the first time or when all ops are purged
const initOps = () => {
  const newop = loadNewDefaultOp();
  resetOps(); // deletes everything including newop
  newop.update(); // re-saves newop
};

//*** This function creates an op list if one doesn't exist and sets the op list for the plugin
export const setupLocalStorage = () => {
  if (
    store.get(window.plugin.wasabee.static.constants.OP_RESTRUCTURE_KEY) == null
  ) {
    initOps();
    store.set(window.plugin.wasabee.static.constants.OP_RESTRUCTURE_KEY, true);
  }

  // make sure we have at least one op
  let ops = opsList();
  if (ops == undefined || ops.length == 0) {
    initOps();
    ops = opsList();
  }

  // if the restore ID is not set, set it to the first thing we find
  let rID = getRestoreOpID();
  if (rID == null) {
    rID = ops[0]; // ops cannot be empty due to previous block
    setRestoreOpID(rID);
  }
};

//** This function removes an operation from the main list */
export const removeOperation = opID => {
  try {
    store.remove(opID);
  } catch (e) {
    console.log(e);
  }
};

//*** This function resets the local op list
export const resetOps = () => {
  const ops = opsList();
  for (const opID of ops) {
    removeOperation(opID);
  }
};

export const opsList = () => {
  var out = new Array();

  store.each(function(value, key) {
    if (key.length == 40) {
      out.push(key);
    }
  });
  return out;
};
