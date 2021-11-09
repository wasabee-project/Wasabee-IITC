export declare type WDKey = {
    Name: string;
    PortalID: string;
    GID: string;
    Lat: string;
    Lng: string;
    Count: number;
    CapID: string;
};
export declare function initWasabeeD(): void;
export declare function getAllWasabeeDkeys(): Promise<WDKey[]>;
export declare function getAgentWasabeeDkeys(gid: string): Promise<WDKey[]>;
export declare function getAllPortalWasabeeDkeys(portalid: string): Promise<WDKey[]>;
export declare function getAgentPortalWasabeeDkeys(gid: string, portalid: string): Promise<WDKey>;
export declare function drawWasabeeDkeys(): Promise<void>;
