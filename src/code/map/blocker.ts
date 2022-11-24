import { getSelectedOperation } from "../selectedOp";
import { WasabeeBlocker, WasabeePortal } from "../model";
import type { GeodesicPolyline } from "leaflet";

const blockerStyle: L.PolylineOptions = {
  color: "#d22",
  opacity: 0.7,
  weight: 5,
  interactive: false,
  dashArray: [8, 8],
};

export class WLBlockerLayer extends L.FeatureGroup {
  blockers: {
    [id: string]: GeodesicPolyline;
  };
  blocked: {
    [id: LinkID]: GeodesicPolyline;
  };

  constructor() {
    super();
    this.blockers = {};
    this.blocked = {};
  }

  onAdd(map: L.Map): this {
    super.onAdd(map);
    map.on("wasabee:op:select", this.update, this);
    map.on("wasabee:crosslinks:done", this.update, this);
    this.update();
    return this;
  }

  onRemove(map: L.Map): this {
    super.onRemove(map);
    map.off("wasabee:op:select", this.update, this);
    map.off("wasabee:crosslinks:done", this.update, this);
    return this;
  }

  addBlocker(fromPortal: WasabeePortal, toPortal: WasabeePortal) {
    const key = fromPortal.id + toPortal.id;
    if (!(key in this.blockers)) {
      this.blockers[key] = L.geodesicPolyline(
        [fromPortal.latLng, toPortal.latLng],
        blockerStyle
      ).addTo(this);
    }
    return this;
  }

  update() {
    const operation = getSelectedOperation();
    WasabeeBlocker.getAll(operation).then((blockers) => {
      for (const key in this.blockers) {
        this.removeLayer(this.blockers[key]);
      }
      this.blockers = {};
      for (const blocker of blockers) {
        this.blockers[blocker.fromPortal.id + blocker.toPortal.id] =
          L.geodesicPolyline(
            [blocker.fromPortal.latLng, blocker.toPortal.latLng],
            blockerStyle
          ).addTo(this);
      }
    });
    for (const key in this.blocked) {
      this.removeLayer(this.blocked[key]);
    }
    this.blocked = {};
    for (const link of operation.links) {
      if (link.selfBlocked || link.blocked) {
        this.blocked[link.ID] = L.geodesicPolyline(
          link.getLatLngs(operation),
          window.plugin.wasabee.skin.selfBlockStyle
        ).addTo(this);
      }
    }
  }
}
