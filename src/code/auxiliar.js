//** This function generates a unique ID for an object */
export const generateId = function(len = 40) {
  const arr = new Uint8Array(len / 2);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, dec => {
    return ("0" + dec.toString(16)).substr(-2);
  }).join("");
};

// This is what should be called to add to the queue
export const getPortalDetails = function(guid) {
  console.log("adding to queue", guid);
  if (Array.isArray(guid)) {
    window.plugin.wasabee.portalDetailQueue = window.plugin.wasabee.portalDetailQueue.concat(
      guid
    );
  } else {
    window.plugin.wasabee.portalDetailQueue.push(guid);
  }

  const rate =
    localStorage[
      window.plugin.wasabee.static.constants.PORTAL_DETAIL_RATE_KEY
    ] || 1000;

  // if not already processing the queue, start it
  if (!window.plugin.wasabee.portalDetailIntervalID) {
    window.plugin.wasabee.portalDetailIntervalID = window.setInterval(
      pdqDoNext,
      rate
    );
    console.log(
      "starting queue: " + window.plugin.wasabee.portalDetailIntervalID
    );
  }
};

const pdqDoNext = function() {
  const p = window.plugin.wasabee.portalDetailQueue.shift();

  // are we done?
  if (p === undefined) {
    console.log(
      "closing queue: " + window.plugin.wasabee.portalDetailIntervalID
    );
    window.clearInterval(window.plugin.wasabee.portalDetailIntervalID);
    window.plugin.wasabee.portalDetailIntervalID = null;
    return;
  }
  console.log(
    "queue " +
      window.plugin.wasabee.portalDetailIntervalID +
      " requesting: " +
      p
  );
  // this is the bit everyone is so worried about
  window.portalDetail.request(p);
};
