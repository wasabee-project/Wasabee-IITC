import WasabeePortal from "./portal";
import ConfirmDialog from "./dialogs/confirmDialog";
import { targetPromise, GetWasabeeServer } from "./server";
import wX from "./wX";

export default class WasabeeAgent {
  constructor() {
    this.id = null;
    this.name = null;
    this.lat = 0;
    this.lng = 0;
    this.date = null;
    this.pic = null;
    this.cansendto = false;
    this.Vverified = false;
    this.blacklisted = false;
    this.rocks = false;
    this.squad = null;
    this.state = null;
  }

  static create(obj) {
    if (typeof obj == "string") {
      obj = JSON.parse(obj);
    }
    const a = new WasabeeAgent();
    a.id = obj.id;
    a.name = obj.name;
    a.lat = obj.lat;
    a.lng = obj.lng;
    a.date = obj.date;
    a.pic = obj.pic;
    a.cansendto = obj.cansendto;
    a.Vverified = obj.Vverified;
    a.blacklisted = obj.blacklisted;
    a.rocks = obj.rocks;
    a.squad = obj.squad;
    a.state = obj.state;

    // push the new data into the agent cache
    window.plugin.wasabee._agentCache.set(a.id, a);
    return a;
  }

  get latLng() {
    if (this.lat && this.lng) return new L.LatLng(this.lat, this.lng);
    return null;
  }

  formatDisplay() {
    const server = GetWasabeeServer();
    const display = L.DomUtil.create("a", "wasabee-agent-label");
    if (this.Vverified || this.rocks) {
      L.DomUtil.addClass(display, "enl");
    }
    if (this.blacklisted) {
      L.DomUtil.addClass(display, "res");
    }
    display.href = `${server}/api/v1/agent/${this.id}?json=n`;
    display.target = "_new";
    L.DomEvent.on(display, "click", ev => {
      window.open(display.href, this.id);
      L.DomEvent.stop(ev);
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
    L.DomEvent.on(sendTarget, "click", ev => {
      L.DomEvent.stop(ev);
      const selectedPortal = WasabeePortal.getSelected();
      if (!selectedPortal) {
        alert(wX("SELECT PORTAL"));
        return;
      }

      const f = selectedPortal.name;
      const name = this.name;
      const d = new ConfirmDialog();
      d.setup(wX("SEND TARGET"), wX("SEND TARGET CONFIRM", f, name), () => {
        targetPromise(this, selectedPortal).then(
          function() {
            alert(wX("TARGET SENT"));
          },
          function(reject) {
            console.log(reject);
          }
        );
      });
      d.enable();
    });
    return content;
  }

  timeSinceformat() {
    if (!this.date) return "";
    const date = Date.parse(this.date + " GMT");
    if (date == 0) return "";

    const seconds = Math.floor((new Date() - date) / 1000);
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
