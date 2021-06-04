import OperationChecklistDialog from "./checklist.js";
import { getSelectedOperation } from "../selectedOp";
import { loadFaked, clearAllMarkers } from "../uiCommands";
import wX from "../wX";

const MarkerList = OperationChecklistDialog.extend({
  statics: {
    TYPE: "markerList",
  },

  _displayDialog: function () {
    const operation = getSelectedOperation();
    loadFaked(operation);
    this.sortable = this.getListDialogContent(
      operation,
      operation.markers,
      0,
      false
    ); // defaults to sorting by op order

    const buttons = {};
    buttons[wX("CLEAR MARKERS")] = () => {
      clearAllMarkers(getSelectedOperation());
    };

    buttons[wX("OK")] = () => {
      this.closeDialog();
    };

    this.createDialog({
      title: wX("MARKER_LIST", { opName: operation.name }),
      html: this.sortable.table,
      width: "auto",
      dialogClass: "markerlist",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.markerList,
    });
  },

  update: async function () {
    const operation = getSelectedOperation();
    this.setTitle(wX("MARKER_LIST", { opName: operation.name }));
    this.sortable = this.getListDialogContent(
      operation,
      operation.markers,
      this.sortable.sortBy,
      this.sortable.sortAsc
    );
    await this.sortable.done;
    this.setContent(this.sortable.table);
  },
});

export default MarkerList;
