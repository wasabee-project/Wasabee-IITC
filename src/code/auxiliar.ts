import { findIconDefinition, icon, IconName } from "@fortawesome/fontawesome-svg-core";
import colorString from "color-string";

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

export function appendFAIcon(iconName: IconName, container: Element) {
  const iconDef = findIconDefinition({ prefix: 'fas', iconName: iconName });
  if (!iconDef) return;
  const iconNode = icon(iconDef).node[0];
  container.appendChild(iconNode);
}