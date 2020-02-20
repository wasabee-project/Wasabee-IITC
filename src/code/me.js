import store from "../lib/store";
import { mePromise } from "./server";
import { getSelectedOperation } from "./selectedOp";

const Wasabee = window.plugin.wasabee;

export default class WasabeeMe {
  constructor() {
    this.GoogleID = null;
    this.Teams = Array();
    this.Ops = Array();
    this.fetched = Date.now();
  }

  store() {
    store.set(Wasabee.static.constants.AGENT_INFO_KEY, JSON.stringify(this));
  }

  remove() {
    store.remove(Wasabee.static.constants.AGENT_INFO_KEY);
  }

  static isLoggedIn() {
    const maxCacheAge = Date.now() - 1000 * 60 * 59;
    const lsme = store.get(Wasabee.static.constants.AGENT_INFO_KEY);
    if (!lsme || typeof lsme !== "string") {
      return false;
    }
    const me = JSON.parse(lsme);
    if (me.fetched > maxCacheAge) {
      return true;
    }
    store.remove(Wasabee.static.constants.AGENT_INFO_KEY);
    return false;
  }

  static get(force) {
    let me = null;
    const maxCacheAge = Date.now() - 1000 * 60 * 59;
    const lsme = store.get(Wasabee.static.constants.AGENT_INFO_KEY);

    if (typeof lsme == "string") {
      // XXX this might be a problem, since create writes it back to the store
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
          // mePromise calls WasabeeMe.create, which calls me.store()
          // store.set(Wasabee.static.constants.AGENT_INFO_KEY, JSON.stringify(me));
          window.runHooks("wasabeeUIUpdate", getSelectedOperation());
        },
        function(err) {
          console.log(err);
          store.remove(Wasabee.static.constants.AGENT_INFO_KEY);
          me = null;
          alert(err);
          window.runHooks("wasabeeUIUpdate", getSelectedOperation());
        }
      );
    }
    return me;
  }

  static create(data) {
    if (!data) {
      console.log("nothing fed to WasabeeMe.create");
      return null;
    }
    if (typeof data == "string") {
      data = JSON.parse(data);
    }

    const wme = new WasabeeMe();
    for (const prop in data) {
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
    wme.store();
    return wme;
  }
}
