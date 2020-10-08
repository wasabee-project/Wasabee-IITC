export default class WasabeeZone {
  constructor(obj) {
    this.id = obj.id;
    this.name = obj.name;
  }

  toJSON() {
    return this;
  }
}
