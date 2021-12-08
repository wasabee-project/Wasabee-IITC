import { WDialog, WDialogOptions } from "../leafletClasses";

declare class AutodrawsDialog extends WDialog {
  needWritePermission: true;
  constructor(options?: WDialogOptions);
}
export default AutodrawsDialog;
