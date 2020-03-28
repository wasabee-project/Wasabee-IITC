import { WDialog } from "../leafletClasses";
import { deleteOpPromise } from "../server";
import { clearAllItems } from "../uiCommands";
import ConfirmDialog from "./confirmDialog";
import {
  getSelectedOperation,
  getOperationByID,
  makeSelectedOperation,
  opsList,
  removeOperation,
  duplicateOperation
} from "../selectedOp";
import OpPermList from "./opPerms";
import wX from "../wX";

const OpsDialog = WDialog.extend({
  statics: {
    TYPE: "opsDialog"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = OpsDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();

    const context = this;
    this._UIUpdateHook = newOpData => {
      context.update(newOpData);
    };
    window.addHook("wasabeeUIUpdate", this._UIUpdateHook);
  },

  removeHooks: function() {
    WDialog.prototype.removeHooks.call(this);
    window.removeHook("wasabeeUIUpdate", this._UIUpdateHook);
  },

  _displayDialog: function() {
    this.makeContent(getSelectedOperation());

    const context = this;
    this._dialog = window.dialog({
      title: wX("OPERATIONS"),
      width: "auto",
      height: "auto",
      html: this._content,
      dialogClass: "wasabee-dialog",
      closeCallback: function() {
        context.disable();
        delete context._content;
        delete context._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.opsButton
    });
  },

  update: function(selectedOp) {
    if (this._enabled && this._dialog && this._dialog.html) {
      this.makeContent(selectedOp);
      this._dialog.html(this._content);
    }
  },

  makeContent: function(selectedOp) {
    const content = L.DomUtil.create("div", "temp-op-wasabee");
    const container = L.DomUtil.create("div", "spinner", content);
    container.style.textalign = "center";
    const operationSelect = L.DomUtil.create("select", null, container);
    operationSelect.style.width = "90%";

    const ol = opsList();
    for (const opID of ol) {
      const tmpOp = getOperationByID(opID);
      const option = L.DomUtil.create("option", null, operationSelect);
      option.value = opID;
      option.text = tmpOp.name;
      if (opID == selectedOp.ID) option.selected = true;
    }

    L.DomEvent.on(operationSelect, "change", () => {
      const newop = makeSelectedOperation(operationSelect.value);
      const mbr = newop.mbr;
      if (mbr && isFinite(mbr._southWest.lat) && isFinite(mbr._northEast.lat)) {
        this._map.fitBounds(mbr);
      }
      window.runHooks("wasabeeUIUpdate", newop);
      window.runHooks("wasabeeCrosslinks", newop);
    });

    const writable = selectedOp.IsWritableOp();

    const nameSection = L.DomUtil.create("p", null, content);
    nameSection.innerHTML = wX("OPER_NAME");
    if (writable) {
      const input = L.DomUtil.create("input", null, nameSection);
      input.value = selectedOp.name;
      L.DomEvent.on(input, "change", () => {
        if (!input.value || input.value == "") {
          alert(wX("USE_VALID_NAME"));
        } else {
          selectedOp.name = input.value;
          selectedOp.store();
          window.runHooks("wasabeeUIUpdate", selectedOp);
        }
      });
    } else {
      nameSection.innerHTML += selectedOp.name;
    }

    if (writable) {
      const colorSection = L.DomUtil.create("p", null, content);
      colorSection.innerHTML = wX("OPER_COLOR");
      const operationColor = selectedOp.color
        ? selectedOp.color
        : window.plugin.wasabee.static.constants.DEFAULT_OPERATION_COLOR;
      const opColor = L.DomUtil.create("select", null, colorSection);
      for (const cd of window.plugin.wasabee.static.layerTypes) {
        if (cd[0] == "SE" || cd[0] == "self-block") continue;
        const c = cd[1];
        const option = L.DomUtil.create("option", null, opColor);
        if (c.name == operationColor) option.selected = true;
        option.value = c.name;
        option.innerHTML = c.displayName;
      }
      L.DomEvent.on(opColor, "change", () => {
        selectedOp.color = opColor.value;
        selectedOp.store();
        window.runHooks("wasabeeUIUpdate", selectedOp);
      });
    }

    const commentSection = L.DomUtil.create("p", null, content);
    if (writable) {
      const commentInput = L.DomUtil.create("textarea", null, commentSection);
      commentInput.rows = "3";
      commentInput.width = "90%";
      commentInput.placeholder = "Op Comment";
      commentInput.value = selectedOp.comment;
      L.DomEvent.on(commentInput, "change", () => {
        selectedOp.comment = commentInput.value;
        selectedOp.store();
      });
    } else {
      const commentDisplay = L.DomUtil.create("p", null, commentSection);
      commentDisplay.innerText = selectedOp.comment;
    }

    const buttonSection = L.DomUtil.create("div", "temp-op-dialog", content);
    if (writable) {
      const clearOpButton = L.DomUtil.create("a", null, buttonSection);
      clearOpButton.innerHTML = "CLEAR_EVERYTHING";
      L.DomEvent.on(clearOpButton, "click", () => {
        clearAllItems(selectedOp);
        selectedOp.store();
      });
    }

    if (opsList().length > 1) {
      const deleteButton = L.DomUtil.create("a", null, buttonSection);
      if (selectedOp.IsOwnedOp()) {
        deleteButton.innerHTML = wX("DELETE") + selectedOp.name;
        if (selectedOp.IsServerOp()) deleteButton.innerHTML += wX("LOCFRMSER");
      } else {
        deleteButton.innerHTML = wX("REM_LOC_CP") + selectedOp.name;
      }
      L.DomEvent.on(deleteButton, "click", () => {
        // this should be moved to uiCommands
        const con = new ConfirmDialog(window.map);
        con.setup(
          wX("CON_DEL") + selectedOp.name,
          wX("YESNO_DEL") + selectedOp.name + "?",
          () => {
            if (selectedOp.IsServerOp() && selectedOp.IsOwnedOp()) {
              deleteOpPromise(selectedOp.ID).then(
                function() {
                  console.log("delete from server successful");
                },
                function(err) {
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
            const mbr = newop.mbr;
            if (
              mbr &&
              isFinite(mbr._southWest.lat) &&
              isFinite(mbr._northEast.lat)
            ) {
              this._map.fitBounds(mbr);
            }
            removeOperation(removeid);
            window.runHooks("wasabeeUIUpdate", newop);
            window.runHooks("wasabeeCrosslinks", newop);
          }
        );
        con.enable();
      });
    }

    if (selectedOp.IsServerOp()) {
      const permsButton = L.DomUtil.create("a", null, buttonSection);
      permsButton.innerHTML = wX("OP_PERMS");
      L.DomEvent.on(permsButton, "click", () => {
        const opl = new OpPermList();
        opl.enable();
      });
    }

    const permsButton = L.DomUtil.create("a", null, buttonSection);
    permsButton.innerHTML = wX("DUPE_OP");
    L.DomEvent.on(permsButton, "click", () => {
      duplicateOperation(selectedOp.ID);
      window.runHooks("wasabeeUIUpdate", window.plugin.wasabee._selectedOp);
    });

    this._content = content;
  }
});

export default OpsDialog;
