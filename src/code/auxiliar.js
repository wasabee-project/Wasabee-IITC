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

function rgbToHue(color) {
  const [r, g, b] = color;
  const min = Math.min(Math.min(r, g), b);
  const max = Math.max(Math.max(r, g), b);

  if (min == max) return 0;

  let hue = 0;
  if (max == r) hue = (g - b) / (max - min);
  else if (max == g) hue = 2 + (b - r) / (max - min);
  else hue = 4 + (r - g) / (max - min);

  hue = hue * 60;
  if (hue < 0) hue = hue + 360;

  return Math.round(hue);
}

export function convertColorToHue(color, on_error = 0) {
  try {
    return rgbToHue(colorString.get.rgb(WasabeeOp.newColors(color)));
  } catch (e) {
    console.log(e);
    return on_error;
  }
}
