import { WasabeeOp } from "./model";
import { getSelectedOperation, makeSelectedOperation } from "./selectedOp";
import { constants } from "./static";

// contains the stack of versions, last element is a copy of the current version
let undo_list: WasabeeOp[] = [];
// stack of undone versions
let redo_list: WasabeeOp[] = [];
let undoing = false; // lock

export function initHistory() {
  onSelect();
  window.map.on("wasabee:op:change", onChange);
  window.map.on("wasabee:op:select", onSelect);
}

function onSelect() {
  // empty the undo list on op select
  const sop = getSelectedOperation();
  undo_list = [new WasabeeOp(sop)];
  redo_list = [];
}

export async function undo() {
  if (undo_list.length < 2) {
    // nothing to undo
    return false;
  }
  const sop = getSelectedOperation();
  // move current version to undone list
  redo_list.push(undo_list.pop());

  undoing = true;
  const op = undo_list[undo_list.length - 1];
  // use last server-related attributes
  op.fetched = sop.fetched;
  op.fetchedOp = sop.fetchedOp;
  op.lasteditid = sop.lasteditid;
  await op.store();
  // switch to this op
  await makeSelectedOperation(op.ID);
  undoing = false;
  return true;
}

export async function redo() {
  if (!redo_list.length) return false;
  const sop = getSelectedOperation();
  // move prev version to undo list
  undo_list.push(redo_list.pop());
  undoing = true;
  const op = undo_list[undo_list.length - 1];
  // use last server-related attributes
  op.fetched = sop.fetched;
  op.fetchedOp = sop.fetchedOp;
  op.lasteditid = sop.lasteditid;
  await op.store();
  // switch to this op
  await makeSelectedOperation(op.ID);
  undoing = false;
  return true;
}

export function undoable() {
  return undo_list.length > 1;
}

export function redoable() {
  return redo_list.length > 0;
}

function onChange() {
  if (undoing) return;
  const sop = getSelectedOperation();
  // stack a copy of the current version
  undo_list.push(new WasabeeOp(sop));
  if (undo_list.length > constants.UNDO_HISTORY_SIZE) undo_list.shift();
  // drop the undone list
  redo_list = [];
}
