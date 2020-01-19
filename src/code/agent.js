export default class WasabeeAgent {
  constructor() {
    this.id = null;
    this.name = null;
    this.lat = 0;
    this.lng = 0;
    this.date = null;
    this.pic = null;
    this.cansendto = false;
  }

  static create(obj) {
    if (typeof obj == "string") {
      obj = JSON.parse(obj);
    }
    const a = new WasabeeAgent();
    for (var prop in obj) {
      if (a.hasOwnProperty(prop)) {
        a[prop] = obj[prop];
      }
    }
    return a;
  }
}
