import { openDB } from "idb";

const version = 2;

// XXX audit these to make sure all the various indexes are used
const db = openDB("wasabee", version, {
  upgrade(db, oldVersion, newVersion, tx) {
    if (oldVersion < 1) {
      const agents = db.createObjectStore("agents", { keyPath: "id" });
      agents.createIndex("date", "date"); // last location change
      agents.createIndex("fetched", "fetched"); // last pull from server
      const teams = db.createObjectStore("teams", { keyPath: "id" });
      teams.createIndex("fetched", "fetched"); // last pull from server

      // do not set an implied key, explicitly set GID/PortalID on insert
      // XXX we can do this with a keyPath https://stackoverflow.com/questions/33852508/how-to-create-an-indexeddb-composite-key
      // const defensivekeys = db.createObjectStore("defensivekeys");
      const defensivekeys = db.createObjectStore("defensivekeys", {
        keyPath: ["GID", "PortalID"],
      });
      defensivekeys.createIndex("PortalID", "PortalID");
      defensivekeys.createIndex("Count", "Count"); // To be used to remove 0-count entries
      // defensivekeys.createIndex("pk", ["GID", "PortalID"], { unique: true });
    }
    if (oldVersion < 2) {
      const ops = db.createObjectStore("operations", { keyPath: "ID" });
      ops.createIndex("fetched", "fetched");
      ops.createIndex("server", "server");
    }
    /* if (oldVersion < 3) {
      const teams = tx.objectStore("teams");
      teams.createIndex("_agents", "_agents[].id");
    } */
    console.debug(newVersion, tx);
  },
});

export default db;
