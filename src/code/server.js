import Operation from "./operation";
import Team from "./team";
import WasabeeMe from "./me";

const Wasabee = window.plugin.Wasabee;

export default function() {
  function sendServerRequest(endpoint, method, data) {
    method = method || "GET";
    const options = {
      url: Wasabee.Constants.SERVER_BASE_KEY + endpoint,
      xhrFields: {
        withCredentials: true
      },
      crossDomain: true,
      method: method
    };

    if (data) {
      $.extend(options, {
        data: JSON.stringify(data),
        dataType: "json",
        contentType: "application/json"
      });
    }

    return $.ajax(options);
  }

  // sendServerRequest needs to go away in favor of promises

  window.plugin.wasabee.uploadSingleOp = operation => {
    let result = null;
    sendServerRequest("/api/v1/draw", "POST", operation)
      .done(response => {
        // update local copy after server does its magic on it
        if (response.Ops != null) {
          response.Ops.forEach(function(op) {
            if (op.ID == operation.ID) {
              result = window.plugin.wasabee.downloadSingleOp(op.ID);
            }
          });
        }
        alert("Upload Complete.");
      })
      .fail(() => {
        window.plugin.wasabee.showMustAuthAlert();
      });
    return result;
  };

  window.plugin.wasabee.updateSingleOp = operation =>
    sendServerRequest("/api/v1/draw/" + operation.ID, "PUT", operation)
      .done(() => {
        alert("Update Complete.");
      })
      .fail(() => {
        window.plugin.wasabee.showMustAuthAlert();
      });

  // TODO: Should this use the DELETE verb?
  window.plugin.wasabee.deleteOwnedServerOp = opID => {
    sendServerRequest("/api/v1/draw/" + opID + "/delete")
      .done(response => {
        console.log("got response -> " + JSON.stringify(response));
      })
      .fail(() => {
        window.plugin.wasabee.showMustAuthAlert();
      });
  };

  // below this line already converted to promises

  window.plugin.wasabee.downloadSingleOp = opID => {
    let n = window.plugin.wasabee.opPromise(opID).then(
      function(newop) {
        newop.store();
        return newop;
      },
      function(err) {
        console.log(err);
        return null;
      }
    );
    return n;
  };

  window.plugin.wasabee.teamPromise = teamid => {
    return new Promise(function(resolve, reject) {
      const url = Wasabee.Constants.SERVER_BASE_KEY + "/api/v1/team/" + teamid;
      const req = new XMLHttpRequest();
      req.open("GET", url);
      req.withCredentials = true;
      req.crossDomain = true;

      req.onload = function() {
        switch (req.status) {
          case 200:
            var team = Team.create(req.response);
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
      const url = Wasabee.Constants.SERVER_BASE_KEY + "/api/v1/draw/" + opID;
      const req = new XMLHttpRequest();
      const localop = window.plugin.wasabee.getOperationByID(opID);

      req.open("GET", url);

      if (localop != null && localop.teamlist.length != 0) {
        req.setRequestHeader("If-Modified-Since", localop.fetched);
      }

      req.withCredentials = true;
      req.crossDomain = true;

      req.onload = function() {
        switch (req.status) {
          case 200:
            resolve(Operation.create(req.response));
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
      const url = Wasabee.Constants.SERVER_BASE_KEY + "/me";
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
        reject(Error("Network Error"));
      };

      req.send();
    });
  };

  window.plugin.wasabee.assignMarkerPromise = (opID, markerID, agentID) => {
    return new Promise(function(resolve, reject) {
      const url =
        Wasabee.Constants.SERVER_BASE_KEY +
        "/api/v1/draw/" +
        opID +
        "/marker/" +
        markerID +
        "/assign";
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
      req.send("agent=" + agentID);
    });
  };
}
