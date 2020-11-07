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

  // XXX there has to be a way to apply the viewBox onto the paths, to get rid of that extra nonsense
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
    icon.innerHTML = `<path d="M694 342L835 376 699 412 694 342Z" fill="rgb(220,110,110)"/><path d="M555 75C600 91 616 164 591 237 566 311 497 351 463 341 422 328 401 251 427 178 452 105 510 59 555 75Z" fill="rgb(182,182,182)"/><path d="M479 189C608 189 713 273 713 378 713 482 608 567 479 567 351 567 246 482 246 378 246 273 351 189 479 189Z" fill="rgb(220,110,110)"/><path d="M717 124C756 153 751 227 705 290 659 353 581 372 551 352 515 329 517 249 563 186 608 123 678 95 717 124Z" fill="rgb(214,214,214)"/><path d="M398 365C404 365 409 374 409 386 409 398 404 407 398 407 391 407 386 398 386 386 386 374 391 365 398 365Z" fill="rgb(43,43,33)"/><path d="M289 356C295 356 300 366 300 377 300 389 295 399 289 399 283 399 278 389 278 377 278 366 283 356 289 356Z" fill="rgb(43,43,33)"/><path d="M313 425C316 438 332 480 342 480 352 476 356 449 361 427 328 428 327 427 313 425Z" fill="rgb(43,43,33)"/>`;
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
