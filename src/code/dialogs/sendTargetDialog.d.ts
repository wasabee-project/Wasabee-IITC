import { WDialog, WDialogOptions } from "../leafletClasses";
import { WasabeeMarker } from "../model";
import { WasabeePortal } from "../model";

interface SendTargetDialogOptions extends WDialogOptions {
  target: WasabeeMarker | WasabeePortal;
}
declare class SendTargetDialog extends WDialog {
  options: SendTargetDialogOptions;
  constructor(options: SendTargetDialogOptions);
}
export default SendTargetDialog;
