import WasabeeAgent from "./agent";
import { teamPromise } from "./server";

export default class WasabeeTeam {
  constructor(data) {
    if (typeof data == "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.log("corrupted team");
        return null;
      }
    }

    this.agents = [];
    this.id = data.id;
    this.name = data.name;
    this.fetched = Date.now();

    // push into team cache
    window.plugin.wasabee.teams.set(this.id, this);

    // push agents into agent cache
    for (const agent of data.agents) {
      this.agents.push(new WasabeeAgent(agent));
    }
  }

  static cacheGet(teamID) {
    if (window.plugin.wasabee.teams.has(teamID)) {
      return window.plugin.wasabee.teams.get(teamID);
    }
    return null;
  }

  static async waitGet(teamID, maxAgeSeconds = 60) {
    if (maxAgeSeconds > 0 && window.plugin.wasabee.teams.has(teamID)) {
      const t = window.plugin.wasabee.teams.get(teamID);
      if (t.fetch > Date.now() - 1000 * maxAgeSeconds) {
        console.log("returning team from cache");
        return t;
      }
      console.log("ignoring team in cache, fetching anew");
    }

    try {
      const result = await teamPromise(teamID);
      const t = new WasabeeTeam(result);
      return t;
    } catch (e) {
      console.log(e);
    }
    return null;
  }
}
