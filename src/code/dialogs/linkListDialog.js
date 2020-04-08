import { WDialog } from "../leafletClasses";
import Sortable from "../../lib/sortable";
import AssignDialog from "./assignDialog";
import SetCommentDialog from "./setCommentDialog";
import ConfirmDialog from "./confirmDialog";
import { getAgent } from "../server";
import wX from "../wX";
import WasabeeMe from "../me";

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
        value: link => link.throwOrderPos
        // , sort: (a, b) => { return a - b; }
        // , format: (cell, value, obj) => { console.log(value, obj); cell.textContent = value; }
      },
      {
        name: "From",
        value: link => this._operation.getPortal(link.fromPortalId),
        sortValue: b => b.name,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, data) =>
          cell.appendChild(data.displayFormat(this._operation))
      },
      {
        name: "To",
        value: link => this._operation.getPortal(link.toPortalId),
        sortValue: b => b.name,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, data) =>
          cell.appendChild(data.displayFormat(this._operation))
      },
      {
        name: "Length",
        value: link => link.length(this._operation),
        format: (cell, data) => {
          cell.classList.add("length");
          cell.textContent =
            data > 1e3 ? (data / 1e3).toFixed(1) + "km" : data.toFixed(1) + "m";
        },
        smallScreenHide: true
      },
      {
        name: "Min Lvl",
        title: wX("MIN_SRC_PORT_LVL"),
        value: link => link.length(this._operation),
        format: (cell, data, link) => {
          cell.appendChild(link.minLevel(this._operation));
        },
        smallScreenHide: true
      },
      {
        name: "Comment",
        value: link => link.comment,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, data, link) => {
          cell.className = "desc";
          if (data != null) {
            const comment = L.DomUtil.create("a", null, cell);
            comment.textContent = window.escapeHtmlSpecialChars(data);
            L.DomEvent.on(cell, "click", () => {
              const scd = new SetCommentDialog(window.map);
              scd.setup(link, operation);
              scd.enable();
            });
          }
        },
        smallScreenHide: true
      },
      {
        name: "Assigned To",
        value: link => {
          if (link.assignedTo != null && link.assignedTo != "") {
            if (!WasabeeMe.isLoggedIn()) return "not logged in";
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
            L.DomEvent.on(a, "click", () => {
              const ad = new AssignDialog();
              ad.setup(link, this._operation);
              ad.enable();
            });
          }
        },
        smallScreenHide: true
      },
      {
        name: "Color",
        value: link => link.color,
        // sort: null,
        format: (cell, data, link) => {
          this.makeColorMenu(cell, data, link);
        },
        smallScreenHide: true
      },
      {
        name: wX("DELETE_LINK"),
        sort: null,
        value: link => link,
        format: (cell, data, link) => {
          const d = L.DomUtil.create("a", null, cell);
          d.href = "#";
          d.textContent = wX("DELETE_LINK");
          L.DomEvent.on(d, "click", () => {
            this.deleteLink(link);
          });
        }
      }
    ];
    this._table.sortBy = 0;
    this._table.items = this._operation.getLinkListFromPortal(this._portal);
  },

  deleteLink: function(link) {
    const con = new ConfirmDialog(window.map);
    const prompt = L.DomUtil.create("div");
    prompt.textContent = wX("CONFIRM_DELETE");
    prompt.appendChild(link.displayFormat(this._operation));
    con.setup("Delete Link", prompt, () => {
      this._operation.removeLink(link.fromPortalId, link.toPortalId);
    });
    con.enable();
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
