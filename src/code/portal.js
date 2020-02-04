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
}
