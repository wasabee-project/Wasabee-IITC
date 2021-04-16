import WasabeeOp from "../operation";
import { WDialog } from "../leafletClasses";
import {
  getSelectedOperation,
  makeSelectedOperation,
  opsList,
  resetHiddenOps,
  hiddenOpsList,
  showOperation,
  hideOperation,
} from "../selectedOp";
import OpPermList from "./opPerms";
import wX from "../wX";
import WasabeeMe from "../me";
import WasabeeAgent from "../agent";
import { syncOp, deleteLocalOp } from "../uiCommands";
import Sortable from "../sortable";

const OpsDialog = WDialog.extend({
  statics: {
    TYPE: "opsDialog",
  },

  options: {
    usePane: true,
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    window.map.on("wasabeeUIUpdate", this.update, this);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.map.off("wasabeeUIUpdate", this.update, this);
  },

  _displayDialog: async function () {
    this.initSortable();
    await this.updateSortable(0, false);

    const buttons = {};
    // wX
    buttons["Unhide all OPs"] = () => {
      resetHiddenOps();
      this.update();
    };
    buttons["Toggle Show/Hide"] = () => {
      const showHiddenOps =
        localStorage[
          window.plugin.wasabee.static.constants.OPS_SHOW_HIDDEN_OPS
        ] !== "false";
      localStorage[
        window.plugin.wasabee.static.constants.OPS_SHOW_HIDDEN_OPS
      ] = !showHiddenOps;
      this.update();
    };

    this.createDialog({
      title: wX("OPERATIONS"),
      html: this.sortable.table,
      height: "auto",
      width: "auto",
      dialogClass: "ops",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.opsList,
    });
  },

  update: async function () {
    if (this._enabled) {
      await this.updateSortable(this.sortable.sortBy, this.sortable.sortAsc);
      // this.setContent(this.sortable.table);
    }
  },

  makeContent: async function () {
    // const hideOps = L.DomUtil.create("th", "show-hidden-ops", serverRow);
    // hideOps.colSpan = 4;
    // const label = L.DomUtil.create("label", null, hideOps);
    // label.htmlFor = "show-hidden-ops";
    // label.textContent = "Show hidden OPs";
    // const checkbox = L.DomUtil.create("input", null, hideOps);
    // checkbox.id = "show-hidden-ops";
    // checkbox.type = "checkbox";
    // checkbox.checked = showHiddenOps;
    // L.DomEvent.on(checkbox, "change", (ev) => {
    //   L.DomEvent.stop(ev);
    //   localStorage[
    //     window.plugin.wasabee.static.constants.OPS_SHOW_HIDDEN_OPS
    //   ] = checkbox.checked;
    //   this.update();
    // });
  },

  initSortable: function () {
    const content = new Sortable();
    content.fields = [
      {
        name: "S",
        value: (op) => op.server,
        // sort: (a, b) => a - b,
        format: (cell, value, op) => {
          cell.classList.add("opserver");
          cell.textContent = op.server;
        },
      },
      {
        name: "Name",
        value: (op) => op.name,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, op) => {
          cell.classList.add("opname");
          const link = L.DomUtil.create("a", "", cell);
          link.href = "#";
          link.textContent = op.name;
          if (!op.local) {
            link.title = `Last fetched: ${op.fetched}\n`;
            if (op.localchanged) link.title += "Local has changed\n";
            if (op.remotechanged) link.title += "Remote has changed";
          }
          if (op.id == getSelectedOperation().ID) link.classList.add("enl");
          L.DomEvent.on(link, "click", async (ev) => {
            L.DomEvent.stop(ev);
            await makeSelectedOperation(op.id);
            const newop = getSelectedOperation();
            const mbr = newop.mbr;
            if (
              mbr &&
              isFinite(mbr._southWest.lat) &&
              isFinite(mbr._northEast.lat)
            ) {
              window.map.fitBounds(mbr);
            }
          });
        },
      },
      {
        name: "",
        value: (op) =>
          1 * op.local + 2 * op.localchanged + 4 * op.remotechanged,
        // sort: (a, b) => a - b,
        format: (cell, value, op) => {
          cell.classList.add("opstatus");
          const status = L.DomUtil.create("span", "", cell);
          status.textContent = "";
          if (!op.local) {
            if (op.localchanged) {
              status.textContent = "☀";
              status.style.color = "green";
              status.title = "Local changes";
            }
            if (op.remotechanged) {
              status.textContent = "⛅";
              status.style.color = "red";
              status.title = "Local&remote changes";
            }
          }
        },
      },
      {
        name: "Owner",
        value: (op) => op.owner,
        // sort: (a, b) => a - b,
        format: (cell, value, op) => {
          cell.classList.add("opowner");
          if (!op.currentserver) cell.append(op.owner);
          else cell.appendChild(op.ownerDisplay);
        },
      },
      {
        name: "P",
        value: (op) => op.perm,
        format: (cell, value, op) => {
          cell.classList.add("opperm");
          let text = wX("ASSIGNED_ONLY_SHORT");
          if (op.perm == "read") text = wX("READ_SHORT");
          else if (op.perm == "write") text = wX("WRITE_SHORT");
          if (op.id == getSelectedOperation().ID) {
            const perm = L.DomUtil.create("a", "", cell);
            perm.textContent = text;
            L.DomEvent.on(perm, "click", (ev) => {
              L.DomEvent.stop(ev);
              const opl = new OpPermList();
              opl.enable();
            });
          } else {
            const perm = L.DomUtil.create("span", "", cell);
            perm.textContent = text;
          }
        },
      },
      {
        name: "Cmds",
        value: () => "",
        // sort: (a, b) => a - b,
        format: (cell, value, op) => {
          cell.classList.add("actions");
          const hide = L.DomUtil.create("a", "", cell);
          hide.href = "#";
          hide.textContent = op.hidden ? "☽" : "👀";
          hide.title = (op.hidden ? "Show " : "Hide ") + op.name;
          L.DomEvent.on(hide, "click", (ev) => {
            L.DomEvent.stop(ev);
            if (op.hidden) showOperation(op.id);
            else hideOperation(op.id);
            this.update();
          });

          // delete locally
          const deleteLocaly = L.DomUtil.create("a", "", cell);
          deleteLocaly.href = "#";
          deleteLocaly.textContent = "🗑️";
          deleteLocaly.title = wX("REM_LOC_CP", op.name);
          L.DomEvent.on(deleteLocaly, "click", (ev) => {
            L.DomEvent.stop(ev);
            deleteLocalOp(op.name, op.id);
          });

          if (op.currentserver) {
            // download op
            const download = L.DomUtil.create("a", "", cell);
            download.href = "#";
            download.textContent = "↻";
            download.title = "Download " + op.name;
            L.DomEvent.on(download, "click", (ev) => {
              L.DomEvent.stop(ev);
              syncOp(op.id);
            });
          }
        },
      },
    ];
    this.sortable = content;
  },

  updateSortable: async function (sortBy, sortAsc) {
    // collapse markers and links into one array.
    const showHiddenOps =
      localStorage[
        window.plugin.wasabee.static.constants.OPS_SHOW_HIDDEN_OPS
      ] !== "false";

    const ol = await opsList(showHiddenOps);
    const currentOps = this.sortable.items.map((o) => o.id);
    const olSorted = currentOps
      .filter((id) => ol.includes(id))
      .concat(ol.filter((id) => !currentOps.includes(id)));
    const hiddenOps = hiddenOpsList();
    const ops = [];
    for (const opID of olSorted) {
      const tmpOp = await WasabeeOp.load(opID);
      if (!tmpOp) continue;
      const sum = {
        id: opID,
        name: tmpOp.name,
        localchanged: tmpOp.localchanged,
        remotechanged: tmpOp.remoteChanged,
        fetched: tmpOp.fetched,
        local: tmpOp.fetched === null,
        perm: tmpOp.getPermission(),
        hidden: hiddenOps.includes(opID),
        currentserver:
          tmpOp.fetched !== null &&
          WasabeeMe.isLoggedIn() &&
          tmpOp.IsOnCurrentServer(),
        server: "",
      };
      if (sum.currentserver) {
        const agent = await WasabeeAgent.get(tmpOp.creator);
        sum.owner = agent.name;
        sum.ownerDisplay = await agent.formatDisplay();
      } else {
        sum.owner = window.PLAYER.nickname;
      }

      for (const server of window.plugin.wasabee.static.publicServers) {
        if (server.url === tmpOp.server) sum.server = server.short;
      }
      ops.push(sum);
    }
    this.sortable.sortBy = sortBy;
    this.sortable.sortAsc = sortAsc;
    this.sortable.items = ops;
    await this.sortable.done;
  },
});

export default OpsDialog;
