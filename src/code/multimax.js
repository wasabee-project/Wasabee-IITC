// interface Vertex {
//     guid: string;
//     latE6: number;
//     lngE6: number;
// }

// interface Portal extends Point {
//     // Static Properties
//     guid: string;
//     title: string;
//     team: string;
//     latE6: number;
//     lngE6: number;
//     level: number;
//     image: string;
//     mission: boolean;
//     mission50plus: boolean;

//     // Status
//     health: number;
//     resCount: number;
//     ornaments: any[];
//     artifactBrief: any[];
//     timestamp: number;
// }

// interface PortalDetails extends Portal {
//     mods: PortalMod[];
//     resonators: Resonators[];
//     owner: string;
//     artifactDetail: any;
// }
// interface PortalMod {
//     owner: string;
//     name: string;
//     rarity: string;
//     stats: ModStats;
// }
// interface ModStats {
//     REMOVAL_STICKINESS: string;
//     MITIGATION?: string;
//     FORCE_AMPLIFIER?: string;
//     HACK_SPEED?: string;
//     LINK_RANGE_MULTIPLIER?: string;
// }
// interface Resonator {
//     owner: string;
//     level: number;
//     energy: number;
// }

// interface Link {
//     guid?: string;
//     team: string;
//     oGuid: string;
//     oLatE6: number;
//     oLngE6: number;
//     dGuid: string;
//     dLatE6: number;
//     dLngE6: number;
// }

// interface ControlField {
//     team?: string;
//     points: Vertex[];
// }



// // Calculates if portal A is under the field formed by base and B.
//         // The geometrical trick is to check if a link between A and a point in the middle of the ocean crosses cero, one or two sides of the field
//         // one = it's inside
//         // two or cero = it's outside
//         // tree = geometry is broken
//         function lower(a, b) {
//             var o = L.latLng("-74.2", "-143.4");
//             var p = a.getLatLng();
//             var f1 = L.latLng(window.plugin.multimax.multi.base[0][0], window.plugin.multimax.multi.base[0][1]); var f2 = L.latLng(window.plugin.multimax.multi.base[1][0], window.plugin.multimax.multi.base[1][1]); var f3 = b.getLatLng();
//             var crossCheck = window.plugin.crossLinks.greatCircleArcIntersect;
//             var c = 0;
//             if (crossCheck(o, p, f1, f2))
//                 c++;
//             if (crossCheck(o, p, f1, f3))
//                 c++;
//             if (crossCheck(o, p, f3, f2))
//                 c++;
//             if (c == 1)
//                 return true;
//             else
//                 return false;
//         }

// const lower = (portal1: Portal, portal2: Portal) : boolean => {

// };

// const isOnScreen = (portal : Portal) : boolean => {

// };

// const getAllPortalsOnScreen = () : Portal[] => portals.filter((isOnScreen));


// const crossCheck = (link1 : Link, link2 : Link) : boolean => {

// };

// const fieldCoversPortal = ({points: [pointA, pointB, pointC]} : ControlField, Portal) : boolean => {
//     const unreachableMapPoint = L.latLng("-74.2", "-143.4"); // Let's hope no one ever want to plan a field over this point!
//     var portalToOutside = new Link();
//     []
// };

// const buildPartialOrder = (portals: Portal[], baseA: Portal, baseB: Portal) => Map {
    
// }