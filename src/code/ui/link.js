import { convertColorToHex } from "../auxiliar";
import { addToColorList } from "../skin";
import wX from "../wX";

import * as PortalUI from "./portal";

// returns a DOM object appropriate for display
export function displayFormat(link, operation, smallScreen = false) {
  const d = L.DomUtil.create("div", null);
  d.appendChild(
    PortalUI.displayFormat(operation.getPortal(link.fromPortalId), smallScreen)
  );
  const arrow = L.DomUtil.create("span", "wasabee-link-seperator", d);
  arrow.style.color = convertColorToHex(link.getColor(operation));
  const picker = L.DomUtil.create("input", "hidden-color-picker", arrow);
  picker.type = "color";
  picker.value = convertColorToHex(link.getColor(operation));
  picker.setAttribute("list", "wasabee-colors-datalist");
  picker.disabled = !operation.canWrite();

  L.DomEvent.on(arrow, "click", () => {
    picker.click();
  });

  L.DomEvent.on(picker, "change", (ev) => {
    link.setColor(ev.target.value, operation);
    addToColorList(ev.target.value);
  });

  d.appendChild(
    PortalUI.displayFormat(operation.getPortal(link.toPortalId), smallScreen)
  );
  return d;
}

export function minLevel(link, operation) {
  const b = link.length(operation);
  let s = wX("UNKNOWN");
  const a = L.DomUtil.create("span", null);

  if (b > 6881280) {
    s = wX("IMPOSSIBLE");
  } else {
    if (b > 1966080) {
      s = wX("VRLA");
      a.title = wX("VRLA DESC");
      a.classList.add("help");
    } else {
      if (b > 655360) {
        s = wX("LA");
        a.title = wX("LA DESC");
        a.classList.add("help");
      } else {
        const d = Math.max(1, Math.ceil(8 * Math.pow(b / 160, 0.25)) / 8);
        const msd = 8 * (d - Math.floor(d));
        s = "L" + d;
        if (0 != msd) {
          if (!(1 & msd)) {
            s = s + "\u2007";
          }
          if (!(1 & msd || 2 & msd)) {
            s = s + "\u2007";
          }
          s =
            s +
            (" = L" +
              Math.floor(d) +
              "0\u215b\u00bc\u215c\u00bd\u215d\u00be\u215e".charAt(msd));
        }
      }
    }
  }
  a.textContent = s;
  return a;
}
