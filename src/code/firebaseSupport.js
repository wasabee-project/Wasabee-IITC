/*
 * Since we can't run a service worker from https://intel.ingress.com, we
 * are creating an iframe that loads content hosted on server.wasabee.com.
 * This way we can setup a service worker under a domain we control and
 * simply pass the messages along using window.parent.postMessage.
 */

import { drawAgents } from "./mapDrawing";
import { opPromise, GetWasabeeServer } from "./server";
import { makeSelectedOperation } from "./selectedOp";

const Wasabee = window.plugin.wasabee;

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
    if (event.data.data.cmd === "Agent Location Change") {
      drawAgents(operation);
    }

    if (event.data.data.cmd === "Map Change") {
      opPromise(event.data.data.opID).then(
        function(refreshed) {
          refreshed.store();
          if (refreshed.ID == operation.ID) {
            console.log("firebase trigger reload of current op");
            makeSelectedOperation(refreshed.ID);
            // refreshed.update(); -- makeSelectedOp triggers redraw for us
          }
        },
        function(err) {
          console.log(err);
        }
      );
    }
  });
};
