import { WDialog } from "../leafletClasses";
import { WasabeeLink, WasabeeMarker } from "../model";
import Sortable, { SortableField } from "../sortable";
import type WasabeeOp from "../model/operation";

declare class OperationChecklistDialog extends WDialog {
  getFields(operation: WasabeeOp): SortableField<WasabeeLink | WasabeeMarker>[];
  getListDialogContent(
    operation: WasabeeOp,
    items: Array<WasabeeLink | WasabeeMarker>,
    sortBy: number,
    sortAsc: boolean
  ): Sortable<WasabeeLink | WasabeeMarker>;
}
export default OperationChecklistDialog;
