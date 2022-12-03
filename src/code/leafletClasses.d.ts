/// <reference types="jquery" />
/// <reference types="jqueryui" />

export declare class WTooltip extends L.Class {
  _pane: HTMLElement;
  _container: HTMLDivElement;
  constructor(map: L.Map);
  dispose(): void;
  updateContent(labelText: string | Node, html?: boolean): this;
  updatePosition(latlng: L.LatLngExpression): this;
  showAsError(): this;
  removeError(): this;
}
declare type WPaneOptions = {
  paneId: string;
  paneName: string;
  default?: () => WDialog;
};
export declare class WPane extends L.Handler {
  options: WPaneOptions;
  _dialog: WDialog;
  _container: HTMLDivElement;
  constructor(options: WPaneOptions);
  addHooks(): void;
  removeHooks(): void;
}
export interface WDialogOptions {
  [propName: string]: unknown;
}
export declare class WDialog extends L.Handler {
  needWritePermission: boolean; // todo: set static
  usePane: boolean;
  paneId: string;
  options: WDialogOptions;
  _smallScreen: boolean;
  _dialog: JQuery<HTMLElement> | null;
  _container: HTMLDivElement;
  _header: HTMLDivElement;
  _content: HTMLDivElement;
  _buttons: HTMLDivElement;
  constructor(options?: WDialogOptions);
  initialize(options?: WDialogOptions);
  addHooks(): void;
  removeHooks(): void;
  onOpChange(): void;
  enable(): any;
  update(): void;
  createDialog(options: DialogOptions): void;
  setTitle(title: string): void;
  setContent(content: HTMLElement | string): void;
  closeDialog(): void;
  _isMobile(): boolean;
}
export interface ButtonsControlOptions extends L.ControlOptions {
  buttons: Map<string, WButton>;
  container: HTMLElement;
}
export declare class ButtonsControl extends L.Control {
  options: ButtonsControlOptions;
  constructor(options: ButtonsControlOptions);
  onAdd(): HTMLDivElement;
  onRemove(): void;
  update(): void;
  disableAllExcept(name: any): void;
}
export declare type ButtonOptions = {
  text?: string;
  html?: HTMLElement;
  title?: string;
  container?: HTMLElement;
  callback: () => void;
  context: unknown;
  buttonImage?: string;
  className?: string;
  img?: string;
  accesskey?: string;
};
export declare class WButton extends L.Class {
  title: string;
  type: string;
  needWritePermission: boolean;
  _enabled: boolean;
  actionsContainer: HTMLElement;
  control: ButtonsControl;
  button: HTMLAnchorElement;
  _container: HTMLElement;
  constructor(container: HTMLElement);
  update(): void;
  _toggleActions(): void;
  setControl(control: any): void;
  disable(): void;
  enable(): void;
  setSubActions(actions: ButtonOptions[]): void;
  _createButton(options: ButtonOptions): HTMLAnchorElement;
}
export {};
