import { WasabeePortal, WasabeeMarker, WasabeeBlocker } from "./model";
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
  if (
    greatCircleArcIntersectByLatLngs(
      realLink.getLatLngs(),
      wasabeeLink.getLatLngs(operation)
    )
  ) {
    if (!operation.markers || operation.markers.length == 0) {
      return true;
    }

    for (const marker of operation.markers) {
      if (
        marker.type == WasabeeMarker.constants.MARKER_TYPE_DESTROY ||
        marker.type == WasabeeMarker.constants.MARKER_TYPE_VIRUS ||
        marker.type == WasabeeMarker.constants.MARKER_TYPE_DECAY
      ) {
        if (
          marker.portalId == realLink.options.data.dGuid ||
          marker.portalId == realLink.options.data.oGuid
        ) {
          return false;
        }
      }
    }
    return true;
  }
  return false;
}

async function testLink(link: IITC.Link, operation: WasabeeOp) {
  // if the crosslink already exists, do not recheck
  if (cache.has(link.options.data.oGuid + link.options.data.dGuid)) {
    return;
  }

  for (const drawnLink of operation.links) {
    if (testPolyLine(drawnLink, link, operation)) {
      cache.add(link.options.data.oGuid + link.options.data.dGuid);
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
      await WasabeeBlocker.addBlocker(operation, fromPortal, toPortal);
      window.plugin.wasabee.crossLinkLayers.addBlocker(fromPortal, toPortal);
      break;
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

// lets see if using a generator makes the GUI more responsive on large ops
// -- yeild doesn't seem to release the main thread, maybe we need to yeild a
// Promise.resolve(window.links[g]) and await it in the for loop?
function* realLinks() {
  const guids = Object.getOwnPropertyNames(window.links);
  // it is possible that the link was purged while we were yielded
  // checking here should reduce the workload while scrolling/zooming
  for (const g of guids) {
    if (window.links[g] != null) yield window.links[g];
  }
}

export function checkAllLinks() {
  if (window.isLayerGroupDisplayed("Wasabee Cross Links") === false) return;

  const operation = getSelectedOperation();

  cache.clear();

  if (!operation.links || operation.links.length == 0) return;

  const linkGenerator = realLinks();
  for (const link of linkGenerator) {
    testLink(link, operation);
  }

  for (const l of operation.links) {
    if (testSelfBlock(l, operation)) {
      const blocked = L.geodesicPolyline(
        l.getLatLngs(operation),
        window.plugin.wasabee.skin.selfBlockStyle
      );
      blocked.options.interactive = false;
      blocked.addTo(window.plugin.wasabee.crossLinkLayers);
    }
  }
  window.map.fire("wasabee:crosslinks:done");
}

function onLinkAdded(data: EventLinkAdded) {
  testLink(data.link, getSelectedOperation());
}

function onMapDataRefreshStart() {
  window.removeHook("linkAdded", onLinkAdded);
}

function onMapDataRefreshEnd() {
  if (window.isLayerGroupDisplayed("Wasabee Cross Links") === false) return;
  window.plugin.wasabee.crossLinkLayers.bringToFront();

  checkAllLinks();
  window.addHook("linkAdded", onLinkAdded);
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

  window.addHook("mapDataRefreshStart", onMapDataRefreshStart);
  window.addHook("mapDataRefreshEnd", onMapDataRefreshEnd);
}
