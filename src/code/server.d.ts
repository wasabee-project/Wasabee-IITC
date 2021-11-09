import WasabeeOp from "./model/operation";
import WasabeeMarker from "./model/marker";
import type WasabeeLink from "./model/link";
import type WasabeePortal from "./model/portal";
import type { WDKey } from "./wd";
interface IServerUpdate {
    updateID?: string;
}
export default function (): any;
export declare function uploadOpPromise(): Promise<WasabeeOp>;
export declare function updateOpPromise(operation: WasabeeOp): Promise<boolean>;
export declare function deleteOpPromise(opID: OpID): Promise<IServerUpdate>;
export declare function statOpPromise(opID: OpID): Promise<string | IServerUpdate>;
export declare function teamPromise(teamid: TeamID): Promise<string | IServerUpdate>;
export declare function opPromise(opID: OpID): Promise<WasabeeOp>;
export declare function mePromise(): Promise<string | IServerUpdate>;
export declare function agentPromise(GID: GoogleID): Promise<string | IServerUpdate>;
export declare function assignMarkerPromise(opID: OpID, markerID: MarkerID, agentID: GoogleID): Promise<string>;
export declare function assignLinkPromise(opID: OpID, linkID: LinkID, agentID: GoogleID): Promise<string>;
export declare function targetPromise(agentID: GoogleID, portal: WasabeePortal, type?: string): Promise<string>;
export declare function routePromise(agentID: GoogleID, portal: WasabeePortal): Promise<string>;
export declare function SendAccessTokenAsync(accessToken: string): Promise<string>;
export declare function SetTeamState(teamID: TeamID, state: "On" | "Off"): Promise<string | IServerUpdate>;
export declare function SetTeamShareWD(teamID: TeamID, state: "On" | "Off"): Promise<string | IServerUpdate>;
export declare function SetTeamLoadWD(teamID: TeamID, state: "On" | "Off"): Promise<string | IServerUpdate>;
export declare function SetMarkerState(opID: OpID, markerID: MarkerID, state: string): Promise<string | IServerUpdate>;
export declare function SetLinkState(opID: OpID, linkID: LinkID, state: string): Promise<string | IServerUpdate>;
export declare function opKeyPromise(opID: OpID, portalID: PortalID, onhand: number, capsule: string): Promise<string>;
export declare function dKeyPromise(json: string): Promise<string>;
export declare function dKeyBulkPromise(json: string): Promise<string>;
export declare function dKeylistPromise(): Promise<{
    DefensiveKeys: WDKey[];
}>;
export declare function locationPromise(lat: number, lng: number): Promise<string | IServerUpdate>;
export declare function logoutPromise(): Promise<string | IServerUpdate>;
export declare function addPermPromise(opID: OpID, teamID: TeamID, role: string, zone: ZoneID): Promise<string>;
export declare function delPermPromise(opID: OpID, teamID: TeamID, role: string, zone: ZoneID): Promise<IServerUpdate>;
export declare function leaveTeamPromise(teamID: TeamID): Promise<IServerUpdate>;
export declare function removeAgentFromTeamPromise(agentID: GoogleID, teamID: TeamID): Promise<IServerUpdate>;
export declare function setAgentTeamSquadPromise(agentID: GoogleID, teamID: TeamID, squad: string): Promise<string>;
export declare function addAgentToTeamPromise(agentID: GoogleID, teamID: TeamID): Promise<string>;
export declare function renameTeamPromise(teamID: TeamID, name: string): Promise<string>;
export declare function rocksPromise(teamID: TeamID, community: string, apikey: string): Promise<string | IServerUpdate>;
export declare function newTeamPromise(name: string): Promise<string | IServerUpdate>;
export declare function deleteTeamPromise(teamID: TeamID): Promise<IServerUpdate>;
export declare function oneTimeToken(token: string): Promise<string>;
export declare function GetWasabeeServer(): any;
export declare function GetUpdateList(): any;
export declare function SetWasabeeServer(server: string): void;
export declare function sendTokenToWasabee(token: string): Promise<string>;
export declare function getCustomTokenFromServer(): Promise<string | IServerUpdate>;
export declare function loadConfig(): Promise<string | IServerUpdate>;
export declare function changeTeamOwnerPromise(teamID: TeamID, newOwner: GoogleID): Promise<string | IServerUpdate>;
export declare function createJoinLinkPromise(teamID: TeamID): Promise<{
    Key: string;
}>;
export declare function deleteJoinLinkPromise(teamID: TeamID): Promise<string | IServerUpdate>;
export declare function setAssignmentStatus(op: WasabeeOp, object: WasabeeLink | WasabeeMarker, completed: boolean): Promise<string | IServerUpdate>;
export declare function sendAnnounce(teamID: TeamID, message: string): Promise<string>;
export declare function pullRocks(teamID: TeamID): Promise<string | IServerUpdate>;
export declare function reverseLinkDirection(opID: OpID, linkID: LinkID): Promise<string | IServerUpdate>;
export declare function setOpInfo(opID: OpID, info: any): Promise<string>;
export declare function setMarkerComment(opID: OpID, markerID: MarkerID, comment: string): Promise<string>;
export declare function setLinkComment(opID: OpID, linkID: LinkID, desc: string): Promise<string>;
export declare function setLinkZone(opID: OpID, linkID: LinkID, zone: ZoneID): Promise<string>;
export declare function setMarkerZone(opID: OpID, markerID: MarkerID, zone: ZoneID): Promise<string>;
export declare function setIntelID(name: string, faction: string, querytoken: string): Promise<string>;
export { };
