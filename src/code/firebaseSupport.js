/*
 * Since we can't run a service worker from https://intel.ingress.com, we
 * are creating an iframe that loads content hosted on server.wasabee.com.
 * This way we can setup a service worker under a domain we control and
 * simply pass the messages along using window.parent.postMessage.
 */

import { drawThings, drawAgents } from "./mapDrawing";
var Wasabee = window.plugin.Wasabee;

export const firebaseInit = () => {
  const $iframe = $("<iframe></iframe>")
    .width(0)
    .height(0)
    .attr("src", Wasabee.Constants.SERVER_BASE_KEY + "/static/firebase/");

  $(document.body).append($iframe);

  window.addEventListener("message", event => {
    console.log("Wasabee: Received a message from postMessage().");
    if (event.origin.indexOf(Wasabee.Constants.SERVER_BASE_KEY) === -1) return;

    console.log("Message received: ", event.data);

    var operation = window.plugin.wasabee.getSelectedOperation();
    if (
      event.data.data.cmd === "Agent Location Change" &&
      operation.teamid == event.data.data.msg
    ) {
      drawAgents();
    }
    if (
      event.data.data.cmd === "Map Change" &&
      operation.ID == event.data.data.msg
    ) {
      console.log("refreshing/redrawing map");
      window.plugin.wasabee.downloadSingleOp(operation.ID);
      drawThings();
    }
  });
};
