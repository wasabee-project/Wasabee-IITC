import { WDialog, WDialogOptions } from "../leafletClasses";
import type WasabeeZone from "../model/zone";

interface ZoneSetColorDialogOptions extends WDialogOptions {
  zone: WasabeeZone;
}
declare class ZoneSetColorDialog extends WDialog {
  options: ZoneSetColorDialogOptions;
  constructor(options: ZoneSetColorDialogOptions);
}
export default ZoneSetColorDialog;
