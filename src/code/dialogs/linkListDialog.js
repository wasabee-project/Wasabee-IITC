import OperationChecklistDialog from "./checklist.js";
import wX from "../wX";
import { loadFaked } from "../uiCommands";
import { getSelectedOperation } from "../selectedOp";

import PortalUI from "../ui/portal";
import LinkUI from "../ui/link";

const LinkListDialog = OperationChecklistDialog.extend({
  statics: {
    TYPE: "linkListDialog",
  },

  SORTBY_KEY: "wasabee-linklist-sortby",
  SORTASC_KEY: "wasabee-linklist-sortasc",

  options: {
    usePane: true,
    // portal
  },

  getFields: function (operation) {
    const fields = OperationChecklistDialog.prototype.getFields.call(
      this,
      operation
    );
    fields[2].name = "";
    const linkFields = [
      {
        name: wX("dialog.link_list.length"),
        value: (link) => link.length(operation),
        format: (cell, data) => {
          cell.classList.add("length");
          cell.textContent =
            data > 1e3 ? (data / 1e3).toFixed(1) + "km" : data.toFixed(1) + "m";
        },
        smallScreenHide: true,
      },
      {
        name: wX("dialog.link_list.level"),
        title: wX("MIN_SRC_PORT_LVL"),
        value: (link) => link.length(operation),
        format: (cell, data, link) => {
          cell.appendChild(LinkUI.minLevel(link, operation));
        },
        smallScreenHide: true,
      },
    ];
    return fields.slice(0, 3).concat(linkFields, fields.slice(3));
  },

  _displayDialog: async function () {
    const operation = getSelectedOperation();
    loadFaked(operation);
    const links = operation.getLinkListFromPortal(this.options.portal);
    const fromCount = links.filter(
      (l) => l.fromPortalId == this.options.portal.id
    ).length;
    const toCount = links.length - fromCount;

    this.sortable = this.getListDialogContent(
      operation,
      links,
      this.SORTBY_KEY,
      this.SORTASC_KEY
    );

    const buttons = {};
    buttons[wX("CLOSE")] = () => {
      this.closeDialog();
    };
    buttons["Toggle Filter"] = () => {
      this.sortable.filter = !this.sortable.filter;
    };
    const picker = this.getBulkPicker();
    buttons["Color Filtered"] = () => {
      picker.click();
    };

    await this.sortable.done;

    this.createDialog({
      title: wX("LINKS2", {
        portalName: PortalUI.displayName(this.options.portal),
        outgoing: fromCount,
        incoming: toCount,
      }),
      html: this.sortable.table,
      width: "auto",
      dialogClass: "linklist",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.linkList,
    });
  },

  update: async function () {
    if (!this.sortable) return;
    const operation = getSelectedOperation();
    const links = operation.getLinkListFromPortal(this.options.portal);
    const fromCount = links.filter(
      (l) => l.fromPortalId == this.options.portal.id
    ).length;
    const toCount = links.length - fromCount;
    this.sortable = this.getListDialogContent(
      operation,
      links,
      this.SORTBY_KEY,
      this.SORTASC_KEY
    );
    await this.sortable.done;
    this.setContent(this.sortable.table);
    this.setTitle(
      wX("LINKS2", {
        portalName: PortalUI.displayName(this.options.portal),
        outgoing: fromCount,
        incoming: toCount,
      })
    );
  },
});

export default LinkListDialog;
