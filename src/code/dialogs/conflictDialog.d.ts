import { WDialog, WDialogOptions } from "../leafletClasses";
import { WasabeeOp } from "../model";
interface ConflictDialogOptions extends WDialogOptions {
  title?: string;
  opOwn: WasabeeOp;
  opRemote: WasabeeOp;
  updateCallback?: (op: WasabeeOp) => void;
  cancelText?: string;
}
declare class ConflictDialog extends WDialog {
  options: ConflictDialogOptions;
  constructor(options: ConflictDialogOptions);
}
export default ConflictDialog;
