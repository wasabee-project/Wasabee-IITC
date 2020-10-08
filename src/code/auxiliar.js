import WasabeeOp from "./operation";
import colorString from "color-string";

//** This function generates a unique ID for an object */
export function generateId(len = 40) {
  const arr = new Uint8Array(len / 2);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (dec) => {
    return ("0" + dec.toString(16)).substr(-2);
  }).join("");
}

export function convertColorToHex(color, on_error = "#000000") {
  try {
    return colorString.to.hex(colorString.get.rgb(WasabeeOp.newColors(color)));
  } catch {
    return on_error;
  }
}
