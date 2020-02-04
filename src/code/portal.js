export default class WasabeePortal {
  constructor(id, name, lat, lng) {
    this.id = id;
    this.name = name;
    this.lat = lat;
    this.lng = lng;
    this.comment = "";
    this.hardness = "";
  }

  // if the name or location changes, this will catch it
  update() {
    window.portalDetail.request(this.id).then(
      function(resolve) {
        if (resolve.title) {
          this.name = resolve.title;
          this.lat = (resolve.latE6 / 1e6).toFixed(6);
          this.lng = (resolve.lngE6 / 1e6).toFixed(6);
        }
      },
      function(reject) {
        console.log("unable to update portal: " + reject);
      }
    );
  }
}
