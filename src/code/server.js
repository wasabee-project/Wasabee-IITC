import WasabeeAgent from "./agent";
import WasabeeMe from "./me";
import WasabeeOp from "./operation";
import WasabeeTeam from "./team";
import store from "../lib/store";
import { getOperationByID } from "./selectedOp";

const Wasabee = window.plugin.wasabee;

export default function() {
  return GetWasabeeServer();
}

export const uploadOpPromise = function(operation) {
  const SERVER_BASE = GetWasabeeServer();
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
              newop.store();
              newop.localchanged = false;
              resolve(newop);
            },
            function(err) {
              console.log("failure to fetch newly uploaded op: " + err);
              reject(err);
            }
          );
          break;
        case 401:
          reject("permission to upload denied");
          break;
        case 500:
          console.log(
            "probably trying to upload an op with an ID already taken... use update"
          );
          operation.fetched = "0"; // make it look like it came from the server
          reject(req.response);
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.response}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.statusText}`);
    };

    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    req.send(JSON.stringify(operation));
  });
};

export const updateOpPromise = function(operation) {
  const SERVER_BASE = GetWasabeeServer();
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
          resolve("successfully uploaded");
          break;
        case 401:
          reject("permission to update denied");
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.response}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.statusText}`);
    };

    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    req.send(JSON.stringify(operation));
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
          resolve("successfully deleted");
          break;
        case 401:
          reject("permission to delete denied");
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.response}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.statusText}`);
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
          reject("permission denied to team: " + teamid);
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.response}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.statusText}`);
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
          reject("not authorized to access op: " + opID);
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.response}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.statusText}`);
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
          reject(
            `${req.status}: not logged in ${req.statusText} ${req.response}`
          );
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.response}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.statusText}`);
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
            reject("not logged in");
            break;
          default:
            reject(`${req.status}: ${req.statusText} ${req.response}`);
            break;
        }
      };

      req.onerror = function() {
        reject(`Network Error: ${req.statusText}`);
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
          reject("not logged in");
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.response}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.statusText}`);
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
          reject("not logged in");
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.response}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.statusText}`);
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
          reject(`${req.status}: ${req.statusText} ${req.response}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.statusText}`);
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
      // console.log(req.getAllResponseHeaders());
      switch (req.status) {
        case 200:
          console.log("sending auth token to server accepted");
          console.log(req.getAllResponseHeaders());
          WasabeeMe.create(req.response); // free update
          resolve(true);
          break;
        default:
          console.log("sending auth token to server rejected");
          alert(
            `sending auth token to server rejected: ${req.statusText} ${req.response}`
          );
          reject(`${req.status}: ${req.statusText} ${req.response}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.statusText}`);
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
          reject("not logged in");
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.response}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.statusText}`);
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
          reject("not logged in");
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.response}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.statusText}`);
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
          reject("not logged in");
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.response}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.statusText}`);
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
          reject("not logged in");
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.response}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.statusText}`);
    };

    req.send();
  });
};

export const locationPromise = function(lat, lng) {
  const SERVER_BASE = GetWasabeeServer();

  return new Promise((resolve, reject) => {
    const url = `${SERVER_BASE}/api/v1/me?lat=${lat}&lon=${lng}`;
    const req = new XMLHttpRequest();
    // r.HandleFunc("/me", meSetAgentLocationRoute).Methods("GET").Queries("lat", "{lat}", "lon", "{lon}")

    req.open("GET", url);
    req.withCredentials = true;
    req.crossDomain = true;

    req.onload = function() {
      switch (req.status) {
        case 200:
          resolve(req.response);
          break;
        case 401:
          reject("not logged in");
          break;
        default:
          reject(`${req.status}: ${req.statusText} ${req.response}`);
          break;
      }
    };

    req.onerror = function() {
      reject(`Network Error: ${req.statusText}`);
    };

    /* const fd = new FormData();
    fd.append("lat", lat);
    fd.append("lon", lng); */
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
