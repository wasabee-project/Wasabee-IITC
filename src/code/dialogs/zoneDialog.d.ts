import { WDialog } from "../leafletClasses";

declare class ZoneDialog extends WDialog {
  ZonedrawHandler: ZonedrawHandler;
}
export default ZoneDialog;

interface ZonedrawHandlerOptions {
  parent: ZoneDialog;
}
declare class ZonedrawHandler extends L.Handler {
  zoneID: number;
  constructor(options: ZonedrawHandlerOptions);
}
