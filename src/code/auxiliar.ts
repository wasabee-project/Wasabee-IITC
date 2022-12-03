import colorString from "color-string";

import { icon, IconLookup } from "@fortawesome/fontawesome-svg-core";
// avoid import from "@fortawesome/free-solid-svg-icons" to reduce *dev* build size
import { faCheck } from "@fortawesome/free-solid-svg-icons/faCheck";
import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";
import { faServer } from "@fortawesome/free-solid-svg-icons/faServer";
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons/faArrowsRotate";
import { faLeftRight } from "@fortawesome/free-solid-svg-icons/faLeftRight";
import { faPen } from "@fortawesome/free-solid-svg-icons/faPen";
import { faEraser } from "@fortawesome/free-solid-svg-icons/faEraser";
import { faBan } from "@fortawesome/free-solid-svg-icons/faBan";
import { faPalette } from "@fortawesome/free-solid-svg-icons/faPalette";
import { faAsterisk } from "@fortawesome/free-solid-svg-icons/faAsterisk";
import { faDesktop } from "@fortawesome/free-solid-svg-icons/faDesktop";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons/faCaretRight";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons/faLocationDot";

function newColors(incoming: string) {
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

export function averageColor(colors: string[]) {
  let [r,g,b] = [0, 0, 0];
  for (const color of colors) {
    const rgb = colorString.get.rgb(color);
    r += rgb[0];
    g += rgb[1];
    b += rgb[2];
  }
  if (colors.length) {
    r = Math.floor(r / colors.length);
    g = Math.floor(g / colors.length);
    b = Math.floor(b / colors.length);
  }
  return colorString.to.hex(r, g, b);
}

const icons = {
  check: faCheck,
  trash: faTrash,
  server: faServer,
  "arrows-rotate": faArrowsRotate,
  "left-right": faLeftRight,
  pen: faPen,
  eraser: faEraser,
  ban: faBan,
  palette: faPalette,
  asterisk: faAsterisk,
  desktop: faDesktop,
  "carret-right": faCaretRight,
  "location-dot": faLocationDot,
};

export function appendFAIcon(iconName: keyof typeof icons, container: Element) {
  if (iconName in icons) {
    const iconNode = icon(icons[iconName] as IconLookup).node[0];
    container.appendChild(iconNode);
  }
}
