import * as L from "leaflet";

declare module "leaflet" {
  // geodesic
  function geodesicPolyline(
    latlngs: LatLngExpression[],
    options?: PolylineOptions
  ): GeodesicPolyline;
  function geodesicPolygon(
    latlngs: LatLngExpression[],
    options?: PolylineOptions
  ): GeodesicPolygon;

  class GeodesicPolyline extends Polyline {
    getLatLngs(): LatLng[];
  }

  // tslint:disable-next-line:no-empty-interface
  class GeodesicPolygon extends GeodesicPolyline { }

  // tslint:disable-next-line:no-empty-interface
  class GeodesicCircle extends Polyline { }

  interface Polyline {
    initialize: typeof L.Polyline.prototype.constructor;
  }
  interface Marker {
    initialize: typeof L.Marker.prototype.constructor;
  }
  interface LayerGroup {
    initialize: typeof L.LayerGroup.prototype.constructor;
  }
  interface Layer {
    _popup: Popup;
  }
  interface Popup {
    _wrapper: HTMLDivElement;
  }

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

  namespace DivIcon {
    class ColoredSvg extends DivIcon {
      constructor(color: string, options?: MarkerOptions);
    }
  }
}
