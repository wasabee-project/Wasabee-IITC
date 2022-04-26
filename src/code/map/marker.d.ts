import type { WLPortal } from "./portal";
import type WasabeeMarker from "../model/marker";
import type WasabeeOp from "../model/operation";

export class WLMarker extends WLPortal {
  state: string;
  constructor(marker: WasabeeMarker);
  setState(state: string): void;
  _popupContent(): any;
  _popupMarkerComment(container: any, marker: any, canWrite: any): void;
  _popupAssignState(container: any, marker: any): Promise<void>;
  _stateButton(container: any, marker: any): void;
  _deleteAction(): void;
  _setComment(ev: any): void;
  _setMarkerType(ev: any): void;
}

export function displayFormat(marker: WasabeeMarker, operation: WasabeeOp): HTMLSpanElement;
