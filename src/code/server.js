import WasabeeMe from "./me";
import WasabeeOp from "./operation";
import {
  getSelectedOperation,
  getOperationByID,
  removeOperation,
} from "./selectedOp";
import wX from "./wX";

const Wasabee = window.plugin.wasabee;

export default function () {
  return GetWasabeeServer();
}

// uploads an op to the server
// refreshed op stored to localStorage; "me" upated to reflect new op in list
export const uploadOpPromise = async function () {
  const operation = getSelectedOperation();
  operation.cleanAll();
  const json = JSON.stringify(operation);

  const response = await _genericPost(
    "/api/v1/draw",
    json,
    "application/json;charset=UTF-8"
  );
  const newme = new WasabeeMe(response);
  newme.store();
  const newop = await opPromise(operation.ID);
  newop.localchanged = false;
  newop.store();
  return newop;
};

// sends a changed op to the server
export const updateOpPromise = (operation) => {
  // let the server know how to process assignments etc
  operation.mode = window.plugin.wasabee.static.constants.MODE_KEY;
  operation.cleanAll();
  const json = JSON.stringify(operation);
  delete operation.mode;

  return _genericPut(
    `/api/v1/draw/${operation.ID}`,
    json,
    "application/json;charset=UTF-8"
  );
};

// removes an op from the server
export const deleteOpPromise = function (opID) {
  return _genericDelete(`/api/v1/draw/${opID}`, new FormData());
};

// returns a promise to a WasabeeTeam -- used only by WasabeeTeam.waitGet
// use WasabeeTeam.waitGet and WasabeeTeam.cacheGet
export const teamPromise = function (teamid) {
  return _genericGet(`/api/v1/team/${teamid}`);
};

