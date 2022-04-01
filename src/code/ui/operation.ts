import ConfirmDialog from "../dialogs/confirmDialog";
import wX from "../wX";

import { WasabeeMe, WasabeeOp } from "../model";
import { GetWasabeeServer } from "../config";
import ConflictDialog from "../dialogs/conflictDialog";
import {
  displayInfo,
  ServerError,
  displayError,
  displayWarning,
} from "../error";
import { getMe } from "../model/cache";
import {
  opsList,
  duplicateOperation,
  makeSelectedOperation,
  changeOpIfNeeded,
  removeOperation,
  getSelectedOperation,
} from "../selectedOp";
import { opPromise } from "../server";

export function clearAllItems(operation: WasabeeOp) {
  const con = new ConfirmDialog({
    title: wX("dialog.clear_all.title", { opName: operation.name }),
    label: wX("dialog.clear_all.text", { opName: operation.name }),
    type: "operation",
    callback: () => {
      operation.clearAllItems();
      window.map.fire("wasabee:crosslinks");
    },
  });
  con.enable();
}

export function clearAllLinks(operation: WasabeeOp) {
  const con = new ConfirmDialog({
    title: wX("dialog.clear_links.title", { opName: operation.name }),
    label: wX("dialog.clear_links.text", { opName: operation.name }),
    type: "operation",
    callback: () => {
      operation.clearAllLinks();
      window.map.fire("wasabee:crosslinks");
    },
  });
  con.enable();
}

export function clearAllMarkers(operation: WasabeeOp) {
  const con = new ConfirmDialog({
    title: wX("dialog.clear_markers.title", { opName: operation.name }),
    label: wX("dialog.clear_markers.text", { opName: operation.name }),
    type: "operation",
    callback: () => {
      operation.clearAllMarkers();
      window.map.fire("wasabee:crosslinks");
    },
  });
  con.enable();
}

export function zoomToOperation(operation: WasabeeOp) {
  if (!operation) return;
  const mbr = operation.mbr;
  if (mbr && mbr.isValid()) {
    window.map.fitBounds(mbr);
  }
}

export async function updateLocalOp(local, remote) {
  const so = getSelectedOperation();
  if (!local) {
    await remote.store();
    return false;
  }

  // if selected op, use current selected op object
  const op = local.ID != so.ID ? local : so;

  if (op.lasteditid === remote.lasteditid) {
    // nothing to do except .server update
    if (op.server !== remote.server) {
      op.server = remote.server;
      await op.store();
      return op.ID === so.ID;
    }
    return false;
  }

  // no changes
  if (!op.checkChanges()) {
    await remote.store();
    // if selected op, reload from the new op
    return remote.ID === so.ID;
  }

  // partial update on fields the server is always right
  op.teamlist = remote.teamlist;
  op.mergeZones(remote);
  op.remoteChanged = true;
  await op.store();

  // In case of selected op, suggest merge to the user
  if (so === op) {
    const con = new ConflictDialog({
      opOwn: so,
      opRemote: remote,
    });
    con.enable();
  }

  return false;
}

export async function fullSync() {
  const so = getSelectedOperation();
  const server = GetWasabeeServer();

  try {
    let reloadOpID = null;
    const me = await getMe(true);
    const opsID = new Set(me.Ops.map((o) => o.ID));

    // delete operations absent from server unless the owner
    const ol = await opsList();
    const serverOps = [];
    for (const opID of ol) {
      const op = await WasabeeOp.load(opID);
      if (op && op.server === server && !opsID.has(op.ID)) serverOps.push(op);
    }
    for (const op of serverOps) {
      // if owned, duplicate the OP
      if (op.isOwnedOp()) {
        const newop = await duplicateOperation(op.ID);
        newop.name = op.name;
        await newop.store();
        // if selected op, we reload the local duplicate
        if (op.ID === so.ID) reloadOpID = newop.ID;
      }
      // skip hook (not needed)
      await WasabeeOp.delete(op.ID);
    }
    if (serverOps.length > 0)
      console.log(
        "remove",
        serverOps.map((op) => op.ID)
      );

    const promises: Promise<WasabeeOp>[] = [];
    for (const opID of opsID) {
      promises.push(opPromise(opID));
    }
    const ops = (await Promise.allSettled(promises))
      .filter((p) => p.status === "fulfilled")
      .map((p: PromiseFulfilledResult<WasabeeOp>) => p.value);
    for (const newop of ops) {
      const localOp = await WasabeeOp.load(newop.ID);
      const reloadSO = await updateLocalOp(localOp, newop);
      if (reloadSO) reloadOpID = so.ID;
    }

    // replace current op by the server version if any
    if (reloadOpID) await makeSelectedOperation(reloadOpID);
    // change op if the current does not exist anymore
    else {
      const op = await changeOpIfNeeded();
      if (op !== so) zoomToOperation(op);
    }

    window.map.fire("wasabee:teams"); // if any team dialogs are open

    displayInfo(wX("SYNC DONE"));
  } catch (e) {
    console.error(e);
    if (e instanceof ServerError) displayError(e);
    if (WasabeeMe.isLoggedIn()) displayWarning(wX("NOT_LOADED"));
  }
  // update UI to reflect new ops list
  window.map.fire("wasabee:fullsync");
}

export async function syncOp(opID: OpID) {
  const localOp = await WasabeeOp.load(opID);
  const remoteOp = await opPromise(opID);
  if (remoteOp.lasteditid != localOp.lasteditid) {
    if (!localOp.localchanged) {
      await remoteOp.store();
    } else {
      const con = new ConflictDialog({
        opOwn: localOp,
        opRemote: remoteOp,
      });
      con.enable();
    }
  }
}

export function deleteLocalOp(opname: string, opid: OpID) {
  const con = new ConfirmDialog({
    title: wX("REM_LOC_CP", { opName: opname }),
    label: wX("YESNO_DEL", { opName: opname }),
    type: "operation",
    callback: async () => {
      await removeOperation(opid);
      const newop = await changeOpIfNeeded(); // fires ui events
      zoomToOperation(newop);
    },
  });
  con.enable();
}
