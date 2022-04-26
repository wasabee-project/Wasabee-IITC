import { WasabeePortal } from "../model";
import { IITC } from "../../types/iitc";

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
