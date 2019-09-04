export default class WasabeeMe {
  constructor() {
    this.GoogleID = null;
    this.Teams = Array();
  }

  static create(data) {
    var wme = new WasabeeMe();
    for (var prop in data) {
      if (wme.hasOwnProperty(prop)) {
        if (prop === "Teams") {
          data.Teams.forEach(function(team) {
            wme.Teams.push(team);
          });
        } else {
          wme[prop] = data[prop];
        }
      }
    }
    return wme;
  }
}
