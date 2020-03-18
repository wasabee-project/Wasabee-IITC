import WasabeeAgent from "./agent";
import WasabeeMe from "./me";
import WasabeeOp from "./operation";
import WasabeeTeam from "./team";
import store from "../lib/store";
import { getSelectedOperation, getOperationByID } from "./selectedOp";
import wX from "./wX";

const Wasabee = window.plugin.wasabee;

export default function() {
  return GetWasabeeServer();
}

export const uploadOpPromise = function() {
  const SERVER_BASE = GetWasabeeServer();

  const operation = getSelectedOperation();
  operation.cleanAll();
  const json = JSON.stringify(operation);
  // console.log(json);

  return new Promise(function(resolve, reject) {
    const url = `${SERVER_BASE}/api/v1/draw`;
    const req = new XMLHttpRequest();
    req.open("POST", url);
    req.withCredentials = true;
    req.crossDomain = true;

    req.onload = function() {
      switch (req.status) {
        case 200:
          WasabeeMe.create(req.response); // free update
          opPromise(operation.ID).then(
            function(newop) {
              newop.localchanged = false;
              newop.store();
              console.log(newop);
              resolve(newop);
            },
            function(err) {
              console.log("failure to fetch newly uploaded op: " + err);
              reject(err);
            }
          );
          break;
        case 401:
          reject(wX("UPLOAD PERM DENIED"));
          break;
        case 500:
          console.log(
            "probably trying to upload an op with an ID already taken... use update"
          );
          operation.fetched = null; // make it look like it came from the server
          reject(req.response);
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.responseText}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.responseText}`);
    };

    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    req.send(json);
  });
};

export const updateOpPromise = function() {
  const SERVER_BASE = GetWasabeeServer();

  const operation = getSelectedOperation();
  operation.cleanAll();
  const json = JSON.stringify(operation);
  // console.log(json);

  return new Promise(function(resolve, reject) {
    const url = `${SERVER_BASE}/api/v1/draw/${operation.ID}`;
    const req = new XMLHttpRequest();
    req.open("PUT", url);
    req.withCredentials = true;
    req.crossDomain = true;

    req.onload = function() {
      switch (req.status) {
        case 200:
          operation.localchanged = false;
          resolve(wX("UPDATED"));
          break;
        case 401:
          reject(wX("UPDATE PERM DENIED"));
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.responseText}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.responseText}`);
    };

    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    req.send(json);
  });
};

export const deleteOpPromise = function(opID) {
  const SERVER_BASE = GetWasabeeServer();
  return new Promise(function(resolve, reject) {
    const url = `${SERVER_BASE}/api/v1/draw/${opID}`;
    const req = new XMLHttpRequest();
    req.open("DELETE", url);
    req.withCredentials = true;
    req.crossDomain = true;

    req.onload = function() {
      switch (req.status) {
        case 200:
          resolve(wX("DELETED"));
          break;
        case 401:
          reject(wX("DELETE PERM DENIED"));
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.responseText}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.responseText}`);
    };

    req.send();
  });
};

export const teamPromise = function(teamid) {
  const SERVER_BASE = GetWasabeeServer();
  return new Promise(function(resolve, reject) {
    const url = `${SERVER_BASE}/api/v1/team/${teamid}`;
    const req = new XMLHttpRequest();
    req.open("GET", url);
    req.withCredentials = true;
    req.crossDomain = true;

    let newteam = null;
    req.onload = function() {
      switch (req.status) {
        case 200:
          // add this team to the cache
          newteam = WasabeeTeam.create(req.response);
          Wasabee.teams.set(teamid, newteam);
          resolve(newteam);
          break;
        case 401:
          reject(wX("TEAM PERM DENIED", teamid));
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.responseText}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.responseText}`);
    };

    req.send();
  });
};

