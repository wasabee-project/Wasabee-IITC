import { WasabeeOp } from "./model";
import { WasabeeBlocker } from "./model";
import wX from "./wX";
import { displayError } from "./error";
import type { LeafletEvent } from "leaflet";

function setRestoreOpID(opID: OpID) {
  localStorage[window.plugin.wasabee.static.constants.SELECTED_OP_KEY] = opID;
}

function getRestoreOpID(): OpID {
  return localStorage[window.plugin.wasabee.static.constants.SELECTED_OP_KEY];
}

export function getSelectedOperation(): WasabeeOp {
  return window.plugin.wasabee._selectedOp;
}

export async function initSelectedOperation() {
  if (window.plugin.wasabee._selectedOp == null) {
    const toLoad = getRestoreOpID();
    if (toLoad == null) {
      await loadNewDefaultOp();
    } else {
      // verify it exists before trying to load
      const tmp = await WasabeeOp.load(toLoad);
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
  return getSelectedOperation();
}

export async function changeOpIfNeeded() {
  const selectedOp = getSelectedOperation();
  const ops = await opsList();
  if (!ops.includes(selectedOp.ID)) {
    if (ops.length == 0) await loadNewDefaultOp();
    else await makeSelectedOperation(ops[ops.length - 1]);
  }
  return getSelectedOperation();
}

// create a new op and set it as selected
export async function loadNewDefaultOp() {
  const newOp = new WasabeeOp({
    creator: PLAYER.nickname,
    name: wX("DEFAULT OP NAME", { date: new Date().toUTCString() }),
  });
  await newOp.store();
  await makeSelectedOperation(newOp.ID);
  return getSelectedOperation();
}

// this is the function that loads an op from the store, makes it the selected op and draws it to the screen
// only this should write to _selectedOp
export async function makeSelectedOperation(opID: OpID) {
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
    displayError("attempted to load invalid opID");
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

  const migrations = [];
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
export async function removeOperation(opID: OpID) {
  await WasabeeOp.delete(opID);
  WasabeeBlocker.removeBlockers(opID); // no need to await
  window.map.fire("wasabee:op:delete", opID);
}

//** This function shows an operation to the main list */
export function showOperation(opID: OpID) {
  const hiddenOps = hiddenOpsList();
  if (hiddenOps.includes(opID)) {
    localStorage[window.plugin.wasabee.static.constants.OPS_LIST_HIDDEN_KEY] =
      JSON.stringify(hiddenOps.filter((ID) => ID != opID));
    window.map.fire("wasabee:op:showhide", { opID: opID, show: true });
  }
}

//** This function hides an operation to the main list */
export function hideOperation(opID: OpID) {
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

export function hiddenOpsList(): OpID[] {
  try {
    const raw =
      localStorage[window.plugin.wasabee.static.constants.OPS_LIST_HIDDEN_KEY];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function setOpBackground(opID: OpID, background: boolean) {
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
  let ops: OpID[] = [];
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

export async function duplicateOperation(opID: OpID) {
  let op: WasabeeOp = null;
  if (opID == window.plugin.wasabee._selectedOp.ID) {
    op = window.plugin.wasabee._selectedOp;
  } else {
    op = await WasabeeOp.load(opID);
  }

  // XXX op.toExport() might be helpful here

  op = new WasabeeOp({
    name: op.name + " " + new Date().toUTCString(),
    creator: window.PLAYER.nickname,
    opportals: op.opportals,
    // anchors infered from links/markers
    links: op.links,
    markers: op.markers,
    color: op.color,
    comment: op.comment,
    zones: op.zones,
    referencetime: op.referencetime,
  });
  await op.store();
  return op;
}

// use the provided GID to delete server ops
export async function removeNonOwnedOps(
  data: LeafletEvent & { GID: GoogleID }
) {
  // no GID provided, likely following a server change while not logged in
  if (!data.GID) {
    return;
  }
  for (const opID of await opsList()) {
    const op = await WasabeeOp.load(opID);
    // don't fire event here
    if (!op || (op.isServerOp() && op.creator !== data.GID)) {
      await WasabeeOp.delete(opID);
      WasabeeBlocker.removeBlockers(opID); // no need to await
    }
  }
  await changeOpIfNeeded();
}
