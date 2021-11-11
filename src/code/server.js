import WasabeeMe from "./model/me";
import WasabeeOp from "./model/operation";
import { getSelectedOperation, removeOperation } from "./selectedOp";
import WasabeeMarker from "./model/marker";
import { ServerError } from "./error";

export default function () {
  return GetWasabeeServer();
}

export function GetWasabeeServer() {
  // Wasabee-IITC, use the configured server
  if (window.plugin && window.plugin.wasabee) {
    let server =
      localStorage[window.plugin.wasabee.static.constants.SERVER_BASE_KEY];
    if (server == null) {
      server = window.plugin.wasabee.static.constants.SERVER_BASE_DEFAULT;
      localStorage[window.plugin.wasabee.static.constants.SERVER_BASE_KEY] =
        server;
    }
    return server;
  }
  // Wasabee-WebUI doesn't need to specify the server
  return "";
}

export function GetUpdateList() {
  if (window.plugin && window.plugin.wasabee) {
    return window.plugin.wasabee._updateList;
  }
  return window.wasabeewebui._updateList;
}

export function SetWasabeeServer(server) {
  server = server.trim();
  if (!server.startsWith("http")) server = "https://" + server;
  if (server.endsWith("/")) server = server.slice(0, -1);
  localStorage[window.plugin.wasabee.static.constants.SERVER_BASE_KEY] = server;
}

/*
On fail, all promises reject an ServerError { code: number, text: string, error?: string }
If http code is 401: request Me.purge (fire wasabee:logout)
On success, it may returns:
 - the requested data as string
 - the requested object
 - 304 (if modified)
 - true/false (updateOp)
*/

export function loadConfig() {
  return genericGet(`/static/wasabee-webui-config.json`);
}

// returns a promise to /me if the access token is valid
export function SendAccessTokenAsync(accessToken) {
  return genericPost(
    "/aptok",
    JSON.stringify({ accessToken: accessToken }),
    "application/json;charset=UTF-8"
  );
}

// sets logout status on the server; return value is status code
export function logoutPromise() {
  return genericGet("/api/v1/me/logout");
}

// local change: none // cache: none
export function oneTimeToken(token) {
  const url = "/oneTimeToken";
  const fd = new FormData();
  fd.append("token", token);
  return genericPost(url, fd);
}

/**** me & d ****/

// returns a promise to WasabeeMe -- should be called only by WasabeeMe.waitGet()
// use WasabeeMe.cacheGet or WasabeeMe.waitGet for caching
export function mePromise() {
  return genericGet("/api/v1/me");
}

// returns a promise to a list of defensive keys for all enabled teams
export function dKeylistPromise() {
  return genericGet("/api/v1/d");
}

// removes the agent from the team; return value is status code
export function leaveTeamPromise(teamID) {
  return genericDelete(`/api/v1/me/${teamID}`, new FormData());
}

// updates an agent's location ; return value is status code
export function locationPromise(lat, lng) {
  return genericGet(`/api/v1/me?lat=${lat}&lon=${lng}`);
}

export function setIntelID(name, faction, querytoken) {
  const fd = new FormData();
  fd.append("name", name);
  fd.append("faction", faction);
  fd.append("qt", querytoken);
  return genericPut(`/api/v1/me/intelid`, fd);
}

// changes agent's team state on the server; return value is status message
export function SetTeamState(teamID, state) {
  return genericGet(`/api/v1/me/${teamID}?state=${state}`);
}

export function SetTeamShareWD(teamID, state) {
  return genericGet(`/api/v1/me/${teamID}/wdshare?state=${state}`);
}

export function SetTeamLoadWD(teamID, state) {
  return genericGet(`/api/v1/me/${teamID}/wdload?state=${state}`);
}

// updates an agent's single defensive key
export function dKeyPromise(json) {
  return genericPost("/api/v1/d", json, "application/json;charset=UTF-8");
}

// many d-keys at once
export function dKeyBulkPromise(json) {
  return genericPost("/api/v1/d/bulk", json, "application/json;charset=UTF-8");
}

/* agent */

// returns a promise to get the agent's JSON data from the server -- should be called only by WasabeeAgent.get()
export function agentPromise(GID) {
  return genericGet(`/api/v1/agent/${GID}`);
}

