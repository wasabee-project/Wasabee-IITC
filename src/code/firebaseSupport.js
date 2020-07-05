/*
 * Since we can't run a service worker from https://intel.ingress.com, we
 * are creating an iframe that loads content hosted on server.wasabee.com.
 * This way we can setup a service worker under a domain we control and
 * simply pass the messages along using window.parent.postMessage.
 */
import { drawAgents } from "./mapDrawing";
import { opPromise, GetWasabeeServer } from "./server";
import { makeSelectedOperation, getSelectedOperation } from "./selectedOp";

export const initFirebase = () => {
  const server = GetWasabeeServer();

  // const $iframe = $("<iframe></iframe>") .width(0) .height(0) .attr("src", server + "/static/firebase/");
  const iframe = L.DomUtil.create("iframe");
  iframe.width = 0;
  iframe.height = 0;
  iframe.src = server + "/static/firebase/index.html";

  $(document.body).append(iframe);

  window.addEventListener("message", event => {
    // ignore anything not from our server
    console.log(event);

    if (event.origin.indexOf(server) === -1) return;

    const operation = getSelectedOperation();
    switch (event.data.data.cmd) {
      case "Generic Message":
        alert(JSON.stringify(event));
        break;
      case "Agent Location Change":
        drawAgents();
        break;
      case "Map Change":
        opPromise(event.data.data.opID).then(
          function(refreshed) {
            refreshed.store();
            if (refreshed.ID == operation.ID) {
              console.log("firebase trigger reload of current op");
              makeSelectedOperation(refreshed.ID);
            }
          },
          function(err) {
            console.log(err);
          }
        );
        break;
      default:
        console.log("ignored firebase event: ", event.data.data.cmd);
    }
  });
};
