import { AutoDraw } from "./tools";
import { WasabeePortal } from "../../model";

/** Tree-like strucure holding a HF configuration */
export interface Tree {
  /** true if complete with respect to the request depth */
  success: boolean;
  /** anchors of the field */
  anchors: [WasabeePortal, WasabeePortal, WasabeePortal];
  /** number of split found (tree size) */
  split: number;
  /** portal used to split the field into three sub field */
  portal: WasabeePortal;
  /** sub tree using `portal` */
  children: [Tree, Tree, Tree];
}

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