// sends a target (portal) to the server to notify the agent
export function targetPromise(agentID, portal, type = "ad hoc") {
  return genericPost(
    `/api/v1/agent/${agentID}/target`,
    JSON.stringify({
      Name: portal.name,
      Lat: portal.lat,
      Lng: portal.lng,
      ID: portal.id,
      Type: type,
    }),
    "application/json;charset=UTF-8"
  );
}

/* team */

// returns a promise to a WasabeeTeam -- used only by WasabeeTeam.get
// use WasabeeTeam.get
export function teamPromise(teamid) {
  return genericGet(`/api/v1/team/${teamid}`);
}

export function sendAnnounce(teamID, message) {
  const fd = new FormData();
  fd.append("m", message);
  return genericPost(`/api/v1/team/${teamID}/announce`, fd);
}

export function pullRocks(teamID) {
  return genericGet(`/api/v1/team/${teamID}/rocks`);
}

// local change: none // cache: none
export function newTeamPromise(name) {
  return genericGet(`/api/v1/team/new?name=${name}`);
}

// local change: none // cache: none
export function renameTeamPromise(teamID, name) {
  const fd = new FormData();
  fd.append("teamname", name);
  return genericPut(`/api/v1/team/${teamID}/rename`, fd);
}

// local change: none // cache: none
export function deleteTeamPromise(teamID) {
  return genericDelete(`/api/v1/team/${teamID}`, new FormData());
}

export function changeTeamOwnerPromise(teamID, newOwner) {
  return genericGet(`/api/v1/team/${teamID}/chown?to=${newOwner}`);
}

// local change: none // cache: none
export function addAgentToTeamPromise(agentID, teamID) {
  return genericPost(`/api/v1/team/${teamID}/${agentID}`, new FormData());
}

// removes another agent from an owned team ; return value is status code
export function removeAgentFromTeamPromise(agentID, teamID) {
  return genericDelete(`/api/v1/team/${teamID}/${agentID}`, new FormData());
}

// local change: none // cache: none
export function rocksPromise(teamID, community, apikey) {
  return genericGet(
    `/api/v1/team/${teamID}/rockscfg?rockscomm=${community}&rockskey=${apikey}`
  );
}

// local change: none // cache: none
export function setAgentTeamSquadPromise(agentID, teamID, squad) {
  const fd = new FormData();
  fd.append("squad", squad);
  return genericPost(`/api/v1/team/${teamID}/${agentID}/squad`, fd);
}

export function createJoinLinkPromise(teamID) {
  return genericGet(`/api/v1/team/${teamID}/genJoinKey`);
}

export function deleteJoinLinkPromise(teamID) {
  return genericGet(`/api/v1/team/${teamID}/delJoinKey`);
}

// returns a promise to fetch a WasabeeOp
// local change: If the server's copy is newer than the local copy, otherwise none
// not generic since 304 result processing and If-Modified-Since header
export async function opPromise(opID) {
  let ims = "Sat, 29 Oct 1994 19:43:31 GMT"; // the dawn of time...
  const localop = await WasabeeOp.load(opID);
  if (localop != null && localop.fetched) ims = localop.fetched;

  try {
    const raw = await generic({
      url: `/api/v1/draw/${opID}`,
      method: "GET",
      headers: localop
        ? {
            "If-None-Match": localop.lasteditid,
            "If-Modified-Since": localop.lasteditid ? null : ims,
          }
        : null,
    });

    if (raw === 304) {
      localop.server = GetWasabeeServer();
      return localop;
    }

    const newop = new WasabeeOp(raw);
    newop.localchanged = false;
    newop.server = GetWasabeeServer();
    newop.fetchedOp = JSON.stringify(raw);
    return newop;
  } catch (e) {
    if (!(e instanceof ServerError)) {
      // unexpected error
      console.error(e);
      return Promise.reject(
        new ServerError({
          code: -1,
          text: `Unexpected error: ${e}`,
        })
      );
    }
    switch (e.code) {
      case 403:
      // fallthrough
      case 410:
        await removeOperation(opID);
      // fallthrough
      default:
        return Promise.reject(e);
    }
  }
}

