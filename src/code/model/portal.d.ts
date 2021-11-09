import * as L from "leaflet";
export default class WasabeePortal {
    id: string;
    name: string;
    lat: string;
    lng: string;
    comment: string;
    hardness: string;
    _latLng: L.LatLng;
    constructor(obj: any);
    toJSON(): {
        id: string;
        name: string;
        lat: string;
        lng: string;
        comment: string;
        hardness: string;
    };
    get latLng(): L.LatLng;
    static fake(lat: string | number, lng: string | number, id?: string, name?: string): WasabeePortal;
    get faked(): boolean;
    get loading(): boolean;
    get pureFaked(): boolean;
}
