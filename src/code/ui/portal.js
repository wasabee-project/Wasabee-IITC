import WasabeePortal from "../model/portal";
import wX from "../wX";

export default {
  fromIITC,
  displayName,
  displayFormat,
  get,
  getSelected,
};

function fromIITC(p) {
  // we have all the details
  if (p && p.options && p.options.data && p.options.guid) {
    const data = p.options.data;
    const id = p.options.guid;
    if (data.title) {
      return new WasabeePortal({
        id: id,
        name: data.title,
        lat: (data.latE6 / 1e6).toFixed(6),
        lng: (data.lngE6 / 1e6).toFixed(6),
      });
    }
    // do we have enough to fake it?
    if (data.latE6) {
      return WasabeePortal.fake(
        (data.latE6 / 1e6).toFixed(6),
        (data.lngE6 / 1e6).toFixed(6),
        id
      );
    }
  }
  // nothing to get
  return null;
}

function team(portal) {
  if (window.portals[portal.id] && window.portals[portal.id].options.data)
    return window.portals[portal.id].options.data.team;
  return "";
}

function displayName(portal) {
  if (portal.pureFaked) return wX("FAKED", { portalId: portal.id });
  if (portal.loading) return wX("LOADING1", { portalGuid: portal.id });
  return portal.name;
}

function displayFormat(portal, shortName = false) {
  const pt = portal.latLng;
  const v = `${portal.lat},${portal.lng}`;
  const name = displayName(portal);
  const e = L.DomUtil.create("a", "wasabee-portal");
  if (shortName === true && portal.name.length > 12) {
    e.textContent = name.slice(0, 8) + "...";
  } else {
    e.textContent = name;
  }

  const t = team(portal);
  if (t == "E") {
    e.classList.add("enl");
  }
  if (t == "R") {
    e.classList.add("res");
  }
  if (t == "N") {
    e.classList.add("unclaimed");
  }

  // e.title = this.name;
  e.href = `/intel?ll=${v}&pll=${v}`;

  L.DomEvent.on(e, "click", (event) => {
    if (window.selectedPortal != portal.id && portal.id.length == 35)
      window.renderPortalDetails(portal.id);
    else window.map.panTo(pt);
    event.preventDefault();
    return false;
  }).on(e, "dblclick", (event) => {
    if (window.selectedPortal != portal.id && portal.id.length == 35)
      window.renderPortalDetails(portal.id);
    if (window.map.getBounds().contains(pt))
      window.zoomToAndShowPortal(portal.id, pt);
    else window.map.panTo(pt);
    event.preventDefault();
    return false;
  });
  return e;
}

function get(id) {
  return fromIITC(window.portals[id]);
}

function getSelected() {
  return window.selectedPortal ? get(window.selectedPortal) : null;
}
