export default class WasabeeZone {
  constructor(obj) {
    this.id = Number(obj.id);
    this.name = obj.name;
  }

  toJSON() {
    return {
      id: Number(this.id),
      name: `${this.name}`,
    };
  }
}
