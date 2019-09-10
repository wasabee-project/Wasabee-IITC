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
    var lsme = store.get(Wasabee.Constants.AGENT_INFO_KEY);
    var me = JSON.parse(lsme);
    var maxCacheAge = Date.now() - 1000 * 60 * 15;
    var storeit = false;

    // if older than 15 minutes, pull again
    if (me == null || me.fetched == undefined || me.fetched > maxCacheAge) {
      console.log(
        "WasabeeMe.get: pulling from server: " +
          me.fetched +
          " > " +
          maxCacheAge
      );
      window.plugin.wasabee.mePromise().then(
        function(nme) {
          me = nme;
          storeit = true;
        },
        function(err) {
          console.log(err);
          me = null;
        }
      );
    } else {
      console.log("WasabeeMe.get: returning from localstore");
    }

    // convert JSON or obj into WasabeeMe
    if (me != null && !(me instanceof WasabeeMe)) {
      me = WasabeeMe.create(me);
    }
    if (storeit) {
      me.store();
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
