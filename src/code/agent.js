export default class Agent {
  constructor() {
    this.id = null;
    this.name = null;
    this.lat = 0;
    this.lng = 0;
    this.date = null;
    this.pic = null;
    this.cansendto = false;
  }

  static create(obj) {
    var agent = new Agent();
    for (var prop in obj) {
      if (agent.hasOwnProperty(prop)) {
        agent[prop] = obj[prop];
      }
    }
    return agent;
  }
}
