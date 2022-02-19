import type WasabeeOp from "../model/operation";
import type WasabeeLink from "../model/link";

interface WLLinkOptions extends L.PolylineOptions {
  opID: OpID;
  linkID: LinkID;
}

export class WLLink extends L.GeodesicPolyline {
  _wlink: WasabeeLink;
  options: WLLinkOptions;
  constructor(link: WasabeeLink, operation: WasabeeOp);
  _getPopup(): HTMLDivElement;
}
