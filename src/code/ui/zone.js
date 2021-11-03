const zoneShape = {
  stroke: false,
  opacity: 0.7,
  fill: true,
};

const WLZone = L.LayerGroup.extend({
  initialize: function (zone) {
    zone.points.sort((a, b) => {
      return a.position - b.position;
    });
    let layer;
    if (zone.points.length == 1)
      layer = L.marker(zone.points[0], {
        icon: L.divIcon.coloredSvg(zone.color),
      });
    else if (zone.points.length == 2)
      layer = L.polyline(zone.points, { color: zone.color });
    else
      layer = L.polygon(zone.points, {
        color: zone.color,
        shapeOptions: zoneShape,
        interactive: false,
      });
    L.LayerGroup.prototype.initialize.call(this, [layer]);
  },
});

export default {
  WLZone,
};
