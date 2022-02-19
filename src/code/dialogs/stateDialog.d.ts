import { WDialog, WDialogOptions } from "../leafletClasses";
import { WasabeeLink } from "../model";
import { WasabeeMarker } from "../model";
interface StateDialogOptions extends WDialogOptions {
  target: WasabeeMarker | WasabeeLink;
  opID: string;
}
declare class StateDialog extends WDialog {
  options: StateDialogOptions;
  constructor(options: StateDialogOptions);
}
export default StateDialog;
