import { WDialog, WDialogOptions } from "../leafletClasses";
import { WasabeeLink, WasabeeMarker, WasabeePortal } from "../model";
interface AssignDialogOptions extends WDialogOptions {
  target: WasabeeLink | WasabeeMarker | WasabeePortal;
}
declare class AssignDialog extends WDialog {
  needWritePermission: true;
  options: AssignDialogOptions;
  constructor(options: AssignDialogOptions);
}
export default AssignDialog;
