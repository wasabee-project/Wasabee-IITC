import type WasabeeOp from "../model/operation";
import { WLPortal } from "./portal";

export class WLAnchor extends WLPortal {
  constructor(portalId: string, operation: WasabeeOp);
  _popupContent(): any;
  _linksButton(container: any): void;
  _swapButton(container: any): void;
  _deleteAction(): void;
}
