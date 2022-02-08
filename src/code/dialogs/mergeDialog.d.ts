import { WDialog, WDialogOptions } from "../leafletClasses";
import WasabeeOp from "../model/operation";
interface MergeDialogOptions extends WDialogOptions {
  title?: string;
  opOwn: WasabeeOp;
  opRemote: WasabeeOp;
  updateCallback?: (op: WasabeeOp) => void;
  cancelText?: string;
}
declare class MergeDialog extends WDialog {
  options: MergeDialogOptions;
  constructor(options: MergeDialogOptions);
}
export default MergeDialog;
