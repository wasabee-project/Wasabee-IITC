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
      me = WasabeeMe.create(lsme);
    }
    if (
      me === null ||
      me.fetched == undefined ||
      me.fetched < maxCacheAge ||
      force
    ) {
      mePromise().then(
        function(nme) {
          me = nme;
          // mePromise calls WasabeeMe.create, which calls me.store()
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

  static async waitGet(force) {
    let me = null;
    const maxCacheAge = Date.now() - 1000 * 60 * 59;
    const lsme = store.get(Wasabee.static.constants.AGENT_INFO_KEY);

    if (typeof lsme == "string") {
      // XXX this might be a problem, since create writes it back to the store
      me = WasabeeMe.create(lsme);
    }
    if (
      me === null ||
      me.fetched == undefined ||
      me.fetched < maxCacheAge ||
      force
    ) {
      const newme = await mePromise();
      if (newme instanceof WasabeeMe) {
        me = newme;
      } else {
        store.remove(Wasabee.static.constants.AGENT_INFO_KEY);
        console.log(newme);
        alert(newme);
        me = null;
      }
      window.runHooks("wasabeeUIUpdate", getSelectedOperation());
    }
    return me;
  }

  static create(data) {
    if (!data) return null;
    if (typeof data == "string") {
      data = JSON.parse(data);
    }
    const wme = new WasabeeMe();
    wme.GoogleID = data.GoogleID;
    if (data.Teams !== null) {
      for (const team of data.Teams) {
        wme.Teams.push(team);
      }
    }
    if (data.Ops !== null) {
      for (const op of data.Ops) {
        wme.Ops.push(op);
      }
    }
    wme.fetched = data.fetched ? data.fetched : Date.now();
    wme.store();
    return wme;
  }

  static purge() {
    store.remove(Wasabee.static.constants.AGENT_INFO_KEY);
    if (window.plugin.wasabee._agentCache)
      window.plugin.wasabee._agentCache.clear();
    if (window.plugin.wasabee.teams) window.plugin.wasabee.teams.clear();
    if (window.plugin.wasabee._Dkeys) {
      window.plugin.wasabee._Dkeys.clear();
      window.runHooks("wasabeeDkeys");
    }
    window.runHooks("wasabeeUIUpdate", getSelectedOperation());
  }
}
