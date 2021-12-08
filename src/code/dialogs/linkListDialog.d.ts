import OperationChecklistDialog from "./checklist";
import type { WDialogOptions } from "../leafletClasses";
import type WasabeePortal from "../model/portal";

interface LinkListDialogOptions extends WDialogOptions {
  portal: WasabeePortal;
}
declare class LinkListDialog extends OperationChecklistDialog {
  options: LinkListDialogOptions;
  constructor(options: LinkListDialogOptions);
}
export default LinkListDialog;
