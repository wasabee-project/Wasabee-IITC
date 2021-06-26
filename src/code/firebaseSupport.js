/*
 * Since we can't run a service worker from https://intel.ingress.com, we
 * are creating an iframe that loads content hosted on server.wasabee.com.
 * This way we can setup a service worker under a domain we control and
 * simply pass the messages along using window.parent.postMessage.
 */
import { drawSingleTeam, drawSingleAgent } from "./mapDrawing";
import { opPromise, GetWasabeeServer } from "./server";
import {
  makeSelectedOperation,
  getSelectedOperation,
  removeOperation,
  loadNewDefaultOp,
} from "./selectedOp";
import { updateLocalOp } from "./uiCommands";
import WasabeeOp from "./model/operation";
import WasabeePortal from "./model/portal";

// TODO: use a dedicated message channel: https://developer.mozilla.org/en-US/docs/Web/API/Channel_Messaging_API/Using_channel_messaging

const frameID = "wasabeeFirebaseFrame";

export function initFirebase() {
  const server = GetWasabeeServer();

  const iframe = L.DomUtil.create("iframe");
  iframe.width = 0;
  iframe.height = 0;
  iframe.src = server + "/static/firebase/index.html";
  iframe.id = frameID;

  $(document.body).append(iframe);

  window.addEventListener("message", async (event) => {
    // ignore anything not from our server
    if (event.origin.indexOf(server) === -1) return;

    const operation = getSelectedOperation();
    switch (event.data.data.cmd) {
      case "Agent Location Change":
        if (event.data.data.gid != null) {
          console.debug(
            "firebase update of single agent location: ",
            event.data.data
          );
          drawSingleAgent(event.data.data.gid);
        } else {
          console.debug(
            "firebase update of whole team location: ",
            event.data.data
          );
          drawSingleTeam(event.data.data.msg);
        }
        break;
      case "Delete":
        console.warn("server requested op delete: ", event.data.data.opID);
        if (event.data.data.opID == operation.ID) await loadNewDefaultOp();
        await removeOperation(event.data.data.opID);
        break;
      case "Generic Message":
        alert(JSON.stringify(event.data.data));
        break;
      case "Login":
        console.debug("server reported teammate login: ", event.data.data.gid);
        window.map.fire("wasabee:agentlocations");
        break;
      case "Map Change":
        if (!window.plugin.wasabee._updateList.has(event.data.data.updateID)) {
          try {
            // update the list to avoid race from slow network
            window.plugin.wasabee._updateList.set(
              event.data.data.updateID,
              Date.now()
            );
            const localop = await WasabeeOp.load(event.data.data.opID);
            const refreshed = await opPromise(event.data.data.opID);
            const reloadSOp = await updateLocalOp(localop, refreshed);
            if (reloadSOp) {
              console.log(
                "firebase trigger reload of current op: ",
                event.data.data
              );
              await makeSelectedOperation(refreshed.ID);
            } else {
              console.debug(
                "firebase trigger update of op",
                event.data.data.opID
              );
            }
          } catch (e) {
            console.error(e);
          }
        } else {
          console.debug(
            "skipping firebase requested update of op since it was our change",
            event.data.data.updateID
          );
        }
        break;
      case "Target":
        try {
          const target = JSON.parse(event.data.data.msg);
          const raw = {
            id: target.ID,
            name: target.Name,
            lat: target.Lat,
            lng: target.Lon,
          };
          const portal = new WasabeePortal(raw);
          const f = portal.displayFormat();
          alert(f.outerHTML + "<br>Sent by: " + target.Sender, true);
        } catch (e) {
          console.error(e);
        }
        break;
      default:
        console.warn("unknown firebase command: ", event.data.data);
    }
  });
}

export function postToFirebase(message) {
  // prevent analytics data from being sent if not enabled by the user: GPDR
  /* if (
    message.id == "analytics" &&
    localStorage[window.plugin.wasabee.static.constants.SEND_ANALYTICS_KEY] !=
      "true"
  )
    return; */

  message.app_name = "Wasabee-IITC";
  message.app_version = window.plugin.wasabee.info.version;

  window.frames[frameID].contentWindow.postMessage(message, GetWasabeeServer());
}
