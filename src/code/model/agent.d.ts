import * as L from "leaflet";
export default class WasabeeAgent {
    id: string;
    name: string;
    vname: string;
    rocksname: string;
    intelname: string;
    intelfaction: string;
    level: number;
    enlid: string;
    pic: string;
    Vverified: boolean;
    blacklisted: boolean;
    rocks: boolean;
    lat: number;
    lng: number;
    date: string;
    ShareWD?: boolean;
    LoadWD?: boolean;
    squad?: string;
    state?: boolean;
    fetched: number;
    cached?: boolean;
    constructor(obj: any);
    getTeamName(teamID?: number): Promise<string>;
    _updateCache(): Promise<void>;
    get latLng(): L.LatLng;
    static get(gid: string, maxAgeSeconds?: number): Promise<WasabeeAgent>;
}
