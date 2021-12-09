import WasabeePortal from "../model/portal";
import { IITC } from "../../types/iitc";

declare function fromIITC(p: IITC.Portal): WasabeePortal;
declare function team(portal: any): string;
declare function displayName(portal: any): any;
declare function displayFormat(
  portal: any,
  shortName?: boolean
): HTMLAnchorElement;
declare function get(id: any): WasabeePortal;
declare function getSelected(): WasabeePortal;
interface WLPortalOptions extends L.MarkerOptions {
  portalId: string;
  title?: string;
  id: string;
}
export declare class WLPortal extends L.Marker {
  type: string;
  options: WLPortalOptions;
  constructor(options: WLPortalOptions);
  _popupContent(): HTMLDivElement;
  _popupPortalComments(container: any, portal: any, canWrite: any): void;
  _setPortalComment(ev: any): void;
  _assignButton(container: any, text: any, target: any): void;
  _deleteAction(): void;
  _deleteButton(container: any, text: any): void;
  _sendTargetButton(container: any, text: any, target: any): void;
  _mapButton(container: any, text: any): void;
}
declare const _default: {
  fromIITC: typeof fromIITC;
  displayName: typeof displayName;
  displayFormat: typeof displayFormat;
  get: typeof get;
  getSelected: typeof getSelected;
  team: typeof team;
  WLPortal: typeof WLPortal;
};
export default _default;
