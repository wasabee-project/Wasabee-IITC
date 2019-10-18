/*
 * Since we can't run a service worker from https://intel.ingress.com, we
 * are creating an iframe that loads content hosted on server.wasabee.com.
 * This way we can setup a service worker under a domain we control and
 * simply pass the messages along using window.parent.postMessage.
 */

import { drawAgents } from "./mapDrawing";
import { GetWasabeeServer } from "./server";

const Wasabee = window.plugin.Wasabee;

export const initFirebase = () => {
  const server = GetWasabeeServer();

  const $iframe = $("<iframe></iframe>")
    .width(0)
    .height(0)
    .attr("src", server + "/static/firebase/");

  $(document.body).append($iframe);

  window.addEventListener("message", event => {
    if (event.origin.indexOf(server) === -1) return;

    const operation = Wasabee._selectedOp;
    if (
      event.data.data.cmd === "Agent Location Change" &&
      operation.teamid == event.data.data.msg
    ) {
      drawAgents();
    }
    if (event.data.data.cmd === "Map Change") {
      window.plugin.wasabee.opPromise(event.data.data.opID).then(
        function(refreshed) {
          refreshed.store();
          if (refreshed.ID == operation.ID) {
            window.plugin.wasabee.makeSelectedOperation(refreshed.ID);
            refreshed.update();
          }
        },
        function(err) {
          console.log(err);
        }
      );
    }
  });
};