export const opPromise = function(opID) {
  const SERVER_BASE = GetWasabeeServer();
  return new Promise(function(resolve, reject) {
    const url = `${SERVER_BASE}/api/v1/draw/${opID}`;
    const req = new XMLHttpRequest();
    const localop = getOperationByID(opID);

    req.open("GET", url);

    if (localop != null && localop.fetched) {
      req.setRequestHeader("If-Modified-Since", localop.fetched);
    }

    req.withCredentials = true;
    req.crossDomain = true;

    let newop = null;
    req.onload = function() {
      switch (req.status) {
        case 200:
          newop = WasabeeOp.create(req.response);
          newop.localchanged = false;
          resolve(newop);
          break;
        case 304: // If-Modified-Since replied NotModified
          console.log("server copy is older/unmodified, keeping local copy");
          localop.localchanged = true;
          resolve(localop);
          break;
        case 401:
          reject(wX("OP PERM DENIED", opID));
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.responseText}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.responseText}`);
    };

    req.send();
  });
};

export const mePromise = function() {
  const SERVER_BASE = GetWasabeeServer();

  return new Promise(function(resolve, reject) {
    const url = `${SERVER_BASE}/me`;
    const req = new XMLHttpRequest();
    req.open("GET", url);
    req.withCredentials = true;
    req.crossDomain = true;
    // req.setRequestHeader("If-Modified-Since", "Wed, 21 Oct 2015 07:28:00 GMT"); // helps in some cases, breaks others

    req.onload = function() {
      // console.log(req.getAllResponseHeaders());
      switch (req.status) {
        case 200:
          resolve(WasabeeMe.create(req.response));
          break;
        case 401:
          reject(wX("NOT LOGGED IN", req.responseText));
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.responseText}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.responseText}`);
    };

    req.send();
  });
};

export const agentPromise = function(GID, force) {
  const SERVER_BASE = GetWasabeeServer();
  return new Promise(function(resolve, reject) {
    if (GID == null) {
      reject("null gid");
    }

    if (!force && window.plugin.wasabee._agentCache.has(GID)) {
      resolve(window.plugin.wasabee._agentCache.get(GID));
    } else {
      const url = `${SERVER_BASE}/api/v1/agent/${GID}`;
      const req = new XMLHttpRequest();
      req.open("GET", url);
      req.withCredentials = true;
      req.crossDomain = true;

      req.onload = function() {
        switch (req.status) {
          case 200:
            resolve(WasabeeAgent.create(req.response));
            break;
          case 401:
            reject(wX("NOT LOGGED IN", req.responseText));
            break;
          default:
            reject(`${req.status}: ${req.statusText} ${req.responseText}`);
            break;
        }
      };

      req.onerror = function() {
        reject(`Network Error: ${req.responseText}`);
      };

      req.send();
    }
  });
};

export const assignMarkerPromise = function(opID, markerID, agentID) {
  const SERVER_BASE = GetWasabeeServer();
  return new Promise(function(resolve, reject) {
    const url = `${SERVER_BASE}/api/v1/draw/${opID}/marker/${markerID}/assign`;
    const req = new XMLHttpRequest();
    req.open("POST", url);
    req.withCredentials = true;
    req.crossDomain = true;

    req.onload = function() {
      switch (req.status) {
        case 200:
          resolve(true);
          break;
        case 401:
          reject(wX("NOT LOGGED IN", req.statusText));
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.responseText}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.responseText}`);
    };

    const fd = new FormData();
    fd.append("agent", agentID);
    req.send(fd);
  });
};

export const assignLinkPromise = function(opID, linkID, agentID) {
  const SERVER_BASE = GetWasabeeServer();
  return new Promise(function(resolve, reject) {
    const url = `${SERVER_BASE}/api/v1/draw/${opID}/link/${linkID}/assign`;
    const req = new XMLHttpRequest();
    req.open("POST", url);
    req.withCredentials = true;
    req.crossDomain = true;

    req.onload = function() {
      switch (req.status) {
        case 200:
          resolve(true);
          break;
        case 401:
          reject(wX("NOT LOGGED IN", req.statusText));
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.responseText}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.responseText}`);
    };

    const fd = new FormData();
    fd.append("agent", agentID);
    req.send(fd);
  });
};

