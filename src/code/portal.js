import { generateId } from "./auxiliar";
import wX from "./wX";

export default class WasabeePortal {
  constructor(obj) {
    if (typeof obj == "string") {
      try {
        obj = JSON.parse(obj);
      } catch (e) {
        console.log(e);
        return null;
      }
    }

    this.id = obj.id;

    // migration: don't use a locale dependent name -- remove for 0.19
    if (obj.name.includes(obj.id)) obj.name = obj.id;
    // check window.portals[id].options.data for updated name ?
    this.name = obj.name;

    if (typeof obj.lat == "number") {
      this.lat = obj.lat.toFixed(6);
    } else {
      this.lat = obj.lat;
    }
    if (typeof obj.lng == "number") {
      this.lng = obj.lng.toFixed(6);
    } else {
      this.lng = obj.lng;
    }
    this.comment = obj.comment;
    this.hardness = obj.hardness;
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

  // create a wasabee portal from a IITC portal (leaflet marker)
  static fromIITC(p) {
    // we have all the details
    if (p && p.options && p.options.data && p.options.guid) {
      const data = p.options.data;
      const id = p.options.guid;
      if (data.title) {
        return new WasabeePortal({
          id: id,
          name: data.title,
          lat: (data.latE6 / 1e6).toFixed(6),
          lng: (data.lngE6 / 1e6).toFixed(6),
        });
      }
      // do we have enough to fake it?
      if (data.latE6) {
        return WasabeePortal.fake(
          (data.latE6 / 1e6).toFixed(6),
          (data.lngE6 / 1e6).toFixed(6),
          id
        );
      }
    }
    // nothing to get
    return null;
  }

  get latLng() {
    return new L.LatLng(parseFloat(this.lat), parseFloat(this.lng));
  }

  // easy compat with IITC's format -- just here for safety as we use more WP
  get _latlng() {
    console.log("calling WasabeePortal._latlng() compat");
    return new L.LatLng(parseFloat(this.lat), parseFloat(this.lng));
  }

  get team() {
    if (window.portals[this.id] && window.portals[this.id].options.data)
      return window.portals[this.id].options.data.team;
    return "";
  }

  get displayName() {
    if (this.pureFaked) return wX("FAKED", this.id);
    if (this.loading) return wX("LOADING1", this.id);
    return this.name;
  }

  displayFormat(shortName = false) {
    const pt = this.latLng;
    const v = `${this.lat},${this.lng}`;
    const name = this.displayName;
    const e = L.DomUtil.create("a", "wasabee-portal");
    if (shortName === true && this.name.length > 12) {
      e.textContent = name.slice(0, 8) + "...";
    } else {
      e.textContent = name;
    }

    const team = this.team;
    if (team == "E") {
      e.classList.add("enl");
    }
    if (team == "R") {
      e.classList.add("res");
    }
    if (team == "N") {
      e.classList.add("unclaimed");
    }

    // e.title = this.name;
    e.href = `/intel?ll=${v}&pll=${v}`;

    L.DomEvent.on(e, "click", (event) => {
      if (window.selectedPortal != this.id && this.id.length == 35)
        window.renderPortalDetails(this.id);
      else window.map.panTo(pt);
      event.preventDefault();
      return false;
    }).on(e, "dblclick", (event) => {
      if (window.selectedPortal != this.id && this.id.length == 35)
        window.renderPortalDetails(this.id);
      if (window.map.getBounds().contains(pt))
        window.zoomToAndShowPortal(this.id, pt);
      else window.map.panTo(pt);
      event.preventDefault();
      return false;
    });
    return e;
  }

  static get(id) {
    return WasabeePortal.fromIITC(window.portals[id]);
  }

  static fake(lat, lng, id, name) {
    if (!lat && !lng) {
      console.log("WasabeePortal.fake called w/o lat/lng");
      return null;
    }

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

  static getSelected() {
    return window.selectedPortal
      ? WasabeePortal.get(window.selectedPortal)
      : null;
  }
}
