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
    team.id = d.id;
    team.name = d.name;
    for (const agent of d.agents) {
      team.agents.push(WasabeeAgent.create(agent));
      // WasabeeAgent.create takes care of caching it for us
    }
    return team;
  }
}
