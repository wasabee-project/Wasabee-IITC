export default class WasabeeZone {
  id: ZoneID;
  name: string;
  color: string;
  points: ZonePoint[];

  constructor(obj) {
    this.id = Number(obj.id);
    this.name = obj.name;
    this.color = obj.color ? obj.color : "#00ff00";
    this.points = [];

    if (obj.points) {
      for (const p of obj.points) {
        this.points.push(new ZonePoint(p));
      }
    }
  }

  toJSON() {
    return {
      id: +this.id,
      name: `${this.name}`,
      color: this.color,
      points: this.points,
    };
  }

  //ray casting algo
  contains(latlng: { lat: number; lng: number }) {
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

export class ZonePoint {
  position: number;
  lat: number;
  lng: number;

  constructor(obj) {
    this.position = Number(obj.position);
    this.lat = +obj.lat;
    this.lng = +obj.lng;
  }
}
