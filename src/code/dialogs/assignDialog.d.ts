import { WDialog, WDialogOptions } from "../leafletClasses";
import WasabeeLink from "../model/link";
import WasabeeMarker from "../model/marker";
import WasabeePortal from "../model/portal";
interface AssignDialogOptions extends WDialogOptions {
  target: WasabeeLink | WasabeeMarker | WasabeePortal;
}
declare class AssignDialog extends WDialog {
  needWritePermission: true;
  options: AssignDialogOptions;
  constructor(options: AssignDialogOptions);
}
export default AssignDialog;
