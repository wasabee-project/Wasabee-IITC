import WasabeeOp from "./model/operation";
import WasabeeMarker from "./model/marker";
import type WasabeeLink from "./model/link";
import type WasabeePortal from "./model/portal";
import type { WDKey } from "./wd";
import WasabeeMe from "./model/me";
import WasabeeTeam from "./model/team";
import WasabeeAgent from "./model/agent";

interface IServerStatus {
    status: string;
}
interface IServerUpdate extends IServerStatus {
    updateID: string;
}

export default function (): string;
export declare function GetWasabeeServer(): string;
export declare function SetWasabeeServer(server: string): void;
export declare function GetUpdateList(): any;

declare function genericGet(url: string, formData: FormData | string, contentType?: string): Promise<any>;
declare function genericPost(url: string, formData: FormData | string, contentType?: string): Promise<any>;
declare function genericPut(url: string, formData: FormData | string, contentType?: string): Promise<any>;
declare function genericDelete(url: string, formData: FormData | string, contentType?: string): Promise<any>;

// server config
export declare function loadConfig(): Promise<string | IServerUpdate>;

// login/out
export declare function SendAccessTokenAsync(accessToken: string): Promise<WasabeeMe>;
export declare function logoutPromise(): Promise<IServerStatus>;
export declare function oneTimeToken(token: string): Promise<WasabeeMe>;
// firebase
export declare function sendTokenToWasabee(token: string): Promise<IServerUpdate>;
export declare function getCustomTokenFromServer(): Promise<string>;

/* me & d */
// query
export declare function mePromise(): Promise<WasabeeMe>;
export declare function dKeylistPromise(): Promise<{
    DefensiveKeys: WDKey[];
}>;
// update data
export declare function leaveTeamPromise(teamID: TeamID): Promise<IServerStatus>;
export declare function locationPromise(lat: number, lng: number): Promise<IServerStatus>;
export declare function setIntelID(name: string, faction: string, querytoken: string): Promise<IServerStatus>;
export declare function SetTeamState(teamID: TeamID, state: "On" | "Off"): Promise<IServerStatus>;
export declare function SetTeamShareWD(teamID: TeamID, state: "On" | "Off"): Promise<IServerStatus>;
export declare function SetTeamLoadWD(teamID: TeamID, state: "On" | "Off"): Promise<IServerStatus>;
export declare function dKeyPromise(json: string): Promise<IServerStatus>;
export declare function dKeyBulkPromise(json: string): Promise<IServerStatus>;

/* agent */
// query
export declare function agentPromise(GID: GoogleID): Promise<WasabeeAgent>;
// action
export declare function targetPromise(agentID: GoogleID, portal: WasabeePortal, type?: string): Promise<IServerStatus>;


/* team */
// query
export declare function teamPromise(teamid: TeamID): Promise<WasabeeTeam>;
export declare function createJoinLinkPromise(teamID: TeamID): Promise<{
    Key: string;
}>;
// action
export declare function sendAnnounce(teamID: TeamID, message: string): Promise<IServerStatus>;
export declare function pullRocks(teamID: TeamID): Promise<IServerStatus>;
// update data
export declare function newTeamPromise(name: string): Promise<IServerStatus>;
export declare function renameTeamPromise(teamID: TeamID, name: string): Promise<IServerStatus>;
export declare function deleteTeamPromise(teamID: TeamID): Promise<IServerStatus>;
export declare function changeTeamOwnerPromise(teamID: TeamID, newOwner: GoogleID): Promise<IServerStatus>;
export declare function addAgentToTeamPromise(agentID: GoogleID, teamID: TeamID): Promise<IServerStatus>;
export declare function removeAgentFromTeamPromise(agentID: GoogleID, teamID: TeamID): Promise<IServerStatus>;
export declare function rocksPromise(teamID: TeamID, community: string, apikey: string): Promise<IServerStatus>;
export declare function setAgentTeamSquadPromise(agentID: GoogleID, teamID: TeamID, squad: string): Promise<IServerStatus>;
export declare function deleteJoinLinkPromise(teamID: TeamID): Promise<IServerStatus>;

/* op */
// query
export declare function opPromise(opID: OpID): Promise<WasabeeOp>;
// special
export declare function uploadOpPromise(): Promise<WasabeeOp>;
export declare function updateOpPromise(operation: WasabeeOp): Promise<boolean>;
// update data
export declare function deleteOpPromise(opID: OpID): Promise<IServerUpdate>;
export declare function addPermPromise(opID: OpID, teamID: TeamID, role: string, zone: ZoneID): Promise<IServerUpdate>;
export declare function delPermPromise(opID: OpID, teamID: TeamID, role: string, zone: ZoneID): Promise<IServerUpdate>;
export declare function setOpInfo(opID: OpID, info: any): Promise<IServerUpdate>;
// update task
export declare function assignMarkerPromise(opID: OpID, markerID: MarkerID, agentID: GoogleID): Promise<IServerUpdate>;
export declare function assignLinkPromise(opID: OpID, linkID: LinkID, agentID: GoogleID): Promise<IServerUpdate>;
export declare function SetMarkerState(opID: OpID, markerID: MarkerID, state: string): Promise<IServerUpdate>;
export declare function SetLinkState(opID: OpID, linkID: LinkID, state: string): Promise<IServerUpdate>;
export declare function setAssignmentStatus(op: WasabeeOp, object: WasabeeLink | WasabeeMarker, completed: boolean): Promise<IServerUpdate>;
export declare function reverseLinkDirection(opID: OpID, linkID: LinkID): Promise<IServerUpdate>;
export declare function setMarkerComment(opID: OpID, markerID: MarkerID, comment: string): Promise<IServerUpdate>;
export declare function setLinkComment(opID: OpID, linkID: LinkID, desc: string): Promise<IServerUpdate>;
export declare function setLinkZone(opID: OpID, linkID: LinkID, zone: ZoneID): Promise<IServerUpdate>;
export declare function setMarkerZone(opID: OpID, markerID: MarkerID, zone: ZoneID): Promise<IServerUpdate>;
// update keys
export declare function opKeyPromise(opID: OpID, portalID: PortalID, onhand: number, capsule: string): Promise<IServerUpdate>;
