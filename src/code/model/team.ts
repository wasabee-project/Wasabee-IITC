import WasabeeAgent, { ServerAgent } from "./agent";
import WasabeeMe from "./me";
import { teamPromise } from "../server";
import db from "../db";

interface RocksTeam {
  rc: string;
  rk: string;
}

interface VTeam {
  vt: string;
  vr: string;
}

interface ServerTeam extends RocksTeam, VTeam {
  id: TeamID;
  name: string;
  agents: ServerAgent[];
  jlt: string;
}

interface Team extends RocksTeam, VTeam {
  id: TeamID;
  name: string;
  agents: WasabeeAgent[];
  jlt: string;

  fetched?: number;
}

export default class WasabeeTeam implements Team {
  id: TeamID;
  name: string;
  agents: WasabeeAgent[];
  jlt: string;
  // Rocks
  rc: string;
  rk: string;
  // V
  vt: string;
  vr: string;

  fetched: number;

  constructor(data: Team | ServerTeam) {
    if (typeof data == "string") {
      console.trace("team waits for an object");
      return;
    }

    let fromServer = false;
    if ("fetched" in data) {
      this.fetched = data.fetched;
    } else {
      this.fetched = Date.now();
      fromServer = true;
    }

    this.id = data.id;
    this.name = data.name;
    this.rc = data.rc;
    this.rk = data.rk;
    this.jlt = data.jlt;
    this.vt = data.vt;
    this.vr = data.vr;
    this.agents = data.agents.map(
      (a) => new WasabeeAgent({ ...a, fetched: this.fetched })
    );

    if (fromServer) this._updateCache();
  }

  async _updateCache() {
    try {
      await (await db).put("teams", this);
    } catch (e) {
      console.error(e);
    }
  }

  // 60 seconds seems too short for the default here...
  static async get(teamID, maxAgeSeconds = 60) {
    const cached = await (await db).get("teams", teamID);
    if (cached) {
      const t = new WasabeeTeam(cached);
      if (t.fetched > Date.now() - 1000 * maxAgeSeconds) {
        return t;
      }
    }

    if (!WasabeeMe.isLoggedIn()) return null;

    try {
      const t = await teamPromise(teamID);
      return new WasabeeTeam(t);
    } catch (e) {
      console.error(e);
    }
    return null;
  }
}
