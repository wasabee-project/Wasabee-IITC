import WasabeeAgent from "./agent";
import WasabeeMe from "./me";
import { teamPromise } from "../server";
import db from "../db";

export default class WasabeeTeam {
  constructor(data) {
    if (typeof data == "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.error(e);
        return;
      }
    }

    let fromServer = false;
    if (data.fetched == null) fromServer = true;
    this.fetched = data.fetched ? data.fetched : Date.now();

    this.id = data.id;
    this.name = data.name;
    this.rc = data.rc;
    this.rk = data.rk;
    this.jlt = data.jlt;
    this.agents = data.agents; // raw agent data

    // this block (1) adds agent to agents cache and (2) populates _a
    // _a is a buffer of pre-built WasabeeAgents we can return via getAgents() w/o having to await
    this._a = new Array();
    for (const agent of data.agents) {
      agent.fetched = this.fetched;
      this._a.push(new WasabeeAgent(agent)); // add to agent cache
    }

    if (fromServer) this._updateCache();
  }

  getAgents() {
    return this._a;
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
        t.cached = true;
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