// returns a promise to fetch a WasabeeOp
// local change: If the server's copy is newer than the local copy, otherwise none
// not generic since 304 result processing and If-Modified-Since header
export const opPromise = function (opID) {
  const SERVER_BASE = GetWasabeeServer();
  const localop = getOperationByID(opID);
  const url = `${SERVER_BASE}/api/v1/draw/${opID}`;

  return new Promise(function (resolve, reject) {
    const req = new XMLHttpRequest();

    req.open("GET", url);

    if (localop != null && localop.fetched) {
      req.setRequestHeader("If-Modified-Since", localop.fetched);
    }

    req.withCredentials = true;
    req.crossDomain = true;

    let newop = null; // I hate javascript
    req.onload = function () {
      switch (req.status) {
        case 200:
          newop = new WasabeeOp(req.response);
          newop.localchanged = false;
          resolve(newop);
          break;
        case 304: // If-Modified-Since replied NotModified
          console.log("server copy is older/unmodified, keeping local copy");
          localop.localchanged = true;
          resolve(localop);
          break;
        /* server should not return this now
	  case 401:
          WasabeeMe.purge();
          reject(wX("NOT LOGGED IN", req.statusText));
          break; */
        case 403:
          removeOperation(opID);
          reject(wX("OP PERM DENIED", opID));
          break;
        case 410:
          removeOperation(opID);
          reject(wX("OP DELETED", opID));
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.responseText}`);
          break;
      }
    };

    req.onerror = function () {
      reject(`Network Error: ${req.responseText}`);
    };

    req.send();
  });
};

// returns a promise to WasabeeMe -- should be called only by WasabeeMe.waitGet()
// use WasabeeMe.cacheGet or WasabeeMe.waitGet for caching
export const mePromise = async function () {
  try {
    const response = await _genericGet("/me");
    return response;
  } catch (e) {
    console.log(e);
    return e;
  }
};

// returns a promise to get the agent's JSON data from the server -- should be called only by WasabeeAgent.waitGet()
// use WasabeeAgent.waitGet and WasabeeAgent.cacheGet for caching
export const agentPromise = function (GID) {
  return _genericGet(`/api/v1/agent/${GID}`);
};

// local change: none // cache: none
export const assignMarkerPromise = function (opID, markerID, agentID) {
  const fd = new FormData();
  fd.append("agent", agentID);
  return _genericPost(`/api/v1/draw/${opID}/marker/${markerID}/assign`, fd);
};

// performs a link assignment on the server, sending notifications
export const assignLinkPromise = function (opID, linkID, agentID) {
  const fd = new FormData();
  fd.append("agent", agentID);
  return _genericPost(`/api/v1/draw/${opID}/link/${linkID}/assign`, fd);
};

// sends a target (portal) to the server to notify the agent
export const targetPromise = function (agentID, portal) {
  const ll = portal.lat + "," + portal.lng;
  const fd = new FormData();
  fd.append("id", agentID);
  fd.append("portal", portal.name);
  fd.append("ll", ll);
  return _genericPost(`/api/v1/agent/${agentID}/target`, fd);
};

// work in progress -- server support not finished
export const routePromise = function (agentID, portal) {
  const ll = portal.lat + "," + portal.lng;
  const fd = new FormData();
  fd.append("id", agentID);
  fd.append("portal", portal.name);
  fd.append("ll", ll);
  return _genericPost(`/api/v1/agent/${agentID}/route`, fd);
};

// returns a promise to /me if the access token is valid
export const SendAccessTokenAsync = function (accessToken) {
  return _genericPost(
    "/aptok",
    JSON.stringify({ accessToken: accessToken }),
    "application/json;charset=UTF-8"
  );
};

// changes agent's team state on the server; return value is status message
export const SetTeamState = function (teamID, state) {
  return _genericGet(`/api/v1/me/${teamID}?state=${state}`);
};

// changes a markers status on the server, sending relevant notifications
export const SetMarkerState = function (opID, markerID, state) {
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

  return _genericGet(`/api/v1/draw/${opID}/marker/${markerID}/${action}`);
};

// changes a link's status on the server, sending relevant notifications
export const SetLinkState = function (opID, linkID, state) {
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

  return _genericGet(`/api/v1/draw/${opID}/link/${linkID}/${action}`);
};

// updates an agent's key count, return value is status code
export const opKeyPromise = function (opID, portalID, onhand, capsule) {
  const fd = new FormData();
  fd.append("onhand", onhand ? onhand : "0");
  fd.append("capsule", capsule ? capsule : "");
  return _genericPost(`/api/v1/draw/${opID}/portal/${portalID}/keyonhand`, fd);
};

// updates an agent's defensive key count, return value is status code
export const dKeyPromise = function (portalID, onhand, capsule) {
  const fd = new FormData();
  fd.append("portalID", portalID ? portalID : "");
  fd.append("count", onhand ? onhand : "0");
  fd.append("capID", capsule ? capsule : "");
  return _genericPost("/api/v1/d", fd);
};

// returns a promise to a list of defensive keys for all enabled teams
export const dKeylistPromise = function () {
  return _genericGet("/api/v1/d");
};

// updates an agent's location ; return value is status code
export const locationPromise = function (lat, lng) {
  return _genericGet(`/api/v1/me?lat=${lat}&lon=${lng}`);
};

// sets logout status on the server; return value is status code
export const logoutPromise = function () {
  return _genericGet("/api/v1/me/logout");
};

// adds a permission to an op; return value is status code
export const addPermPromise = function (opID, teamID, role) {
  const fd = new FormData();
  fd.append("team", teamID);
  fd.append("role", role);
  return _genericPost(`/api/v1/draw/${opID}/perms`, fd);
};

// removes a permission from an op; return value is status code
export const delPermPromise = function (opID, teamID, role) {
  const fd = new FormData();
  fd.append("team", teamID);
  fd.append("role", role);
  return _genericDelete(`/api/v1/draw/${opID}/perms`, fd);
};

// removes the agent from the team; return value is status code
export const leaveTeamPromise = function (teamID) {
  return _genericDelete(`/api/v1/me/${teamID}`, new FormData());
};

// removes another agent from an owned team ; return value is status code
export const removeAgentFromTeamPromise = function (agentID, teamID) {
  return _genericDelete(`/api/v1/team/${teamID}/${agentID}`, new FormData());
};

// local change: none // cache: none
export const setAgentTeamSquadPromise = function (agentID, teamID, squad) {
  const fd = new FormData();
  fd.append("squad", squad);
  return _genericPost(`/api/v1/team/${teamID}/${agentID}/squad`, fd);
};

// local change: none // cache: none
export const addAgentToTeamPromise = function (agentID, teamID) {
  return _genericPost(`/api/v1/team/${teamID}/${agentID}`, new FormData());
};

// local change: none // cache: none
export const renameTeamPromise = function (teamID, name) {
  const fd = new FormData();
  fd.append("teamname", name);
  return _genericPut(`/api/v1/team/${teamID}/rename`, fd);
};

// local change: none // cache: none
export const rocksPromise = function (teamID, community, apikey) {
  return _genericGet(
    `/api/v1/team/${teamID}/rockscfg?rockscomm=${community}&rockskey=${apikey}`
  );
};

// local change: none // cache: none
export const newTeamPromise = function (name) {
  return _genericGet(`/api/v1/team/new?name=${name}`);
};

// local change: none // cache: none
export const deleteTeamPromise = function (teamID) {
  return _genericDelete(`/api/v1/team/${teamID}`, new FormData());
};

// local change: none // cache: none
export const oneTimeToken = function (token) {
  const url = "/oneTimeToken";
  const fd = new FormData();
  fd.append("token", token);
  return _genericPost(url, fd);
};

const _genericPut = function (url, formData, contentType) {
  const SERVER_BASE = GetWasabeeServer();
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();

    req.open("PUT", SERVER_BASE + url);
    req.withCredentials = true;
    req.crossDomain = true;

    if (contentType != null) req.setRequestHeader("Content-Type", contentType);

    req.onload = function () {
      switch (req.status) {
        case 200:
          resolve(req.response);
          break;
        case 401:
          WasabeeMe.purge();
          reject(wX("NOT LOGGED IN", req.statusText));
          break;
        default:
          reject(req.response);
          break;
      }
    };

    req.onerror = function () {
      reject(`Network Error: ${req.responseText}`);
    };

    req.send(formData);
  });
};

const _genericPost = function (url, formData, contentType) {
  const SERVER_BASE = GetWasabeeServer();
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();

    req.open("POST", SERVER_BASE + url);
    req.withCredentials = true;
    req.crossDomain = true;

    if (contentType != null) req.setRequestHeader("Content-Type", contentType);

    req.onload = function () {
      switch (req.status) {
        case 200:
          resolve(req.response);
          break;
        case 302: // probably unused now
          console.log("POST returnd 302: ", req);
          resolve(req.response);
          break;
        case 401:
          WasabeeMe.purge();
          reject(wX("NOT LOGGED IN", req.statusText));
          break;
        default:
          reject(req.response);
          break;
      }
    };

    req.onerror = function () {
      reject(`Network Error: ${req.responseText}`);
    };

    req.send(formData);
  });
};

const _genericDelete = function (url, formData) {
  const SERVER_BASE = GetWasabeeServer();
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();

    req.open("DELETE", SERVER_BASE + url);
    req.withCredentials = true;
    req.crossDomain = true;

    req.onload = function () {
      switch (req.status) {
        case 200:
          resolve(req.response);
          break;
        case 401:
          WasabeeMe.purge();
          reject(wX("NOT LOGGED IN", req.statusText));
          break;
        default:
          reject(req.response);
          break;
      }
    };

    req.onerror = function () {
      reject(`Network Error: ${req.responseText}`);
    };
    req.send(formData);
  });
};

const _genericGet = function (url) {
  const SERVER_BASE = GetWasabeeServer();
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();

    req.open("GET", SERVER_BASE + url);
    req.withCredentials = true;
    req.crossDomain = true;

    req.onload = function () {
      switch (req.status) {
        case 200:
          resolve(req.response);
          break;
        case 401:
          WasabeeMe.purge();
          reject(wX("NOT LOGGED IN", req.statusText));
          break;
        case 403:
          reject(req.response);
          break;
        default:
          reject(req.response);
          break;
      }
    };

    req.onerror = function () {
      reject(`Network Error: ${req.responseText}`);
    };
    req.send();
  });
};

export const GetWasabeeServer = () => {
  let server = localStorage[Wasabee.static.constants.SERVER_BASE_KEY];
  if (server == null) {
    server = Wasabee.static.constants.SERVER_BASE_DEFAULT;
    localStorage[Wasabee.static.constants.SERVER_BASE_KEY] = server;
  }
  return server;
};

export const SetWasabeeServer = (server) => {
  // XXX sanity checking here please:
  // starts w/ https://
  // does not end with /
  localStorage[Wasabee.static.constants.SERVER_BASE_KEY] = server;
};
