import { WDialog, WDialogOptions } from "../../leafletClasses";
import WasabeeOp from "../../model/operation";
import WasabeePortal from "../../model/portal";

export class AutoDraw extends WDialog {
  needWritePermission: true;
  _operation: WasabeeOp;
  _portalSets: {
    [name: string]: {
      zone: ZoneID;
      keys: boolean;
      portals: WasabeePortal[];
      display: HTMLSpanElement;
    };
  };
  _mapRefreshHook: () => void;

  constructor(options?: WDialogOptions);
  initialize(options?: WDialogOptions): void;

  _opChange(): void;
  _initPortalSet(setKey: string, zone: ZoneID, keys: boolean): void;
  _updatePortalSet(): void;
  _addSetPortal(
    text: string,
    thisKey: string,
    container: HTMLDivElement,
    storageKey: string,
    callback?: () => void
  ): void;
  _addCheckbox(
    text: string,
    id: string,
    thisKey: string,
    container: HTMLDivElement,
    defaultValue: boolean
  ): void;
  _addSelectSet(
    text: string,
    setKey: string,
    container: HTMLDivElement,
    defaultValue: string
  ): void;
}
