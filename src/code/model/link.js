import { generateId, convertColorToHex, newColors } from "../auxiliar";
import { getSelectedOperation } from "../selectedOp";
import wX from "../wX";
import AssignDialog from "../dialogs/assignDialog";
import { addToColorList } from "../skin";

import PortalUI from "../ui/portal";

export default class WasabeeLink {
  constructor(obj) {
    this.ID = obj.ID ? obj.ID : generateId();
    this.fromPortalId = obj.fromPortalId;
    this.toPortalId = obj.toPortalId;
    this.description = obj.description ? obj.description : null;
    this.assignedTo = obj.assignedTo ? obj.assignedTo : "";
    this.throwOrderPos = obj.throwOrderPos ? Number(obj.throwOrderPos) : 0;
    this.color = obj.color ? obj.color : "main";
    this.completed = obj.completed ? !!obj.completed : false;
    this.zone = obj.zone ? Number(obj.zone) : 1;
  }

  // build object to serialize
  toJSON() {
    return {
      ID: this.ID,
      fromPortalId: this.fromPortalId,
      toPortalId: this.toPortalId,
      description: this.description,
      assignedTo: this.assignedTo,
      throwOrderPos: Number(this.throwOrderPos),
      color: this.color,
      completed: !!this.completed, // !! forces a boolean value
      zone: Number(this.zone),
    };
  }

  // for interface consistency, the other types use comment
  // we can't rename them here w/o making the corresponding changes on the server
  get comment() {
    return this.description;
  }

  set comment(c) {
    this.description = c;
  }

  // for interface consistency, other types use order
  get opOrder() {
    return this.throwOrderPos;
  }

  set opOrder(o) {
    this.throwOrderPos = Number.parseInt(o, 10);
  }

  // make the interface match (kinda) what markers do
  // 'pending','assigned','acknowledged','completed'
  // THESE ARE INTERNAL VALUES AND SHOULD NOT BE wX'd!!!
  get state() {
    if (this.completed) return "completed";
    if (this.assignedTo) return "assigned";
    return "pending";
  }

  set state(s) {
    if (s == "completed") {
      this.completed = true;
    } else {
      this.completed = false;
    }
  }

  // kludge to make the interface work
  get portalId() {
    return this.fromPortalId;
  }

  getLatLngs(operation) {
    if (!operation) operation = getSelectedOperation();

    const returnArray = Array();

    const fromPortal = operation.getPortal(this.fromPortalId);
    if (!fromPortal || !fromPortal.lat) {
      console.log("unable to get source portal");
      return null;
    }
    returnArray.push(fromPortal.latLng);

    const toPortal = operation.getPortal(this.toPortalId);
    if (!toPortal || !toPortal.lat) {
      console.log("unable to get destination portal");
      return null;
    }
    returnArray.push(toPortal.latLng);

    return returnArray;
  }

  get latLngs() {
    return this.getLatLngs(getSelectedOperation());
  }

  // returns a DOM object appropriate for display
  // do we still need the operation here?
  displayFormat(operation, smallScreen = false) {
    const d = L.DomUtil.create("div", null);
    d.appendChild(
      PortalUI.displayFormat(
        operation.getPortal(this.fromPortalId),
        smallScreen
      )
    );
    const arrow = L.DomUtil.create("span", "wasabee-link-seperator", d);
    arrow.style.color = this.getColor(operation);
    const picker = L.DomUtil.create("input", "hidden-color-picker", arrow);
    picker.type = "color";
    picker.value = convertColorToHex(this.getColor(operation));
    picker.setAttribute("list", "wasabee-colors-datalist");
    picker.disabled = !operation.canWrite();

    L.DomEvent.on(arrow, "click", () => {
      picker.click();
    });

    L.DomEvent.on(picker, "change", (ev) => {
      this.setColor(ev.target.value, operation);
    });

    d.appendChild(
      PortalUI.displayFormat(operation.getPortal(this.toPortalId), smallScreen)
    );
    return d;
  }

  setColor(color, operation) {
    this.color = color;
    if (this.color == operation.color) this.color = "main";
    operation.update();
    addToColorList(color);
  }

  getColor(operation) {
    // 0.17 -- use the old names internally no matter what we are sent
    let color = this.color;
    if (color == "main") color = operation.color;
    color = newColors(color);
    if (window.plugin.wasabee.skin.layerTypes.has(color))
      color = window.plugin.wasabee.skin.layerTypes.get(color).color;
    return color;
  }

  length(operation) {
    const latlngs = this.getLatLngs(operation);
    return L.latLng(latlngs[0]).distanceTo(latlngs[1]);
  }

  minLevel(operation) {
    const b = this.length(operation);
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

  getPopup(operation) {
    const div = L.DomUtil.create("div", null);
    L.DomUtil.create("div", null, div).appendChild(
      this.displayFormat(operation, true)
    );
    if (this.description)
      L.DomUtil.create("div", "enl", div).textContent = this.description;
    L.DomUtil.create("div", "enl", div).textContent = "# " + this.throwOrderPos;
    if (operation.canWrite()) {
      const del = L.DomUtil.create("button", null, div);
      del.textContent = wX("DELETE_LINK");
      L.DomEvent.on(del, "click", (ev) => {
        L.DomEvent.stop(ev);
        operation.removeLink(this.fromPortalId, this.toPortalId);
      });
      const rev = L.DomUtil.create("button", null, div);
      rev.textContent = wX("REVERSE");
      L.DomEvent.on(rev, "click", (ev) => {
        L.DomEvent.stop(ev);
        operation.reverseLink(this.fromPortalId, this.toPortalId);
      });
    }

    if (operation.canWriteServer()) {
      const assignButton = L.DomUtil.create("button", null, div);
      assignButton.textContent = wX("ASSIGN");
      L.DomEvent.on(assignButton, "click", (ev) => {
        L.DomEvent.stop(ev);
        const ad = new AssignDialog({ target: this });
        ad.enable();
      });
    }
    return div;
  }
}
