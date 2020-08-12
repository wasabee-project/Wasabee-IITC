/*
 * Since we can't run a service worker from https://intel.ingress.com, we
 * are creating an iframe that loads content hosted on server.wasabee.com.
 * This way we can setup a service worker under a domain we control and
 * simply pass the messages along using window.parent.postMessage.
 */
import { drawSingleTeam } from "./mapDrawing";
import { opPromise, GetWasabeeServer } from "./server";
import { makeSelectedOperation, getSelectedOperation } from "./selectedOp";

// TODO: use a dedicated message channel: https://developer.mozilla.org/en-US/docs/Web/API/Channel_Messaging_API/Using_channel_messaging

const frameID = "wasabeeFirebaseFrame";

export const initFirebase = () => {
  const server = GetWasabeeServer();

  const iframe = L.DomUtil.create("iframe");
  iframe.width = 0;
  iframe.height = 0;
  iframe.src = server + "/static/firebase/index.html";
  iframe.id = frameID;

  $(document.body).append(iframe);

  window.addEventListener("message", (event) => {
    // ignore anything not from our server
    if (event.origin.indexOf(server) === -1) return;

    const operation = getSelectedOperation();
    switch (event.data.data.cmd) {
      case "Generic Message":
        alert(JSON.stringify(event.data.data));
        break;
      case "Agent Location Change":
        console.log("firebase update of agent location: ", event.data.data);
        window.plugin.wasabee.onlineAgents.set(event.data.data.gid, Date.now());
        drawSingleTeam(event.data.data.msg);
        break;
      case "Map Change":
        opPromise(event.data.data.opID).then(
          function (refreshed) {
            refreshed.store();
            if (refreshed.ID == operation.ID) {
              console.log(
                "firebase trigger reload of current op: ",
                event.data.data
              );
              makeSelectedOperation(refreshed.ID);
            } else {
              console.log(
                "firebase trigger update of op",
                event.data.data.opID
              );
            }
          },
          function (err) {
            console.log(err);
          }
        );
        break;
      case "Login":
        // display to console somehow?
        console.log("server reported teammate login: ", event.data.data.gid);
        window.plugin.wasabee.onlineAgents.set(event.data.data.gid, Date.now());
        break;
      default:
        console.log("unknown firebase command: ", event.data.data);
    }
  });
};

export const postToFirebase = (message) => {
  // prevent analytics data from being sent if not enabled by the user: GPDR
  if (
    message.id == "analytics" &&
    localStorage[window.plugin.wasabee.static.constants.SEND_ANALYTICS_KEY] !=
      "true"
  )
    return;

  window.frames[frameID].contentWindow.postMessage(message, GetWasabeeServer());
};
