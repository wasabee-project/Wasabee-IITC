/*
 * Since we can't run a service worker from https://intel.ingress.com, we
 * are creating an iframe that loads content hosted on CDN.
 * This way we can setup a service worker under a domain we control and
 * simply pass the messages along using the Channel API.
 */
import { WasabeeMe } from "../model";
import { constants } from "../static";
import { postToFirebase } from "./logger";

import type { MessageHandler } from "./event";

const frameID = "wasabeeFirebaseFrame";

const channel = new MessageChannel();
export const port = channel.port1;

export function initFirebase(onMessage: MessageHandler) {
  const iframe = L.DomUtil.create("iframe");
  iframe.width = "0";
  iframe.height = "0";
  iframe.src = constants.FIREBASE_IFRAME;
  iframe.id = frameID;

  iframe.addEventListener("load", () => {
    port.onmessage = (ev) => {
      if (ev.data === "ready") {
        port.onmessage = onMessage;
        if (WasabeeMe.isLoggedIn()) {
          postToFirebase({
            id: "wasabeeLogin",
            method: "auto",
          });
        }
      }
    };
    iframe.contentWindow.postMessage("init", "*", [channel.port2]);
  });

  $(document.body).append(iframe);
}
