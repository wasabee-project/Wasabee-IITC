import WasabeeAgent from "./agent";

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
}