// uploads an op to the server
// refreshed op stored to localStorage; "me" upated to reflect new op in list
export async function uploadOpPromise() {
  const operation = getSelectedOperation();
  const json = operation.toExport();

  const response = await genericPost(
    "/api/v1/draw",
    json,
    "application/json;charset=UTF-8"
  );
  const newme = new WasabeeMe(response);
  newme.store();
  const newop = await opPromise(operation.ID);
  newop.localchanged = false;
  await newop.store();
  return newop;
}

// sends a changed op to the server
export async function updateOpPromise(operation) {
  const json = operation.toExport();

  try {
    const update = await generic({
      url: `/api/v1/draw/${operation.ID}`,
      method: "PUT",
      body: json,
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "If-Match": operation.lasteditid || null,
      },
    });
    operation.lasteditid = update.updateID;
    operation.remoteChanged = false;
    operation.fetched = new Date().toUTCString();
    operation.fetchedOp = JSON.stringify(operation);
    return true;
  } catch (e) {
    if (!(e instanceof ServerError)) {
      // unexpected error
      console.error(e);
      return Promise.reject(
        new ServerError({
          code: -1,
          text: `Unexpected error: ${e}`,
        })
      );
    }
    switch (e.code) {
      case 412:
        return false;
      // break;
      case 410:
        await removeOperation(operation.ID);
      // fallthrough
      default:
        return Promise.reject(e);
    }
  }
}

// removes an op from the server
export function deleteOpPromise(opID) {
  return genericDelete(`/api/v1/draw/${opID}`, new FormData());
}

export function setOpInfo(opID, info) {
  const fd = new FormData();
  fd.append("info", info);
  return genericPost(`/api/v1/draw/${opID}/info`, fd);
}

// adds a permission to an op; return value is status code
export function addPermPromise(opID, teamID, role, zone) {
  const fd = new FormData();
  fd.append("team", teamID);
  fd.append("role", role);
  fd.append("zone", zone);
  return genericPost(`/api/v1/draw/${opID}/perms`, fd);
}

// removes a permission from an op; return value is status code
export function delPermPromise(opID, teamID, role, zone) {
  const fd = new FormData();
  fd.append("team", teamID);
  fd.append("role", role);
  fd.append("zone", zone);
  return genericDelete(`/api/v1/draw/${opID}/perms`, fd);
}

// local change: none // cache: none
export function assignMarkerPromise(opID, markerID, agentID) {
  const fd = new FormData();
  fd.append("agent", agentID);
  return genericPost(`/api/v1/draw/${opID}/marker/${markerID}/assign`, fd);
}

// performs a link assignment on the server, sending notifications
export function assignLinkPromise(opID, linkID, agentID) {
  const fd = new FormData();
  fd.append("agent", agentID);
  return genericPost(`/api/v1/draw/${opID}/link/${linkID}/assign`, fd);
}

// changes a markers status on the server, sending relevant notifications
export function SetMarkerState(opID, markerID, state) {
  let action = "incomplete";
  switch (state) {
    case "acknowledged":
      action = "acknowledge";
      break;
    case "pending":
      action = "incomplete";
      break;
    case "completed":
      action = "complete";
      break;
    default:
      action = "incomplete";
  }

  return genericGet(`/api/v1/draw/${opID}/marker/${markerID}/${action}`);
}

// changes a link's status on the server, sending relevant notifications
export function SetLinkState(opID, linkID, state) {
  let action = "incomplete";
  switch (state) {
    // no acknowledge for links -- use incomplete
    case "pending":
      action = "incomplete";
      break;
    case "completed":
      action = "complete";
      break;
    default:
      action = "incomplete";
  }

  return genericGet(`/api/v1/draw/${opID}/link/${linkID}/${action}`);
}

export function setAssignmentStatus(op, object, completed) {
  let type = "link";
  if (object instanceof WasabeeMarker) type = "marker";
  let c = "incomplete";
  if (completed) c = "complete";

  return genericGet(`/api/v1/draw/${op.ID}/${type}/${object.ID}/${c}`);
}

export function reverseLinkDirection(opID, linkID) {
  return genericGet(`/api/v1/draw/${opID}/link/${linkID}/swap`);
}

export function setMarkerComment(opID, markerID, comment) {
  const fd = new FormData();
  fd.append("comment", comment);
  return genericPost(`/api/v1/draw/${opID}/marker/${markerID}/comment`, fd);
}

