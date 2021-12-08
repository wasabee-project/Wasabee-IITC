import { WDialog, WDialogOptions } from "../leafletClasses";

interface TeamMembershipListOptions extends WDialogOptions {
  teamID: string;
}
declare class TeamMembershipList extends WDialog {
  options: TeamMembershipListOptions;
  constructor(options: TeamMembershipListOptions);
}
export default TeamMembershipList;
