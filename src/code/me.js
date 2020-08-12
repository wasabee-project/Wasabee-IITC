import { mePromise } from "./server";
import { getSelectedOperation } from "./selectedOp";

const Wasabee = window.plugin.wasabee;

export default class WasabeeMe {
  constructor() {
    this.GoogleID = null;
    this.IngressName = null;
    this.Level = 0;
    this.Teams = Array();
    this.Ops = Array();
    this.fetched = Date.now();
    this.Assignments = Array();
  }

  static maxCacheAge() {
    return Date.now() - 1000 * 60 * 60 * 24;
  }

  toJSON() {
    // default
    return this;
  }

  store() {
    localStorage[Wasabee.static.constants.AGENT_INFO_KEY] = JSON.stringify(
      this
    );
  }

  // eslint-diable-next-line
  remove() {
    delete localStorage[Wasabee.static.constants.AGENT_INFO_KEY];
  }

  static isLoggedIn() {
    const lsme = localStorage[Wasabee.static.constants.AGENT_INFO_KEY];
    if (!lsme || typeof lsme !== "string") {
      return false;
    }
    let me = null;
    try {
      me = JSON.parse(lsme);
    } catch (e) {
      console.log(e);
      return false;
    }
    if (me.fetched > WasabeeMe.maxCacheAge()) {
      return true;
    }
    delete localStorage[Wasabee.static.constants.AGENT_INFO_KEY];
    return false;
  }

  // this is deceptive, it only returns a cached value, any update takes place async
  static cacheGet() {
    let me = null;
    const lsme = localStorage[Wasabee.static.constants.AGENT_INFO_KEY];

    if (typeof lsme == "string") {
      me = WasabeeMe.create(lsme);
    }
    if (
      me === null ||
      me.fetched == undefined ||
      me.fetched < WasabeeMe.maxCacheAge()
    ) {
      delete localStorage[Wasabee.static.constants.AGENT_INFO_KEY];
      return null;
    }

    return me;
  }

  // use waitGet with "force == true" if you want a fresh value now
  static async waitGet(force) {
    let me = null;
    const lsme = localStorage[Wasabee.static.constants.AGENT_INFO_KEY];

    if (typeof lsme == "string") {
      me = WasabeeMe.create(lsme);
    }
    if (
      me === null ||
      me.fetched == undefined ||
      me.fetched < WasabeeMe.maxCacheAge() ||
      force
    ) {
      try {
        const newme = await mePromise();
        if (newme instanceof WasabeeMe == false) {
          throw newme;
        }
        me = newme;
      } catch (e) {
        delete localStorage[Wasabee.static.constants.AGENT_INFO_KEY];
        console.log(e);
        alert(e);
        me = null;
      }
      window.runHooks("wasabeeUIUpdate", getSelectedOperation());
    }
    return me;
  }

  static create(data) {
    if (!data) return null;
    if (typeof data == "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.log(e);
        return null;
      }
    }
    const wme = new WasabeeMe();
    wme.GoogleID = data.GoogleID;
    wme.IngressName = data.IngressName;
    if (data.Teams !== null) {
      for (const team of data.Teams) {
        wme.Teams.push(team);
      }
    }
    if (data.Ops && data.Ops.length > 0) {
      for (const op of data.Ops) {
        wme.Ops.push(op);
      }
    }
    if (data.Assignments && data.Assignments.length > 0) {
      for (const assignment of data.Assignments) {
        wme.Assignments.push(assignment);
      }
    }
    wme.fetched = data.fetched ? data.fetched : Date.now();
    // wme.store();
    return wme;
  }

  static purge() {
    delete localStorage[Wasabee.static.constants.AGENT_INFO_KEY];
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
