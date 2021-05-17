export default class WasabeeZone {
  constructor(obj) {
    this.id = Number(obj.id);
    this.name = obj.name;
    this.color = obj.color ? obj.color : "00ff00";
    this.points = [];

    if (obj.points) {
      for (p of obj.points) {
        this.points.push(new zonePoint(p));
      }
    }
  }

  toJSON() {
    return {
      id: Number(this.id),
      name: `${this.name}`,
      color: this.color,
      points: points,
    };
  }
}

class zonePoint {
  constructor(obj) {
    this.position = Number(obj.position);
    this.lat = Number(obj.lat);
    this.lng = Number(obj.lng);
  }
}
