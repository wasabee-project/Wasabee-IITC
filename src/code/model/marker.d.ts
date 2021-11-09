export default class WasabeeMarker {
    ID: string;
    portalId: string;
    type: string;
    comment?: string;
    order: number;
    completedID: boolean;
    assignedTo: string;
    zone: number;
    _state: "pending" | "assigned" | "acknowledged" | "completed";
    static get markerTypes(): Set<string>;
    static get constants(): {
        MARKER_TYPE_CAPTURE: string;
        MARKER_TYPE_DECAY: string;
        MARKER_TYPE_EXCLUDE: string;
        MARKER_TYPE_DESTROY: string;
        MARKER_TYPE_FARM: string;
        MARKER_TYPE_GOTO: string;
        MARKER_TYPE_KEY: string;
        MARKER_TYPE_LINK: string;
        MARKER_TYPE_MEETAGENT: string;
        MARKER_TYPE_OTHER: string;
        MARKER_TYPE_RECHARGE: string;
        MARKER_TYPE_UPGRADE: string;
        MARKER_TYPE_VIRUS: string;
    };
    constructor(obj: any);
    toJSON(): {
        ID: string;
        portalId: string;
        type: string;
        comment: string;
        state: "pending" | "completed" | "assigned" | "acknowledged";
        completedID: boolean;
        assignedTo: string;
        order: number;
        zone: number;
    };
    get opOrder(): number;
    set opOrder(o: number);
    setOrder(o: number | string): void;
    assign(gid: any): void;
    set state(state: "pending" | "completed" | "assigned" | "acknowledged");
    get state(): "pending" | "completed" | "assigned" | "acknowledged";
    isDestructMarker(): boolean;
    static isDestructMarkerType(type: any): boolean;
}
