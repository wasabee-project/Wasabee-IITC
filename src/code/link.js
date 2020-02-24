import { generateId } from "./auxiliar";
import { getSelectedOperation } from "./selectedOp";

export default class WasabeeLink {
  //ID <- randomly generated alpha-numeric ID for the link
  //fromPortal <- portal the link is from
  //toPortal <- portal the link is to
  //description <- user entered description of link
  constructor(operation, fromPortalId, toPortalId, description) {
    this.ID = generateId();
    this.fromPortalId = fromPortalId;
    this.toPortalId = toPortalId;
    this.description = description;
    this.assignedTo = null;
    this.throwOrderPos = 0;
    this.color = "main";
    this.completed = false;
  }

  static create(obj, operation) {
    const link = new WasabeeLink(
      operation,
      obj.fromPortalId,
      obj.toPortalId,
      obj.description
    );
    link.assignedTo = obj.assignedTo ? obj.assignedTo : "";
    link.throwOrderPos = obj.throwOrderPos ? obj.throwOrderPos : 0;
    link.color = obj.color ? obj.color : "main";
    link.completed = obj.completed ? obj.completed : false;
    return link;
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
  get state() {
    if (this.completed) {
      return "completed";
    }
    if (this.assignedTo) {
      return "assigned";
    }
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
    // for crosslinks.js
    if (!operation) operation = getSelectedOperation();

    const fromPortal = operation.getPortal(this.fromPortalId);
    if (!fromPortal)
      console.log("op missing 'from' portal: " + JSON.stringify(this)); // NUKE ME
    const toPortal = operation.getPortal(this.toPortalId);
    if (!fromPortal)
      console.log("op missing 'to' portal: " + JSON.stringify(this)); // NUKE ME
    if (fromPortal != null && toPortal != null) {
      const returnArray = Array();
      returnArray.push(new L.LatLng(fromPortal.lat, fromPortal.lng));
      returnArray.push(new L.LatLng(toPortal.lat, toPortal.lng));
      return returnArray;
    } else {
      console.log(JSON.stringify(this));
      return null;
    }
  }

  // returns a DOM object appropriate for display
  displayFormat(operation) {
    const d = L.DomUtil.create("div", "");
    d.appendChild(
      operation.getPortal(this.fromPortalId).displayFormat(operation)
    );
    const arrow = L.DomUtil.create("span", "", d);
    arrow.innerHTML = " ➾ ";
    arrow.style.color = this.getColorHex();
    d.appendChild(
      operation.getPortal(this.toPortalId).displayFormat(operation)
    );
    return d;
  }

  getColorHex() {
    if (window.plugin.wasabee.static.layerTypes.has(this.color)) {
      const c = window.plugin.wasabee.static.layerTypes.get(this.color);
      return c.color;
    }
    return "#333333";
  }

  length(operation) {
    const latlngs = this.getLatLngs(operation);
    return L.latLng(latlngs[0]).distanceTo(latlngs[1]);
  }

  minLevel(operation) {
    const b = this.length(operation);
    let s = "unknown";
    const a = L.DomUtil.create("span", "");

    if (b > 6881280) {
      s = "impossible";
    } else {
      if (b > 1966080) {
        s = "L8+some VRLA";
        a.title =
          "Depending on the number and type Link Amps used, a lower source portal level might suffice.";
        a.classList.add("help");
      } else {
        if (b > 655360) {
          s = "L8+some LA";
          a.title =
            "Depending on the number and type Link Amps used, a lower source portal level might suffice.";
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
}
