import type { WasabeeOp } from "./model";
import { WasabeePortal } from "./model";
import { WasabeeBlocker } from "./model";
import { WasabeeMarker } from "./model";
import ConfirmDialog from "./dialogs/confirmDialog";
import { WasabeeMe } from "./model";
import wX from "./wX";
import { locationPromise } from "./server";

import * as PortalUI from "./ui/portal";
import { displayInfo } from "./error";
import { deleteDatabase } from "./db";
import { constants } from "./static";
import type { Wasabee } from "./init";

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
