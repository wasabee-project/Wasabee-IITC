import { getSelectedOperation } from "../selectedOp";

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
