import WasabeePortal from "./portal";
import ConfirmDialog from "./dialogs/confirmDialog";
import AgentDialog from "./dialogs/agentDialog";
import { targetPromise, routePromise } from "./server";
import wX from "./wX";

export default class WasabeeAgent {
  constructor(obj) {
    if (typeof obj == "string") {
      try {
        obj = JSON.parse(obj);
      } catch (e) {
        console.log(e);
        obj = {};
      }
    }

    this.id = obj.id ? obj.id : null;
    this.name = obj.name ? obj.name : null;
    this.lat = obj.lat ? obj.lat : 0;
    this.lng = obj.lng ? obj.lng : 0;
    this.date = obj.date ? obj.date : null;
    this.pic = obj.pic ? obj.pic : null;
    this.cansendto = obj.cansendto ? obj.cansendto : false;
    this.Vverified = obj.Vverified ? obj.Vverified : false;
    this.blacklisted = obj.blacklisted ? obj.blacklisted : false;
    this.rocks = obj.rocks ? obj.rocks : false;
    this.squad = obj.squad ? obj.squad : null;
    this.state = obj.state && obj.state == "On" ? "On" : "Off";

    // push the new data into the agent cache
    window.plugin.wasabee._agentCache.set(this.id, this);
  }

  get latLng() {
    if (this.lat && this.lng) return new L.LatLng(this.lat, this.lng);
    return null;
  }

  formatDisplay() {
    const display = L.DomUtil.create("a", "wasabee-agent-label");
    if (this.Vverified || this.rocks) {
      L.DomUtil.addClass(display, "enl");
    }
    if (this.blacklisted) {
      L.DomUtil.addClass(display, "res");
    }
    L.DomEvent.on(display, "click", (ev) => {
      L.DomEvent.stop(ev);
      const ad = new AgentDialog(window.map, { gid: this.id });
      ad.enable();
    });
    display.textContent = this.name;
    return display;
  }

  getPopup() {
    const content = L.DomUtil.create("div", "wasabee-agent-popup");
    const title = L.DomUtil.create("div", "desc", content);
    title.id = this.id;
    title.innerHTML = this.formatDisplay().outerHTML + this.timeSinceformat();

    const sendTarget = L.DomUtil.create("button", null, content);
    sendTarget.textContent = wX("SEND TARGET");
    L.DomEvent.on(sendTarget, "click", (ev) => {
      L.DomEvent.stop(ev);
      const selectedPortal = WasabeePortal.getSelected();
      if (!selectedPortal) {
        alert(wX("SELECT PORTAL"));
        return;
      }

      const d = new ConfirmDialog();
      d.setup(
        wX("SEND TARGET"),
        wX("SEND TARGET CONFIRM", selectedPortal.displayName, this.name),
        async () => {
          try {
            await targetPromise(this.id, selectedPortal);
            alert(wX("TARGET SENT"));
          } catch (e) {
            console.log(e);
          }
        }
      );
      d.enable();
    });

    // this needs wX
    const requestRoute = L.DomUtil.create("button", null, content);
    requestRoute.textContent = "Send Route to Target";
    L.DomEvent.on(requestRoute, "click", (ev) => {
      L.DomEvent.stop(ev);
      const selectedPortal = WasabeePortal.getSelected();
      if (!selectedPortal) {
        alert(wX("SELECT PORTAL"));
        return;
      }

      const d = new ConfirmDialog();
      d.setup(
        "Send Route to Target",
        "Do you really want to request the route to be sent?",
        async () => {
          try {
            await routePromise(this.id, selectedPortal);
            alert("Route Sent");
          } catch (e) {
            console.log(e);
          }
        }
      );
      d.enable();
    });
    return content;
  }

  timeSinceformat() {
    if (!this.date) return "";
    const date = Date.parse(this.date + " UTC");
    if (Number.isNaN(date)) return `(${this.date} UTC)`; // FireFox Date.parse no good
    if (date == 0) return "";

    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 0) return "";
    let interval = Math.floor(seconds / 31536000 / 2592000 / 86400);

    if (interval > 1) return wX("AGES");
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return wX("HOURS", interval);
    interval = Math.floor(seconds / 60);
    if (interval > 1) return wX("MINUTES", interval);
    interval = Math.floor(seconds);
    return wX("SECONDS", interval);
  }
}
