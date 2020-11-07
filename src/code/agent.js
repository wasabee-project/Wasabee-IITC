import WasabeePortal from "./portal";
import ConfirmDialog from "./dialogs/confirmDialog";
import AgentDialog from "./dialogs/agentDialog";
import { agentPromise, targetPromise, routePromise } from "./server";
import { getSelectedOperation } from "./selectedOp";
import wX from "./wX";

export default class WasabeeAgent {
  constructor(obj) {
    if (typeof obj == "string") {
      try {
        obj = JSON.parse(obj);
      } catch (e) {
        console.error(e);
        obj = {};
      }
    }

    this.id = obj.id;
    this.name = obj.name; // XXX gets messy in the cache if team display name is set
    this.level = obj.level ? Number(obj.level) : 0;
    this.enlid = obj.enlid ? obj.enlid : 0;
    this.pic = obj.pic ? obj.pic : null;
    this.Vverified = obj.Vverified ? obj.Vverified : false;
    this.blacklisted = obj.blacklisted ? obj.blacklisted : false;
    this.rocks = obj.rocks ? obj.rocks : false;
    this.lat = obj.lat ? obj.lat : 0;
    this.lng = obj.lng ? obj.lng : 0;
    this.date = obj.date ? obj.date : null;
    this.cansendto = obj.cansendto ? obj.cansendto : false; // never true from a team pull
    this.ShareWD = obj.ShareWD;
    this.LoadWD = obj.LoadWD;
    this.startlat = obj.startlat ? obj.startlat : 0;
    this.startlng = obj.startlng ? obj.startlng : 0;
    this.startradius = obj.startradius ? Number(obj.startradius) : 0;
    this.sharestart = obj.sharestart ? obj.sharestart : false;

    // distance, dispayname, squad and state are meaningless in the cache since you cannot know which team set them
    this.distance = obj.distance ? Number(obj.distance) : 0; // don't use this
    this.displayname = obj.displayname ? obj.displayname : "";
    this.squad = obj.squad ? obj.squad : null;
    this.state = obj.state;

    // push the new data into the agent cache
    window.plugin.wasabee._agentCache.set(this.id, this);
  }

  get latLng() {
    if (this.lat && this.lng) return new L.LatLng(this.lat, this.lng);
    return null;
  }

  static cacheGet(gid) {
    if (window.plugin.wasabee._agentCache.has(gid)) {
      return window.plugin.wasabee._agentCache.get(gid);
    }
    return null;
  }

