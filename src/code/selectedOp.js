import store from "../lib/store";
import WasabeeOp from "./operation";
import wX from "./wX";
import { generateId } from "./auxiliar";

function setRestoreOpID(opID) {
  localStorage[window.plugin.wasabee.static.constants.SELECTED_OP_KEY] = opID;
}

function getRestoreOpID() {
  return localStorage[window.plugin.wasabee.static.constants.SELECTED_OP_KEY];
}

export function getSelectedOperation() {
  return window.plugin.wasabee._selectedOp;
}

export function initSelectedOperation() {
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
        loadNewDefaultOp();
      } else {
        makeSelectedOperation(toLoad);
      }
    }
  }
  return window.plugin.wasabee._selectedOp;
}

export function changeOpIfNeeded() {
  const selectedOp = getSelectedOperation();
  const ops = opsList();
  if (!ops.includes(selectedOp.ID)) {
    if (ops.length == 0) loadNewDefaultOp();
    else makeSelectedOperation(ops[ops.length - 1]);
  }
  return window.plugin.wasabee._selectedOp;
}

// create a new op and set it as selected
export function loadNewDefaultOp() {
  const newOp = new WasabeeOp({
    creator: PLAYER.nickname,
    name: wX("DEFAULT OP NAME", new Date().toGMTString()),
  });
  newOp.store();
  const op = makeSelectedOperation(newOp.ID);
  return op;
}

// this is the function that loads an op from the store, makes it the selected op and draws it to the screen
// only this should write to _selectedOp
export function makeSelectedOperation(opID) {
  // _selectedOp is null at first load (or page reload), should never be after that
  if (window.plugin.wasabee._selectedOp != null) {
    if (opID == window.plugin.wasabee._selectedOp.ID) {
      console.log(
        "makeSelectedOperation called on the current op; replacing with version from local store. not saving live changes first"
      );
    } else {
      // should not be necessary now, but still safe
      if (opsList().includes(window.plugin.wasabee._selectedOp.ID))
        window.plugin.wasabee._selectedOp.store();
    }
  }

  // get the op from localStorage
  // in 0.19 this becomes WasabeeOp.load(opID);
  const op = getOperationByID(opID);
  if (op == null) {
    console.log("makeSelectedOperation called on invalid opID");
    alert("attempted to load invalid opID");
  }
  // the only place we should change the selected op.
  delete window.plugin.wasabee._selectedOp;
  window.plugin.wasabee._selectedOp = op;
  setRestoreOpID(window.plugin.wasabee._selectedOp.ID);

  window.runHooks("wasabeeUIUpdate", window.plugin.wasabee._selectedOp);
  window.runHooks("wasabeeCrosslinks", window.plugin.wasabee._selectedOp);
  return window.plugin.wasabee._selectedOp;
}

// use this to pull an op from local store by ID
// in 0.19 this entire function goes away;
export function getOperationByID(opID) {
  try {
    const newfmt = localStorage[opID];
    if (newfmt == undefined) return null;
    const raw = JSON.parse(newfmt);
    const op = new WasabeeOp(raw);
    if (op.ID) return op;
  } catch (e) {
    console.log(e);
  }
  return oldOpFormat(opID);
}

function oldOpFormat(opID) {
  console.log("trying old format");
  try {
    const oldfmt = store.get(opID);
    const raw = JSON.parse(oldfmt);
    const op = new WasabeeOp(raw);
    if (op != null && op.ID) {
      op.store();
      return op;
    }
  } catch (e) {
    console.log(e);
  }
  return null;
}

// called when loaded for the first time or when all ops are purged
function initOps() {
  const newop = loadNewDefaultOp();
  resetOps(); // deletes everything including newop
  newop.update(); // re-saves newop
}

//*** This function creates an op list if one doesn't exist and sets the op list for the plugin
export function setupLocalStorage() {
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
}

function storeOpsList(ops) {
  localStorage[
    window.plugin.wasabee.static.constants.OPS_LIST_KEY
  ] = JSON.stringify(ops);
}

//** This function removes an operation from the main list */
export function removeOperation(opID) {
  const ops = opsList().filter((ID) => ID != opID);
  storeOpsList(ops);
  delete localStorage[opID];
}

//** This function adds an operation to the main list */
export function addOperation(opID) {
  const ops = opsList();
  if (!ops.includes(opID)) ops.push(opID);
  storeOpsList(ops);
}

//*** This function resets the local op list
export function resetOps() {
  const ops = opsList();
  for (const opID of ops) {
    removeOperation(opID);
  }
}

export function opsList() {
  const raw = localStorage[window.plugin.wasabee.static.constants.OPS_LIST_KEY];
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.log(e);
      //falback to old listing
    }
  }

  // <0.18 migration
  const list = oldOpsList();
  storeOpsList(list);
  return list;
}

// to remove on 0.19
function oldOpsList() {
  const out = new Array();

  for (const key in localStorage) {
    if (key.length == 40) out.push(key);
    // after 0.18
    // if (key.length) == 40 && localStorage[key].includes(`"ID":`)) out.push(key);
  }

  return out;
}

export function duplicateOperation(opID) {
  let op = null;
  if (opID == window.plugin.wasabee._selectedOp.ID) {
    op = window.plugin.wasabee._selectedOp;
    op.store();
  } else {
    op = getOperationByID(opID);
  }

  op.ID = generateId();
  op.name = op.name + " " + new Date().toGMTString();
  op.teamlist = null;
  op.fetched = null;
  op.keysonhand = new Array();
  op.cleanAll();
  op.store();
  return op;
}

// this checks me from cache; if not logged in, no op is owned and all on server will be deleted, which may confuse users
export function removeNonOwnedOps() {
  for (const opID of opsList()) {
    const op = getOperationByID(opID);
    if (!op || !op.IsOwnedOp()) removeOperation(opID);
  }
  changeOpIfNeeded();
}
