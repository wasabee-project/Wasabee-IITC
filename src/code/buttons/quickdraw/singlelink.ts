import type { WasabeeOp, WasabeePortal } from "../../model";
import type { QuickDrawMode } from "./mode";
import wX from "../../wX";

export class SingleLink implements QuickDrawMode {
  name: "singlelink";

  prev: WasabeePortal;

  constructor() {
    this.prev = null;
  }

  onPortalClick(
    op: WasabeeOp,
    portal: WasabeePortal,
    options: { color?: string }
  ) {
    if (this.prev) {
      if (this.prev.id !== portal.id) {
        op.addLink(portal, this.prev, {
          order: op.nextOrder,
          color: options.color,
        });
      }
    }
    this.prev = portal;
  }

  getGuides(latlng: L.LatLng) {
    if (!this.prev) return [];
    return [[this.prev.latLng, latlng]];
  }

  getTooltip() {
    if (!this.prev) return wX("toolbar.quick_draw.tooltip.single_mode.first");
    return wX("toolbar.quick_draw.tooltip.single_mode.next");
  }
}