export function setLinkComment(opID, linkID, desc) {
  const fd = new FormData();
  fd.append("desc", desc);
  return genericPost(`/api/v1/draw/${opID}/link/${linkID}/desc`, fd);
}

export function setLinkZone(opID, linkID, zone) {
  const fd = new FormData();
  fd.append("zone", zone);
  return genericPost(`/api/v1/draw/${opID}/link/${linkID}/zone`, fd);
}

export function setMarkerZone(opID, markerID, zone) {
  const fd = new FormData();
  fd.append("zone", zone);
  return genericPost(`/api/v1/draw/${opID}/marker/${markerID}/zone`, fd);
}

// updates an agent's key count, return value is status code
export function opKeyPromise(opID, portalID, onhand, capsule) {
  const fd = new FormData();
  fd.append("count", onhand);
  fd.append("capsule", capsule);
  return genericPost(`/api/v1/draw/${opID}/portal/${portalID}/keyonhand`, fd);
}

/* The following are for Wasabee-WebUI and not used in Wasabee-IITC */

// in the service-worker for IITC
export function sendTokenToWasabee(token) {
  // no need for a form-data, just send the raw token
  return genericPost(`/api/v1/me/firebase`, token);
}

export function getCustomTokenFromServer() {
  return generic({
    url: `/api/v1/me/firebase`,
    method: "GET",
    raw: true,
  });
}

/* generic method */
/**
 * Generic fetch method against wasabee server
 *
 * @param {Object} request
 * @param {string} request.url
 * @param {string} request.method
 * @param {string | FormData} [request.body]
 * @param {HeadersInit} [request.headers]
 * @param {boolean} [request.raw]
 * @param {boolean} [request.retried]
 * @returns {Promise<304 | string | Object>}
 */
async function generic(request) {
  /** @type RequestInit */
  const requestInit = {
    method: request.method,
    mode: "cors",
    cache: "default",
    credentials: "include",
    redirect: "manual",
    referrerPolicy: "origin",
  };
  if (request.body) requestInit.body = request.body;
  if (request.headers) requestInit.headers = request.headers;

  try {
    const response = await fetch(GetWasabeeServer() + request.url, requestInit);
    /** @type Object | string */
    const payload = await response.text();

    let jsonPayload;
    if (!request.raw) {
      if (!payload && !request.retried && response.ok) {
        // server shouldn't reply empty string
        console.warn(
          `server answers is empty on [${request.url}], retry once, just in case`
        );
        return generic({ ...request, retried: true });
      }
      try {
        jsonPayload = JSON.parse(payload);
      } catch {
        if (response.ok)
          return Promise.reject(
            new ServerError({
              code: -1,
              text: "unexpected server answer",
            })
          );
      }
    }

    switch (response.status) {
      case 200:
        if (!request.raw && jsonPayload.updateID)
          GetUpdateList().set(jsonPayload.updateID, Date.now());
        return Promise.resolve(request.raw ? payload : jsonPayload);
      // break;
      case 304: // If-None-Match or If-Modified-Since replied NotModified
        return Promise.resolve(304);
      // break
      case 401:
        WasabeeMe.purge();
      // fallthrough;
      case 403: // forbidden
      // fallthrough
      case 410: // Gone
      // fallthrough
      case 412: // mismatch etag
      // fallthrough
      default:
        return Promise.reject(
          new ServerError({
            code: response.status,
            text: response.statusText,
            error: jsonPayload ? jsonPayload.error : null,
          })
        );
    }
  } catch (e) {
    console.error(e);
    return Promise.reject(
      new ServerError({
        code: -1,
        text: "Network error",
      })
    );
  }
}

function genericGet(url) {
  return generic({
    method: "GET",
    url: url,
  });
}

function genericPost(url, formData, contentType) {
  return generic({
    url: url,
    method: "POST",
    body: formData,
    headers: contentType ? { "Content-Type": contentType } : null,
  });
}

function genericPut(url, formData, contentType) {
  return generic({
    url: url,
    method: "PUT",
    body: formData,
    headers: contentType ? { "Content-Type": contentType } : null,
  });
}

function genericDelete(url, formData, contentType) {
  return generic({
    url: url,
    method: "DELETE",
    body: formData,
    headers: contentType ? { "Content-Type": contentType } : null,
  });
}
