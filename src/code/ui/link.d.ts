import type WasabeeOp from "../model/operation";
import type WasabeeLink from "../model/link";
declare function displayFormat(
  link: WasabeeLink,
  operation: WasabeeOp,
  smallScreen?: boolean
): HTMLDivElement;
declare function minLevel(
  link: WasabeeLink,
  operation: WasabeeOp
): HTMLSpanElement;
declare class WLLink extends L.GeodesicPolyline {
  _wlink: WasabeeLink;
  constructor(link: WasabeeLink, operation: WasabeeOp);
  _getPopup(): HTMLDivElement;
}
declare const _default: {
  displayFormat: typeof displayFormat;
  minLevel: typeof minLevel;
  WLLink: typeof WLLink;
};
export default _default;
