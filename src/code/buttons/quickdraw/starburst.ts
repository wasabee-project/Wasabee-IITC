import type { WasabeeOp, WasabeePortal } from "../../model";
import type { QuickDrawMode } from "./mode";
import wX from "../../wX";

export class StarBurst implements QuickDrawMode {
  name: "starburst";

  anchor: WasabeePortal;

  constructor() {
    this.anchor = null;
  }

  onPortalClick(
    op: WasabeeOp,
    portal: WasabeePortal,
    options: { color?: string }
  ) {
    if (!this.anchor) {
      this.anchor = portal;
    } else {
      if (this.anchor.id !== portal.id) {
        op.addLink(portal, this.anchor, {
          order: op.nextOrder,
          color: options.color,
        });
      }
    }
  }

  getGuides(latlng: L.LatLng) {
    if (!this.anchor) return [];
    return [[this.anchor.latLng, latlng]];
  }

  getTooltip() {
    if (!this.anchor) return wX("toolbar.quick_draw.tooltip.star_mode.anchor");
    return wX("toolbar.quick_draw.tooltip.star_mode.portal");
  }
}
