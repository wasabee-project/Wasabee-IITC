import { WDialog } from "../leafletClasses";
import Sortable from "../../lib/sortable";
import AssignDialog from "./assignDialog";
import SetCommentDialog from "./setCommentDialog";
import ConfirmDialog from "./confirmDialog";
import { getAgent } from "../server";
import OverflowMenu from "../overflowMenu";
import wX from "../wX";

const LinkListDialog = WDialog.extend({
  statics: {
    TYPE: "linkListDialog"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = LinkListDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
    this._title = wX("NO_TITLE");
    this._label = wX("NO_LABEL");
    this.placeholder = "";
    this.current = "";
  },

  addHooks: function() {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    const context = this;
    this._UIUpdateHook = newOpData => {
      context.updateLinkList(newOpData);
    };
    window.addHook("wasabeeUIUpdate", this._UIUpdateHook);
    this._displayDialog();
  },

  removeHooks: function() {
    WDialog.prototype.removeHooks.call(this);
    window.removeHook("wasabeeUIUpdate", this._UIUpdateHook);
  },

  _displayDialog: function() {
    if (!this._map) return;

    this._dialog = window.dialog({
      title: this._portal.name + wX("LINKS2"),
      width: "auto",
      height: "auto",
      html: this._table.table,
      dialogClass: "wasabee-dialog wasabee-dialog-linklist",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      resizable: true,
      id: window.plugin.wasabee.static.dialogNames.linkList
    });
  },

  setup: function(operation, portal) {
    this._portal = portal;
    this._operation = operation;
    this._table = new Sortable();
    this._table.fields = [
      {
        name: "Order",
        value: link => link.order,
        sort: (a, b) => {
          return a - b;
        },
        format: (a, m) => {
          a.textContent = m;
        }
      },
      {
        name: "From",
        value: link => this._operation.getPortal(link.fromPortalId),
        sortValue: b => b.name,
        sort: (a, b) => a.localeCompare(b),
        format: (d, data) => d.appendChild(data.displayFormat(this._operation))
      },
      {
        name: "To",
        value: link => this._operation.getPortal(link.toPortalId),
        sortValue: b => b.name,
        sort: (a, b) => a.localeCompare(b),
        format: (d, data) => d.appendChild(data.displayFormat(this._operation))
      },
      {
        name: "Length",
        value: link => link.length(this._operation),
        format: (a, m) => {
          a.classList.add("length");
          a.textContent =
            m > 1e3 ? (m / 1e3).toFixed(1) + "km" : m.toFixed(1) + "m";
        }
      },
      {
        name: "Min Lvl",
        title: wX("MIN_SRC_PORT_LVL"),
        value: link => link.length(this._operation),
        format: (cell, d, link) => {
          cell.appendChild(link.minLevel(this._operation));
        }
      },
      {
        name: "Comment",
        value: link => link.comment,
        sort: (a, b) => a.localeCompare(b),
        format: (row, obj, link) => {
          row.className = "desc";
          if (obj != null) {
            const comment = L.DomUtil.create("a", null, row);
            comment.textContent = window.escapeHtmlSpecialChars(obj);
            L.DomEvent.on(comment, "click", () => {
              const scd = new SetCommentDialog(window.map);
              scd.setup(link, operation);
              scd.enable();
            });
          }
        }
      },
      {
        name: "Assigned To",
        value: link => {
          if (link.assignedTo != null && link.assignedTo != "") {
            const agent = getAgent(link.assignedTo);
            if (agent != null) {
              return agent.name;
            } else {
              return "looking up: [" + link.assignedTo + "]";
            }
          }
          return "";
        },
        sort: (a, b) => a.localeCompare(b),
        format: (a, m, link) => {
          const assignee = L.DomUtil.create("a", null, a);
          assignee.textContent = m;
          if (this._operation.IsServerOp() && this._operation.IsWritableOp()) {
            L.DomEvent.on(assignee, "click", () => {
              const ad = new AssignDialog();
              ad.setup(link, this._operation);
              ad.enable();
            });
          }
        }
      },
      {
        name: "Color",
        value: link => link.color,
        sort: null,
        format: (list, data, link) => {
          this.makeColorMenu(list, data, link);
        }
      },
      {
        name: "",
        sort: null,
        value: link => link,
        format: (o, e) => this.makeMenu(o, e)
      }
    ];
    this._table.sortBy = 0;
    this._table.items = this._operation.getLinkListFromPortal(this._portal);
  },

  deleteLink: function(link, operation) {
    const con = new ConfirmDialog(window.map);
    const prompt = L.DomUtil.create("div");
    prompt.textContent = wX("CONFIRM_DELETE");
    prompt.appendChild(link.displayFormat(operation));
    con.setup("Delete Link", prompt, () => {
      this._operation.removeLink(link.fromPortalId, link.toPortalId);
    });
    con.enable();
  },

  makeMenu: function(list, data) {
    const state = new OverflowMenu();
    const options = [
      {
        label: "Reverse",
        onclick: () => {
          this._operation.reverseLink(data.fromPortalId, data.toPortalId);
        }
      },
      {
        label: "Delete",
        onclick: () => this.deleteLink(data, this._operation)
      },
      {
        label: "Set Comment",
        onclick: () => {
          const scd = new SetCommentDialog(window.map);
          scd.setup(data, this._operation);
          scd.enable();
        }
      }
    ];
    if (this._operation.IsServerOp() && this._operation.IsWritableOp()) {
      options.push({
        label: "Assign",
        onclick: () => {
          const ad = new AssignDialog();
          ad.setup(data, this._operation);
          ad.enable();
        }
      });
    }
    state.items = options;
    list.className = "menu";
    list.appendChild(state.button);
  },

  makeColorMenu: function(list, data, link) {
    const colorSection = L.DomUtil.create("div", null, list);
    const linkColor = L.DomUtil.create("select", null, colorSection);
    linkColor.id = link.ID;

    for (const style of window.plugin.wasabee.static.layerTypes) {
      if (style[0] == "SE" || style[0] == "self-block") continue;
      const a = style[1];
      const option = L.DomUtil.create("option");
      option.setAttribute("value", a.name);
      if (a.name == "main") {
        a.displayName = "Op Color";
      }
      if (a.name == data) {
        option.setAttribute("selected", true);
      }
      option.innerHTML = a.displayName;
      linkColor.append(option);
    }

    linkColor.addEventListener(
      "change",
      () => {
        link.color = linkColor.value;
        this._operation.update();
      },
      false
    );
  },

  updateLinkList: function(operation) {
    if (!this._enabled) return;
    if (this._operation.ID == operation.ID) {
      this._table.items = operation.getLinkListFromPortal(this._portal);
    } else {
      // the selected operation changed, just bail
      this._dialog.dialog("close");
    }
  }
});

export default LinkListDialog;
