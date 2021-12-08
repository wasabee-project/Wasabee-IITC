import { WDialog, WDialogOptions } from "../leafletClasses";

interface KeyListPortalOptions extends WDialogOptions {
  portalID: string;
}
declare class KeyListPortal extends WDialog {
  options: KeyListPortalOptions;
  constructor(options: KeyListPortalOptions);
}
export default KeyListPortal;
