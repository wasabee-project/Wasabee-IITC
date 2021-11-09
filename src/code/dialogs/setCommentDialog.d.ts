import { WDialog, WDialogOptions } from "../leafletClasses";
import WasabeePortal from "../model/portal";
import WasabeeLink from "../model/link";
import WasabeeMarker from "../model/marker";
import type WasabeeOp from "../model/operation";
interface SetCommentDialogOptions extends WDialogOptions {
  target: WasabeeMarker | WasabeeLink | WasabeePortal;
  operation: WasabeeOp;
}
export declare class SetCommentDialog extends WDialog {
  options: SetCommentDialogOptions;
  constructor(options: SetCommentDialogOptions);
}
export default SetCommentDialog;
