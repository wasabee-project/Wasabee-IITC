import wX from "../wX";
import { displayFormat as displayPortal } from "./portal";

export function displayFormat(marker, operation) {
  const portal = operation.getPortal(marker.portalId);

  if (portal == null) {
    console.log("null portal getting marker popup");
    return (L.DomUtil.create("div", "").textContent = "invalid portal");
  }

  const desc = L.DomUtil.create("span");
  const kind = L.DomUtil.create("span", `${marker.type}`, desc);
  kind.textContent = wX(marker.type);
  desc.appendChild(displayPortal(portal));
  return desc;
}