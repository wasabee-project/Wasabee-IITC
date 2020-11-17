import { WDialog } from "../leafletClasses";
import Sortable from "../../lib/sortable";
import AssignDialog from "./assignDialog";
import SetCommentDialog from "./setCommentDialog";
import ConfirmDialog from "./confirmDialog";
import WasabeeAgent from "../agent";
import wX from "../wX";
// import WasabeeMe from "../me";
import { getSelectedOperation } from "../selectedOp";
// import WasabeeOp from "../operation";

const LinkListDialog = WDialog.extend({
  statics: {
    TYPE: "linkListDialog",
  },

  initialize: function (map = window.map, options) {
    WDialog.prototype.initialize.call(this, map, options);
    this._title = wX("NO_TITLE");
    this._label = wX("NO_LABEL");
    this.placeholder = "";
    this.current = "";
  },

  addHooks: function () {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    window.map.on("wasabeeUIUpdate", this.updateLinkList, this);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.map.off("wasabeeUIUpdate", this.updateLinkList, this);
  },

  _displayDialog: function () {
    const buttons = {};
    buttons[wX("OK")] = () => {
      this._dialog.dialog("close");
    };

    this._dialog = window.dialog({
      title: this._portal.displayName + wX("LINKS2"),
      html: this._table.table,
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-linklist",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.linkList,
    });
    this._dialog.dialog("option", "buttons", buttons);
  },

  setup: function (UNUSED, portal) {
    this._portal = portal;
    const operation = getSelectedOperation();
    this._opID = operation.ID;
    this._table = new Sortable();
    this._table.fields = [
      {
        name: "Order",
        value: (link) => link.throwOrderPos,
      },
      {
        name: "From",
        value: (link) => operation.getPortal(link.fromPortalId),
        sortValue: (portal) => portal.name,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, portal) =>
          cell.appendChild(portal.displayFormat(operation)),
      },
      {
        name: "To",
        value: (link) => operation.getPortal(link.toPortalId),
        sortValue: (portal) => portal.name,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, portal) =>
          cell.appendChild(portal.displayFormat(operation)),
      },
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
      {
        name: "Comment",
        value: (link) => link.comment,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, data, link) => {
          cell.className = "desc";
          if (data != null) {
            const comment = L.DomUtil.create("a", null, cell);
            comment.textContent = window.escapeHtmlSpecialChars(data);
            L.DomEvent.on(cell, "click", (ev) => {
              L.DomEvent.stop(ev);
              const scd = new SetCommentDialog(window.map);
              scd.setup(link, operation);
              scd.enable();
            });
          }
        },
        smallScreenHide: true,
      },
      {
        name: "Assigned To",
        value: (link) => {
          if (link.assignedTo != null && link.assignedTo != "") {
            const agent = WasabeeAgent.cacheGet(link.assignedTo);
            if (agent != null) return agent.name;
            // we can't use async here, so just request it now and it should be in cache next time
            WasabeeAgent.waitGet(link.assignedTo);
            return "GID: [" + link.assignedTo + "]";
          }

          return "";
        },
        sort: (a, b) => a.localeCompare(b),
        format: (a, m, link) => {
          const assignee = L.DomUtil.create("a", null, a);
          assignee.textContent = m;
          if (operation.IsServerOp() && operation.IsWritableOp()) {
            L.DomEvent.on(a, "click", (ev) => {
              L.DomEvent.stop(ev);
              const ad = new AssignDialog();
              ad.setup(link);
              ad.enable();
            });
          }
        },
        smallScreenHide: true,
      },
      /* {
        name: "Color",
        value: (link) => link.color,
        format: (cell, data, link) => {
          this.makeColorMenu(cell, data, link);
        },
        smallScreenHide: true,
      }, */
      {
        name: "Reverse",
        value: (link) => link.fromPortalId,
        format: (cell, data, link) => {
          const d = L.DomUtil.create("a", null, cell);
          d.href = "#";
          d.textContent = "Reverse";
          L.DomEvent.on(d, "click", (ev) => {
            L.DomEvent.stop(ev);
            operation.reverseLink(link.fromPortalId, link.toPortalId);
          });
        },
      },
      {
        name: wX("DELETE_LINK"),
        sort: null,
        value: (link) => link,
        format: (cell, data, link) => {
          const d = L.DomUtil.create("a", null, cell);
          d.href = "#";
          d.textContent = wX("DELETE_LINK");
          L.DomEvent.on(d, "click", (ev) => {
            L.DomEvent.stop(ev);
            this.deleteLink(link);
          });
        },
      },
    ];
    this._table.sortBy = 0;
    this._table.items = operation.getLinkListFromPortal(this._portal);
  },

  deleteLink: function (link) {
    const con = new ConfirmDialog(window.map);
    const prompt = L.DomUtil.create("div");
    prompt.textContent = wX("CONFIRM_DELETE");
    const operation = getSelectedOperation();
    prompt.appendChild(link.displayFormat(operation));
    con.setup("Delete Link", prompt, () => {
      operation.removeLink(link.fromPortalId, link.toPortalId);
    });
    con.enable();
  },

  /* makeColorMenu: function (list, data, link) {
    const operation = getSelectedOperation();
    const colorSection = L.DomUtil.create("div", null, list);
    const linkColor = L.DomUtil.create("select", null, colorSection);
    linkColor.id = link.ID;

    for (const style of window.plugin.wasabee.skin.layerTypes.values()) {
      const option = L.DomUtil.create("option");
      option.value = style.name;
      if (style.name == "main") style.displayName = "Op Color";
      if (style.name == data) option.selected = true;
      option.innerHTML = style.displayName;
      linkColor.append(option);
    }

    // TODO: picker here
    // custom color
    if (WasabeeOp.newColors(data) == data) {
      const option = L.DomUtil.create("option");
      option.value = data;
      option.selected = true;
      option.textContent = `Custom ${data}`;
      linkColor.append(option);
    }

    linkColor.addEventListener(
      "change",
      () => {
        link.setColor(linkColor.value, operation);
      },
      false
    );
  }, */

  updateLinkList: function () {
    const operation = getSelectedOperation();
    if (!this._enabled) return;
    if (this._opID == operation.ID) {
      this._table.items = operation.getLinkListFromPortal(this._portal);
    } else {
      // the selected operation changed, just bail
      this._dialog.dialog("close");
    }
  },
});

export default LinkListDialog;
