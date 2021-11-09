import type WasabeeOp from "../model/operation";
import PortalUI from "./portal";

declare class WLAnchor extends PortalUI.WLPortal {
  constructor(portalId: string, operation: WasabeeOp);
  _popupContent(): any;
  _linksButton(container: any): void;
  _swapButton(container: any): void;
  _deleteAction(): void;
}
declare const _default: {
  WLAnchor: typeof WLAnchor;
};
export default _default;
