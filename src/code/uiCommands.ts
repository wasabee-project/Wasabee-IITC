import WasabeeOp from "./model/operation";
import WasabeePortal from "./model/portal";
import WasabeeBlocker from "./model/blocker";
import WasabeeMarker from "./model/marker";
import ConfirmDialog from "./dialogs/confirmDialog";
import MergeDialog from "./dialogs/mergeDialog";
import WasabeeMe from "./model/me";
import wX from "./wX";
import { opPromise, GetWasabeeServer, locationPromise } from "./server";
import AuthDialog from "./dialogs/authDialog";
import {
  getSelectedOperation,
  makeSelectedOperation,
  opsList,
  removeOperation,
  changeOpIfNeeded,
  duplicateOperation,
} from "./selectedOp";

import PortalUI from "./ui/portal";
import {
  displayError,
  displayInfo,
  displayWarning,
  ServerError,
} from "./error";
import { deleteDatabase } from "./db";
import { constants } from "./static";
import type { Wasabee } from "./init";

export function addPortal(operation: WasabeeOp, portal: WasabeePortal) {
  if (!portal) {
    displayError(wX("SELECT PORTAL"));
    return;
  }
  operation.addPortal(portal);
}

export function swapPortal(operation: WasabeeOp, portal: WasabeePortal) {
  const selectedPortal = PortalUI.getSelected();
  if (!selectedPortal) {
    displayError(wX("SELECT PORTAL"));
    return;
  }
  if (portal.id === selectedPortal.id) {
    displayError(wX("SELF SWAP"));
    return;
  }

  const pr = L.DomUtil.create("div", null);
  pr.textContent = wX("SWAP PROMPT");
  pr.appendChild(PortalUI.displayFormat(portal));
  L.DomUtil.create("span", null, pr).textContent = wX("SWAP WITH");
  pr.appendChild(PortalUI.displayFormat(selectedPortal));
  L.DomUtil.create("span", null, pr).textContent = "?";
  const con = new ConfirmDialog({
    title: wX("SWAP TITLE"),
    label: pr,
    type: "anchor",
    callback: () => {
      operation.swapPortal(portal, selectedPortal);
    },
  });
  con.enable();
}

export function deletePortal(operation: WasabeeOp, portal: WasabeePortal) {
  const pr = L.DomUtil.create("div", null);
  pr.textContent = wX("DELETE ANCHOR PROMPT");
  pr.appendChild(PortalUI.displayFormat(portal));
  const con = new ConfirmDialog({
    title: wX("DELETE ANCHOR TITLE"),
    label: pr,
    type: "anchor",
    callback: () => {
      operation.removeAnchor(portal.id);
      // window.map.fire("wasabee:crosslinks"); -- only needed if we also reset the cache first
    },
  });
  con.enable();
}

export function deleteMarker(
  operation: WasabeeOp,
  marker: WasabeeMarker,
  portal: WasabeePortal
) {
  const pr = L.DomUtil.create("div", null);
  pr.textContent = wX("DELETE MARKER PROMPT");
  pr.appendChild(PortalUI.displayFormat(portal));
  const con = new ConfirmDialog({
    title: wX("DELETE MARKER TITLE"),
    label: pr,
    type: "marker",
    callback: () => {
      operation.removeMarker(marker);
      window.map.fire("wasabee:crosslinks");
    },
  });
  con.enable();
}

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

export function listenForAddedPortals(newPortal) {
  if (!newPortal.portal.options.data.title) return;

  const op = getSelectedOperation();
  const portal = PortalUI.fromIITC(newPortal.portal);
  op.updatePortal(portal);
  WasabeeBlocker.updatePortal(op, portal).then((r) => {
    if (r) window.map.fire("wasabee:crosslinks:update");
  });
}

export function listenForPortalDetails(e) {
  if (!e.success) return;
  const portal = new WasabeePortal({
    id: e.guid,
    name: e.details.title,
    lat: (e.details.latE6 / 1e6).toFixed(6),
    lng: (e.details.lngE6 / 1e6).toFixed(6),
  });
  const op = getSelectedOperation();
  op.updatePortal(portal);
  WasabeeBlocker.updatePortal(op, portal).then((r) => {
    if (r) window.map.fire("wasabee:crosslinks:update");
  });
}

// This is what should be called to add to the queue
// can take either an entire array of portal GUID or a single GUID
// this depends on something listening for the IITC PortalDetailsLoaded hook to process the result
// see listenForPortalDetails above
export function getPortalDetails(guid) {
  if (Array.isArray(guid)) {
    window.plugin.wasabee.portalDetailQueue =
      window.plugin.wasabee.portalDetailQueue.concat(guid);
  } else {
    window.plugin.wasabee.portalDetailQueue.push(guid);
  }

  const rate =
    localStorage[
      window.plugin.wasabee.static.constants.PORTAL_DETAIL_RATE_KEY
    ] || 1000;

  // if not already processing the queue, start it
  if (!window.plugin.wasabee.portalDetailIntervalID) {
    window.plugin.wasabee.portalDetailIntervalID = window.setInterval(
      pdqDoNext,
      rate
    );
    console.log(
      "starting portal details request queue: " +
        window.plugin.wasabee.portalDetailIntervalID
    );
  }
}

