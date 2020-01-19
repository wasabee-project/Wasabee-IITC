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
          d.agents.forEach(function(agent) {
            team.agents.push(WasabeeAgent.create(agent));
            // push into Wasabee._agentCache
          });
        } else {
          team[prop] = d[prop];
        }
      }
    }
    return team;
  }
}
