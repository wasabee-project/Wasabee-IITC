import { WDialog } from "../leafletClasses";

interface ZonedrawHandlerOptions {
  parent: WDialog;
}
export class ZonedrawHandler extends L.Handler {
  zoneID: number;
  constructor(map: L.Map, options: ZonedrawHandlerOptions);
}