export const targetPromise = function(agent, portal) {
  const SERVER_BASE = GetWasabeeServer();
  const ll = portal.lat + "," + portal.lng;
  const id = agent.id;

  return new Promise(function(resolve, reject) {
    const url = `${SERVER_BASE}/api/v1/agent/${id}/target`;
    const req = new XMLHttpRequest();
    req.open("POST", url);
    req.withCredentials = true;
    req.crossDomain = true;

    req.onload = function() {
      switch (req.status) {
        case 200:
          resolve(true);
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.responseText}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.responseText}`);
    };

    const fd = new FormData();
    fd.append("id", id);
    fd.append("portal", portal.name);
    fd.append("ll", ll);
    req.send(fd);
  });
};

export const SendAccessTokenAsync = function(accessToken) {
  const SERVER_BASE = GetWasabeeServer();

  return new Promise(function(resolve, reject) {
    const url = `${SERVER_BASE}/aptok`;
    const req = new XMLHttpRequest();

    req.open("POST", url);
    req.withCredentials = true;
    req.crossDomain = true;

    req.onload = function() {
      switch (req.status) {
        case 200:
          WasabeeMe.create(req.response); // free update
          resolve(true);
          break;
        default:
          alert(wX("AUTH TOKEN REJECTED", req.statusText));
          reject(`${req.status}: ${req.statusText} ${req.responseText}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.responseText}`);
    };

    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({ accessToken: accessToken }));
  });
};

export const SetTeamState = function(teamID, state) {
  const SERVER_BASE = GetWasabeeServer();

  return new Promise((resolve, reject) => {
    const url = `${SERVER_BASE}/api/v1/me/${teamID}?state=${state}`;
    const req = new XMLHttpRequest();

    req.open("GET", url);
    req.withCredentials = true;
    req.crossDomain = true;

    req.onload = function() {
      switch (req.status) {
        case 200:
          resolve();
          break;
        case 401:
          reject(wX("NOT LOGGED IN", req.statusText));
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.responseText}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.responseText}`);
    };

    req.send();
  });
};

export const opKeyPromise = function(opID, portalID, onhand, capsule) {
  const SERVER_BASE = GetWasabeeServer();

  return new Promise((resolve, reject) => {
    const url = `${SERVER_BASE}/api/v1/draw/${opID}/portal/${portalID}/keyonhand`;
    const req = new XMLHttpRequest();

    req.open("POST", url);
    req.withCredentials = true;
    req.crossDomain = true;

    req.onload = function() {
      switch (req.status) {
        case 200:
          resolve();
          break;
        case 401:
          reject(wX("NOT LOGGED IN", req.statusText));
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.responseText}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.responseText}`);
    };

    const fd = new FormData();
    fd.append("onhand", onhand ? onhand : "0");
    fd.append("capsule", capsule ? capsule : "");
    req.send(fd);
  });
};

export const dKeyPromise = function(portalID, onhand, capsule) {
  const SERVER_BASE = GetWasabeeServer();

  return new Promise((resolve, reject) => {
    const url = `${SERVER_BASE}/api/v1/d`;
    const req = new XMLHttpRequest();

    req.open("POST", url);
    req.withCredentials = true;
    req.crossDomain = true;

    req.onload = function() {
      switch (req.status) {
        case 200:
          resolve();
          break;
        case 401:
          reject(wX("NOT LOGGED IN", req.statusText));
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.responseText}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.responseText}`);
    };

    const fd = new FormData();
    fd.append("portalID", portalID ? portalID : "");
    fd.append("count", onhand ? onhand : "0");
    fd.append("capID", capsule ? capsule : "");
    req.send(fd);
  });
};

export const dKeylistPromise = function() {
  const SERVER_BASE = GetWasabeeServer();

  return new Promise((resolve, reject) => {
    const url = `${SERVER_BASE}/api/v1/d`;
    const req = new XMLHttpRequest();

    req.open("GET", url);
    req.withCredentials = true;
    req.crossDomain = true;

    req.onload = function() {
      switch (req.status) {
        case 200:
          resolve(req.response);
          break;
        case 401:
          reject(wX("NOT LOGGED IN", req.statusText));
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.responseText}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.responseText}`);
    };

    req.send();
  });
};

export const locationPromise = function(lat, lng) {
  const SERVER_BASE = GetWasabeeServer();

  return new Promise((resolve, reject) => {
    const url = `${SERVER_BASE}/api/v1/me?lat=${lat}&lon=${lng}`;
    const req = new XMLHttpRequest();

    req.open("GET", url);
    req.withCredentials = true;
    req.crossDomain = true;

    req.onload = function() {
      switch (req.status) {
        case 200:
          resolve(req.response);
          break;
        case 401:
          reject(wX("NOT LOGGED IN", req.statusText));
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.responseText}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.responseText}`);
    };

    req.send();
  });
};

