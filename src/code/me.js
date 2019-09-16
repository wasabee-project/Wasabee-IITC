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

  static isLoggedIn() {
    let maxCacheAge = Date.now() - 1000 * 60 * 15;
    let lsme = store.get(Wasabee.Constants.AGENT_INFO_KEY);
    if (lsme == null) {
      return false;
    }
    let me = JSON.parse(lsme);
    if (me.fetched > maxCacheAge) {
      return true;
    }
    return false;
  }

  static get(force) {
    let maxCacheAge = Date.now() - 1000 * 60 * 15;
    let lsme = store.get(Wasabee.Constants.AGENT_INFO_KEY);
    if (lsme != null) {
      var me = JSON.parse(lsme);
    } else {
      me = null;
    }
    // if older than 15 minutes, pull again
    if (
      me == null ||
      me.fetched == undefined ||
      me.fetched < maxCacheAge ||
      force
    ) {
      if (me != null) {
        me == null;
        store.remove(Wasabee.Constants.AGENT_INFO_KEY);
      }
      console.log("WasabeeMe.get: pulling from server");
      window.plugin.wasabee.mePromise().then(
        function(nme) {
          me = nme;
          me.store();
        },
        function(err) {
          console.log(err);
          me = null;
        }
      );
    } else {
      // console.log("WasabeeMe.get: returning from localstore");
    }

    // convert JSON or obj into WasabeeMe
    if (me != null && !(me instanceof WasabeeMe)) {
      me = WasabeeMe.create(me);
    }
    return me;
  }

  static create(data) {
    if (typeof data == "string") {
      data = JSON.parse(data);
    }

    let wme = new WasabeeMe();
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
