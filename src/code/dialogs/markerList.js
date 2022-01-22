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

    if (localStorage[this.SORTBY_KEY] == null) {
      localStorage[this.SORTBY_KEY] = 0;
    }
    if (localStorage[this.SORTASC_KEY] == null) {
      localStorage[this.SORTASC_KEY] = "true";
    }

    this.sortable = this.getListDialogContent(
      operation,
      operation.markers,
      localStorage[this.SORTBY_KEY],
      localStorage[this.SORTASC_KEY] == "true"
    );

    // where to save the column and dir when changed
    this.sortable.sortByStoreKey = this.SORTBY_KEY;
    this.sortable.sortAscStoreKey = this.SORTASC_KEY;

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
    this.sortable = this.getListDialogContent(
      operation,
      operation.markers,
      localStorage[this.SORTBY_KEY],
      localStorage[this.SORTASC_KEY] == "true"
    );
    await this.sortable.done;
    this.setContent(this.sortable.table);
  },
});

export default MarkerList;