export const logoutPromise = function() {
  const SERVER_BASE = GetWasabeeServer();

  return new Promise((resolve, reject) => {
    const url = `${SERVER_BASE}/api/v1/me/logout`;
    const req = new XMLHttpRequest();

    req.open("GET", url);
    req.withCredentials = true;
    req.crossDomain = true;

    req.onload = function() {
      switch (req.status) {
        case 200:
          WasabeeMe.purge();
          resolve(true);
          break;
        default:
          reject(`${req.status}: ${req.statusText}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.responseText}`);
    };

    req.send();
  });
};

export const addPermPromise = function(opID, teamID, role) {
  const SERVER_BASE = GetWasabeeServer();

  return new Promise((resolve, reject) => {
    const url = `${SERVER_BASE}/api/v1/draw/${opID}/perms`;
    const req = new XMLHttpRequest();

    req.open("POST", url);
    req.withCredentials = true;
    req.crossDomain = true;

    req.onload = function() {
      switch (req.status) {
        case 200:
          resolve(true);
          break;
        case 401:
          reject(wX("NOT LOGGED IN", req.statusText));
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.responseText}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.responseText}`);
    };

    const fd = new FormData();
    fd.append("team", teamID);
    fd.append("role", role);
    req.send(fd);
  });
};

export const delPermPromise = function(opID, teamID, role) {
  const SERVER_BASE = GetWasabeeServer();

  return new Promise((resolve, reject) => {
    const url = `${SERVER_BASE}/api/v1/draw/${opID}/perms`;
    const req = new XMLHttpRequest();

    req.open("DELETE", url);
    req.withCredentials = true;
    req.crossDomain = true;

    req.onload = function() {
      switch (req.status) {
        case 200:
          resolve(true);
          break;
        default:
          reject(`${req.status}: ${req.statusText}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.responseText}`);
    };

    const fd = new FormData();
    fd.append("team", teamID);
    fd.append("role", role);
    req.send(fd);
  });
};

export const leaveTeamPromise = function(teamID) {
  const SERVER_BASE = GetWasabeeServer();

  return new Promise((resolve, reject) => {
    const url = `${SERVER_BASE}/api/v1/me/${teamID}`;
    const req = new XMLHttpRequest();

    req.open("DELETE", url);
    req.withCredentials = true;
    req.crossDomain = true;

    req.onload = function() {
      switch (req.status) {
        case 200:
          resolve(true);
          break;
        default:
          reject(`${req.status}: ${req.statusText}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.responseText}`);
    };
    req.send();
  });
};

export const removeAgentFromTeamPromise = function(agentID, teamID) {
  const SERVER_BASE = GetWasabeeServer();

  return new Promise((resolve, reject) => {
    const url = `${SERVER_BASE}/api/v1/team/${teamID}/${agentID}`;
    const req = new XMLHttpRequest();

    req.open("DELETE", url);
    req.withCredentials = true;
    req.crossDomain = true;

    req.onload = function() {
      switch (req.status) {
        case 200:
          resolve(true);
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.responseText}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.responseText}`);
    };
    req.send();
  });
};

