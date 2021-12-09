import { mePromise } from "../server";
import db from "../db";

import { constants } from "../static";
import WasabeeAgent from "./agent";

export interface MeTeam {
  ID: string;
  Name: string;
  RocksComm: string;
  RocksKey: string;
  JoinLinkToken: string;
  ShareWD: boolean;
  LoadWD: boolean;
  State: boolean;
  Owner: string;
  VTeam: string;
  VTeamRole: string;
}

interface MeOp {
  ID: OpID;
  Name: string;
  IsOwner: boolean;
  Color: string; // ??
  TeamID: TeamID;
}

export default class WasabeeMe extends WasabeeAgent {
  querytoken?: string;
  lockey?: string;
  vapi?: string;

  Telegram: {
    ID: string;
    Verified: boolean;
    Authtoken: string;
  };

  Teams: MeTeam[];
  Ops: MeOp[];

  _teamMap: Map<string, boolean>;

  constructor(data) {
    if (typeof data == "string") {
      console.trace("me waits for an object");
      return null;
    }
    data.id = data.GoogleID || data.id;
    super(data);
    this.querytoken = data.querytoken;
    this.pic = data.pic;
    this.intelfaction = data.intelfaction;
    this.lockey = data.lockey;
    this.vapi = data.vapi;

    this.Teams = [];
    if (data.Teams && data.Teams.length > 0) {
      for (const team of data.Teams) {
        team.ShareWD = team.ShareWD == "On" || team.ShareWD === true;
        team.LoadWD = team.LoadWD == "On" || team.LoadWD === true;
        team.State = team.State == "On" || team.State === true;
        this.Teams.push(team);
      }
    }

    this.Ops = [];
    if (data.Ops && data.Ops.length > 0) {
      for (const op of data.Ops) {
        this.Ops.push(op);
      }
    }
    this.fetched = data.fetched ? data.fetched : Date.now();
    this._teamMap = null;
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
    const me = WasabeeMe.localGet();
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

    window.map.fire("wasabee:logout", { GID: me ? me.id : null });
  }

  teamJoined(teamID) {
    if (this._teamMap == null) this.makeTeamMap();
    if (this._teamMap.has(teamID)) return true;
    return false;
  }

  makeTeamMap() {
    this._teamMap = new Map();
    for (const t of this.Teams) {
      this._teamMap.set(t.ID, t.State);
    }
  }
}
