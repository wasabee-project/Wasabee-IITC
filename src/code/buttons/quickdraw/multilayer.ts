import type { WasabeeOp, WasabeePortal } from "../../model";
import type { QuickDrawMode } from "./mode";
import { constants } from "../../static";
import wX from "../../wX";

export class MultiLayer implements QuickDrawMode {
  name: "multilayer";

  anchor1: WasabeePortal;
  anchor2: WasabeePortal;

  constructor() {
    this.anchor1 = null;
    this.anchor2 = null;
  }

  onPortalClick(
    op: WasabeeOp,
    portal: WasabeePortal,
    options: { color?: string }
  ) {
    if (!this.anchor1) {
      this.anchor1 = portal;
      // save for auto-draw usage
      localStorage[constants.ANCHOR_ONE_KEY] = JSON.stringify(this.anchor1);
    } else if (!this.anchor2) {
      if (this.anchor1.id !== portal.id) {
        op.addLink(portal, this.anchor1, {
          description: wX("QDBASE"),
          order: op.nextOrder,
          color: options.color,
        });
        this.anchor2 = portal;
        // save for auto-draw usage
        localStorage[constants.ANCHOR_TWO_KEY] = JSON.stringify(this.anchor2);
      }
    } else {
      if (this.anchor1.id !== portal.id && this.anchor2.id !== portal.id) {
        op.startBatchMode();
        op.addLink(portal, this.anchor1, {
          order: op.nextOrder,
          color: options.color,
        });
        op.addLink(portal, this.anchor2, {
          order: op.nextOrder,
          color: options.color,
        });
        op.endBatchMode();
      }
    }
  }

  getGuides(latlng: L.LatLng) {
    if (!this.anchor1) return [];
    if (!this.anchor2) return [[this.anchor1.latLng, latlng]];
    return [
      [this.anchor1.latLng, latlng],
      [this.anchor2.latLng, latlng],
    ];
  }

  getTooltip() {
    if (!this.anchor1) return wX("QDSTART");
    if (!this.anchor2) return wX("QDNEXT");
    return wX("QDCONT");
  }
}
