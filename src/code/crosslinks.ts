import { WasabeePortal, WasabeeBlocker } from "./model";
import { getSelectedOperation } from "./selectedOp";

import * as PortalUI from "./ui/portal";
import type WasabeeOp from "./model/operation";
import type { IITC } from "../types/iitc";
import type WasabeeLink from "./model/link";

import { greatCircleArcIntersectByLatLngs } from "./geo";
import { WLBlockerLayer } from "./map/blocker";

const cache = new Set<string>();

function testPolyLine(
  wasabeeLink: WasabeeLink,
  realLink: IITC.Link,
  operation: WasabeeOp
) {
  return greatCircleArcIntersectByLatLngs(
    realLink.getLatLngs(),
    wasabeeLink.getLatLngs(operation)
  );
}

async function addBlockerFromIITC(link: IITC.Link, operation: WasabeeOp) {
  let fromPortal =
    operation.getPortal(link.options.data.oGuid) ||
    PortalUI.get(link.options.data.oGuid);
  if (!fromPortal)
    fromPortal = WasabeePortal.fake(
      (link.options.data.oLatE6 / 1e6).toFixed(6),
      (link.options.data.oLngE6 / 1e6).toFixed(6),
      link.options.data.oGuid
    );
  let toPortal =
    operation.getPortal(link.options.data.dGuid) ||
    PortalUI.get(link.options.data.dGuid);
  if (!toPortal)
    toPortal = WasabeePortal.fake(
      (link.options.data.dLatE6 / 1e6).toFixed(6),
      (link.options.data.dLngE6 / 1e6).toFixed(6),
      link.options.data.dGuid
    );
  window.plugin.wasabee.crossLinkLayers.addBlocker(fromPortal, toPortal);
  await WasabeeBlocker.addBlocker(
    operation,
    fromPortal,
    toPortal,
    link.options.data.team as WasabeeBlocker["team"]
  );
}

async function testLink(link: IITC.Link, operation: WasabeeOp) {
  // if the crosslink already exists, do not recheck
  if (cache.has(link.options.data.oGuid + link.options.data.dGuid)) {
    return;
  }
  cache.add(link.options.data.oGuid + link.options.data.dGuid);

  let cross = false;
  for (const drawnLink of operation.links) {
    if (testPolyLine(drawnLink, link, operation)) {
      if (!cross) {
        await addBlockerFromIITC(link, operation);
        cross = true;
      }
      drawnLink.blocked = true;
    }
  }
}

export function testSelfBlock(incoming: WasabeeLink, operation: WasabeeOp) {
  for (const against of operation.links) {
    if (incoming.ID == against.ID) continue;
    if (
      greatCircleArcIntersectByLatLngs(
        against.getLatLngs(operation),
        incoming.getLatLngs(operation)
      )
    ) {
      return true;
    }
  }
  return false;
}

/** Test a Wasabee link against known blockers */
export function testBlocked(
  incoming: WasabeeLink,
  operation: WasabeeOp,
  blockers: WasabeeBlocker[]
) {
  for (const b of blockers) {
    if (
      greatCircleArcIntersectByLatLngs(incoming.getLatLngs(operation), [
        b.fromPortal.latLng,
        b.toPortal.latLng,
      ])
    ) {
      return true;
    }
  }
  return false;
}

/** Test a known blocker against all Wasabee links */
export function testBlocker(operation: WasabeeOp, blocker: WasabeeBlocker) {
  for (const l of operation.links) {
    if (
      greatCircleArcIntersectByLatLngs(l.getLatLngs(operation), [
        blocker.fromPortal.latLng,
        blocker.toPortal.latLng,
      ])
    ) {
      return true;
    }
  }
  return false;
}

export async function checkAllLinks() {
  if (window.isLayerGroupDisplayed("Wasabee Cross Links") === false) return;

  const operation = getSelectedOperation();

  cache.clear();

  if (!operation.links || operation.links.length == 0) {
    WasabeeBlocker.removeBlockers(operation.ID);
    window.map.fire("wasabee:crosslinks:done");
    return;
  }

  // re-test known data (link/link, link/blocker)
  const blockers = await WasabeeBlocker.getAll(operation);
  for (const l of operation.links) {
    l.blocked = testBlocked(l, operation, blockers);
    l.selfBlocked = testSelfBlock(l, operation);
  }
  for (const b of blockers) {
    cache.add(b.from + b.to);
    if (!testBlocker(operation, b)) {
      WasabeeBlocker.removeBlocker(operation, b.from, b.to);
    }
  }

  const markers: PortalID[] = [];
  for (const marker of operation.markers) {
    if (marker.isDestructMarker()) {
      markers.push(marker.portalId);
    }
  }

  const links: IITC.Link[] = [];
  for (const guid in window.links) {
    const l = window.links[guid];
    if (
      l &&
      !markers.includes(l.options.data.oGuid) &&
      !markers.includes(l.options.data.dGuid)
    )
      links.push(l);
  }

  // test all intel links
  for (const link of links) {
    await testLink(link, operation);
  }
  window.map.fire("wasabee:crosslinks:done");
}

function onMapDataRefreshEnd() {
  if (window.isLayerGroupDisplayed("Wasabee Cross Links") === false) return;
  window.plugin.wasabee.crossLinkLayers.bringToFront();

  checkAllLinks();
}

export function initCrossLinks() {
  window.map.on("wasabee:crosslinks", checkAllLinks);
  window.plugin.wasabee.crossLinkLayers = new WLBlockerLayer();
  window.addLayerGroup(
    "Wasabee Cross Links",
    window.plugin.wasabee.crossLinkLayers,
    true
  );

  window.plugin.wasabee.crossLinkLayers.on("add", checkAllLinks);

  window.addHook("mapDataRefreshEnd", onMapDataRefreshEnd);
}