  static async waitGet(gid) {
    if (window.plugin.wasabee._agentCache.has(gid)) {
      return window.plugin.wasabee._agentCache.get(gid);
    }

    try {
      const result = await agentPromise(gid);
      const newagent = new WasabeeAgent(result);
      return newagent;
    } catch (e) {
      console.error(e);
    }
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
            console.error(e);
          }
        }
      );
      d.enable();
    });

    // this needs wX
    const requestRoute = L.DomUtil.create("button", null, content);
    requestRoute.textContent = "Send Route to Target";
    requestRoute.style.display = "none"; // hide this until the server-side is ready
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
            console.error(e);
          }
        }
      );
      d.enable();
    });

    const op = getSelectedOperation();
    const assignments = L.DomUtil.create("ul", "assignments", content);
    for (const m of op.markers) {
      if (m.assignedTo != this.id) continue;
      const a = L.DomUtil.create("li", "assignment", assignments);
      const portal = op.getPortal(m.portalId);
      a.textContent = `${m.order}: ${wX(m.type)} `;
      a.appendChild(portal.displayFormat());
    }

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

  icon(z = 7) {
    if (z < 6) return this.globalIcon();
    if (z >= 6 && z < 9) return this.smallIcon();
    if (z >= 9 && z < 11) return this.mediumIcon();
    return this.bigIcon();
  }

  iconSize(z = 7) {
    if (z < 6) return [30, 30];
    if (z >= 6 && z < 9) return [42, 62];
    if (z >= 9 && z < 11) return [48, 64];
    return [52, 68];
  }

  iconAnchor(z = 7) {
    if (z < 6) return [15, 30];
    if (z >= 6 && z < 9) return [21, 68];
    if (z >= 9 && z < 11) return [24, 68];
    return [26, 68];
  }

  globalIcon() {
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    icon.setAttribute("viewBox", "200 70 630 520");
    icon.setAttribute("height", "30");
    icon.setAttribute("width", "30");
    icon.setAttribute(
      "style",
      "fill-rule: evenodd; clip-rule: evenodd; stroke-miterlimit: 10;"
    );
    icon.innerHTML = `<path d="M693.958,342.221L835.444,376.094L698.886,412.048L693.958,342.221Z" style="fill:rgb(220,110,110);" /><path d="M554.884,74.903C600.248,91.286 616.43,164.041 591.029,237.406C565.628,310.771 497.181,350.802 462.898,340.58C422.146,328.43 401.352,251.442 426.754,178.077C452.155,104.712 509.521,58.52 554.884,74.903Z" style="fill:rgb(182,182,182);" /><path d="M479.375,188.5C608.126,188.5 712.5,273.286 712.5,377.875C712.5,482.464 608.126,567.25 479.375,567.25C350.624,567.25 246.25,482.464 246.25,377.875C246.25,273.286 350.624,188.5 479.375,188.5Z" style="fill:rgb(220,110,110);" /><path d="M716.932,123.894C756.272,152.549 750.931,226.895 705.002,289.952C659.072,353.008 580.963,371.826 550.607,352.241C514.522,328.958 516.608,249.239 562.537,186.183C608.467,123.126 677.592,95.239 716.932,123.894Z" style="fill:rgb(214,214,214);" /><path d="M397.5,364.75C403.713,364.75 408.75,374.264 408.75,386C408.75,397.736 403.713,407.25 397.5,407.25C391.287,407.25 386.25,397.736 386.25,386C386.25,374.264 391.287,364.75 397.5,364.75Z" style="fill:rgb(43,43,33);" /><path d="M288.75,356C294.963,356 300,365.514 300,377.25C300,388.986 294.963,398.5 288.75,398.5C282.537,398.5 277.5,388.986 277.5,377.25C277.5,365.514 282.537,356 288.75,356Z" style="fill:rgb(43,43,33);" /><path d="M312.505,424.759C315.597,438.472 332.043,479.75 341.912,479.75C351.793,475.936 355.726,449.332 361.247,426.943C328.26,428.493 326.511,426.63 312.505,424.759Z" style="fill:rgb(43,43,33);fill-opacity:0.6;" />`;
    return icon;
  }

  // XXX resize this properly
  smallIcon() {
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    icon.setAttribute("viewBox", "0 0 52 68");
    icon.innerHTML = `<defs><clipPath id="circleView"><circle fill="#fff" cx="26" cy="26" r="23" /></clipPath></defs>
      <path fill="yellow" stroke="#aaa" stroke-width="1" stroke-opacity="0.6" d="M 51 26 a 25 25 90 0 0 -50 0 c 0 11 5 20 10 25 l 12 12 c 3 3 3 3 6 0 l 11 -12 c 5 -5 11 -14 11 -25 z" /> 
      <circle fill="#fff" cx="26" cy="26" r="24" opacity="0.8" />
      <image x="2.5" y="2.5" width="47" height="47" href="${this.pic}" clip-path="url(#circleView)" />`;
    return icon;
  }

  // XXX resize this properly
  mediumIcon() {
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    icon.setAttribute("viewBox", "0 0 52 68");
    icon.innerHTML = `<defs><clipPath id="circleView"><circle fill="#fff" cx="26" cy="26" r="23" /></clipPath></defs>
      <path fill="orange" stroke="#aaa" stroke-width="1" stroke-opacity="0.6" d="M 51 26 a 25 25 90 0 0 -50 0 c 0 11 5 20 10 25 l 12 12 c 3 3 3 3 6 0 l 11 -12 c 5 -5 11 -14 11 -25 z" /> 
      <circle fill="#fff" cx="26" cy="26" r="24" opacity="0.8" />
      <image x="2.5" y="2.5" width="47" height="47" href="${this.pic}" clip-path="url(#circleView)" />`;
    return icon;
  }

  bigIcon() {
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    icon.setAttribute("viewBox", "0 0 52 68");
    icon.innerHTML = `<defs><clipPath id="circleView"><circle fill="#fff" cx="26" cy="26" r="23" /></clipPath></defs>
      <path fill="red" stroke="#aaa" stroke-width="1" stroke-opacity="0.6" d="M 51 26 a 25 25 90 0 0 -50 0 c 0 11 5 20 10 25 l 12 12 c 3 3 3 3 6 0 l 11 -12 c 5 -5 11 -14 11 -25 z" /> 
      <circle fill="#fff" cx="26" cy="26" r="24" opacity="0.8" />
      <image x="2.5" y="2.5" width="47" height="47" href="${this.pic}" clip-path="url(#circleView)" />`;
    return icon;
  }
}
