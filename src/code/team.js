import WasabeeAgent from "./agent";
import { teamPromise } from "./server";

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
    for (const agent of data.agents) {
      team.agents.push(WasabeeAgent.create(agent));
      // WasabeeAgent.create takes care of caching it for us
    }
    return team;
  }

  static get(teamID) {
    if (window.plugin.wasabee.teams.has(teamID)) {
      return window.plugin.wasabee.teams.get(teamID);
    }
    let t = null;
    teamPromise(teamID).then(
      team => {
        t = team;
      },
      err => {
        console.log(err);
      }
    );
    return t;
  }
}
