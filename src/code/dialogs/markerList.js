import OperationChecklistDialog from "./checklist.js";
import { getSelectedOperation } from "../selectedOp";
import { loadFaked, clearAllMarkers } from "../uiCommands";
import wX from "../wX";

const MarkerList = OperationChecklistDialog.extend({
  statics: {
    TYPE: "markerList",
  },

  SORTBY_KEY: "wasabee-markerlist-sortby",
  SORTASC_KEY: "wasabee-markerlist-sortasc",

  _displayDialog: async function () {
    const operation = getSelectedOperation();
    loadFaked(operation);

    this.sortable = this.getListDialogContent(operation, operation.markers);

    const buttons = {};
    buttons[wX("CLEAR MARKERS")] = () => {
      clearAllMarkers(getSelectedOperation());
    };

    buttons[wX("OK")] = () => {
      this.closeDialog();
    };

    await this.sortable.done;

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
    if (!this.sortable) return;
    const operation = getSelectedOperation();
    this.setTitle(wX("MARKER_LIST", { opName: operation.name }));
    this.sortable = this.getListDialogContent(operation, operation.markers);
    await this.sortable.done;
    this.setContent(this.sortable.table);
  },
});

export default MarkerList;
