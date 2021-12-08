import { WDialog, WDialogOptions } from "../leafletClasses";
import { MeTeam } from "../model/me";

interface ManageTeamDialogOptions extends WDialogOptions {
  team: MeTeam;
}
declare class ManageTeamDialog extends WDialog {
  options: ManageTeamDialogOptions;
  constructor(options: ManageTeamDialogOptions);
}
export default ManageTeamDialog;
