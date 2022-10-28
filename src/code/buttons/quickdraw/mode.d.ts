import type { WasabeeOp, WasabeePortal } from "../../model";

export interface QuickDrawMode {
  name: string;
  getName(): string;
  onPortalClick(
    op: WasabeeOp,
    portal: WasabeePortal,
    options: { color?: string }
  ): void;
  getGuides(latlng: L.LatLng): L.LatLngExpression[][];
  getTooltip(latlng?: L.LatLng): string;
}
