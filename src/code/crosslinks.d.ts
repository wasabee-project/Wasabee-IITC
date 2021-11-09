import * as L from "leaflet";
interface LLC extends L.LatLng {
    _cartesian?: [number, number, number];
}
export declare function greatCircleArcIntersectByLatLngs(a0: LLC, a1: LLC, b0: LLC, b1: LLC): boolean;
export declare function greatCircleArcIntersect(existing: any, drawn: any): boolean;
export declare function checkAllLinks(): void;
export declare function initCrossLinks(): void;
export declare class GeodesicLine {
    lat1: number;
    lat2: number;
    lng1: number;
    lng2: number;
    sinLat1CosLat2: number;
    sinLat2CosLat1: number;
    cosLat1CosLat2SinDLng: number;
    constructor(start: L.LatLng, end: L.LatLng);
    isMeridian(): boolean;
    latAtLng(lng: any): number;
    bearing(): number;
}
export {};