export const setAgentTeamSquadPromise = function(agentID, teamID, squad) {
  const SERVER_BASE = GetWasabeeServer();

  return new Promise((resolve, reject) => {
    const url = `${SERVER_BASE}/api/v1/team/${teamID}/${agentID}/squad`;
    const req = new XMLHttpRequest();

    req.open("POST", url);
    req.withCredentials = true;
    req.crossDomain = true;

    req.onload = function() {
      switch (req.status) {
        case 200:
          resolve(true);
          break;
        default:
          reject(`${req.status}: ${req.statusText}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.responseText}`);
    };
    const fd = new FormData();
    fd.append("squad", squad);
    req.send(fd);
  });
};

export const addAgentToTeamPromise = function(agentID, teamID) {
  const SERVER_BASE = GetWasabeeServer();

  return new Promise((resolve, reject) => {
    const url = `${SERVER_BASE}/api/v1/team/${teamID}/${agentID}`;
    const req = new XMLHttpRequest();

    req.open("POST", url);
    req.withCredentials = true;
    req.crossDomain = true;

    req.onload = function() {
      switch (req.status) {
        case 200:
          resolve(true);
          break;
        case 302:
          console.log(req);
          resolve(true);
          break;
        default:
          reject(`${req.responseText}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.responseText}`);
    };
    req.send();
  });
};

export const renameTeamPromise = function(teamID, name) {
  const SERVER_BASE = GetWasabeeServer();

  return new Promise((resolve, reject) => {
    const url = `${SERVER_BASE}/api/v1/team/${teamID}/rename`;
    const req = new XMLHttpRequest();

    req.open("PUT", url);
    req.withCredentials = true;
    req.crossDomain = true;

    req.onload = function() {
      switch (req.status) {
        case 200:
          resolve(true);
          break;
        default:
          reject(`${req.responseText}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.responseText}`);
    };
    const fd = new FormData();
    fd.append("teamname", name);
    req.send(fd);
  });
};

export const rocksPromise = function(teamID, community, apikey) {
  const SERVER_BASE = GetWasabeeServer();

  return new Promise((resolve, reject) => {
    const url = `${SERVER_BASE}/api/v1/team/${teamID}/rockscfg?rockscomm=${community}&rockskey=${apikey}`;
    const req = new XMLHttpRequest();

    req.open("GET", url);
    req.withCredentials = true;
    req.crossDomain = true;

    req.onload = function() {
      switch (req.status) {
        case 200:
          resolve(true);
          break;
        default:
          reject(`${req.responseText}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.responseText}`);
    };
    req.send();
  });
};

export const newTeamPromise = function(name) {
  const SERVER_BASE = GetWasabeeServer();

  return new Promise((resolve, reject) => {
    const url = `${SERVER_BASE}/api/v1/team/new?name=${name}`;
    const req = new XMLHttpRequest();

    req.open("GET", url);
    req.withCredentials = true;
    req.crossDomain = true;

    req.onload = function() {
      switch (req.status) {
        case 200:
          resolve(true);
          break;
        default:
          reject(`${req.responseText}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.responseText}`);
    };
    req.send();
  });
};

export const deleteTeamPromise = function(teamID) {
  const SERVER_BASE = GetWasabeeServer();

  return new Promise((resolve, reject) => {
    const url = `${SERVER_BASE}/api/v1/team/${teamID}`;
    const req = new XMLHttpRequest();

    req.open("DELETE", url);
    req.withCredentials = true;
    req.crossDomain = true;

    req.onload = function() {
      switch (req.status) {
        case 200:
          resolve(true);
          break;
        default:
          reject(`${req.responseText}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.responseText}`);
    };
    req.send();
  });
};

export const GetWasabeeServer = function() {
  let server = store.get(Wasabee.static.constants.SERVER_BASE_KEY);
  if (server == null) {
    server = Wasabee.static.constants.SERVER_BASE_DEFAULT;
    store.set(
      Wasabee.static.constants.SERVER_BASE_KEY,
      Wasabee.static.constants.SERVER_BASE_DEFAULT
    );
  }
  return server;
};

// don't use this unless you just can't use the promise directly
export const getAgent = gid => {
  // when a team is loaded from the server, all agents are pushed into the cache
  if (window.plugin.wasabee._agentCache.has(gid)) {
    return window.plugin.wasabee._agentCache.get(gid);
  }

  let agent = null;
  agentPromise(gid, false).then(
    function(resolve) {
      agent = resolve;
      window.plugin.wasabee._agentCache.set(gid, agent);
    },
    function(reject) {
      console.log(reject);
    }
  );
  return agent;
};
