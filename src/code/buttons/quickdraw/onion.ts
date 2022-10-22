import type { WasabeeOp, WasabeePortal } from "../../model";
import type { QuickDrawMode } from "./mode";
import wX from "../../wX";
import { portalInField } from "../../geo";

export class Onion implements QuickDrawMode {
  name: "onion";

  anchor1: WasabeePortal;
  anchor2: WasabeePortal;
  anchor3: WasabeePortal;

  constructor() {
    this.anchor1 = null;
    this.anchor2 = null;
    this.anchor3 = null;
  }

  onPortalClick(
    op: WasabeeOp,
    portal: WasabeePortal,
    options: { color?: string }
  ) {
    if (!this.anchor1) {
      this.anchor1 = portal;
    } else if (!this.anchor2) {
      if (this.anchor1.id !== portal.id) {
        op.addLink(portal, this.anchor1, {
          order: op.nextOrder,
          color: options.color,
        });
        this.anchor2 = portal;
      }
    } else if (!this.anchor3) {
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
        this.anchor3 = portal;
      }
    } else {
      if (
        this.anchor1.id !== portal.id &&
        this.anchor2.id !== portal.id &&
        this.anchor3.id !== portal.id
      ) {
        // add a covering layer if possible
        const targets = [];
        if (portalInField(portal, this.anchor1, this.anchor2, this.anchor3)) {
          targets.push(this.anchor1, this.anchor2, this.anchor3);
          this.anchor3 = portal;
        } else if (
          portalInField(portal, this.anchor2, this.anchor3, this.anchor1)
        ) {
          targets.push(this.anchor2, this.anchor3, this.anchor1);
          this.anchor1 = portal;
        } else if (
          portalInField(portal, this.anchor3, this.anchor1, this.anchor2)
        ) {
          targets.push(this.anchor3, this.anchor1, this.anchor2);
          this.anchor2 = portal;
        }
        if (targets.length == 3) {
          op.startBatchMode();
          op.addLink(portal, targets[0], {
            description: "qd onion",
            order: op.nextOrder,
            color: options.color,
          });
          op.addLink(portal, targets[1], {
            description: "qd onion",
            order: op.nextOrder,
            color: options.color,
          });
          op.addLink(portal, targets[2], {
            description: "qd onion backlink",
            order: op.nextOrder,
            color: options.color,
          });
          op.endBatchMode();
        }
      }
    }
  }

  getGuides(latlng: L.LatLng) {
    if (!this.anchor1) return [];
    if (!this.anchor2) return [[this.anchor1.latLng, latlng]];
    if (!this.anchor3)
      return [
        [this.anchor1.latLng, latlng],
        [this.anchor2.latLng, latlng],
      ];
    return [
      [this.anchor1.latLng, latlng],
      [this.anchor2.latLng, latlng],
      [this.anchor3.latLng, latlng],
    ];
  }

  getTooltip() {
    if (!this.anchor1) return wX("toolbar.quick_draw.tooltip.onion.anchor1");
    if (!this.anchor2) return wX("toolbar.quick_draw.tooltip.onion.anchor2");
    if (!this.anchor3) return wX("toolbar.quick_draw.tooltip.onion.anchor3");
    return wX("toolbar.quick_draw.tooltip.onion.portal");
  }
}
