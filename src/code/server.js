import WasabeeAgent from "./agent";
import WasabeeMe from "./me";
import WasabeeOp from "./operation";
import WasabeeTeam from "./team";
import store from "../lib/store";

const Wasabee = window.plugin.Wasabee;

export default function() {
  const SERVER_BASE = GetWasabeeServer();

  window.plugin.wasabee.uploadOpPromise = operation => {
    return new Promise(function(resolve, reject) {
      const url = SERVER_BASE + "/api/v1/draw";
      const req = new XMLHttpRequest();
      req.open("POST", url);
      req.withCredentials = true;
      req.crossDomain = true;

      req.onload = function() {
        switch (req.status) {
          case 200:
            WasabeeMe.create(req.response).store(); // free update
            window.plugin.wasabee.opPromise(operation.ID).then(
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
            reject(req.response);
            break;
          default:
            reject(Error(req.statusText));
            break;
        }
      };

      req.onerror = function() {
        reject(Error("Network Error"));
      };

      req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      req.send(JSON.stringify(operation));
    });
  };

  window.plugin.wasabee.updateOpPromise = operation => {
    return new Promise(function(resolve, reject) {
      const url = SERVER_BASE + "/api/v1/draw/" + operation.ID;
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
            reject(Error(req.statusText));
            break;
        }
      };

      req.onerror = function() {
        reject(Error("Network Error"));
      };

      req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      req.send(JSON.stringify(operation));
    });
  };

  window.plugin.wasabee.deleteOpPromise = opID => {
    return new Promise(function(resolve, reject) {
      const url = SERVER_BASE + "/api/v1/draw/" + opID;
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
            reject(Error(req.statusText));
            break;
        }
      };

      req.onerror = function() {
        reject(Error("Network Error"));
      };

      req.send();
    });
  };

  window.plugin.wasabee.teamPromise = teamid => {
    return new Promise(function(resolve, reject) {
      const url = SERVER_BASE + "/api/v1/team/" + teamid;
      const req = new XMLHttpRequest();
      req.open("GET", url);
      req.withCredentials = true;
      req.crossDomain = true;

      req.onload = function() {
        switch (req.status) {
          case 200:
            var team = WasabeeTeam.create(req.response);
            Wasabee.teams.set(teamid, team);
            resolve(team);
            break;
          case 401:
            reject(
              "it is safe to ignore this 401: you are not authorized for team: " +
                teamid
            );
            break;
          default:
            reject(Error(req.statusText));
            break;
        }
      };

      req.onerror = function() {
        reject(Error("Network Error"));
      };

      req.send();
    });
  };

  window.plugin.wasabee.opPromise = opID => {
    return new Promise(function(resolve, reject) {
      const url = SERVER_BASE + "/api/v1/draw/" + opID;
      const req = new XMLHttpRequest();
      const localop = window.plugin.wasabee.getOperationByID(opID);

      req.open("GET", url);

      if (localop != null && localop.teamlist.length != 0) {
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
            resolve(localop);
            break;
          case 401:
            reject("not authorized to access op: " + opID);
            break;
          default:
            reject(Error(req.statusText));
            break;
        }
      };

      req.onerror = function() {
        reject(Error("Network Error"));
      };

      req.send();
    });
  };

  window.plugin.wasabee.mePromise = () => {
    return new Promise(function(resolve, reject) {
      const url = SERVER_BASE + "/me";
      const req = new XMLHttpRequest();
      req.open("GET", url);
      req.withCredentials = true;
      req.crossDomain = true;

      req.onload = function() {
        switch (req.status) {
          case 200:
            resolve(WasabeeMe.create(req.response));
            break;
          case 401:
            reject("not logged in");
            break;
          default:
            reject(Error(req.statusText));
            break;
        }
      };

      req.onerror = function() {
        reject(Error("not logged in"));
      };

      req.send();
    });
  };

  window.plugin.wasabee.agentPromise = GID => {
    return new Promise(function(resolve, reject) {
      if (GID == null) {
        reject(Error("null gid"));
      }

      const url = SERVER_BASE + "/api/v1/agent/" + GID;
      console.log(url);
      const req = new XMLHttpRequest();
      req.open("GET", url);
      req.withCredentials = true;
      req.crossDomain = true;

      req.onload = function() {
        switch (req.status) {
          case 200:
            // console.log(req.response);
            resolve(WasabeeAgent.create(req.response));
            break;
          case 401:
            reject("not logged in");
            break;
          default:
            reject(Error(req.statusText));
            break;
        }
      };

      req.onerror = function() {
        reject(Error("not logged in"));
      };

      req.send();
    });
  };
}

export const assignMarkerPromise = function(opID, markerID, agentID) {
  const SERVER_BASE = store.get(Wasabee.Constants.SERVER_BASE_KEY);
  return new Promise(function(resolve, reject) {
    const url =
      SERVER_BASE + "/api/v1/draw/" + opID + "/marker/" + markerID + "/assign";
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
          reject(Error(req.statusText));
          break;
      }
    };

    req.onerror = function() {
      reject(Error("Network Error"));
    };

    const fd = new FormData();
    fd.append("agent", agentID);
    req.send(fd);
  });
};

export const assignLinkPromise = function(opID, linkID, agentID) {
  const SERVER_BASE = store.get(Wasabee.Constants.SERVER_BASE_KEY);
  return new Promise(function(resolve, reject) {
    const url =
      SERVER_BASE + "/api/v1/draw/" + opID + "/link/" + linkID + "/assign";
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
          reject(Error(req.statusText));
          break;
      }
    };

    req.onerror = function() {
      reject(Error("Network Error"));
    };

    const fd = new FormData();
    fd.append("agent", agentID);
    req.send(fd);
  });
};

export const SendAccessTokenAsync = function(accessToken) {
  const SERVER_BASE = store.get(Wasabee.Constants.SERVER_BASE_KEY);

  return new Promise((resolve, reject) => {
    const url = SERVER_BASE + "/aptok";
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
          reject(Error("not logged in"));
          break;
        default:
          reject(Error(req.statusText));
          break;
      }
    };

    req.onerror = function() {
      reject(Error("Network Error"));
    };

    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({ accessToken: accessToken }));
  });
};

export const SetTeamState = function(teamID, state) {
  const SERVER_BASE = store.get(Wasabee.Constants.SERVER_BASE_KEY);

  return new Promise((resolve, reject) => {
    const url = SERVER_BASE + "/api/v1/me/" + teamID + "?state=" + state;
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
          reject(Error("not logged in"));
          break;
        default:
          reject(Error(req.statusText));
          break;
      }
    };

    req.onerror = function() {
      reject(Error("Network Error"));
    };

    req.send();
  });
};

export const GetWasabeeServer = function() {
  let server = store.get(Wasabee.Constants.SERVER_BASE_KEY);
  if (server == null) {
    server = Wasabee.Constants.SERVER_BASE_DEFAULT;
    store.set(
      Wasabee.Constants.SERVER_BASE_KEY,
      Wasabee.Constants.SERVER_BASE_DEFAULT
    );
  }
  return server;
};
