/*
 * Since we can't run a service worker from https://intel.ingress.com, we
 * are creating an iframe that loads content hosted on server.wasabee.com.
 * This way we can setup a service worker under a domain we control and
 * simply pass the messages along using window.parent.postMessage.
 */

export const firebaseInit = () => {
  const $iframe = $("<iframe></iframe>")
    .width(0)
    .height(0)
    .attr("src", "https://server.wasabee.rocks/static/firebase/");

  $(document.body).append($iframe);

  window.addEventListener("message", event => {
    console.log("Wasabee: Received a message from postMessage().");
    if (event.origin.indexOf("https://server.wasabee.rocks") === -1) return;

    console.log("Message received: ", event.data);

    //TODO: What do we want to do with the message?
  });
};