function pdqDoNext() {
  const p = window.plugin.wasabee.portalDetailQueue.shift();

  // are we done?
  if (p === undefined) {
    console.debug(
      "closing portal details request queue: " +
        window.plugin.wasabee.portalDetailIntervalID
    );
    window.clearInterval(window.plugin.wasabee.portalDetailIntervalID);
    window.plugin.wasabee.portalDetailIntervalID = null;
    return;
  }

  if (p.length != 35) return; // ignore faked ones from DrawTools imports and other garbage
  // this is the bit everyone is so worried about
  window.portalDetail.request(p);
}

// load faked op portals
export function loadFaked(operation: WasabeeOp, force = false) {
  const flag =
    localStorage[window.plugin.wasabee.static.constants.AUTO_LOAD_FAKED] ||
    false;

  // local storage always returns as string
  if (flag !== "true" && !force) return;

  const f = [];
  for (const x of operation.fakedPortals) f.push(x.id);
  if (f.length > 0) getPortalDetails(f);
}

// load faked blocker portals
export async function loadBlockerFaked(operation: WasabeeOp, force = false) {
  const flag =
    localStorage[window.plugin.wasabee.static.constants.AUTO_LOAD_FAKED] ||
    false;

  // local storage always returns as string
  if (flag !== "true" && !force) return;

  const bp = await WasabeeBlocker.getPortals(operation);
  const f = bp.filter((p) => p.id === p.name).map((p) => p.id);
  if (f.length > 0) getPortalDetails(f);
}

export function sendLocation() {
  if (!WasabeeMe.isLoggedIn()) return;
  const sl =
    localStorage[window.plugin.wasabee.static.constants.SEND_LOCATION_KEY];
  if (sl !== "true") return;

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        await locationPromise(
          position.coords.latitude,
          position.coords.longitude
        );
        console.debug(wX("LOCATION SUB"));
      } catch (e) {
        console.error(e);
      }
    },
    (err) => {
      console.error(err);
    }
  );
}

export function getAllPortalsOnScreen(operation: WasabeeOp) {
  const bounds = window.map.getBounds();
  const x = [];
  for (const portal in window.portals) {
    if (bounds.contains(window.portals[portal].getLatLng())) {
      if (
        operation.containsMarkerByID(
          window.portals[portal].options.guid,
          WasabeeMarker.constants.MARKER_TYPE_EXCLUDE
        )
      )
        continue;
      const wp = PortalUI.fromIITC(window.portals[portal]);
      if (wp) x.push(wp);
    }
  }
  return x;
}

export function getAllPortalsLinked(
  operation: WasabeeOp,
  originPortal: WasabeePortal
) {
  const x = [];
  for (const link in window.links) {
    const p = window.links[link];

    if (
      operation.containsLinkFromTo(p.options.data.oGuid, p.options.data.dGuid)
    )
      continue;

    const linkPortal1 = new WasabeePortal({
      id: p.options.data.oGuid,
      lat: (p.options.data.oLatE6 / 1e6).toFixed(6),
      lng: (p.options.data.oLngE6 / 1e6).toFixed(6),
      name: p.options.data.oGuid,
      comment: "in",
    });

    const linkPortal2 = new WasabeePortal({
      id: p.options.data.dGuid,
      lat: (p.options.data.dLatE6 / 1e6).toFixed(6),
      lng: (p.options.data.dLngE6 / 1e6).toFixed(6),
      name: p.options.data.dGuid,
      comment: "out",
    });

    if (linkPortal1.id === originPortal.id) {
      x.push(linkPortal2);
    }
    if (linkPortal2.id === originPortal.id) {
      x.push(linkPortal1);
    }
  }
  // console.log(x);
  return x;
}

