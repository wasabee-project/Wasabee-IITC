import { agentPromise } from "../server";
import WasabeeMe from "./me";
import WasabeeTeam from "./team";
import db from "../db";

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

  async getTeamName(teamID = 0) {
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
    const cached = await (await db).get("agents", this.id);

    // nothing already in the cache, just dump this in and call it good
    // will contain the extras, but that's fine for now
    if (cached == null) {
      // console.debug("not cached, adding");
      try {
        await (await db).put("agents", this);
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
      await (await db).put("agents", cached);
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
    const cached = await (await db).get("agents", gid);
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
}
