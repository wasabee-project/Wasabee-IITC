import Agent from "./agent";

export default class Team {
  constructor() {
    this.name = null;
    this.id = null;
    this.agents = [];
  }

  static create(data) {
    const d = JSON.parse(data);
    const team = new Team();
    for (var prop in d) {
      if (team.hasOwnProperty(prop)) {
        if (prop === "agents") {
          d.agents.forEach(function(agent) {
            team.agents.push(Agent.create(agent));
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
