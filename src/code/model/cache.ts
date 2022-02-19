import WasabeeMe from "./me";
import WasabeeAgent from "./agent";
import { agentPromise, mePromise, teamPromise } from "../server";
import WasabeeTeam from "./team";

// hold agent data up to 24 hours by default -- don't bother the server if all we need to do is resolve GID -> name
export async function getAgent(gid: string, maxAgeSeconds = 86400) {
  const cached = await WasabeeAgent.get(gid);
  if (cached && cached.fetched > Date.now() - 1000 * maxAgeSeconds) {
    const a = new WasabeeAgent(cached);
    // console.debug("returning from cache", a);
    return a;
  }

  if (!WasabeeMe.isLoggedIn()) {
    // console.debug("not logged in, giving up");
    return null;
  }

  // console.debug("pulling server for new agent data (no team)");
  try {
    const result = await agentPromise(gid);
    return new WasabeeAgent(result);
  } catch (e) {
    console.error(e);
  }
  // console.debug("giving up");
  return null;
}

export async function getMe(force?: boolean, noFail?: boolean) {
  const me = WasabeeMe.localGet();
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
    } catch (e) {
      if (force && !noFail) throw e;
    }
  }
  // use updated (or null) me object
  return WasabeeMe.localGet();
}

// 60 seconds seems too short for the default here...
export async function getTeam(teamID, maxAgeSeconds = 60) {
  const cached = await WasabeeTeam.get(teamID);
  if (cached) {
    const t = new WasabeeTeam(cached);
    if (t.fetched > Date.now() - 1000 * maxAgeSeconds) {
      return t;
    }
  }

  if (!WasabeeMe.isLoggedIn()) return null;

  try {
    const t = await teamPromise(teamID);
    return new WasabeeTeam(t);
  } catch (e) {
    console.error(e);
  }
  return null;
}
