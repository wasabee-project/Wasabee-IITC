import WasabeeOp from "../model/operation";
import { WLPortal, WLPortalOptions } from "./portal";

interface WLAnchorOptions extends WLPortalOptions {
  color: string;
}

export class WLAnchor extends WLPortal {
  options: WLAnchorOptions;

  constructor(portalId: string, operation: WasabeeOp, color?: string);
  _popupContent(): any;
  _linksButton(container: any): void;
  _swapButton(container: any): void;
  _deleteAction(): void;
}
