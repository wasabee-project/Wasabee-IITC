import type WasabeeOp from "./operation";
export default class WasabeeLink {
    ID: string;
    fromPortalId: string;
    toPortalId: string;
    description?: string;
    assignedTo?: string;
    throwOrderPos: number;
    color: string;
    completed: boolean;
    zone: number;
    constructor(obj: any);
    assign(gid: any): void;
    toJSON(): {
        ID: string;
        fromPortalId: string;
        toPortalId: string;
        description: string;
        assignedTo: string;
        throwOrderPos: number;
        color: string;
        completed: boolean;
        zone: number;
    };
    get comment(): string;
    set comment(c: string);
    get opOrder(): number;
    set opOrder(o: number);
    setOrder(o: number | string): void;
    get state(): "pending" | "completed" | "assigned";
    set state(s: string);
    get portalId(): string;
    getLatLngs(operation: WasabeeOp): any[];
    get latLngs(): any[];
    setColor(color: string, operation: WasabeeOp): void;
    getColor(operation: WasabeeOp): string;
    length(operation: WasabeeOp): number;
}
