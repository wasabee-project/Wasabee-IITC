import store from "../lib/store";

var Wasabee = window.plugin.Wasabee;

export default class WasabeeMe {
  constructor() {
    this.GoogleID = null;
    this.Teams = Array();
    this.Ops = Array();
    this.fetched = Date.now();
  }

  store() {
    // store.unobserve(Wasabee.Constants.AGENT_INFO_KEY);
    store.set(Wasabee.Constants.AGENT_INFO_KEY, JSON.stringify(this));
    // store.observe(Wasabee.Constants.AGENT_INFO_KEY, function() {
    //  console.log("AGENT_INFO_KEY changed in another window");
    //});
  }

  static get() {
    var me = store.get(Wasabee.Constants.AGENT_INFO_KEY);
    var maxCacheAge = Date.now() - 1000 * 60 * 15;
    // if older than 15 minutes, pull again
    if (me == null || me.fetched == undefined || me.fetched < maxCacheAge) {
      window.plugin.wasabee.mePromise().then(
        function(nme) {
          me = nme;
          nme.store();
        },
        function(err) {
          console.log(err);
          me = null;
        }
      );
    } else {
      me = WasabeeMe.create(me);
    }
    return me;
  }

  static create(data) {
    if (typeof data == "string") {
      data = JSON.parse(data);
    }

    var wme = new WasabeeMe();
    for (var prop in data) {
      if (wme.hasOwnProperty(prop)) {
        switch (prop) {
          case "Teams":
            data.Teams.forEach(function(team) {
              wme.Teams.push(team);
            });
            break;
          case "Ops":
            data.Ops.forEach(function(op) {
              wme.Ops.push(op);
            });
            break;
          default:
            wme[prop] = data[prop];
            break;
        }
      }
    }
    return wme;
  }
}
