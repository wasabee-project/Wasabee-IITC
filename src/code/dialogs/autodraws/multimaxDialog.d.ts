import { AutoDraw } from "./tools";
import WasabeePortal from "../../model/portal";

export default class MultimaxDialog extends AutoDraw {
  _anchorOne: WasabeePortal;
  _anchorTwo: WasabeePortal;
  _flcheck: boolean;
  _orderFromEnd: boolean;
  _urp: L.LatLng;

  constructor();
  MM(
    pOne: WasabeePortal,
    pTwo: WasabeePortal,
    portals: WasabeePortal[],
    order?: number,
    base?: boolean,
    commentPrefix?: string
  ): any[];
  fieldCoversPortal(a: any, b: any, c: any, p: any): boolean;
  getSpine(
    one: WasabeePortal,
    two: WasabeePortal,
    portals: WasabeePortal[]
  ): WasabeePortal[];
}
