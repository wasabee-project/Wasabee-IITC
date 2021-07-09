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
          cell.appendChild(LinkUI.minLevel(link, operation));
        },
        smallScreenHide: true,
      },
    ];
    return fields.slice(0, 2).concat(linkFields, fields.slice(3));
  },

  _displayDialog: function () {
    const operation = getSelectedOperation();
    loadFaked(operation);
    const links = operation.getLinkListFromPortal(this.options.portal);
    const fromCount = links.filter(
      (l) => l.fromPortalId == this.options.portal.id
    ).length;
    const toCount = links.length - fromCount;

    this.sortable = this.getListDialogContent(operation, links, 0, false); // defaults to sorting by op order

    const buttons = {};
    buttons[wX("OK")] = () => {
      this.closeDialog();
    };

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
    const operation = getSelectedOperation();
    const links = operation.getLinkListFromPortal(this.options.portal);
    const fromCount = links.filter(
      (l) => l.fromPortalId == this.options.portal.id
    ).length;
    const toCount = links.length - fromCount;
    this.sortable = this.getListDialogContent(
      operation,
      links,
      this.sortable.sortBy,
      this.sortable.sortAsc
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
