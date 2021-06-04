import OperationChecklistDialog from "./checklist.js";
import wX from "../wX";
import { loadFaked } from "../uiCommands";
import { getSelectedOperation } from "../selectedOp";

const LinkListDialog = OperationChecklistDialog.extend({
  statics: {
    TYPE: "linkListDialog",
  },

  options: {
    usePane: true,
    // portal
  },

  getFields: function (operation) {
    const fields = OperationChecklistDialog.prototype.getFields.call(
      this,
      operation
    );
    const linkFields = [
      {
        name: "Length",
        value: (link) => link.length(operation),
        format: (cell, data) => {
          cell.classList.add("length");
          cell.textContent =
            data > 1e3 ? (data / 1e3).toFixed(1) + "km" : data.toFixed(1) + "m";
        },
        smallScreenHide: true,
      },
      {
        name: "Min Lvl",
        title: wX("MIN_SRC_PORT_LVL"),
        value: (link) => link.length(operation),
        format: (cell, data, link) => {
          cell.appendChild(link.minLevel(operation));
        },
        smallScreenHide: true,
      },
    ];
    return fields.slice(0, 2).concat(linkFields, fields.slice(3));
  },

  _displayDialog: function () {
    const operation = getSelectedOperation();
    loadFaked(operation);
    this.sortable = this.getListDialogContent(
      operation,
      operation.getLinkListFromPortal(this.options.portal),
      0,
      false
    ); // defaults to sorting by op order

    const buttons = {};
    buttons[wX("OK")] = () => {
      this.closeDialog();
    };

    this.createDialog({
      title: this.options.portal.displayName + wX("LINKS2"),
      html: this.sortable.table,
      width: "auto",
      dialogClass: "linklist",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.linkList,
    });
  },

  update: async function () {
    const operation = getSelectedOperation();
    this.sortable = this.getListDialogContent(
      operation,
      operation.getLinkListFromPortal(this.options.portal),
      this.sortable.sortBy,
      this.sortable.sortAsc
    );
    await this.sortable.done;
    this.setContent(this.sortable.table);
    this.setTitle(this.options.portal.displayName + wX("LINKS2"));
  },
});

export default LinkListDialog;
