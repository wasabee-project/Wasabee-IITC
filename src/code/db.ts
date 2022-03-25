import { deleteDB, openDB } from "idb";

import type { DBSchema } from "idb";
import type WasabeeAgent from "./model/agent";
import type { IBlockerPortal } from "./model/blocker";
import type WasabeeBlocker from "./model/blocker";
import type { ILocalOp } from "./model/operation";
import type WasabeeTeam from "./model/team";
import type { WDKey } from "./wd";

const version = 3;

interface WasabeeDB extends DBSchema {
  agents: {
    key: GoogleID;
    value: WasabeeAgent;
    indexes: {
      date: string;
      fetched: string;
    };
  };
  teams: {
    key: TeamID;
    value: WasabeeTeam;
    indexes: {
      fetched: string;
    };
  };
  defensivekeys: {
    key: [GoogleID, PortalID];
    value: WDKey;
    indexes: {
      PortalID: string;
      Count: number;
    };
  };
  operations: {
    key: OpID;
    value: ILocalOp;
    indexes: {
      fetched: string;
      server: string;
    };
  };
  blockers: {
    key: [OpID, PortalID, PortalID];
    value: WasabeeBlocker;
    indexes: {
      opID: OpID;
      from: PortalID;
      to: PortalID;
    };
  };
  blockers_portals: {
    key: [OpID, PortalID];
    value: IBlockerPortal;
    indexes: {
      opID: OpID;
    };
  };
}

// XXX audit these to make sure all the various indexes are used
const db = openDB<WasabeeDB>("wasabee", version, {
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
    if (oldVersion < 3) {
      // { opID, from, to }
      const blockers = db.createObjectStore("blockers", {
        keyPath: ["opID", "from", "to"],
      });
      blockers.createIndex("opID", "opID", { unique: false });
      blockers.createIndex("from", ["opID", "from"], { unique: false });
      blockers.createIndex("to", ["opID", "to"], { unique: false });

      // portals for blockers
      // { id, lat, lng, name }
      const portals = db.createObjectStore("blockers_portals", {
        keyPath: ["opID", "id"],
      });
      portals.createIndex("opID", "opID", { unique: false });
    }
    /* if (oldVersion < 3) {
      const teams = tx.objectStore("teams");
      teams.createIndex("_agents", "_agents[].id");
    } */
    console.debug(newVersion, tx);
  },
});

export async function deleteDatabase() {
  (await db).close();
  return deleteDB("wasabee");
}

export default db;
