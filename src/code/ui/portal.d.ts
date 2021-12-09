import WasabeePortal from "../model/portal";
import { IITC } from "../../types/iitc";

export function fromIITC(p: IITC.Portal): WasabeePortal;

export function team(portal: any): string;

export function displayName(portal: any): any;

export function displayFormat(
  portal: any,
  shortName?: boolean
): HTMLAnchorElement;

export function get(id: any): WasabeePortal;

export function getSelected(): WasabeePortal;

interface WLPortalOptions extends L.MarkerOptions {
  portalId: string;
  title?: string;
  id: string;
}

export class WLPortal extends L.Marker {
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
