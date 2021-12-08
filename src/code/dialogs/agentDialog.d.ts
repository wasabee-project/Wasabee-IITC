import { WDialog, WDialogOptions } from "../leafletClasses";
interface AgentDialogOptions extends WDialogOptions {
  gid: string;
}
declare class AgentDialog extends WDialog {
  options: AgentDialogOptions;
  constructor(options: AgentDialogOptions);
}
export default AgentDialog;
