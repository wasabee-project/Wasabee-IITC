import { WDialog, WDialogOptions } from "../leafletClasses";
import { WasabeeLink } from "../model";
import { WasabeeMarker } from "../model";
import { WasabeePortal } from "../model";
interface AssignDialogOptions extends WDialogOptions {
  target: WasabeeLink | WasabeeMarker | WasabeePortal;
}
declare class AssignDialog extends WDialog {
  needWritePermission: true;
  options: AssignDialogOptions;
  constructor(options: AssignDialogOptions);
}
export default AssignDialog;
