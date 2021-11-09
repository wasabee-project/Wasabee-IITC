export interface MeTeam {
    ID: string;
    Name: string;
    RocksComm: string;
    RocksKey: string;
    JoinLinkToken: string;
    ShareWD: "On" | "Off";
    LoadWD: "On" | "Off";
    State: "On" | "Off";
    Owner: string;
    VTeam: string;
    VTeamRole: string;
}
interface MeOp {
    ID: string;
}
export default class WasabeeMe {
    GoogleID: string;
    name: string;
    vname: string;
    rocksname: string;
    intelname: string;
    level: number;
    Teams: Array<MeTeam>;
    Ops: Array<MeOp>;
    fetched: number;
    Vverified: boolean;
    blacklisted: boolean;
    enlid: string;
    pic: string;
    intelfaction: string;
    querytoken: string;
    _teamMap: Map<string, "On" | "Off">;
    constructor(data: any);
    static maxCacheAge(): number;
    toJSON(): this;
    store(): void;
    remove(): void;
    static localGet(): WasabeeMe;
    static isLoggedIn(): boolean;
    static cacheGet(): WasabeeMe;
    static waitGet(force?: boolean): Promise<WasabeeMe>;
    static purge(): Promise<void>;
    teamJoined(teamID: any): boolean;
    teamEnabled(teamID: any): boolean;
    makeTeamMap(): void;
}
export {};
