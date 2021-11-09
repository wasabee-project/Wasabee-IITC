import WasabeeAgent from "./agent";
export default class WasabeeTeam {
    fetched: number;
    id: string;
    name: string;
    rc: string;
    rk: string;
    jlt: string;
    agents: Array<WasabeeAgent>;
    _a: Array<WasabeeAgent>;
    constructor(data: any);
    getAgents(): WasabeeAgent[];
    _updateCache(): Promise<void>;
    static get(teamID: any, maxAgeSeconds?: number): Promise<WasabeeTeam>;
}
