import { generateId } from "./auxiliar";

export default class WasabeePortal {
  constructor(id, name, lat, lng, comment, hardness) {
    this.id = id;
    this.name = name;
    // check window.portals[id].options.data for updated name ?
    if (typeof lat == "number") {
      this.lat = lat.toString();
    } else {
      this.lat = lat;
    }
    if (typeof lng == "number") {
      this.lng = lng.toString();
    } else {
      this.lng = lng;
    }
    this.comment = comment;
    this.hardness = hardness;
  }

  static create(obj) {
    if (typeof obj == "string") obj = JSON.parse(obj);
    if (!obj || !obj.id) {
      console.log("can't create WasabeePortal from this");
      return;
    }
    const wp = new WasabeePortal(
      obj.id,
      obj.name,
      obj.lat,
      obj.lng,
      obj.comment,
      obj.hardness
    );

    return wp;
  }

  // create a wasabee portal from a IITC portal (leaflet marker)
  static fromIITC(p) {
    // we have all the details
    if (p && p.options && p.options.data && p.options.guid) {
      const data = p.options.data;
      const id = p.options.guid;
      if (data.title) {
        return new WasabeePortal(
          id,
          data.title,
          (data.latE6 / 1e6).toFixed(6).toString(),
          (data.lngE6 / 1e6).toFixed(6).toString()
        );
      }
      // do we have enough to fake it?
      if (data.latE6) {
        return WasabeePortal.fake(
          (data.latE6 / 1e6).toFixed(6).toString(),
          (data.lngE6 / 1e6).toFixed(6).toString(),
          id
        );
      }
    }
    // nothing to get
    return null;
  }

  // if the name or location changes, this will catch it
  fullUpdate() {
    if (this.id.length != 35) return; // ignore faked ones from DrawTools imports

    window.portalDetail.request(this.id).then(
      res => {
        if (res.title) {
          this.name = res.title;
          this.lat = (res.latE6 / 1e6).toFixed(6).toString();
          this.lng = (res.lngE6 / 1e6).toFixed(6).toString();
        }
      },
      reject => {
        console.log("unable to update portal: " + reject);
      }
    );
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

  displayFormat(shortName = false) {
    const pt = this.latLng;
    const v = `${this.lat},${this.lng}`;
    const e = L.DomUtil.create("a", "wasabee-portal");
    if (shortName === true && this.name.length > 12) {
      e.textContent = this.name.slice(0, 8) + "...";
    } else {
      e.textContent = this.name;
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

    L.DomEvent.on(e, "click", event => {
      return (
        window.selectedPortal != this.id
          ? window.renderPortalDetails(this.id)
          : window.map.panTo(pt),
        event.preventDefault(),
        false
      );
    }).on(e, "dblclick", event => {
      return (
        window.map.getBounds().contains(pt)
          ? (window.portals[this.id] || window.renderPortalDetails(this.id),
            window.zoomToAndShowPortal(this.id, pt))
          : (window.map.panTo(pt), window.renderPortalDetails(this.id)),
        event.preventDefault(),
        false
      );
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
    if (!name) name = `Loading: [${id}]`;
    const n = new WasabeePortal(id, name, lat, lng);
    return n;
  }

  static getSelected() {
    return window.selectedPortal
      ? WasabeePortal.get(window.selectedPortal)
      : null;
  }
}
