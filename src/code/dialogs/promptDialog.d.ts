import { WDialog, WDialogOptions } from "../leafletClasses";

interface PromptDialogOptions extends WDialogOptions {
  title: string;
  label: string;
  placeholder?: string;
  current?: string;
  suggestions?: {
    text: string;
    value: string;
  }[];
  callback?: () => void;
  cancelCallback?: () => void;
}
declare class PromptDialog extends WDialog {
  inputField: HTMLInputElement;
  options: PromptDialogOptions;
  constructor(options: PromptDialogOptions);
}
export default PromptDialog;
