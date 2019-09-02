import store from "store";
import Operation from "./operation";
import Team from "./team";
import WasabeeMe from "./me";

var Wasabee = window.plugin.Wasabee;

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

  window.plugin.wasabee.authWithWasabee = () =>
    sendServerRequest("/me")
      .done(response => {
        Wasabee.Me = new WasabeeMe(response);
        if (response.Ops != null) {
          window.plugin.wasabee.updateServerOpMap(response.Ops, true);
        }
      })
      .fail(() => {
        window.plugin.wasabee.showMustAuthAlert();
      });

  window.plugin.wasabee.uploadSingleOp = operation =>
    sendServerRequest("/api/v1/draw", "POST", operation)
      .done(response => {
        //  We shouldn't read an answer to this. It's a POST.
        if (response.Ops != null) {
          window.plugin.wasabee.updateServerOpMap(response.Ops, false);
        }
        alert("Upload Complete.");
      })
      .fail(() => {
        window.plugin.wasabee.showMustAuthAlert();
      });

  window.plugin.wasabee.updateSingleOp = operation =>
    sendServerRequest("/api/v1/draw/" + operation.ID, "PUT", operation)
      .done(() => {
        alert("Update Complete.");
      })
      .fail(() => {
        window.plugin.wasabee.showMustAuthAlert();
      });

  window.plugin.wasabee.downloadSingleOp = opID => {
    if (window.plugin.wasabee.IsServerOp(opID) === true) {
      window.plugin.wasabee.opPromise(opID).then(
        function(newop) {
          // add it to the list of known ops
          Wasabee.ops.set(newop.ID, true);
        },
        function(err) {
          console.log(err);
        }
      );
    }
  };

  // TODO: Should this use the DELETE verb?
  window.plugin.wasabee.deleteOwnedServerOp = opID =>
    sendServerRequest("/api/v1/draw/" + opID + "/delete")
      .done(response => {
        console.log("got response -> " + JSON.stringify(response));
      })
      .fail(() => {
        window.plugin.wasabee.showMustAuthAlert();
      });

  window.plugin.wasabee.fetchAllOps = ops => {
    ops.forEach(opID => {
      window.plugin.wasabee.downloadSingleOp(opID);
    });
  };

  window.plugin.wasabee.updateServerOpMap = (ops, pullFullOps) => {
    // save the list of op IDs to the local store
    console.log("ops -> " + JSON.stringify(ops));

    // pull all known ops from server to local store
    if (pullFullOps) {
      Promise.all(window.plugin.wasabee.fetchAllOps(ops))
        .then(() => {
          alert("Sync Complete.");
        })
        .catch(data => {
          throw (alert(data.message), console.log(data), data);
        });
    }

    // save the list of ops
    store.set(Wasabee.Constants.OP_LIST_KEY, JSON.stringify(ops));
  };

  window.plugin.wasabee.IsWritableOp = opID => {
    console.log("checking IsWritableOp: " + opID);
    var isWritable = false;
    try {
      var op = window.plugin.wasabee.getOperationByID(opID);
      if (op != null) {
        // XXX TODO properly fetch and store /me
        console.log("me: " + Wasabee.Me.GoogleID);
        console.log("my teams: " + Wasabee.Me.Teams);
        console.log(op);
        if (Wasabee.Me.GoogleID != null) {
          // XXX determine if an op team with write access is in the agent's teams
          isWritable = true;
        }
      }
    } catch (e) {
      console.log(e);
    }
    return isWritable;
  };

  window.plugin.wasabee.IsServerOp = opID => {
    var isServerOp = false;
    try {
      var op = window.plugin.wasabee.getOperationByID(opID);
      if (op != null && op.Teams != null) {
        isServerOp = true;
      }
    } catch (e) {
      console.log(e);
    }
    return isServerOp;
  };

  window.plugin.wasabee.teamPromise = teamid => {
    return new Promise(function(resolve, reject) {
      var url = Wasabee.Constants.SERVER_BASE_KEY + "/api/v1/team/" + teamid;
      var req = new XMLHttpRequest();
      req.open("GET", url);
      req.withCredentials = true;
      req.crossDomain = true;

      req.onload = function() {
        switch (req.status) {
          case 200:
            var team = Team.create(req.response);
            // add it to the global Wasabee.teams map
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
      var url = Wasabee.Constants.SERVER_BASE_KEY + "/api/v1/draw/" + opID;
      var req = new XMLHttpRequest();
      req.open("GET", url);
      req.withCredentials = true;
      req.crossDomain = true;

      req.onload = function() {
        switch (req.status) {
          case 200:
            var newop = Operation.create(req.response);
            resolve(newop);
            break;
          case 401:
            reject("not authorized to access op: " + opID);
            window.plugin.wasabee.showMustAuthAlert();
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
}
