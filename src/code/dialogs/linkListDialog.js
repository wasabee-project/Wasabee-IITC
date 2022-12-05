import OperationChecklistDialog from "./checklist.js";
import wX from "../wX";
import { loadFaked } from "../ui/portal";
import { getSelectedOperation } from "../selectedOp";

import * as PortalUI from "../ui/portal";
import * as LinkUI from "../ui/link";
import statics from "../static";

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
    buttons[wX("dialog.link_list.all_from")] = () => {
      this._setAllLinksDirection(true);
    };
    buttons[wX("dialog.link_list.all_to")] = () => {
      this._setAllLinksDirection(false);
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
      dialogClass: "checklist",
      buttons: buttons,
      id: statics.dialogNames.linkList,
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

  _setAllLinksDirection(from) {
    const operation = getSelectedOperation();
    operation.startBatchMode();
    const links = operation.getLinkListFromPortal(this.options.portal);
    for (const l of links) {
      if (from && l.toPortalId === this.options.portal.id)
        operation.reverseLink(l);
      if (!from && l.fromPortalId === this.options.portal.id)
        operation.reverseLink(l);
    }
    operation.endBatchMode();
  },
});

export default LinkListDialog;
