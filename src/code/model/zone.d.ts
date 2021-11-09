export default class WasabeeZone {
    id: number;
    name: string;
    color: string;
    points: Array<zonePoint>;
    constructor(obj: any);
    toJSON(): {
        id: number;
        name: string;
        color: string;
        points: zonePoint[];
    };
    contains(latlng: any): boolean;
}
declare class zonePoint {
    position: number;
    lat: number;
    lng: number;
    constructor(obj: any);
}
export {};
