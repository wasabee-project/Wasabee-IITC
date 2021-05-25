import { mePromise } from "./server";

const Wasabee = window.plugin.wasabee;

export default class WasabeeMe {
  constructor(data) {
    if (typeof data == "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.error(e);
        return null;
      }
    }
    this.GoogleID = data.GoogleID;
    this.name = data.name;
    this.vname = data.vname;
    this.rocksname = data.rocksname;
    this.intelname = data.intelname;
    this.level = data.level ? data.level : 0;
    this.Teams = Array();
    this.Ops = Array();
    this.fetched = Date.now();
    this.Vverified = data.Vverified;
    this.blacklisted = data.blacklisted;
    this.enlid = data.enlid;
    this._teamMap = null;
    // RAID and RISC are unused by clients
    this.pic = data.pic;
    this.intelfaction = data.intelfaction;
    this.querytoken = data.querytoken;

    if (data.Teams && data.Teams.length > 0) {
      for (const team of data.Teams) {
        this.Teams.push(team);
      }
    }
    if (data.Ops && data.Ops.length > 0) {
      for (const op of data.Ops) {
        this.Ops.push(op);
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
    localStorage[Wasabee.static.constants.AGENT_INFO_KEY] =
      JSON.stringify(this);
  }

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
      console.error(e);
      return false;
    }
    if (me.fetched > WasabeeMe.maxCacheAge()) {
      return true;
    }
    WasabeeMe.purge();
    window.map.fire("wasabee:uiupdate:buttons");
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
      window.map.fire("wasabee:uiupdate:buttons");
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
        window.map.fire("wasabee:uiupdate:buttons");
        console.error(e);
        alert(e.toString());
        me = null;
      }
    }
    return me;
  }

  static async purge() {
    delete localStorage[Wasabee.static.constants.AGENT_INFO_KEY];
    delete localStorage["sentToServer"]; // resend firebase token on login

    const tr = window.plugin.wasabee.idb.transaction(
      ["agents", "teams", "defensivekeys"],
      "readwrite"
    );
    const agentos = tr.objectStore("agents");
    const teamos = tr.objectStore("teams");
    const dkos = tr.objectStore("defensivekeys");
    await Promise.all([agentos.clear(), teamos.clear(), dkos.clear(), tr.done]);

    window.map.fire("wasabee:logout");
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
