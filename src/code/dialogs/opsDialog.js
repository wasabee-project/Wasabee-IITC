import { WDialog } from "../leafletClasses";
import ConfirmDialog from "./confirmDialog";
import {
  getSelectedOperation,
  getOperationByID,
  makeSelectedOperation,
  opsList,
  removeOperation,
<<<<<<< HEAD
  changeOpIfNeeded,
  hiddenOpsList,
  hideOperation,
  showOperation,
  resetHiddenOps,
=======
  duplicateOperation,
>>>>>>> master
} from "../selectedOp";
import OpPermList from "./opPerms";
import wX from "../wX";
import { postToFirebase } from "../firebaseSupport";

import WasabeeMe from "../me";
import WasabeeAgent from "../agent";

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
<<<<<<< HEAD
    this._UIUpdateHook = () => {
      context.update();
=======
    this._UIUpdateHook = (newOpData) => {
      context.update(newOpData);
>>>>>>> master
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
<<<<<<< HEAD
      id: window.plugin.wasabee.static.dialogNames.opsList,
=======
      id: window.plugin.wasabee.static.dialogNames.opsButton,
>>>>>>> master
    });
    this._dialog.dialog("option", "buttons", buttons);
  },

<<<<<<< HEAD
  update: function () {
=======
  update: function (selectedOp) {
>>>>>>> master
    if (this._enabled && this._dialog && this._dialog.html) {
      this.makeContent(getSelectedOperation());
      this._dialog.html(this._content);
    }
  },

  makeContent: function (selectedOp) {
<<<<<<< HEAD
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
=======
    const content = L.DomUtil.create("div");
    const topSet = L.DomUtil.create("div", "topset", content);
    const operationSelect = L.DomUtil.create("select", null, topSet);
>>>>>>> master

    const ol = opsList(showHiddenOps);
    const data = new Map();
    data.set("", []);
    for (const opID of ol) {
      const tmpOp = getOperationByID(opID);
<<<<<<< HEAD
      if (!tmpOp) continue;
      const server = tmpOp.server || "";
      if (!data.has(server)) data.set(server, []);
      data.get(server).push({
        id: opID,
        name: tmpOp.name,
        localchanged: tmpOp.localchanged,
        local: tmpOp.fetched === null,
        owner: tmpOp.creator,
        perm: tmpOp.getPermission(),
=======
      const option = L.DomUtil.create("option", null, operationSelect);
      option.value = opID;
      option.text = tmpOp.name;
      if (opID == selectedOp.ID) option.selected = true;
    }

    L.DomEvent.on(operationSelect, "change", (ev) => {
      L.DomEvent.stop(ev);
      const newop = makeSelectedOperation(operationSelect.value);
      const mbr = newop.mbr;
      if (mbr && isFinite(mbr._southWest.lat) && isFinite(mbr._northEast.lat)) {
        this._map.fitBounds(mbr);
      }
      window.runHooks("wasabeeUIUpdate", newop);
      window.runHooks("wasabeeCrosslinks", newop);
    });

    const writable = selectedOp.IsWritableOp();

    const nameLabel = L.DomUtil.create("label", null, topSet);
    nameLabel.textContent = wX("OPER_NAME");
    const nameDisplay = L.DomUtil.create("div", null, topSet);
    if (writable) {
      const input = L.DomUtil.create("input", null, nameDisplay);
      input.value = selectedOp.name;
      L.DomEvent.on(input, "change", (ev) => {
        L.DomEvent.stop(ev);
        if (!input.value || input.value == "") {
          alert(wX("USE_VALID_NAME"));
        } else {
          selectedOp.name = input.value;
          selectedOp.store();
          window.runHooks("wasabeeUIUpdate", selectedOp);
        }
      });
    } else {
      nameDisplay.textContent = selectedOp.name;
    }

    if (writable) {
      const colorLabel = L.DomUtil.create("label", null, topSet);
      colorLabel.textContent = wX("OPER_COLOR");
      const operationColor = selectedOp.color
        ? selectedOp.color
        : window.plugin.wasabee.static.constants.DEFAULT_OPERATION_COLOR;
      const colorDisplay = L.DomUtil.create("div", null, topSet);
      const opColor = L.DomUtil.create("select", null, colorDisplay);
      for (const cd of window.plugin.wasabee.static.layerTypes) {
        if (cd[0] == "SE" || cd[0] == "self-block") continue;
        const c = cd[1];
        const option = L.DomUtil.create("option", null, opColor);
        if (c.name == operationColor) option.selected = true;
        option.value = c.name;
        option.textContent = c.displayName;
      }
      L.DomEvent.on(opColor, "change", (ev) => {
        L.DomEvent.stop(ev);
        selectedOp.color = opColor.value;
        selectedOp.store();
        window.runHooks("wasabeeUIUpdate", selectedOp);
      });
    }

    if (writable) {
      const commentInput = L.DomUtil.create("textarea", null, topSet);
      commentInput.placeholder = "Op Comment";
      commentInput.value = selectedOp.comment;
      L.DomEvent.on(commentInput, "change", (ev) => {
        L.DomEvent.stop(ev);
        selectedOp.comment = commentInput.value;
        selectedOp.store();
>>>>>>> master
      });
    }
    const hiddenOps = hiddenOpsList();

<<<<<<< HEAD
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
=======
    const buttonSection = L.DomUtil.create("div", "buttonset", content);
    if (writable) {
      const clearOpDiv = L.DomUtil.create("div", null, buttonSection);
      const clearOpButton = L.DomUtil.create("button", null, clearOpDiv);
      // adding a comment so that github will let me create a pull request to fix the issue with CLEAR_EVERYTHING showing up on the button instead of the correct text. Scott, pleae double check the line below this - I left off the wX code in the previous version.
      clearOpButton.textContent = wX("CLEAR_EVERYTHING");
      L.DomEvent.on(clearOpButton, "click", (ev) => {
        L.DomEvent.stop(ev);
        clearAllItems(selectedOp);
        selectedOp.store();
      });
    }
>>>>>>> master

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
<<<<<<< HEAD

      for (const op of ops) {
        const opRow = L.DomUtil.create("tr", "op", opTable);
        {
          const opName = L.DomUtil.create("td", "opname", opRow);
          const link = L.DomUtil.create("a", "", opName);
          link.href = "#";
          link.textContent = op.name;
          if (op.id == selectedOp.ID) link.classList.add("enl");
          L.DomEvent.on(link, "click", (ev) => {
            L.DomEvent.stop(ev);
            const newop = makeSelectedOperation(op.id);
=======
      L.DomEvent.on(deleteButton, "click", (ev) => {
        L.DomEvent.stop(ev);
        // this should be moved to uiCommands
        const con = new ConfirmDialog(window.map);
        con.setup(
          wX("CON_DEL", selectedOp.name),
          wX("YESNO_DEL", selectedOp.name),
          () => {
            if (selectedOp.IsServerOp() && selectedOp.IsOwnedOp()) {
              deleteOpPromise(selectedOp.ID).then(
                function () {
                  console.log("delete from server successful");
                },
                function (err) {
                  console.log(err);
                  alert(err);
                }
              );
            }
            const ol = opsList();
            let newopID = ol[0];
            if (newopID == null || newopID == selectedOp.ID) {
              console.log(
                "removing first op in list? I was going to use that...."
              );
              newopID = ol[1];
              if (newopID == null) {
                console.log("not removing last op... fix this");
                // create a new default op and use that -- just call the init/reset functions?
              }
            }
            const removeid = selectedOp.ID;
            const newop = makeSelectedOperation(newopID);
>>>>>>> master
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
            } else if (op.localchanged) {
              status.textContent = "*";
              status.style.color = "red";
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

<<<<<<< HEAD
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
        }
      }
    }

    this._content = container;
=======
    if (selectedOp.IsServerOp()) {
      const permsDiv = L.DomUtil.create("div", null, buttonSection);
      const permsButton = L.DomUtil.create("button", null, permsDiv);
      permsButton.textContent = wX("OP_PERMS");
      L.DomEvent.on(permsButton, "click", (ev) => {
        L.DomEvent.stop(ev);
        const opl = new OpPermList();
        opl.enable();
      });
    }

    const dupeDiv = L.DomUtil.create("div", null, buttonSection);
    const dupeButton = L.DomUtil.create("button", null, dupeDiv);
    dupeButton.textContent = wX("DUPE_OP");
    L.DomEvent.on(dupeButton, "click", (ev) => {
      L.DomEvent.stop(ev);
      duplicateOperation(selectedOp.ID);
      window.runHooks("wasabeeUIUpdate", window.plugin.wasabee._selectedOp);
    });

    this._content = content;
>>>>>>> master
  },
});

export default OpsDialog;
