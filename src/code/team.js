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
    this.fetched = Date.now();
    this.rc = data.rc;
    this.rk = data.rk;
    this.jlt = data.jlt;
    this.agents = data.agents; // raw agent data

    // no _a, must be from server
    if (!data._a) {
      this._a = new Array();
      for (const agent of data.agents) {
        this._a.push(new WasabeeAgent(agent, true)); // add to agent cache
      }
      this._updateCache();
    } else {
      this._a = data._a;
    }
  }

  getAgents() {
    return this._a;
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
