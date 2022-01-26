import colorString from "color-string";

import { icon, IconName } from "@fortawesome/fontawesome-svg-core";
// avoid import from "@fortawesome/free-solid-svg-icons" to reduce *dev* build size
import { faCheck } from "@fortawesome/free-solid-svg-icons/faCheck";
import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";
import { faServer } from "@fortawesome/free-solid-svg-icons/faServer";
import { faSync } from "@fortawesome/free-solid-svg-icons/faSync";
import { faArrowsAltH } from "@fortawesome/free-solid-svg-icons/faArrowsAltH";
import { faPen } from "@fortawesome/free-solid-svg-icons/faPen";
import { faEraser } from "@fortawesome/free-solid-svg-icons/faEraser";
import { faBan } from "@fortawesome/free-solid-svg-icons/faBan";
import { faPalette } from "@fortawesome/free-solid-svg-icons/faPalette";
import { faAsterisk } from "@fortawesome/free-solid-svg-icons/faAsterisk";
import { faDesktop } from "@fortawesome/free-solid-svg-icons/faDesktop";

//** This function generates a unique ID for an object */
export function generateId(len = 40) {
  const arr = new Uint8Array(len / 2);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (dec) => {
    return ("0" + dec.toString(16)).substr(-2);
  }).join("");
}

export function newColors(incoming: string) {
  switch (incoming) {
    case "groupa":
      return "orange";
    case "groupb":
      return "yellow";
    case "groupc":
      return "lime";
    case "groupd":
      return "purple";
    case "groupe":
      return "teal";
    case "groupf":
      return "fuchsia";
    case "main":
      return window.plugin.wasabee.skin.defaultOperationColor as string;
    default:
      return incoming;
  }
}

export function convertColorToHex(color: string, on_error = "#000000") {
  try {
    return colorString.to.hex(colorString.get.rgb(newColors(color)));
  } catch {
    return on_error;
  }
}

const icons = [
  faCheck,
  faTrash,
  faServer,
  faSync,
  faArrowsAltH,
  faPen,
  faEraser,
  faBan,
  faPalette,
  faAsterisk,
  faDesktop,
];

export function appendFAIcon(iconName: IconName, container: Element) {
  const iconDef = icons.find((i) => i.iconName === iconName);
  if (!iconDef) return;
  const iconNode = icon(iconDef).node[0];
  container.appendChild(iconNode);
}