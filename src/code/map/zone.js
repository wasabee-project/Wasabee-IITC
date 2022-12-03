const zoneShape = {
  stroke: false,
  opacity: 0.7,
  fill: true,
};

export const WLZone = L.FeatureGroup.extend({
  initialize: function (zone) {
    zone.points.sort((a, b) => {
      return a.position - b.position;
    });
    const layer = [];
    if (zone.points.length == 1)
      layer.push(
        L.marker(zone.points[0], {
          icon: new L.DivIcon.ColoredSvg(zone.color),
          title: zone.name,
        })
      );
    else if (zone.points.length == 2)
      layer.push(L.polyline(zone.points, { color: zone.color }));
    else if (zone.points.length > 2) {
      const poly = L.polygon(zone.points, {
        color: zone.color,
        shapeOptions: zoneShape,
      });
      poly.bindTooltip(zone.name, {
        className: "ui-tooltip wasabee-zone-tooltip",
        sticky: true,
      });
      layer.push(poly);
    }

    L.FeatureGroup.prototype.initialize.call(this, layer);
  },

  onAdd(map) {
    L.FeatureGroup.prototype.onAdd.call(this, map);
    this.bringToBack();
  },
});
