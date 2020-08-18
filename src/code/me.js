import { mePromise } from "./server";
import { getSelectedOperation } from "./selectedOp";

const Wasabee = window.plugin.wasabee;

export default class WasabeeMe {
  constructor(data) {
    if (typeof data == "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.log(e);
        return null;
      }
    }
    this.GoogleID = data.GoogleID;
    this.IngressName = data.IngressName;
    this.Level = data.level ? data.level : 0;
    this.Teams = Array();
    this.Ops = Array();
    this.fetched = Date.now();
    this.Assignments = Array();
    this._teamMap = null;

    if (data.Teams !== null) {
      for (const team of data.Teams) {
        this.Teams.push(team);
      }
    }
    if (data.Ops && data.Ops.length > 0) {
      for (const op of data.Ops) {
        this.Ops.push(op);
      }
    }
    if (data.Assignments && data.Assignments.length > 0) {
      for (const assignment of data.Assignments) {
        this.Assignments.push(assignment);
      }
    }
    this.fetched = data.fetched ? data.fetched : Date.now();
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
    WasabeeMe.purge();
    return false;
  }

  // for when you need a cached value or nothing -- in critical code paths
  static cacheGet() {
    let me = null;
    const lsme = localStorage[Wasabee.static.constants.AGENT_INFO_KEY];

    if (typeof lsme == "string") {
      me = new WasabeeMe(lsme); // do not store
    }
    if (
      me === null ||
      me.fetched == undefined ||
      me.fetched < WasabeeMe.maxCacheAge()
    ) {
      WasabeeMe.purge();
      return null;
    }

    return me;
  }

  // use waitGet with "force == true" if you want a fresh value now
  static async waitGet(force) {
    let me = null;
    const lsme = localStorage[Wasabee.static.constants.AGENT_INFO_KEY];

    if (typeof lsme == "string") {
      me = new WasabeeMe(lsme); // do not store
    }
    if (
      me === null ||
      me.fetched == undefined ||
      me.fetched < WasabeeMe.maxCacheAge() ||
      force
    ) {
      try {
        const response = await mePromise();
        const newme = new WasabeeMe(response);
        newme.store();
        me = newme;
      } catch (e) {
        WasabeeMe.purge();
        console.log(e);
        alert(e);
        me = null;
      }
      window.runHooks("wasabeeUIUpdate", getSelectedOperation());
    }
    return me;
  }

  static purge() {
    delete localStorage[Wasabee.static.constants.AGENT_INFO_KEY];
    localStorage[window.plugin.wasabee.static.constants.MODE_KEY] = "design";
    delete localStorage["sentToServer"]; // resend firebase token on login

    if (window.plugin.wasabee._agentCache)
      window.plugin.wasabee._agentCache.clear();
    if (window.plugin.wasabee.teams) window.plugin.wasabee.teams.clear();
    if (window.plugin.wasabee._Dkeys) {
      window.plugin.wasabee._Dkeys.clear();
      window.runHooks("wasabeeDkeys");
    }

    window.runHooks("wasabeeUIUpdate", getSelectedOperation());
  }

  teamJoined(teamID) {
    if (this._teamMap == null) this.makeTeamMap();
    if (this._teamMap.has(teamID)) return true;
    return false;
  }

  teamEnabled(teamID) {
    if (this._teamMap == null) this.makeTeamMap();
    if (this._teamMap.has(teamID)) {
      const m = this._teamMap.get(teamID);
      if (m == "On") return true;
    }
    return false;
  }

  makeTeamMap() {
    this._teamMap = new Map();
    for (const t of this.Teams) {
      this._teamMap.set(t.ID, t.State);
    }
  }
}
