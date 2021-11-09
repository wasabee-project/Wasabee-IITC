import { DBSchema } from "idb";
import type WasabeeAgent from "./model/agent";
import type { IBlockerPortal } from "./model/blocker";
import type WasabeeBlocker from "./model/blocker";
import type { ILocalOp } from "./model/operation";
import type WasabeeTeam from "./model/team";
import type { WDKey } from "./wd";
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
declare const db: Promise<import("idb").IDBPDatabase<WasabeeDB>>;
export default db;