// recursive function to auto-mark blockers
export async function blockerAutomark(operation: WasabeeOp, first = true) {
  const blockers = await WasabeeBlocker.getAll(operation);
  if (first) {
    operation.startBatchMode();
    // add blocker portals
    for (const b of blockers) {
      operation._addPortal(
        new WasabeePortal({
          id: b.from,
          name: b.fromPortal.name,
          lat: b.fromPortal.lat,
          lng: b.fromPortal.lng,
        })
      );
      operation._addPortal(
        new WasabeePortal({
          id: b.to,
          name: b.toPortal.name,
          lat: b.toPortal.lat,
          lng: b.toPortal.lng,
        })
      );
    }
  }
  // build count list
  const portals: PortalID[] = [];
  for (const b of blockers) {
    if (
      !operation.containsMarkerByID(
        b.from,
        WasabeeMarker.constants.MARKER_TYPE_EXCLUDE
      )
    )
      portals.push(b.from);
    if (
      !operation.containsMarkerByID(
        b.to,
        WasabeeMarker.constants.MARKER_TYPE_EXCLUDE
      )
    )
      portals.push(b.to);
  }
  const reduced: { [id: PortalID]: number } = {};
  for (const p of portals) {
    if (!reduced[p]) reduced[p] = 0;
    reduced[p]++;
  }
  const sorted = Object.entries(reduced).sort((a, b) => b[1] - a[1]);

  // return from recursion
  if (sorted.length == 0) {
    if (first) operation.endBatchMode();
    return;
  }

  const portalId = sorted[0][0];

  // put in some smarts for picking close portals, rather than random ones
  // when the count gets > 3

  // get WasabeePortal for portalId
  let wportal = operation.getPortal(portalId);
  if (!wportal) wportal = PortalUI.get(portalId);
  if (!wportal) {
    displayInfo(wX("AUTOMARK STOP"));
    return;
  }
  // console.log(wportal);

  // add marker
  let type = WasabeeMarker.constants.MARKER_TYPE_DESTROY;
  if (PortalUI.team(wportal) == "E") {
    type = WasabeeMarker.constants.MARKER_TYPE_VIRUS;
  }
  const zone = operation.determineZone(wportal.latLng);
  operation.addMarker(type, wportal, { comment: "auto-marked", zone: zone });

  // remove nodes from blocker list
  await WasabeeBlocker.removeBlocker(operation, portalId);

  // recurse
  await blockerAutomark(operation, false);

  if (first) operation.endBatchMode();
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
  if (local.lasteditid == remote.lasteditid) {
    // nothing to do
    return false;
  }

  // if selected op, use current selected op object
  const op = local.ID != so.ID ? local : so;

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
    const con = new MergeDialog({
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
    const me = await WasabeeMe.waitGet(true);
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
    else new AuthDialog().enable();
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
      const con = new MergeDialog({
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

export function clearAllData() {
  const con = new ConfirmDialog({
    title: wX("CLEAROPS BUTTON TITLE"),
    label: wX("CLEAROPS PROMPT"),
    type: "operation",
    callback: async () => {
      // remove database
      deleteDatabase();
      // cleanup localStorage
      for (const key of [
        constants.SELECTED_OP_KEY,
        constants.OPS_LIST_KEY,
        constants.OPS_LIST_HIDDEN_KEY,
        constants.OPS_SHOW_HIDDEN_OPS,
        constants.SEND_LOCATION_KEY,
        constants.SEND_ANALYTICS_KEY,
        constants.EXPERT_MODE_KEY,
        constants.LANGUAGE_KEY,
        constants.AGENT_INFO_KEY,
        constants.MULTIMAX_UNREACHABLE_KEY,
        constants.LINK_SOURCE_KEY,
        constants.ANCHOR_ONE_KEY,
        constants.ANCHOR_TWO_KEY,
        constants.ANCHOR_THREE_KEY,
        constants.PORTAL_DETAIL_RATE_KEY,
        constants.SKIN_KEY,
        constants.LAST_MARKER_KEY,
        constants.AUTO_LOAD_FAKED,
        constants.TRAWL_SKIP_STEPS,
        constants.USE_PANES,
        constants.SKIP_CONFIRM,
        constants.SERVER_BASE_KEY,
        constants.REBASE_UPDATE_KEY,
      ]) {
        delete localStorage[key];
      }

      const Wasabee: Wasabee = window.plugin.wasabee;

      // remove buttons
      Wasabee.buttons.remove();

      // remove toolbox
      document
        .querySelectorAll("#toolbox a.wasabee")
        .forEach((e) => e.remove());

      // remove layers
      window.removeLayerGroup(Wasabee.portalLayerGroup);
      window.removeLayerGroup(Wasabee.linkLayerGroup);
      window.removeLayerGroup(Wasabee.markerLayerGroup);
      window.removeLayerGroup(Wasabee.agentLayerGroup);
      window.removeLayerGroup(Wasabee.zoneLayerGroup);
      window.removeLayerGroup(Wasabee.backgroundOpsGroup);
      window.removeLayerGroup(Wasabee.defensiveLayers);
      window.removeLayerGroup(Wasabee.crossLinkLayers);
    },
  });
  con.enable();
}

export function setMarkersToZones() {
  const op = getSelectedOperation();

  op.startBatchMode();
  for (const m of op.markers) {
    const ll = op.getPortal(m.portalId).latLng;

    const zone = op.determineZone(ll);
    op.setZone(m, zone);
  }
  op.endBatchMode();
}

export function setLinksToZones() {
  const op = getSelectedOperation();

  op.startBatchMode();
  for (const l of op.links) {
    const ll = op.getPortal(l.fromPortalId).latLng;
    const zone = op.determineZone(ll);
    op.setZone(l, zone);
  }
  op.endBatchMode();
}
