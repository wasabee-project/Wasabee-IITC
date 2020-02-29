import WasabeeAgent from "./agent";
import { teamPromise } from "./server";

export default class WasabeeTeam {
  constructor() {
    this.name = null;
    this.id = null;
    this.agents = [];
  }

  static create(data) {
    const d = JSON.parse(data);
    const team = new WasabeeTeam();
    team.id = d.id;
    team.name = d.name;
    for (const agent of d.agents) {
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
        console.log(team);
        t = team;
      },
      err => {
        console.log(err);
      }
    );
    return t;
  }
}
