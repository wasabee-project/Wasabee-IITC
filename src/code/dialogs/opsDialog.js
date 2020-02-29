import { Feature } from "../leafletDrawImports";
import { deleteOpPromise } from "../server";
import UiCommands from "../uiCommands";
import ConfirmDialog from "./confirmDialog";
import {
  getSelectedOperation,
  getOperationByID,
  makeSelectedOperation,
  opsList,
  removeOperation
} from "../selectedOp";
import OpPermList from "./opPerms";

const OpsDialog = Feature.extend({
  statics: {
    TYPE: "opsDialog"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = OpsDialog.TYPE;
    Feature.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    if (!this._map) return;
    Feature.prototype.addHooks.call(this);
    this._operation = getSelectedOperation();
    const context = this;
    this._UIUpdateHook = newOpData => {
      context.update(newOpData);
    };
    window.addHook("wasabeeUIUpdate", this._UIUpdateHook);

    this._displayDialog();
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
    window.removeHook("wasabeeUIUpdate", this._UIUpdateHook);
  },

  _displayDialog: function() {
    const op = getSelectedOperation();
    this.update(op);

    const context = this;
    this._dialog = window.dialog({
      title: "Operations",
      width: "auto",
      height: "auto",
      html: this._content,
      dialogClass: "wasabee-dialog-mustauth",
      closeCallback: function() {
        context.disable();
        delete context._content;
        delete context._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.opsButton
    });
  },

  update: function(selectedOp) {
    this.makeContent(selectedOp);
    if (!this._enabled) return;
    const id = "dialog-" + window.plugin.wasabee.static.dialogNames.opsButton;
    if (window.DIALOGS[id]) {
      this.makeContent(selectedOp);
      window.DIALOGS[id].replaceChild(
        this._content,
        window.DIALOGS[id].childNodes[0]
      );
    }
  },

  makeContent: function(selectedOp) {
    const content = L.DomUtil.create("div", "temp-op-wasabee");
    const container = L.DomUtil.create("div", "spinner", content);
    container.style.textalign = "center";
    const operationSelect = L.DomUtil.create("select", "", container);
    operationSelect.style.width = "90%";

    const ol = opsList();
    for (const opID of ol) {
      const tmpOp = getOperationByID(opID);
      const option = L.DomUtil.create("option", "", operationSelect);
      option.value = opID;
      option.text = tmpOp.name;
      if (opID == selectedOp.ID) option.selected = true;
    }

    L.DomEvent.on(operationSelect, "change", () => {
      const newop = makeSelectedOperation(operationSelect.value);
      const mbr = newop.mbr();
      if (mbr && isFinite(mbr._southWest.lat) && isFinite(mbr._northEast.lat)) {
        this._map.fitBounds(mbr);
      }
      window.runHooks("wasabeeUIUpdate", newop);
      window.runHooks("wasabeeCrosslinks", newop);
    });

    const writable = selectedOp.IsWritableOp();

    const nameSection = L.DomUtil.create("p", "", content);
    nameSection.innerHTML = "Operation Name: ";
    if (writable) {
      const input = L.DomUtil.create("input", "", nameSection);
      input.value = selectedOp.name;
      L.DomEvent.on(input, "change", () => {
        if (!input.value || input.value == "") {
          alert("Please use a valid operation name");
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
      const colorSection = L.DomUtil.create("p", "", content);
      colorSection.innerHTML = "Operation Color: ";
      const operationColor = selectedOp.color
        ? selectedOp.color
        : window.plugin.wasabee.static.constants.DEFAULT_OPERATION_COLOR;
      const opColor = L.DomUtil.create("select", "", colorSection);
      for (const cd of window.plugin.wasabee.static.layerTypes) {
        const c = cd[1];
        const option = L.DomUtil.create("option", "", opColor);
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

    const commentSection = L.DomUtil.create("p", "", content);
    if (writable) {
      const commentInput = L.DomUtil.create("textarea", "", commentSection);
      commentInput.rows = "3";
      commentInput.width = "90%";
      commentInput.placeholder = "Op Comment";
      commentInput.value = selectedOp.comment;
      L.DomEvent.on(commentInput, "change", () => {
        selectedOp.comment = commentInput.value;
        selectedOp.store();
      });
    } else {
      const commentDisplay = L.DomUtil.create("p", "", commentSection);
      commentDisplay.innerText = selectedOp.comment;
    }

    const buttonSection = L.DomUtil.create("div", "temp-op-dialog", content);
    if (writable) {
      const clearOpButton = L.DomUtil.create("a", "", buttonSection);
      clearOpButton.innerHTML = "Clear Portals/Links/Markers";
      L.DomEvent.on(clearOpButton, "click", () => {
        UiCommands.clearAllItems(selectedOp);
        selectedOp.store();
      });
    }

    if (opsList().length > 1) {
      const deleteButton = L.DomUtil.create("a", "", buttonSection);
      if (selectedOp.IsOwnedOp()) {
        deleteButton.innerHTML = "Delete " + selectedOp.name;
        if (selectedOp.IsServerOp())
          deleteButton.innerHTML += "<br />(locally and from server)";
      } else {
        deleteButton.innerHTML = "Remove local copy of " + selectedOp.name;
      }
      L.DomEvent.on(deleteButton, "click", () => {
        // this should be moved to uiCommands
        const con = new ConfirmDialog(window.map);
        con.setup(
          "Confirm Delete: " + selectedOp.name,
          "Are you sure you want to delete " + selectedOp.name + "?",
          () => {
            if (selectedOp.IsOwnedOp()) {
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
              }
            }
            const removeid = selectedOp.ID;
            removeOperation(removeid);
            window.runHooks("wasabeeUIUpdate", getOperationByID(newopID));
          }
        );
        con.enable();
      });
    }

    if (selectedOp.IsServerOp()) {
      const permsButton = L.DomUtil.create("a", null, buttonSection);
      permsButton.innerHTML = "Op Permissions";
      L.DomEvent.on(permsButton, "click", () => {
        const opl = new OpPermList();
        opl.enable();
      });
    }

    this._content = content;
  }
});

export default OpsDialog;
