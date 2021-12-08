import { WDialog, WDialogOptions } from "../leafletClasses";
import WasabeeMarker from "../model/marker";
import WasabeePortal from "../model/portal";

interface SendTargetDialogOptions extends WDialogOptions {
  target: WasabeeMarker | WasabeePortal;
}
declare class SendTargetDialog extends WDialog {
  options: SendTargetDialogOptions;
  constructor(options: SendTargetDialogOptions);
}
export default SendTargetDialog;
