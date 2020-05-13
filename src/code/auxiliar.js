//** This function generates a unique ID for an object */
export const generateId = function(len = 40) {
  const arr = new Uint8Array(len / 2);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, dec => {
    return ("0" + dec.toString(16)).substr(-2);
  }).join("");
};

// This is what should be called to add to the queue
// can take either an entire array of portal GUID or a single GUID
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
  console.log("rate", rate);

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

  if (!p.length || p.length != 35) return; // ignore faked ones from DrawTools imports and other garbage
  console.log(
    "queue " +
      window.plugin.wasabee.portalDetailIntervalID +
      " requesting: " +
      p
  );
  // this is the bit everyone is so worried about
  window.portalDetail.request(p);
};

export const loadFaked = function(operation, force = false) {
  const flag =
    localStorage[window.plugin.wasabee.static.constants.AUTO_LOAD_FAKED] ||
    false;

  console.log(flag);
  // local storage always returns as string
  if (flag !== "true" && !force) return;

  const f = new Array();
  for (const x of operation.fakedPortals) f.push(x.id);
  if (f.length > 0) getPortalDetails(f);
};
