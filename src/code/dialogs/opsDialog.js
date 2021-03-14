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
import GetWasabeeServer from "../server";
import { syncOp, deleteLocalOp } from "../uiCommands";

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
    const content = await this.makeContent(getSelectedOperation());

    const buttons = {};
    buttons[wX("OK")] = () => {
      this.closeDialog();
    };
    buttons["Unhide all OPs"] = () => {
      resetHiddenOps();
      this.update();
    };

    this.createDialog({
      title: wX("OPERATIONS"),
      html: content,
      height: "auto",
      width: "auto",
      dialogClass: "ops",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.opsList,
    });
  },

  update: async function () {
    if (this._enabled) {
      const content = await this.makeContent(getSelectedOperation());
      this.setContent(content);
    }
  },

  makeContent: async function (selectedOp) {
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

    const ol = await opsList(showHiddenOps);
    const data = new Map();
    data.set("", []);
    for (const opID of ol) {
      const tmpOp = await WasabeeOp.load(opID);
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
          }
        }
        {
          const opOwner = L.DomUtil.create("td", "opowner", opRow);
          if (op.local) opOwner.append(window.PLAYER.nickname);
          else {
            const placeholder = L.DomUtil.create("div", "", opOwner);
            if (WasabeeMe.isLoggedIn()) {
              placeholder.textContent = "looking up: [" + op.owner + "]";
              // is this redundant with above?  // XXX
              WasabeeAgent.get(op.owner).then((agent) => {
                placeholder.remove();
                opOwner.appendChild(agent.name); // XXX brain to tired to figure out how to await agent.formatDisplay() here
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
            deleteLocalOp(op.name, op.id);
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

    return container;
  },
});

export default OpsDialog;
