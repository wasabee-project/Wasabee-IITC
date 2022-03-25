import WasabeeOp from "../model/operation";
import { WDialog } from "../leafletClasses";
import {
  getSelectedOperation,
  makeSelectedOperation,
  opsList,
  resetHiddenOps,
  hiddenOpsList,
  showOperation,
  hideOperation,
  setOpBackground,
} from "../selectedOp";
import OpPermList from "./opPerms";
import wX from "../wX";
import WasabeeMe from "../model/me";
import WasabeeAgent from "../model/agent";
import { syncOp, deleteLocalOp, zoomToOperation } from "../uiCommands";
import Sortable from "../sortable";

import AgentUI from "../ui/agent";
import { appendFAIcon } from "../auxiliar";

const OpsDialog = WDialog.extend({
  statics: {
    TYPE: "opsDialog",
  },

  SORTBY_KEY: "wasabee-opslist-sortby",
  SORTASC_KEY: "wasabee-opslist-sortasc",

  options: {
    usePane: true,
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    window.map.on("wasabee:op:select wasabee:op:change", this.update, this);
    window.map.on("wasabee:fullsync", this.update, this);
    window.map.on("wasabee:logout", this.update, this);
    window.map.on("wasabee:op:delete", this.update, this);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.map.off("wasabee:op:select wasabee:op:change", this.update, this);
    window.map.off("wasabee:fullsync", this.update, this);
    window.map.off("wasabee:logout", this.update, this);
    window.map.off("wasabee:op:delete", this.update, this);
  },

  _displayDialog: async function () {
    this.initSortable();

    await this.updateSortable();

    const buttons = {};
    // wX
    buttons[wX("dialog.ops_list.unhide_ops")] = () => {
      resetHiddenOps();
      this.update();
    };
    buttons[wX("dialog.ops_list.toggle_hide")] = () => {
      const showHiddenOps =
        localStorage[
          window.plugin.wasabee.static.constants.OPS_SHOW_HIDDEN_OPS
        ] !== "false";
      localStorage[window.plugin.wasabee.static.constants.OPS_SHOW_HIDDEN_OPS] =
        !showHiddenOps;
      this.update();
    };
    buttons[wX("CLOSE")] = () => {
      this.closeDialog();
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
      await this.updateSortable();
      // this.setContent(this.sortable.table);
    }
  },

  initSortable: function () {
    const content = new Sortable();
    content.fields = [
      {
        name: "S",
        value: (op) => op.server,
        // sort: (a, b) => a - b,
        format: (cell, value, op) => {
          cell.textContent = op.server;
        },
      },
      {
        name: wX("dialog.common.name"),
        value: (op) => op.name,
        sort: (a, b) => a.localeCompare(b),
        format: (cell, value, op) => {
          const link = L.DomUtil.create("a", "", cell);
          link.href = "#";
          link.textContent = op.name;
          if (!op.local) {
            link.title =
              wX("dialog.ops_list.last_fetched", { date: op.fetched }) + "\n";
            if (op.localchanged)
              link.title += wX("dialog.ops_list.local_change") + "\n";
            if (op.remotechanged)
              link.title += wX("dialog.ops_list.remote_change") + "\n";
          }
          if (op.id == getSelectedOperation().ID) link.classList.add("enl");
          L.DomEvent.on(link, "click", async (ev) => {
            L.DomEvent.stop(ev);
            await makeSelectedOperation(op.id);
            const newop = getSelectedOperation();
            zoomToOperation(newop);
          });
        },
      },
      {
        name: "",
        value: (op) =>
          1 * op.local + 2 * op.localchanged + 4 * op.remotechanged,
        // sort: (a, b) => a - b,
        format: (cell, value, op) => {
          if (!op.local) {
            if (op.localchanged && !op.remotechanged) {
              appendFAIcon("desktop", cell);
              cell.title = wX("dialog.ops_list.local_change");
            } else if (op.remotechanged) {
              appendFAIcon("server", cell);
              cell.title = wX("dialog.ops_list.remote_change");
            }
          }
        },
      },
      {
        name: wX("dialog.common.owner"),
        value: (op) => op.owner,
        sort: (a, b) => a.localeCompare(b),
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
        name: "Bg",
        value: () => null,
        sort: null,
        format: (cell, value, op) => {
          // background
          const background = L.DomUtil.create("input", null, cell);
          background.type = "checkbox";
          background.checked = op.background;

          background.title = op.background
            ? wX("dialog.ops_list.background_disable")
            : wX("dialog.ops_list.background_enable");
          L.DomEvent.on(background, "change", (ev) => {
            L.DomEvent.stop(ev);
            const background = ev.target;
            // wX
            background.title = background.checked
              ? wX("dialog.ops_list.background_disable")
              : wX("dialog.ops_list.background_enable");
            setOpBackground(op.id, background.checked);
          });
        },
      },
      {
        name: wX("dialog.common.commands_short"),
        value: () => null,
        sort: null,
        className: "actions",
        format: (cell, value, op) => {
          // delete locally
          const deleteLocaly = L.DomUtil.create("a", "", cell);
          deleteLocaly.href = "#";
          appendFAIcon("trash", deleteLocaly);
          deleteLocaly.title = wX("REM_LOC_CP", { opName: op.name });
          L.DomEvent.on(deleteLocaly, "click", (ev) => {
            L.DomEvent.stop(ev);
            deleteLocalOp(op.name, op.id);
          });

          if (op.currentserver) {
            // download op
            const download = L.DomUtil.create("a", "", cell);
            download.href = "#";
            appendFAIcon("sync", download);
            download.title = wX("dialog.ops_list.download", {
              opName: op.name,
            });
            L.DomEvent.on(download, "click", (ev) => {
              L.DomEvent.stop(ev);
              syncOp(op.id);
            });
          }
        },
      },
      {
        name: "V",
        value: () => null,
        sort: null,
        className: "visibility",
        format: (cell, value, op) => {
          // show in the list
          const show = L.DomUtil.create("input", null, cell);
          show.type = "checkbox";
          show.checked = !op.hidden;
          L.DomEvent.on(show, "change", (ev) => {
            L.DomEvent.stop(ev);
            if (show.checked) showOperation(op.id);
            else hideOperation(op.id);
          });
        },
      },
    ];
    content.sortByStoreKey = this.SORTBY_KEY;
    content.sortAscStoreKey = this.SORTASC_KEY;
    this.sortable = content;
  },

  updateSortable: async function () {
    if (!this.sortable) return;
    // collapse markers and links into one array.
    const showHiddenOps =
      localStorage[
        window.plugin.wasabee.static.constants.OPS_SHOW_HIDDEN_OPS
      ] !== "false";

    const me = WasabeeMe.cacheGet();

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
        currentserver: me && tmpOp.isOnCurrentServer(),
        server: "",
        background: tmpOp.background,
      };
      if (sum.currentserver) {
        const agent = await WasabeeAgent.get(tmpOp.creator);
        sum.owner = agent.getName();
        sum.ownerDisplay = AgentUI.formatDisplay(agent);
      } else {
        sum.owner = window.PLAYER.nickname;
      }

      for (const server of window.plugin.wasabee.static.publicServers) {
        if (server.url === tmpOp.server) sum.server = server.short;
      }
      ops.push(sum);
    }

    this.sortable.items = ops;
    await this.sortable.done;

    if (showHiddenOps) this.sortable.table.classList.remove("hideOps");
    else this.sortable.table.classList.add("hideOps");
  },
});

export default OpsDialog;
