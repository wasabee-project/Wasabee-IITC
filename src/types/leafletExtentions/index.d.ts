import * as L from "leaflet";

declare module "leaflet" {
  // geodesic
  function geodesicPolyline(
    latlngs: LatLng[],
    options?: PolylineOptions
  ): GeodesicPolyline;
  function geodesicPolygon(
    latlngs: LatLng[],
    options?: PolylineOptions
  ): GeodesicPolygon;

  class GeodesicPolyline extends Polyline {
    getLatLngs(): LatLng[];
  }

  // tslint:disable-next-line:no-empty-interface
  class GeodesicPolygon extends GeodesicPolyline { }

  // tslint:disable-next-line:no-empty-interface
  class GeodesicCircle extends Polyline { }

  // extends PolynineOption to any prop
  interface PolylineOptions {
    /* guid: string */
    [propName: string]: any;
  }

  interface LeafletEvent {
    /* opID: string */
    /* background: boolean */
    [propName: string]: any;
  }

  interface Marker {
    update(): this;
  }
}
