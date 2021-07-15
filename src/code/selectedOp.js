import WasabeeOp from "./model/operation";
import WasabeeBlocker from "./model/blocker";
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

export async function initSelectedOperation() {
  if (window.plugin.wasabee._selectedOp == null) {
    const toLoad = getRestoreOpID();
    if (toLoad == null) {
      await loadNewDefaultOp();
    } else {
      // verify it exists before trying to load
      let tmp = await WasabeeOp.load(toLoad);
      if (tmp == null) {
        console.log(
          "most recently loaded up not present in local store, starting with new default op"
        );
        await loadNewDefaultOp();
      } else {
        await makeSelectedOperation(toLoad);
      }
    }
  }
  return window.plugin.wasabee._selectedOp;
}

export async function changeOpIfNeeded() {
  const selectedOp = getSelectedOperation();
  const ops = await opsList();
  if (!ops.includes(selectedOp.ID)) {
    if (ops.length == 0) await loadNewDefaultOp();
    else await makeSelectedOperation(ops[ops.length - 1]);
  }
  return window.plugin.wasabee._selectedOp;
}

// create a new op and set it as selected
export async function loadNewDefaultOp() {
  const newOp = new WasabeeOp({
    creator: PLAYER.nickname,
    name: wX("DEFAULT OP NAME", { date: new Date().toGMTString() }),
  });
  await newOp.store();
  await makeSelectedOperation(newOp.ID);
  return window.plugin.wasabee._selectedOp;
}

// this is the function that loads an op from the store, makes it the selected op and draws it to the screen
// only this should write to _selectedOp
export async function makeSelectedOperation(opID) {
  // _selectedOp is null at first load (or page reload), should never be after that
  let previousID;
  if (window.plugin.wasabee._selectedOp != null) {
    previousID = window.plugin.wasabee._selectedOp.ID;
    if (opID == window.plugin.wasabee._selectedOp.ID) {
      console.log(
        "makeSelectedOperation called on the current op; replacing with version from local store. not saving live changes first"
      );
    } else {
      // should not be necessary now, but still safe
      const ol = await opsList();
      if (ol.includes(window.plugin.wasabee._selectedOp.ID))
        await window.plugin.wasabee._selectedOp.store();
    }
  }

  // get the op from indexeddb/localStorage
  const op = await WasabeeOp.load(opID);
  if (op == null) {
    console.log("makeSelectedOperation called on invalid opID");
    alert("attempted to load invalid opID");
    return;
  }

  // remove old listeners ? old object should never .store
  op.on("update", () => window.map.fire("wasabee:op:change"));
  op.on("blockers", () => window.map.fire("wasabee:crosslinks"));

  // the only place we should change the selected op.
  delete window.plugin.wasabee._selectedOp;
  window.plugin.wasabee._selectedOp = op;
  setRestoreOpID(window.plugin.wasabee._selectedOp.ID);

  if (previousID !== opID) {
    window.map.fire("wasabee:op:select", {
      previous: previousID,
      current: opID,
    });
  } else {
    window.map.fire("wasabee:op:change");
  }
  window.map.fire("wasabee:crosslinks");
  // return window.plugin.wasabee._selectedOp;
}

// called when loaded for the first time or when all ops are purged
async function initOps() {
  const newop = await loadNewDefaultOp();
  await resetOps(); // deletes everything including newop
  newop.update(); // re-saves newop
}

//*** This function creates an op list if one doesn't exist and sets the op list for the plugin
export async function setupLocalStorage() {
  // make sure we have at least one op
  let ops = await opsList();
  if (ops == undefined || ops.length == 0) {
    await initOps();
    ops = await opsList();
  }

  const migrations = Array();
  for (const opID of ops) {
    migrations.push(WasabeeOp.migrate(opID));
  }
  // no need to see the results, just wait until all are done
  await Promise.allSettled(migrations);

  // if the restore ID is not set, set it to the first thing we find
  let rID = getRestoreOpID();
  if (rID == null || rID == undefined) {
    rID = ops[0]; // ops cannot be empty due to previous block
    setRestoreOpID(rID);
  }
}

