import { agentPromise } from "../server";
import WasabeeMe from "./me";
import db from "../db";

interface BaseAgent {
  id: GoogleID;
  name: string;
  intelname?: string;
  intelfaction: "unset" | "ENLIGHTENED" | "RESISTANCE";
  communityname?: string;
  pic?: string;
  lat: number;
  lng: number;
  date: string;
}

interface RockAgent extends BaseAgent {
  rocksname?: string;
  rocks: boolean;
}

interface VAgent extends BaseAgent {
  enlid?: string;
  vname?: string;
  Vverified: boolean;
  level: number;
  blacklisted: boolean;
}

interface ServerTeamAgent extends BaseAgent {
  shareWD?: boolean;
  loadWD?: boolean;
  state?: boolean;
  squad?: string;
}

export interface ServerAgent
  extends BaseAgent,
    RockAgent,
    VAgent,
    ServerTeamAgent {}

// local model
interface TeamAgent extends BaseAgent {
  shareWDKeys?: boolean;
  loadWDKeys?: boolean;
  shareLocation?: boolean;
  comment?: string;
}

interface Agent extends BaseAgent, RockAgent, VAgent, TeamAgent {
  fetched?: number;
}

// convert agent in server model to client model
function serverAgentToAgent(agent: ServerAgent) {
  return {
    ...agent,
    shareWDKeys: agent.shareWD,
    loadWDKeys: agent.loadWD,
    shareLocation: agent.state,
    comment: agent.squad,
  };
}

export default class WasabeeAgent implements Agent {
  id: GoogleID;
  name: string;
  pic?: string;
  lat: number;
  lng: number;
  date: string;

  // Community (strong)
  communityname?: string;

  // intel (weak)
  intelname?: string;
  intelfaction: "unset" | "ENLIGHTENED" | "RESISTANCE";

  // V
  enlid?: string;
  vname?: string;
  Vverified: boolean;
  level: number;
  blacklisted: boolean;

  // rocks
  rocksname?: string;
  rocks: boolean;

  // per team data
  shareWDKeys?: boolean;
  loadWDKeys?: boolean;
  shareLocation?: boolean;
  comment?: string;

  fetched: number;

  constructor(obj: Agent) {
    if (typeof obj == "string") {
      console.trace("agent waits for an object");
      return null;
    }
    // if ServerAgent
    if ("shareWD" in obj || "squad" in obj) obj = serverAgentToAgent(obj);
    // console.debug("passed to constructor", obj);

    // things which are stable across all teams
    this.id = obj.id;
    this.name = obj.name;
    this.intelname = obj.intelname !== "unset" ? obj.intelname : "";
    this.intelfaction = obj.intelfaction;
    this.communityname = obj.communityname || '';
    this.pic = obj.pic ? obj.pic : null;
    this.lat = obj.lat ? obj.lat : 0;
    this.lng = obj.lng ? obj.lng : 0;
    this.date = obj.date ? obj.date : null; // last location sub, not fetched
    // V
    this.enlid = obj.enlid ? obj.enlid : null;
    this.vname = obj.vname;
    this.Vverified = !!obj.Vverified;
    this.level = obj.level ? Number(obj.level) : 0;
    this.blacklisted = !!obj.blacklisted;
    // rocks
    this.rocksname = obj.rocksname;
    this.rocks = !!obj.rocks;

    if (this.communityname) this.name = this.communityname;
    else if (this.Vverified) this.name = this.vname || this.name;
    else if (this.rocks) this.name = this.rocksname || this.name;
    else if (this.intelname) this.name = this.intelname + " [!]";
    else this.name = this.name || '[unknown name]';

    /* what did we decide to do with these?
    this.startlat = obj.startlat ? obj.startlat : 0;
    this.startlng = obj.startlng ? obj.startlng : 0;
    this.startradius = obj.startradius ? Number(obj.startradius) : 0;
    this.sharestart = obj.sharestart ? obj.sharestart : false; */

    // vary per-team, don't set on direct pulls
    if (obj.shareWDKeys) this.shareWDKeys = obj.shareWDKeys;
    if (obj.loadWDKeys) this.loadWDKeys = obj.loadWDKeys;
    if (obj.shareLocation) this.shareLocation = obj.shareLocation;
    if (obj.comment) this.comment = obj.comment;
    // this.distance = obj.distance ? Number(obj.distance) : 0; // don't use this

    // not sent by server, but preserve if from cache
    this.fetched = obj.fetched ? obj.fetched : Date.now();

    // push the new data into the agent cache
    // do not await this, let it happen in the background
    this._updateCache();
  }

  getName() {
    if (this.communityname) return this.communityname;
    if (this.Vverified && this.vname) return this.vname;
    if (this.rocks && this.rocksname) return this.rocksname;
    if (this.intelname) return this.intelname;
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
    // update data
    Object.assign(cached, this);

    // remove things which make no sense in the global cache
    delete cached.shareWDKeys;
    delete cached.loadWDKeys;
    delete cached.comment;
    delete cached.shareLocation;

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
  static async get(gid: string, maxAgeSeconds = 86400) {
    const cached = await (await db).get("agents", gid);
    if (cached && cached.fetched > Date.now() - 1000 * maxAgeSeconds) {
      const a = new WasabeeAgent(cached);
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
