import WasabeeAgent from "./agent";

export default class WasabeeTeam {
  constructor() {
    this.name = null;
    this.id = null;
    this.agents = [];
  }

  static create(data) {
    const d = JSON.parse(data);
    const team = new WasabeeTeam();
    for (var prop in d) {
      if (team.hasOwnProperty(prop)) {
        if (prop === "agents") {
          for (const agent of d.agents) {
            team.agents.push(WasabeeAgent.create(agent));
            // WasabeeAgent.create takes care of caching it for us
          }
        } else {
          team[prop] = d[prop];
        }
      }
    }
    return team;
  }
}
