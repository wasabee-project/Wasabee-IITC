export default class WasabeeMe {
  constructor() {
    this.GoogleID = null;
    this.Teams = [];
  }

  static create(data) {
    var d = JSON.parse(data);
    var wme = new WasabeeMe();
    for (var prop in d) {
      if (wme.hasOwnProperty(prop)) {
        if (prop === "Teams") {
          d.agents.forEach(function(agent) {
            wme.agents.push(agent);
          });
        } else {
          wme[prop] = d[prop];
        }
      }
    }
    return wme;
  }
}
