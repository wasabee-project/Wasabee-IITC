import { Feature } from "../leafletDrawImports";
import { deleteOpPromise } from "../server";
import UiCommands from "../uiCommands";
import ConfirmDialog from "./confirmDialog";
import {
  getSelectedOperation,
  makeSelectedOperation,
  opsList,
  getOperationByID,
  removeOperation
} from "../selectedOp";

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
    this._displayDialog();
  },

  _displayDialog: function() {
    const op = getSelectedOperation();
    const content = L.DomUtil.create("div", "temp-op-wasabee");
    content.id = "wasabee-dialog-operation-content";
    content.appendChild(this._opSelectMenu(this, op));
    const opinfo = L.DomUtil.create("div", "", content);
    opinfo.id = "wasabee-dialog-operation-opinfo";

    const obHandler = this;
    this._dialog = window.dialog({
      title: "Operations",
      width: "auto",
      height: "auto",
      html: content,
      dialogClass: "wasabee-dialog-mustauth",
      closeCallback: function() {
        obHandler.disable();
        delete obHandler._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.opsButton
    });

    const operationSelect = document.getElementById("wasabee-operationSelect");
    $(operationSelect).change(); // otherwise the rest of the dialog does not load
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
  },

  _opSelectMenuUpdate: function(context, operation) {
    let dialogcontainer = document.getElementById(
      "wasabee-dialog-operation-content"
    );
    let oldspinner = document.getElementById(
      "wasabee-dialog-operation-spinner"
    );
    dialogcontainer.replaceChild(
      context._opSelectMenu(context, operation),
      oldspinner
    );
  },

  _opSelectMenu: function(context, operation) {
    const container = L.DomUtil.create("div", "spinner");
    container.id = "wasabee-dialog-operation-spinner";
    $(container).css({
      "text-align": "center"
    });
    const operationSelect = L.DomUtil.create("select", "");
    operationSelect.id = "wasabee-operationSelect";
    $(operationSelect).css({
      width: "90%"
    });

    const ol = opsList();
    for (const opID of ol) {
      const op = getOperationByID(opID);
      $(operationSelect).append(
        $("<option>").prop({
          value: opID,
          text: op.name
        })
      );
    }

    $(operationSelect).val(operation.ID);
    $(operationSelect).change(function() {
      const newID = $(this).val();
      const newop = makeSelectedOperation(newID);
      context._displayOpInfo(context, newop);
      const mbr = newop.mbr();
      if (mbr && isFinite(mbr._southWest.lat) && isFinite(mbr._northEast.lat)) {
        context._map.fitBounds(mbr);
      }
      window.runHooks("wasabeeUIUpdate", newop);
      window.runHooks("wasabeeCrosslinks", newop);
    });

    container.appendChild(operationSelect);
    context._displayOpInfo(context, operation);
    return container;
  },

  _displayOpInfo: function(context, operation) {
    const opinfo = document.getElementById("wasabee-dialog-operation-opinfo");
    if (!opinfo) {
      return;
    }
    opinfo.innerHTML = ""; // start clean
    const nameSection = L.DomUtil.create("p", "", opinfo);
    nameSection.innerHTML = "Operation Name: ";
    const input = L.DomUtil.create("input", "", nameSection);
    input.id = "op-dialog-content-nameinput";
    input.value = operation.name;
    $(input).change(function() {
      if ($(input).val() == null || $(input).val() == "") {
        alert("That is an invalid operation name");
      } else {
        operation.name = $(input).val();
        operation.store();
        context._opSelectMenuUpdate(context, operation);
      }
    });
    const colorSection = L.DomUtil.create("p", "", opinfo);
    colorSection.innerHTML = "Operation Color: ";
    const operationColor = operation.color
      ? operation.color
      : window.plugin.wasabee.Constants.DEFAULT_OPERATION_COLOR;
    const opColor = L.DomUtil.create("select", "", colorSection);
    window.plugin.wasabee.layerTypes.forEach(function(a) {
      const option = L.DomUtil.create("option", "");
      if (a.name == operationColor) {
        option.setAttribute("selected", true);
      }
      option.setAttribute("value", a.name);
      option.innerHTML = a.displayName;
      opColor.append(option);
    });
    $(opColor).change(function() {
      operation.color = $(opColor).val();
      operation.update(); // OK - changing color does not trigger
    });

    const commentInputEnabled = operation.IsWritableOp();
    const commentSection = L.DomUtil.create("p", "", opinfo);
    const commentInput = L.DomUtil.create("textarea", "", commentSection);
    commentInput.rows = "3";
    commentInput.placeholder = "Op Comment";
    commentInput.value = operation.comment;
    $(commentInput).prop("disabled", !commentInputEnabled);
    $(commentInput).change(function() {
      operation.comment = $(commentInput).val();
      operation.store();
    });

    const buttonSection = L.DomUtil.create("div", "temp-op-dialog", opinfo);
    const clearOpButton = L.DomUtil.create("a", "", buttonSection);
    clearOpButton.innerHTML = "Clear Portals/Links/Markers";
    L.DomEvent.on(clearOpButton, "click", () => {
      UiCommands.clearAllItems(operation);
    });

    // only show the delete button if more than 1 op remaining
    if (opsList().length > 1) {
      const deleteButton = L.DomUtil.create("a", "", buttonSection);
      deleteButton.innerHTML = "Delete " + operation.name;
      deleteButton.disabled = true;
      L.DomEvent.on(deleteButton, "click", () => {
        // this should be moved to uiCommands, but the menu adjustment at the end makes that non-trivial
        const con = new ConfirmDialog(window.map);
        con.setup(
          "Confirm Delete: " + operation.name,
          "Are you sure you want to delete " + operation.name + "?",
          () => {
            if (operation.IsOwnedOp()) {
              deleteOpPromise(operation.ID).then(
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
            if (newopID == null || newopID == operation.ID) {
              console.log(
                "removing first op in list? I was going to use that...."
              );
              newopID = ol[1];
              if (newopID == null) {
                console.log("not removing last op... fix this");
              }
            }
            const removeid = operation.ID;
            const operationSelect = document.getElementById(
              "wasabee-operationSelect"
            );
            $(operationSelect).val(newopID);
            $(operationSelect).change();
            removeOperation(removeid);
            context._opSelectMenuUpdate(context, getSelectedOperation());
          }
        );
        con.enable();
      });
    }
  }
});

export default OpsDialog;
