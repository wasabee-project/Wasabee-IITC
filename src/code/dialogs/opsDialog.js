import { Feature } from "../leafletDrawImports";
import { deleteOpPromise } from "../server";
import UiCommands from "../uiCommands";
import ConfirmDialog from "./confirmDialog";

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
    const op = window.plugin.wasabee.getSelectedOperation();
    const content = document.createElement("div");
    content.id = "wasabee-dialog-operation-content";
    const opinfo = document.createElement("div");
    opinfo.id = "wasabee-dialog-operation-opinfo";

    content.appendChild(this._opSelectMenu(this, op));
    content.appendChild(opinfo);

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
      id: window.plugin.Wasabee.static.dialogNames.opsButton
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
    const container = document.createElement("div");
    container.id = "wasabee-dialog-operation-spinner";
    container.className = "spinner";
    container.innerHTML = "";
    $(container).css({
      "text-align": "center"
    });
    const operationSelect = document.createElement("select");
    operationSelect.id = "wasabee-operationSelect";
    $(operationSelect).css({
      width: "90%"
    });
    const ol = window.plugin.wasabee.opsList();
    ol.forEach(function(opID) {
      const op = window.plugin.wasabee.getOperationByID(opID);
      $(operationSelect).append(
        $("<option>").prop({
          value: opID,
          text: op.name
        })
      );
    });
    // XXX use operationSelect.addEventListener instead of this format
    $(operationSelect).val(operation.ID);
    $(operationSelect).change(function() {
      const newID = $(this).val();
      // window.plugin.wasabee.closeAllDialogs( window.plugin.Wasabee.static.dialogNames.opsButton);
      const newop = window.plugin.wasabee.makeSelectedOperation(newID);
      context._displayOpInfo(context, newop);
      const mbr = newop.mbr();
      if (isFinite(mbr._southWest.lat) && isFinite(mbr._northEast.lat)) {
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
      // console.log("unable to get wasabee-dialog-operation-opinfo; skipping display");
      return;
    }
    opinfo.innerHTML = ""; // start clean
    const nameSection = opinfo.appendChild(document.createElement("p"));
    nameSection.innerHTML = "Operation Name: ";
    const input = nameSection.appendChild(document.createElement("input"));
    // input.type = "text";
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
    const colorSection = opinfo.appendChild(document.createElement("p"));
    colorSection.innerHTML = "Operation Color: ";
    let operationColor =
      window.plugin.Wasabee.Constants.DEFAULT_OPERATION_COLOR;
    if (operation.color != null) {
      operationColor = operation.color;
    }
    const opColor = colorSection.appendChild(document.createElement("select"));
    window.plugin.Wasabee.layerTypes.forEach(function(a) {
      const option = document.createElement("option");
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

    const isServerOp = operation.IsServerOp();
    let isWritableOp = false;
    if (isServerOp) {
      isWritableOp = operation.IsWritableOp();
    }
    const commentInputEnabled = !isServerOp || isWritableOp;
    const commentSection = opinfo.appendChild(document.createElement("p"));
    const commentInput = commentSection.appendChild(
      document.createElement("textarea")
    );
    commentInput.rows = "3";
    commentInput.placeholder = "Op Comment";
    commentInput.value = operation.comment;
    $(commentInput).prop("disabled", !commentInputEnabled);
    $(commentInput).change(function() {
      operation.comment = $(commentInput).val();
      operation.store();
    });

    const buttonSection = opinfo.appendChild(document.createElement("div"));
    buttonSection.className = "temp-op-dialog";

    const clearOpButton = buttonSection.appendChild(
      document.createElement("a")
    );
    clearOpButton.innerHTML = "Clear Portals/Links/Markers";
    clearOpButton.addEventListener(
      "click",
      () => {
        UiCommands.clearAllItems(operation);
      },
      false
    );

    const deleteButton = buttonSection.appendChild(document.createElement("a"));
    deleteButton.innerHTML = "Delete " + operation.name;
    if (window.plugin.wasabee.opsList().size == 0) {
      deleteButton.disabled = true;
    }
    deleteButton.addEventListener(
      "click",
      () => {
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
            const ol = window.plugin.wasabee.opsList();
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
            window.plugin.wasabee.removeOperation(removeid);
            context._opSelectMenuUpdate(
              context,
              window.plugin.wasabee.getSelectedOperation()
            );
          }
        );
        con.enable();
      },
      false
    );
    // return opinfo;
  }
});

export default OpsDialog;
