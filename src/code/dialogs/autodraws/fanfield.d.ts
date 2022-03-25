import type WasabeePortal from "../../model/portal";
import type { AutoDraw } from "./tools";

export function angle(a: WasabeePortal, p: WasabeePortal): number;

export default class FanfieldDialog extends AutoDraw {
  _anchor: WasabeePortal;
  _start: WasabeePortal;
  _end: WasabeePortal;
  constructor();
}
