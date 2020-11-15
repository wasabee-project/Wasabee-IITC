import WasabeeOp from "../operation";
import { WDialog } from "../leafletClasses";
import ConfirmDialog from "./confirmDialog";
import {
  getSelectedOperation,
  makeSelectedOperation,
  opsList,
  removeOperation,
  resetHiddenOps,
  hiddenOpsList,
  showOperation,
  hideOperation,
  changeOpIfNeeded,
} from "../selectedOp";
import OpPermList from "./opPerms";
import wX from "../wX";
import { postToFirebase } from "../firebaseSupport";
import WasabeeMe from "../me";
import WasabeeAgent from "../agent";
import GetWasabeeServer from "../server";
import { syncOp } from "../uiCommands";

const OpsDialog = WDialog.extend({
  statics: {
    TYPE: "opsDialog",
  },

  initialize: function (map = window.map, options) {
    this.type = OpsDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
    postToFirebase({ id: "analytics", action: OpsDialog.TYPE });
  },

  addHooks: function () {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();

    const context = this;
    this._UIUpdateHook = () => {
      context.update();
    };
    window.addHook("wasabeeUIUpdate", this._UIUpdateHook);
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.removeHook("wasabeeUIUpdate", this._UIUpdateHook);
  },

  _displayDialog: function () {
    this.makeContent(getSelectedOperation());

    const buttons = {};
    buttons[wX("OK")] = () => {
      this._dialog.dialog("close");
    };
    buttons["Unhide all OPs"] = () => {
      resetHiddenOps();
      this.update();
    };

    this._dialog = window.dialog({
      title: wX("OPERATIONS"),
      html: this._content,
      height: "auto",
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-ops",
      closeCallback: () => {
        this.disable();
        delete this._content;
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.opsList,
    });
    this._dialog.dialog("option", "buttons", buttons);
  },

  update: function () {
    if (this._enabled && this._dialog && this._dialog.html) {
      this.makeContent(getSelectedOperation());
      this._dialog.html(this._content);
    }
  },

  makeContent: function (selectedOp) {
    const container = L.DomUtil.create("div", "container");
    const opTable = L.DomUtil.create(
      "tbody",
      "",
      L.DomUtil.create("table", "wasabee-table", container)
    );

    const showHiddenOps =
      localStorage[
        window.plugin.wasabee.static.constants.OPS_SHOW_HIDDEN_OPS
      ] !== "false";

    const ol = opsList(showHiddenOps);
    const data = new Map();
    data.set("", []);
    for (const opID of ol) {
      const tmpOp = WasabeeOp.load(opID);
      if (!tmpOp) continue;
      const server = tmpOp.server || "";
      if (!data.has(server)) data.set(server, []);
      data.get(server).push({
        id: opID,
        name: tmpOp.name,
        localchanged: tmpOp.localchanged,
        remotechanged: tmpOp.remoteChanged,
        fetched: tmpOp.fetched,
        local: tmpOp.fetched === null,
        owner: tmpOp.creator,
        perm: tmpOp.getPermission(),
      });
    }
    const hiddenOps = hiddenOpsList();

    for (const server of [...data.keys()].sort()) {
      const ops = data
        .get(server)
        .sort((a, b) =>
          a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        );
      const serverRow = L.DomUtil.create("tr", "servername", opTable);
      const serverTh = L.DomUtil.create("th", "", serverRow);
      serverTh.colSpan = 5;
      serverTh.textContent = server;

      const isLocal = server == "";
      if (isLocal) {
        serverTh.textContent = "Local";
        serverTh.colSpan = 1;
        const hideOps = L.DomUtil.create("th", "show-hidden-ops", serverRow);
        hideOps.colSpan = 4;
        const label = L.DomUtil.create("label", null, hideOps);
        label.htmlFor = "show-hidden-ops";
        label.textContent = "Show hidden OPs";
        const checkbox = L.DomUtil.create("input", null, hideOps);
        checkbox.id = "show-hidden-ops";
        checkbox.type = "checkbox";
        checkbox.checked = showHiddenOps;
        L.DomEvent.on(checkbox, "change", (ev) => {
          L.DomEvent.stop(ev);
          localStorage[
            window.plugin.wasabee.static.constants.OPS_SHOW_HIDDEN_OPS
          ] = checkbox.checked;
          this.update();
        });
      }

      for (const op of ops) {
        const opRow = L.DomUtil.create("tr", "op", opTable);
        {
          const opName = L.DomUtil.create("td", "opname", opRow);
          const link = L.DomUtil.create("a", "", opName);
          link.href = "#";
          link.textContent = op.name;
          if (!isLocal) {
            link.title = `Last fetched: ${op.fetched}\n`;
            if (op.localchanged) link.title += "Local has changed\n";
            if (op.remotechanged) link.title += "Remote has changed";
          }
          if (op.id == selectedOp.ID) link.classList.add("enl");
          L.DomEvent.on(link, "click", (ev) => {
            L.DomEvent.stop(ev);
            const newop = makeSelectedOperation(op.id);
            const mbr = newop.mbr;
            if (
              mbr &&
              isFinite(mbr._southWest.lat) &&
              isFinite(mbr._northEast.lat)
            ) {
              this._map.fitBounds(mbr);
            }
          });
        }
        {
          const opStatus = L.DomUtil.create("td", "opstatus", opRow);
          const status = L.DomUtil.create("span", "", opStatus);
          status.textContent = "";
          if (!op.local) {
            if (isLocal) {
              status.textContent = "!";
              status.style.color = "red";
            } else {
              status.style.color = "red";
              if (op.localchanged) status.textContent += "↑";
              if (op.remotechanged) status.textContent += "↓";
            }
          }
        }
        {
          const opOwner = L.DomUtil.create("td", "opowner", opRow);
          const agent = WasabeeAgent.cacheGet(op.owner);
          if (agent != null) opOwner.appendChild(agent.formatDisplay());
          else if (op.local) opOwner.append(window.PLAYER.nickname);
          else {
            const placeholder = L.DomUtil.create("div", "", opOwner);
            if (WasabeeMe.isLoggedIn()) {
              placeholder.textContent = "looking up: [" + op.owner + "]";
              WasabeeAgent.waitGet(op.owner).then((agent) => {
                placeholder.remove();
                opOwner.appendChild(agent.formatDisplay());
              });
            } else {
              // it is the local agent anyway
              placeholder.textContent = "";
            }
          }
        }
        {
          const opPerm = L.DomUtil.create("td", "opperm", opRow);
          let text = wX("ASSIGNED_ONLY_SHORT");
          if (op.perm == "read") text = wX("READ_SHORT");
          else if (op.perm == "write") text = wX("WRITE_SHORT");
          if (op.id == selectedOp.ID) {
            const perm = L.DomUtil.create("a", "", opPerm);
            perm.textContent = text;
            L.DomEvent.on(perm, "click", (ev) => {
              L.DomEvent.stop(ev);
              const opl = new OpPermList();
              opl.enable();
            });
          } else {
            const perm = L.DomUtil.create("span", "", opPerm);
            perm.textContent = text;
          }
        }
        {
          const actions = L.DomUtil.create("td", "actions", opRow);

          // hide
          const hide = L.DomUtil.create("a", "", actions);
          const hidden = hiddenOps.includes(op.id);
          hide.href = "#";
          hide.textContent = hidden ? "☽" : "👀";
          hide.title = (hidden ? "Show " : "Hide ") + op.name;
          L.DomEvent.on(hide, "click", (ev) => {
            L.DomEvent.stop(ev);
            if (hidden) showOperation(op.id);
            else hideOperation(op.id);
            this.update();
          });

          // delete locally
          const deleteLocaly = L.DomUtil.create("a", "", actions);
          deleteLocaly.href = "#";
          deleteLocaly.textContent = "🗑️";
          deleteLocaly.title = wX("REM_LOC_CP", op.name);
          L.DomEvent.on(deleteLocaly, "click", (ev) => {
            L.DomEvent.stop(ev);
            // this should be moved to uiCommands
            const con = new ConfirmDialog(window.map);
            con.setup(
              wX("REM_LOC_CP", op.name),
              wX("YESNO_DEL", op.name),
              () => {
                removeOperation(op.id);
                const newop = changeOpIfNeeded();
                const mbr = newop.mbr;
                if (
                  mbr &&
                  isFinite(mbr._southWest.lat) &&
                  isFinite(mbr._northEast.lat)
                ) {
                  this._map.fitBounds(mbr);
                }
              }
            );
            con.enable();
          });

          if (WasabeeMe.isLoggedIn() && server == GetWasabeeServer()) {
            // download op
            const download = L.DomUtil.create("a", "", actions);
            download.href = "#";
            download.textContent = "↻";
            download.title = "Download " + op.name;
            L.DomEvent.on(download, "click", (ev) => {
              L.DomEvent.stop(ev);
              syncOp(op.id);
            });
          }
        }
      }
    }

    this._content = container;
  },
});

export default OpsDialog;
