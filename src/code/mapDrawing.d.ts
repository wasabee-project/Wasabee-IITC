import * as L from "leaflet";
export declare function drawMap(): void;
export declare function drawBackgroundOps(opIDs?: string[]): Promise<void>;
export declare function drawBackgroundOp(operation: any, layerGroup?: L.LayerGroup, style?: L.PathOptions): void;
export declare function drawAgents(): Promise<void>;
export declare function drawSingleTeam(teamID: string, layerMap?: Map<string, number>, alreadyDone?: string[]): Promise<any[]>;
export declare function drawSingleAgent(gid: any): Promise<void>;