//** This function removes an operation from the main list */
export async function removeOperation(opID) {
  await WasabeeOp.delete(opID);
  WasabeeBlocker.removeBlockers(opID); // no need to await
  window.map.fire("wasabee:op:delete", opID);
}

//** This function shows an operation to the main list */
export function showOperation(opID) {
  const hiddenOps = hiddenOpsList();
  if (hiddenOps.includes(opID)) {
    localStorage[window.plugin.wasabee.static.constants.OPS_LIST_HIDDEN_KEY] =
      JSON.stringify(hiddenOps.filter((ID) => ID != opID));
    window.map.fire("wasabee:op:showhide", { opID: opID, show: true });
  }
}

//** This function hides an operation to the main list */
export function hideOperation(opID) {
  const hiddenOps = hiddenOpsList();
  if (!hiddenOps.includes(opID)) {
    hiddenOps.push(opID);
    localStorage[window.plugin.wasabee.static.constants.OPS_LIST_HIDDEN_KEY] =
      JSON.stringify(hiddenOps);
    window.map.fire("wasabee:op:showhide", { opID: opID, show: false });
  }
}

export function resetHiddenOps() {
  localStorage[window.plugin.wasabee.static.constants.OPS_LIST_HIDDEN_KEY] =
    "[]";
}

//*** This function resets the local op list
export async function resetOps() {
  const ops = await opsList();
  // don't fire event here
  await Promise.all(ops.map(WasabeeOp.delete));
  ops.map(WasabeeBlocker.removeBlockers); // no need to await
}

export function hiddenOpsList() {
  try {
    const raw =
      localStorage[window.plugin.wasabee.static.constants.OPS_LIST_HIDDEN_KEY];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function setOpBackground(opID, background) {
  const sop = getSelectedOperation();
  const op = sop.ID === opID ? sop : await WasabeeOp.load(opID);
  if (op.background == background) return;
  op.background = background;
  await op.store();
  window.map.fire("wasabee:op:background", {
    opID: opID,
    background: background,
  });
}

export async function opsList(hidden = true) {
  // after 0.19, remove the list and just query the idb keys
  let ops = [];
  try {
    const raw =
      localStorage[window.plugin.wasabee.static.constants.OPS_LIST_KEY];
    ops = JSON.parse(raw);
    ops = ops.filter((id) => localStorage[id]);
  } catch {
    //
  }
  const fromIdb = await window.plugin.wasabee.idb.getAllKeys("operations");
  for (const k of fromIdb) {
    if (!ops.includes(k)) ops.push(k);
  }
  if (!hidden) {
    const hiddenOps = hiddenOpsList();
    return ops.filter((o) => !hiddenOps.includes(o));
  }
  return ops;
}

export async function duplicateOperation(opID) {
  let op = null;
  if (opID == window.plugin.wasabee._selectedOp.ID) {
    op = window.plugin.wasabee._selectedOp;
    await op.store();
  } else {
    op = await WasabeeOp.load(opID);
  }

  // XXX op.toExport() might be helpful here

  op.ID = generateId();
  op.name = op.name + " " + new Date().toGMTString();
  op.creator = window.PLAYER.nickname;
  op.teamlist = null;
  op.fetched = null;
  op.keysonhand = new Array();
  op.cleanAll();
  await op.store();
  return op;
}

// this checks me from cache; if not logged in, no op is owned and all on server will be deleted, which may confuse users
export async function removeNonOwnedOps() {
  for (const opID of await opsList()) {
    const op = await WasabeeOp.load(opID);
    // don't fire event here
    if (!op || !op.isOwnedOp()) {
      await WasabeeOp.delete(opID);
      WasabeeBlocker.removeBlockers(opID); // no need to await
    }
  }
  await changeOpIfNeeded();
}
