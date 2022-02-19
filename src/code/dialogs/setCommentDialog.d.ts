import { WDialog, WDialogOptions } from "../leafletClasses";
import { WasabeePortal } from "../model";
import { WasabeeLink } from "../model";
import { WasabeeMarker } from "../model";
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
