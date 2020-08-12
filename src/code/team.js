import WasabeeAgent from "./agent";

export default class WasabeeTeam {
  constructor() {
    this.name = null;
    this.id = null;
    this.agents = [];
    this.fetched = null;
  }

  static create(data) {
    // all consumers curently send JSON, but for API consistency
    // support both obj and JSON
    if (typeof data == "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.log("corrupted team");
        return null;
      }
    }

    const team = new WasabeeTeam();
    team.id = data.id;
    team.name = data.name;
    team.fetched = Date.now();
    window.plugin.wasabee.teams.set(team.id, team);
    for (const agent of data.agents) {
      // WasabeeAgent.create takes care of caching it for us
      team.agents.push(WasabeeAgent.create(agent));
    }
    return team;
  }

  static cacheGet(teamID) {
    if (window.plugin.wasabee.teams.has(teamID)) {
      return window.plugin.wasabee.teams.get(teamID);
    }
    return null;
  }
}
