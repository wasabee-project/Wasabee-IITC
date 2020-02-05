export default class WasabeePortal {
  constructor(id, name, lat, lng, comment, hardness) {
    this.id = id;
    this.name = name;
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

  // hiding behind too-clever-by-half makes for unmanagable code
  getPortalLink() {
    const pt = L.latLng(parseFloat(this.lat), parseFloat(this.lng));
    const v = this.lat + "," + this.lng;
    const e = document.createElement("a");
    return (
      e.appendChild(document.createTextNode(this.name)),
      (e.title = this.name),
      (e.href = "/intel?ll=" + v + "&pll=" + v),
      e.addEventListener(
        "click",
        event => {
          return (
            window.selectedPortal != this.id
              ? window.renderPortalDetails(this.id)
              : window.map.panTo(pt),
            event.preventDefault(),
            false
          );
        },
        false
      ),
      e.addEventListener(
        "dblclick",
        event => {
          return (
            window.map.getBounds().contains(pt)
              ? (window.portals[this.id] || window.renderPortalDetails(this.id),
                window.zoomToAndShowPortal(this.id, pt))
              : (window.map.panTo(pt), window.renderPortalDetails(this.id)),
            event.preventDefault(),
            false
          );
        },
        false
      ),
      e
    );
  }

  static get(id) {
    if (window.portals[id] && window.portals[id].options.data.title) {
      const data = window.portals[id].options.data;
      return new WasabeePortal(
        id,
        data.title,
        (data.latE6 / 1e6).toFixed(6).toString(),
        (data.lngE6 / 1e6).toFixed(6).toString()
      );
    }
    return null;
  }

  static getSelected() {
    return window.selectedPortal
      ? WasabeePortal.get(window.selectedPortal)
      : null;
  }
}
