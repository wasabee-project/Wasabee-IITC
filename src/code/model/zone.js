export default class WasabeeZone {
  constructor(obj) {
    this.id = Number(obj.id);
    this.name = obj.name;
    this.color = obj.color ? obj.color : "#00ff00";
    this.points = [];

    if (obj.points) {
      for (const p of obj.points) {
        this.points.push(new zonePoint(p));
      }
    }
  }

  toJSON() {
    return {
      id: Number(this.id),
      name: `${this.name}`,
      color: this.color,
      points: this.points,
    };
  }

  //ray casting algo
  contains(latlng) {
    this.points.sort((a, b) => {
      return a.position - b.position;
    });

    let inside = false;
    const x = latlng.lat,
      y = latlng.lng;

    for (
      let i = 0, j = this.points.length - 1;
      i < this.points.length;
      j = i++
    ) {
      const xi = this.points[i].lat,
        yi = this.points[i].lng;
      const xj = this.points[j].lat,
        yj = this.points[j].lng;

      const intersect =
        yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    return inside;
  }
}

class zonePoint {
  constructor(obj) {
    this.position = Number(obj.position);
    this.lat = Number(obj.lat);
    this.lng = Number(obj.lng);
  }
}
