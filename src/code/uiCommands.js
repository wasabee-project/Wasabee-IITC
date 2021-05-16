import WasabeeOp from "./operation";
import WasabeePortal from "./portal";
import ConfirmDialog from "./dialogs/confirmDialog";
import MergeDialog from "./dialogs/mergeDialog";
import WasabeeMe from "./me";
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

export function addPortal(operation, portal) {
  if (!portal) {
    alert(wX("SELECT PORTAL"));
    return;
  }
  operation.addPortal(portal);
}

export function swapPortal(operation, portal) {
  const selectedPortal = WasabeePortal.getSelected();
  if (!selectedPortal) {
    alert(wX("SELECT PORTAL"));
    return;
  }
  if (portal.id === selectedPortal.id) {
    alert(wX("SELF SWAP"));
    return;
  }

  const pr = L.DomUtil.create("div", null);
  pr.textContent = wX("SWAP PROMPT");
  pr.appendChild(portal.displayFormat());
  L.DomUtil.create("span", null, pr).textContent = wX("SWAP WITH");
  pr.appendChild(selectedPortal.displayFormat());
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

export function deletePortal(operation, portal) {
  const pr = L.DomUtil.create("div", null);
  pr.textContent = wX("DELETE ANCHOR PROMPT");
  pr.appendChild(portal.displayFormat());
  const con = new ConfirmDialog({
    title: wX("DELETE ANCHOR TITLE"),
    label: pr,
    type: "anchor",
    callback: () => {
      operation.removeAnchor(portal.id);
    },
  });
  con.enable();
}

export function deleteMarker(operation, marker, portal) {
  const pr = L.DomUtil.create("div", null);
  pr.textContent = wX("DELETE MARKER PROMPT");
  pr.appendChild(portal.displayFormat());
  const con = new ConfirmDialog({
    title: wX("DELETE MARKER TITLE"),
    label: pr,
    type: "marker",
    callback: () => {
      operation.removeMarker(marker);
    },
  });
  con.enable();
}

export function clearAllItems(operation) {
  const con = new ConfirmDialog({
    title: `Clear: ${operation.name}`,
    label: `Do you want to reset ${operation.name}?`,
    type: "operation",
    callback: () => {
      operation.clearAllItems();
      window.map.fire("wasabeeCrosslinks", { reason: "clearAllItems" }, false);
    },
  });
  con.enable();
}

export function clearAllLinks(operation) {
  const con = new ConfirmDialog({
    title: `Clear Links: ${operation.name}`,
    label: `Do you want to remove all links from ${operation.name}?`,
    type: "operation",
    callback: () => {
      operation.clearAllLinks();
      window.map.fire("wasabeeCrosslinks", { reason: "clearAllItems" }, false);
    },
  });
  con.enable();
}

export function clearAllMarkers(operation) {
  const con = new ConfirmDialog({
    title: `Clear Markers: ${operation.name}`,
    label: `Do you want to remove all markers from ${operation.name}?`,
    type: "operation",
    callback: () => {
      operation.clearAllMarkers();
      window.map.fire("wasabeeCrosslinks", { reason: "clearAllItems" }, false);
    },
  });
  con.enable();
}

export function listenForAddedPortals(newPortal) {
  if (!newPortal.portal.options.data.title) return;

  const op = getSelectedOperation();
  op.updatePortal(WasabeePortal.fromIITC(newPortal.portal));
}

export function listenForPortalDetails(e) {
  if (!e.success) return;
  const op = getSelectedOperation();
  op.updatePortal(
    new WasabeePortal({
      id: e.guid,
      name: e.details.title,
      lat: (e.details.latE6 / 1e6).toFixed(6),
      lng: (e.details.lngE6 / 1e6).toFixed(6),
    })
  );
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

export function loadFaked(operation, force = false) {
  const flag =
    localStorage[window.plugin.wasabee.static.constants.AUTO_LOAD_FAKED] ||
    false;

  // local storage always returns as string
  if (flag !== "true" && !force) return;

  const f = new Array();
  for (const x of operation.fakedPortals) f.push(x.id);
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

export function getAllPortalsOnScreen(operation) {
  const bounds = window.map.getBounds();
  const x = [];
  for (const portal in window.portals) {
    if (bounds.contains(window.portals[portal].getLatLng())) {
      if (
        operation.containsMarkerByID(
          window.portals[portal].options.guid,
          window.plugin.wasabee.static.constants.MARKER_TYPE_EXCLUDE
        )
      )
        continue;
      const wp = WasabeePortal.fromIITC(window.portals[portal]);
      if (wp) x.push(wp);
    }
  }
  return x;
}

export function getAllPortalsLinked(operation, originPortal) {
  const x = [];
  for (const link in window.links) {
    const p = window.links[link];

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

    if (operation.containsLinkFromTo(linkPortal1, linkPortal2)) {
      continue;
    }
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

// this is the test point used in several auto-draws
// settings allow there to be several different due to
// rouding errors resulting from long distances
export function testPortal(recursed = false) {
  let urp =
    localStorage[
      window.plugin.wasabee.static.constants.MULTIMAX_UNREACHABLE_KEY
    ];
  if (!urp) {
    urp = '{"lat":-74.2,"lng":-143.4}';
    localStorage[
      window.plugin.wasabee.static.constants.MULTIMAX_UNREACHABLE_KEY
    ] = urp;
  }

  let parsed = null;
  try {
    parsed = JSON.parse(urp);
  } catch (err) {
    if (!recursed) {
      delete localStorage[
        window.plugin.wasabee.static.constants.MULTIMAX_UNREACHABLE_KEY
      ];
      return testPortal(true);
    }
  }

  // if recrused and still getting garbage, we have a problem
  return parsed;
}

// recursive function to auto-mark blockers
export function blockerAutomark(operation, first = true) {
  if (first) operation.startBatchMode();
  // build count list
  const portals = new Array();
  for (const b of operation.blockers) {
    if (
      !operation.containsMarkerByID(
        b.fromPortalId,
        window.plugin.wasabee.static.constants.MARKER_TYPE_EXCLUDE
      )
    )
      portals.push(b.fromPortalId);
    if (
      !operation.containsMarkerByID(
        b.toPortalId,
        window.plugin.wasabee.static.constants.MARKER_TYPE_EXCLUDE
      )
    )
      portals.push(b.toPortalId);
  }
  const reduced = {};
  for (const p of portals) {
    if (!reduced[p]) reduced[p] = 0;
    reduced[p]++;
  }
  const sorted = Object.entries(reduced).sort((a, b) => b[1] - a[1]);

  // return from recursion
  if (sorted.length == 0) {
    if (first) operation.endBatchMode();
    window.map.fire("wasabeeUIUpdate", { reason: "blockerAutomark" }, false);
    return;
  }

  const portalId = sorted[0][0];

  // put in some smarts for picking close portals, rather than random ones
  // when the count gets > 3

  // get WasabeePortal for portalId
  let wportal = operation.getPortal(portalId);
  if (!wportal) wportal = WasabeePortal.get(portalId);
  if (!wportal) {
    alert(wX("AUTOMARK STOP"));
    return;
  }
  // console.log(wportal);

  // add marker
  let type = window.plugin.wasabee.static.constants.MARKER_TYPE_DESTROY;
  if (wportal.team == "E") {
    type = window.plugin.wasabee.static.constants.MARKER_TYPE_VIRUS;
  }
  operation.addMarker(type, wportal, { comment: "auto-marked" });

  // remove nodes from blocker list
  operation.blockers = operation.blockers.filter((b) => {
    if (b.fromPortalId == portalId || b.toPortalId == portalId) return false;
    return true;
  });
  // recurse
  blockerAutomark(operation, false);

  if (first) operation.endBatchMode();
}

export async function fullSync() {
  const so = getSelectedOperation();
  const server = GetWasabeeServer();

  try {
    const me = await WasabeeMe.waitGet(true);
    const promises = new Array();
    const opsID = new Set(me.Ops.map((o) => o.ID));

    // delete operations absent from server unless the owner
    const ol = await opsList();
    const serverOps = new Set(
      ol
        .map(await WasabeeOp.load)
        .filter((op) => op)
        .filter((op) => op.server == server && !opsID.has(op.ID))
    );
    for (const op of serverOps) {
      // if owned, duplicate the OP
      if (op.IsOwnedOp()) {
        const newop = await duplicateOperation(op.ID);
        newop.name = op.name;
        await newop.store();
      }
      await removeOperation(op.ID);
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
    for (const newop of ops) {
      const localOp = await WasabeeOp.load(newop.ID);
      if (!localOp || !localOp.localchanged) await newop.store();
      else if (localOp.lasteditid != newop.lasteditid) {
        const op = localOp.ID != so.ID ? localOp : so;
        // check if there are really local changes
        // XXX: this may be too long to do
        if (!op.checkChanges()) {
          await newop.store();
        } else {
          // partial update on fields the server is always right
          // XXX: do we need zone for teamlist consistency ?
          op.teamlist = newop.teamlist;
          op.remoteChanged = true;
          await op.store();

          // In case of selected op, suggest merge to the user
          if (so === op) {
            const con = new MergeDialog({
              opOwn: so,
              opRemote: newop,
            });
            con.enable();
          }
        }
      }
    }

    // replace current op by the server version if any
    if (ops.some((op) => op.ID == so.ID)) await makeSelectedOperation(so.ID);
    // change op if the current does not exist anymore
    else if (!ol.includes(so.ID)) await changeOpIfNeeded();
    // update UI to reflect new ops list
    else window.map.fire("wasabeeUIUpdate", { reason: "full sync" }, false);

    alert(wX("SYNC DONE"));
  } catch (e) {
    console.error(e);
    new AuthDialog().enable();
  }
}

export async function syncOp(opID) {
  const localOp = WasabeeOp.load(opID);
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

export function deleteLocalOp(opname, opid) {
  const con = new ConfirmDialog({
    title: wX("REM_LOC_CP", { opName: opname }),
    label: wX("YESNO_DEL", { opName: opname }),
    type: "operation",
    callback: async () => {
      await removeOperation(opid);
      const newop = await changeOpIfNeeded();
      const mbr = newop.mbr;
      if (mbr && isFinite(mbr._southWest.lat) && isFinite(mbr._northEast.lat)) {
        window.map.fitBounds(mbr);
      }
    },
  });
  con.enable();
}

export async function resetCaches() {
  await window.plugin.wasabee.idb.clear("agents");
  await window.plugin.wasabee.idb.clear("teams");
  await window.plugin.wasabee.idb.clear("defensivekeys");
}
