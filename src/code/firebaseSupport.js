/*
 * Since we can't run a service worker from https://intel.ingress.com, we
 * are creating an iframe that loads content hosted on server.wasabee.com.
 * This way we can setup a service worker under a domain we control and
 * simply pass the messages along using window.parent.postMessage.
 */

import { drawAgents } from "./mapDrawing";
var Wasabee = window.plugin.Wasabee;

export const initFirebase = () => {
  const $iframe = $("<iframe></iframe>")
    .width(0)
    .height(0)
    .attr("src", Wasabee.Constants.SERVER_BASE_KEY + "/static/firebase/");

  $(document.body).append($iframe);

  window.addEventListener("message", event => {
    // console.log("Wasabee: Received a message from postMessage().");
    if (event.origin.indexOf(Wasabee.Constants.SERVER_BASE_KEY) === -1) return;

    // console.log("Message received: ", event.data);
    var operation = Wasabee._selectedOp;
    if (
      event.data.data.cmd === "Agent Location Change" &&
      operation.teamid == event.data.data.msg
    ) {
      drawAgents();
    }
    if (event.data.data.cmd === "Map Change") {
      window.plugin.wasabee.downloadSingleOp(event.data.data.opID);
      if (event.data.data.opID == operation.ID) {
        console.log(
          "selected map changed by firebase push, refreshing/redrawing map"
        );
        var trashID = "000000000000000000000000000000000000000"; // required to trigger redraw
        operation.ID = trashID;
        operation.name = "swap for reload";
        operation.store();
        window.plugin.wasabee.makeSelectedOperation(event.data.data.opID);
        window.plugin.wasabee.removeOperation(trashID);
      }
    }
  });
};
