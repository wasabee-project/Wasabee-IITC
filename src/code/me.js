import store from "../lib/store";
import { mePromise } from "./server";

const Wasabee = window.plugin.Wasabee;

export default class WasabeeMe {
  constructor() {
    this.GoogleID = null;
    this.Teams = Array();
    this.Ops = Array();
    this.fetched = Date.now();
  }

  store() {
    store.set(Wasabee.Constants.AGENT_INFO_KEY, JSON.stringify(this));
  }

  remove() {
    store.remove(Wasabee.Constants.AGENT_INFO_KEY);
  }

  static isLoggedIn() {
    const maxCacheAge = Date.now() - 1000 * 60 * 59;
    const lsme = store.get(Wasabee.Constants.AGENT_INFO_KEY);
    if (lsme === null || typeof lsme !== "string") {
      return false;
    }
    const me = JSON.parse(lsme);
    if (me.fetched > maxCacheAge) {
      return true;
    }
    store.remove(Wasabee.Constants.AGENT_INFO_KEY);
    return false;
  }

  static get(force) {
    let me = null;
    const maxCacheAge = Date.now() - 1000 * 60 * 59;
    const lsme = store.get(Wasabee.Constants.AGENT_INFO_KEY);

    if (typeof lsme == "string") {
      me = WasabeeMe.create(JSON.parse(lsme));
    }
    if (
      me === null ||
      me.fetched == undefined ||
      me.fetched < maxCacheAge ||
      force
    ) {
      // console.log("pulling /me from server");
      mePromise().then(
        function(nme) {
          me = nme;
          store.set(Wasabee.Constants.AGENT_INFO_KEY, JSON.stringify(me));
        },
        function(err) {
          console.log(err);
          store.remove(Wasabee.Constants.AGENT_INFO_KEY);
          me = null;
          alert(err);
        }
      );
    }
    return me;
  }

  static create(data) {
    if (data === null) {
      console.log("null passed to WasabeeMe.create");
      return null;
    }
    if (typeof data == "string") {
      data = JSON.parse(data);
    }

    const wme = new WasabeeMe();
    for (var prop in data) {
      if (wme.hasOwnProperty(prop)) {
        switch (prop) {
          case "Teams":
            if (data.Teams !== null) {
              for (const team of data.Teams) {
                wme.Teams.push(team);
              }
            }
            break;
          case "Ops":
            if (data.Ops !== null) {
              for (const op of data.Ops) {
                wme.Ops.push(op);
              }
            }
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
