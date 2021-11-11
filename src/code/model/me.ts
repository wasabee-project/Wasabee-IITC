import { mePromise } from "../server";
import db from "../db";

import { constants } from "../static";

export interface MeTeam {
  ID: string,
  Name: string,
  RocksComm: string,
  RocksKey: string,
  JoinLinkToken: string,
  ShareWD: "On" | "Off",
  LoadWD: "On" | "Off",
  State: "On" | "Off",
  Owner: string,
  VTeam: string,
  VTeamRole: string,
}

interface MeOp {
  ID: string,
}

export default class WasabeeMe {
  GoogleID: string;
  name: string;
  vname: string;
  rocksname: string;
  intelname: string;
  level: number;
  Teams: Array<MeTeam>;
  Ops: Array<MeOp>;
  fetched: number;
  Vverified: boolean;
  blacklisted: boolean;
  enlid: string;
  pic: string;
  intelfaction: string;
  querytoken: string;

  _teamMap: Map<string, "On" | "Off">;

  constructor(data) {
    if (typeof data == "string") {
      console.trace("me waits for an object");
      return null;
    }
    this.GoogleID = data.GoogleID;
    this.name = data.name;
    this.vname = data.vname;
    this.rocksname = data.rocksname;
    this.intelname = data.intelname;
    this.level = data.level ? data.level : 0;
    this.Teams = Array();
    this.Ops = Array();
    this.fetched = Date.now();
    this.Vverified = data.Vverified;
    this.blacklisted = data.blacklisted;
    this.enlid = data.enlid;
    this._teamMap = null;
    // RAID and RISC are unused by clients
    this.pic = data.pic;
    this.intelfaction = data.intelfaction;
    this.querytoken = data.querytoken;

    if (data.Teams && data.Teams.length > 0) {
      for (const team of data.Teams) {
        this.Teams.push(team);
      }
    }
    if (data.Ops && data.Ops.length > 0) {
      for (const op of data.Ops) {
        this.Ops.push(op);
      }
    }
    this.fetched = data.fetched ? data.fetched : Date.now();
  }

  static maxCacheAge() {
    return Date.now() - 1000 * 60 * 60 * 24;
  }

  toJSON() {
    // default
    return this;
  }

  store() {
    localStorage[constants.AGENT_INFO_KEY] = JSON.stringify(this);
  }

  remove() {
    delete localStorage[constants.AGENT_INFO_KEY];
  }

  static localGet() {
    const lsme = localStorage[constants.AGENT_INFO_KEY];
    if (typeof lsme == "string") {
      return new WasabeeMe(JSON.parse(lsme)); // do not store
    }
    return null;
  }

  static isLoggedIn() {
    const me = WasabeeMe.localGet();

    if (!me) {
      return false;
    }

    if (me.fetched > WasabeeMe.maxCacheAge()) {
      return true;
    }
    WasabeeMe.purge();
    return false;
  }

  // for when you need a cached value or nothing -- in critical code paths
  static cacheGet() {
    const me = WasabeeMe.localGet();

    if (!me) {
      return null;
    }

    if (me.fetched == undefined || me.fetched < WasabeeMe.maxCacheAge()) {
      WasabeeMe.purge();
      return null;
    }

    return me;
  }

  // use waitGet with "force == true" if you want a fresh value now
  // may throw if force == true
  static async waitGet(force?: boolean, noFail?: boolean) {
    const me = WasabeeMe.localGet();
    if (
      me === null ||
      me.fetched == undefined ||
      me.fetched < WasabeeMe.maxCacheAge() ||
      force
    ) {
      try {
        const response = await mePromise();
        const newme = new WasabeeMe(response);
        newme.store();
      } catch (e) {
        if (force && !noFail) throw e;
      }
    }
    // use updated (or null) me object
    return WasabeeMe.localGet();
  }

  static async purge() {
    delete localStorage[constants.AGENT_INFO_KEY];
    delete localStorage["sentToServer"]; // resend firebase token on login

    const tr = (await db).transaction(
      ["agents", "teams", "defensivekeys"],
      "readwrite"
    );
    const agentos = tr.objectStore("agents");
    const teamos = tr.objectStore("teams");
    const dkos = tr.objectStore("defensivekeys");
    await Promise.all([agentos.clear(), teamos.clear(), dkos.clear(), tr.done]);

    window.map.fire("wasabee:logout");
  }

  teamJoined(teamID) {
    if (this._teamMap == null) this.makeTeamMap();
    if (this._teamMap.has(teamID)) return true;
    return false;
  }

  teamEnabled(teamID) {
    if (this._teamMap == null) this.makeTeamMap();
    if (this._teamMap.has(teamID)) {
      const m = this._teamMap.get(teamID);
      if (m == "On") return true;
    }
    return false;
  }

  makeTeamMap() {
    this._teamMap = new Map();
    for (const t of this.Teams) {
      this._teamMap.set(t.ID, t.State);
    }
  }
}
