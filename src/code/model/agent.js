import WasabeePortal from "./portal";
import ConfirmDialog from "../dialogs/confirmDialog";
import AgentDialog from "../dialogs/agentDialog";
import { agentPromise, targetPromise, routePromise } from "../server";
import { getSelectedOperation } from "../selectedOp";
import wX from "../wX";
import WasabeeMe from "./me";
import WasabeeTeam from "./team";

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
    // console.debug("passed to constructor", obj);

    // things which are stable across all teams
    this.id = obj.id;
    this.name = obj.name;
    this.vname = obj.vname;
    this.rocksname = obj.rocksname;
    this.intelname = obj.intelname;
    this.intelfaction = obj.intelfaction;
    this.level = obj.level ? Number(obj.level) : 0;
    this.enlid = obj.enlid ? obj.enlid : 0;
    this.pic = obj.pic ? obj.pic : null;
    this.Vverified = obj.Vverified ? obj.Vverified : false;
    this.blacklisted = obj.blacklisted ? obj.blacklisted : false;
    this.rocks = obj.rocks ? obj.rocks : false;
    this.lat = obj.lat ? obj.lat : 0;
    this.lng = obj.lng ? obj.lng : 0;
    this.date = obj.date ? obj.date : null; // last location sub, not fetched

    /* what did we decide to do with these?
    this.startlat = obj.startlat ? obj.startlat : 0;
    this.startlng = obj.startlng ? obj.startlng : 0;
    this.startradius = obj.startradius ? Number(obj.startradius) : 0;
    this.sharestart = obj.sharestart ? obj.sharestart : false; */

    // vary per-team, don't set on direct pulls
    if (obj.ShareWD) this.ShareWD = obj.ShareWD;
    if (obj.LoadWD) this.LoadWD = obj.LoadWD;
    if (obj.squad) this.squad = obj.squad;
    if (obj.state) this.state = obj.state;
    // this.distance = obj.distance ? Number(obj.distance) : 0; // don't use this

    // not sent by server, but preserve if from cache
    this.fetched = obj.fetched ? obj.fetched : Date.now();

    // push the new data into the agent cache
    // do not await this, let it happen in the background
    this._updateCache();
  }

  async _getDisplayName(teamID = 0) {
    if (teamID == 0) return this.name;

    const team = await WasabeeTeam.get(teamID);
    if (team == null) return this.name;
    // XXX is there a cute team.agents.filter() we can use here?
    for (const a of team.agents) {
      if (a.id == this.id) return a.name;
    }

    return this.name;
  }

  async _updateCache() {
    // load anything currently cached
    const cached = await window.plugin.wasabee.idb.get("agents", this.id);

    // nothing already in the cache, just dump this in and call it good
    // will contain the extras, but that's fine for now
    if (cached == null) {
      // console.debug("not cached, adding");
      try {
        await window.plugin.wasabee.idb.put("agents", this);
      } catch (e) {
        console.error(e);
      }
      return;
    }

    // if the cached version is newer, do not update
    if (cached.fetched >= this.fetched) {
      // console.debug("incoming is older, not updating cache");
      return;
    }
    // note the new fetched time
    cached.fetched = this.fetched;
    // console.debug("updating cache");

    // update location only if known
    if (this.lat != 0 && this.lng != 0) {
      cached.lat = this.lat;
      cached.lng = this.lng;
      cached.date = this.date;
    }

    // these probably won't change, but just be sure
    cached.name = this.name;
    cached.level = this.level;
    cached.enlid = this.enlid;
    cached.pic = this.pic;
    cached.Vverified = this.Vverified;
    cached.blacklisted = this.blacklisted;
    cached.rocks = this.rocks;
    // cansendto is never true from a team pull, but might be true from a direct pull

    // remove things which make no sense in the global cache
    delete cached.ShareWD;
    delete cached.LoadWD;
    delete cached.squad;
    delete cached.state;

    try {
      await window.plugin.wasabee.idb.put("agents", cached);
    } catch (e) {
      console.error(e);
    }
  }

  get latLng() {
    if (this.lat && this.lng) return new L.LatLng(this.lat, this.lng);
    return null;
  }

  // hold agent data up to 24 hours by default -- don't bother the server if all we need to do is resolve GID -> name
  static async get(gid, maxAgeSeconds = 86400) {
    const cached = await window.plugin.wasabee.idb.get("agents", gid);
    if (cached && cached.fetched > Date.now() - 1000 * maxAgeSeconds) {
      const a = new WasabeeAgent(cached);
      a.cached = true;
      // console.debug("returning from cache", a);
      return a;
    }

    if (!WasabeeMe.isLoggedIn()) {
      // console.debug("not logged in, giving up");
      return null;
    }

    // console.debug("pulling server for new agent data (no team)");
    try {
      const result = await agentPromise(gid);
      return new WasabeeAgent(result);
    } catch (e) {
      console.error(e);
    }
    // console.debug("giving up");
    return null;
  }

  async formatDisplay(teamID = 0) {
    const display = L.DomUtil.create("a", "wasabee-agent-label");
    if (this.Vverified || this.rocks) {
      L.DomUtil.addClass(display, "enl");
    }
    if (this.blacklisted) {
      L.DomUtil.addClass(display, "res");
    }
    L.DomEvent.on(display, "click", (ev) => {
      L.DomEvent.stop(ev);
      const ad = new AgentDialog({ gid: this.id });
      ad.enable();
    });
    display.textContent = await this._getDisplayName(teamID);
    return display;
  }

  async getPopup() {
    const content = L.DomUtil.create("div", "wasabee-agent-popup");
    const title = L.DomUtil.create("div", "desc", content);
    title.id = this.id;
    const fd = await this.formatDisplay(0);
    title.innerHTML = fd.outerHTML + this.timeSinceformat();

    const sendTarget = L.DomUtil.create("button", null, content);
    sendTarget.textContent = wX("SEND TARGET");
    L.DomEvent.on(sendTarget, "click", (ev) => {
      L.DomEvent.stop(ev);
      const selectedPortal = WasabeePortal.getSelected();
      if (!selectedPortal) {
        alert(wX("SELECT PORTAL"));
        return;
      }

      const d = new ConfirmDialog({
        title: wX("SEND TARGET"),
        label: wX("SEND TARGET CONFIRM", {
          portalName: selectedPortal.displayName,
          agent: this.name,
        }),
        type: "agent",
        callback: async () => {
          try {
            await targetPromise(this.id, selectedPortal);
            alert(wX("TARGET SENT"));
          } catch (e) {
            console.error(e);
          }
        },
      });
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

      const d = new ConfirmDialog({
        title: "Send Route to Target",
        label: "Do you really want to request the route to be sent?",
        type: "agent",
        callback: async () => {
          try {
            await routePromise(this.id, selectedPortal);
            alert("Route Sent");
          } catch (e) {
            console.error(e);
          }
        },
      });
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
    if (interval > 1) return wX("HOURS", { hours: interval });
    interval = Math.floor(seconds / 60);
    if (interval > 1) return wX("MINUTES", { minutes: interval });
    interval = Math.floor(seconds);
    return wX("SECONDS", { seconds: interval });
  }

  // change this to return an L.Marker() to make the logic in mapDrawing simpler
  icon(z = 7) {
    if (z < 6) return this.globalIcon();
    if (z >= 6 && z < 9) return this.smallIcon();
    if (z >= 9 && z < 15) return this.mediumIcon();
    return this.bigIcon();
  }

  iconSize(z = 7) {
    if (z < 6) return [30, 30];
    if (z >= 6 && z < 9) return [36, 47];
    if (z >= 9 && z < 15) return [40, 52];
    return [46, 60];
  }

  iconAnchor(z = 7) {
    if (z < 6) return [15, 30];
    if (z >= 6 && z < 9) return [18, 47];
    if (z >= 9 && z < 15) return [20, 52];
    return [23, 60];
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
