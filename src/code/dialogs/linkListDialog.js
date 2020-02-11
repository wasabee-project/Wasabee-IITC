import { Feature } from "../leafletDrawImports";
import Sortable from "../../lib/sortable";
import AssignDialog from "./assignDialog";
import SetCommentDialog from "./setCommentDialog";
import ConfirmDialog from "./confirmDialog";
import { getAgent } from "../server";

const LinkListDialog = Feature.extend({
  statics: {
    TYPE: "linkListDialog"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = LinkListDialog.TYPE;
    Feature.prototype.initialize.call(this, map, options);
    this._title = "No title set";
    this._label = "No label set";
    this.placeholder = "";
    this.current = "";
  },

  addHooks: function() {
    if (!this._map) return;
    Feature.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
  },

  _displayDialog: function() {
    if (!this._map) return;
    const callback = newOpData => updateLinkList(newOpData, this);
    window.addHook("wasabeeUIUpdate", callback);

    this._dialog = window.dialog({
      title: this._portal.name + ": Links",
      width: "auto",
      height: "auto",
      html: this._table.table,
      dialogClass: "wasabee-dialog wasabee-dialog-linklist",
      closeCallback: () => {
        window.removeHook("wasabeeUIUpdate", callback);
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.Wasabee.static.dialogNames.linkList
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
        title: "Minimum level required on source portal",
        value: link => link.length(this._operation),
        format: (a, b) => {
          var s;
          if (b > 6881280) {
            s = "impossible";
          } else {
            if (b > 1966080) {
              s = "L8+some VRLA";
              a.title =
                "Depending on the number and type Link Amps used, a lower source portal level might suffice.";
              a.classList.add("help");
            } else {
              if (b > 655360) {
                s = "L8+some LA";
                a.title =
                  "Depending on the number and type Link Amps used, a lower source portal level might suffice.";
                a.classList.add("help");
              } else {
                var d = Math.max(1, Math.ceil(8 * Math.pow(b / 160, 0.25)) / 8);
                var msd = 8 * (d - Math.floor(d));
                s = "L" + d;
                if (0 != msd) {
                  if (!(1 & msd)) {
                    s = s + "\u2007";
                  }
                  if (!(1 & msd || 2 & msd)) {
                    s = s + "\u2007";
                  }
                  s =
                    s +
                    (" = L" +
                      Math.floor(d) +
                      "0\u215b\u00bc\u215c\u00bd\u215d\u00be\u215e".charAt(
                        msd
                      ));
                }
              }
            }
          }
          a.textContent = s;
        }
      },
      {
        name: "Comment",
        value: link => link.comment,
        sort: (a, b) => a.localeCompare(b),
        format: (row, obj, link) => {
          row.className = "desc";
          if (obj != null) {
            const comment = row.appendChild(document.createElement("a"));
            comment.innerHTML = window.escapeHtmlSpecialChars(obj);
            row.addEventListener(
              "click",
              () => {
                const scd = new SetCommentDialog(window.map);
                scd.setup(link, operation);
                scd.enable();
              },
              false
            );
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
          const assignee = a.appendChild(document.createElement("a"));
          assignee.innerHTML = m;
          if (this._operation.IsServerOp()) {
            a.addEventListener(
              "click",
              () => {
                const ad = new AssignDialog();
                ad.setup(link, this._operation);
                ad.enable();
              },
              false
            );
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
    const prompt = document.createElement("div");
    prompt.innerHTML = "Do you really want to delete this link: ";
    prompt.appendChild(link.displayFormat(operation));
    con.setup("Delete Link", prompt, () => {
      this._operation.removeLink(link.fromPortalId, link.toPortalId);
    });
    con.enable();
  },

  makeMenu: function(list, data) {
    const state = new window.plugin.Wasabee.OverflowMenu();
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
    if (this._operation.IsServerOp()) {
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
    const colorSection = list.appendChild(document.createElement("div"));
    const linkColor = colorSection.appendChild(
      document.createElement("select")
    );
    linkColor.id = link.ID;

    window.plugin.Wasabee.layerTypes.forEach(function(a) {
      const option = document.createElement("option");
      option.setAttribute("value", a.name);
      if (a.name == "main") {
        a.displayName = "Op Color";
      }
      if (a.name == data) {
        option.setAttribute("selected", true);
      }
      option.innerHTML = a.displayName;
      linkColor.append(option);
    });

    linkColor.addEventListener(
      "change",
      () => {
        link.color = linkColor.value;
        this._operation.update();
      },
      false
    );
  }
});

const updateLinkList = (operation, ll) => {
  if (ll._operation.ID == operation.ID) {
    ll._table.items = operation.getLinkListFromPortal(ll._portal);
  } else {
    // the selected operation changed, just bail
    ll._dialog.dialog("close");
  }
};

export default LinkListDialog;
