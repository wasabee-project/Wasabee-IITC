import { AutoDraw } from "./tools";
import WasabeePortal from "../../model/portal";

export default class HomogeneousDialog extends AutoDraw {
  _anchorOne: WasabeePortal;
  _anchorTwo: WasabeePortal;
  _anchorThree: WasabeePortal;
  depthMenu: HTMLSelectElement;
  orderMenu: HTMLSelectElement;
  _fullSearch: boolean;
  _urp: L.LatLng;

  constructor();
}
