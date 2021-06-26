import { generateId } from "../auxiliar";

export default class WasabeePortal {
  constructor(obj) {
    if (typeof obj == "string") {
      try {
        obj = JSON.parse(obj);
      } catch (e) {
        console.error(e);
        return null;
      }
    }

    this.id = obj.id;

    // migration: don't use a locale dependent name -- remove for 0.19
    if (obj.name.includes(obj.id)) obj.name = obj.id;
    // check window.portals[id].options.data for updated name ?
    this.name = obj.name;

    // make sure we are using 6-digits precision "number"
    this.lat = (+obj.lat).toFixed(6);
    this.lng = (+obj.lng).toFixed(6);

    this.comment = obj.comment ? obj.comment : "";
    this.hardness = obj.hardness ? obj.hardness : "";

    this._latLng = new L.LatLng(parseFloat(this.lat), parseFloat(this.lng));
  }

  // build object to serialize
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      lat: this.lat,
      lng: this.lng,
      comment: this.comment,
      hardness: this.hardness,
    };
  }

  get latLng() {
    return this._latLng;
  }

  static fake(lat, lng, id, name) {
    console.assert(lat && lng, "WasabeePortal.fake called w/o lat/lng");

    if (!id) id = generateId();
    if (!name) name = id;
    const n = new WasabeePortal({ id: id, name: name, lat: lat, lng: lng });
    return n;
  }

  get faked() {
    return this.id.length != 35 || this.id == this.name;
  }

  get loading() {
    return this.id.length == 35 && this.id == this.name;
  }

  get pureFaked() {
    return this.id.length != 35;
  }
}
