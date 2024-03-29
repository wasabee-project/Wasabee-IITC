import OperationChecklistDialog from "./checklist.js";
import { getSelectedOperation } from "../selectedOp";
import { loadFaked } from "../ui/portal";
import wX from "../wX";
import { clearAllMarkers } from "../ui/operation";
import statics from "../static";

const MarkerList = OperationChecklistDialog.extend({
  statics: {
    TYPE: "markerList",
  },

  SORTBY_KEY: "wasabee-markerlist-sortby",
  SORTASC_KEY: "wasabee-markerlist-sortasc",

  _displayDialog: async function () {
    const operation = getSelectedOperation();
    loadFaked(operation);

    this.sortable = this.getListDialogContent(
      operation,
      operation.markers,
      this.SORTBY_KEY,
      this.SORTASC_KEY
    );

    const buttons = {};
    if (operation.canWrite()) {
      buttons[wX("CLEAR MARKERS")] = () => {
        clearAllMarkers(getSelectedOperation());
      };
      buttons[wX("dialog.blockers.clear_automark")] = () => {
        // same lines as blockersList...
        const operation = getSelectedOperation();
        operation.startBatchMode();
        operation.markers = operation.markers.filter(
          (m) => m.comment !== "auto-marked"
        );
        operation.cleanPortalList();
        operation.endBatchMode();
      };
    }

    buttons[wX("CLOSE")] = () => {
      this.closeDialog();
    };

    await this.sortable.done;

    this.createDialog({
      title: wX("MARKER_LIST", { opName: operation.name }),
      html: this.sortable.table,
      width: "auto",
      dialogClass: "checklist",
      buttons: buttons,
      id: statics.dialogNames.markerList,
    });
  },

  update: async function () {
    if (!this.sortable) return;
    const operation = getSelectedOperation();
    this.setTitle(wX("MARKER_LIST", { opName: operation.name }));
    this.sortable = this.getListDialogContent(
      operation,
      operation.markers,
      this.SORTBY_KEY,
      this.SORTASC_KEY
    );
    await this.sortable.done;
    this.setContent(this.sortable.table);
  },
});

export default MarkerList;
