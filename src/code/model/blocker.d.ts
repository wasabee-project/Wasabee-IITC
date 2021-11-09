import type WasabeeOp from "./operation";
import type WasabeePortal from "./portal";
export interface IBlockerPortal {
    opID: OpID;
    id: PortalID;
    name: string;
    lat: string;
    lng: string;
}
export default class WasabeeBlocker {
    opID: string;
    from: string;
    to: string;
    fromPortal?: IBlockerPortal;
    toPortal?: IBlockerPortal;
    constructor(obj: any);
    static addPortal(op: WasabeeOp, portal: WasabeePortal): Promise<void>;
    static updatePortal(op: WasabeeOp, portal: WasabeePortal): Promise<boolean>;
    static removeBlocker(op: WasabeeOp, portalId: string): Promise<void>;
    static removeBlockers(opID: string): Promise<void>;
    static addBlocker(op: WasabeeOp, fromPortal: WasabeePortal, toPortal: WasabeePortal): Promise<void>;
    static getPortals(op: WasabeeOp): Promise<IBlockerPortal[]>;
    static getAll(op: WasabeeOp): Promise<WasabeeBlocker[]>;
}
