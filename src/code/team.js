import WasabeeAgent from "./agent";
import WasabeeMe from "./me";
import { teamPromise } from "./server";

export default class WasabeeTeam {
  constructor(data) {
    if (typeof data == "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.error("corrupted team");
        return null;
      }
    }

    this.id = data.id;
    this.name = data.name;
    this.date = Date.now();
    this.rc = data.rc;
    this.rk = data.rk;
    this.jlt = data.jlt;

    // from team cache: use as is
    if (data.agentIDs) this.agentIDs = data.agentIDs;

    // from server
    if (data.agents) {
      this.agentIDs = new Array(); // use this now
      for (const agent of data.agents) {
        const a = new WasabeeAgent(agent, this.id); // push to agent cache
        this.agentIDs.push(a.id); // we only need the id here
      }
      this._updateCache();
    }
  }

  async agents() {
    const p = new Array();
    for (const id of this.agentIDs) p.push(WasabeeAgent.get(id));
    const agents = new Array();
    const results = await Promise.allSettled(p);
    for (const result of results) {
      if (result.status == "fulfilled") {
        agents.push(result.value);
      } else {
        console.log(result.status, result.reason);
      }
    }
    return agents;
  }

  async _updateCache() {
    await window.plugin.wasabee.idb.put("teams", this);
  }

  static async get(teamID, maxAgeSeconds = 60) {
    if (!WasabeeMe.isLoggedIn()) return null;

    const cached = await window.plugin.wasabee.idb.get("teams", teamID);
    if (cached) {
      const t = new WasabeeTeam(cached);
      if (t.date > Date.now() - 1000 * maxAgeSeconds) {
        t.cached = true;
        return t;
      }
    }

    try {
      const t = await teamPromise(teamID);
      return new WasabeeTeam(t);
    } catch (e) {
      console.error(e.toString());
    }
    return null;
  }
}
