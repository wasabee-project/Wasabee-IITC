import WasabeeAgent from "./agent";
import WasabeeMe from "./me";
import { teamPromise } from "./server";

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

    this.id = data.id;
    this.name = data.name;
    this.feteched = Date.now();
    this.rc = data.rc;
    this.rk = data.rk;
    this.jlt = data.jlt;

    // from team cache: use as is
    if (data.agentIDs) this.agentIDs = data.agentIDs;

    // from server
    if (data.agents) {
      this.agentIDs = new Array();
      for (const agent of data.agents) {
        const a = new WasabeeAgent(agent, this.id, true); // push to agent cache
        this.agentIDs.push(a.id); // we only need the id here
      }
      this._updateCache();
    }
  }

  async agents() {
    const p = new Array();
    for (const id of this.agentIDs) p.push(WasabeeAgent.get(id, this.id));
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

  // 60 seconds seems too short for the default here...
  static async get(teamID, maxAgeSeconds = 60) {
    const cached = await window.plugin.wasabee.idb.get("teams", teamID);
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
      console.error(e.toString());
    }
    return null;
  }
}
