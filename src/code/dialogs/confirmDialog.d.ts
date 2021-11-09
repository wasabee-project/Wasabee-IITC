import { WDialog, WDialogOptions } from "../leafletClasses";
interface ConfirmDialogOptions extends WDialogOptions {
  title: string;
  label: string | HTMLElement;
  type?: "agent" | "anchor" | "link" | "marker" | "zone" | "operation" | "team";
  callback?: () => void;
  cancelCallback?: () => void;
}
declare class ConfirmDialog extends WDialog {
  options: ConfirmDialogOptions;
  constructor(options: ConfirmDialogOptions);
}
export default ConfirmDialog;
