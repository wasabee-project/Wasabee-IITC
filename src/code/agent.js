export default class Agent {
  constructor () {
    this.id = null
    this.name = null
    this.lat = 0
    this.lng = 0
    this.date = null
    this.pic = null
    this.cansendto = false
    this.battery = 0
    this.alt = 0
  }

  static create (obj) {
    var agent = new Agent()
    for (var prop in obj) {
      if (agent.hasOwnProperty(prop)) {
        agent[prop] = obj[prop]
      }
      if (prop === 'OwnTracks') {
        agent.battery = obj[prop].batt
        agent.alt = obj[prop].alt
      }
    }
    return agent
  }
}
