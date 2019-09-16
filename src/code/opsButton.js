import { Feature } from "./leafletDrawImports";
import ExportDialog from "./exportDialog";
import addButtons from "./addButtons";
import WasabeeMe from "./me";

const opsButtonControl = Feature.extend({
  statics: {
    TYPE: "opsButton"
  },

  options: {
    icon: new L.Icon({
      iconSize: new L.Point(16, 16),
      iconAnchor: new L.Point(0, 0),
      iconUrl: window.plugin.Wasabee.static.images.toolbar_viewOps
    })
  },

  initialize: function(map, options) {
    this.type = opsButtonControl.TYPE;
    Feature.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    if (!this._map) return;
    Feature.prototype.addHooks.call(this);
    this._displayDialog();
  },

  _displayDialog: function() {
    var op = window.plugin.Wasabee.getSelectedOperation();
    var content = document.createElement("div");
    content.id = "wasabee-dialog-operation-content";
    var opinfo = document.createElement("div");
    opinfo.id = "wasabee-dialog-operation-opinfo";

    content.appendChild(this._opSelectMenu(this, op));
    content.appendChild(opinfo);

    var obHandler = this;
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
    let operationSelect = document.getElementById("wasabee-operationSelect");
    $(operationSelect).change();
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
  },

  _opSelectMenuUpdate: function(context, operation) {
    var dialogcontainer = document.getElementById(
      "wasabee-dialog-operation-content"
    );
    var oldspinner = document.getElementById(
      "wasabee-dialog-operation-spinner"
    );
    dialogcontainer.replaceChild(
      context._opSelectMenu(context, operation),
      oldspinner
    );
  },

  _opSelectMenu: function(context, operation) {
    var container = document.createElement("div");
    container.id = "wasabee-dialog-operation-spinner";
    container.className = "spinner";
    container.innerHTML = "";
    $(container).css({
      "text-align": "center"
    });
    var operationSelect = document.createElement("select");
    operationSelect.id = "wasabee-operationSelect";
    $(operationSelect).css({
      width: "50%"
    });
    var ol = window.plugin.wasabee.opsList();
    ol.forEach(function(opID) {
      var op = window.plugin.wasabee.getOperationByID(opID);
      $(operationSelect).append(
        $("<option>").prop({
          value: opID,
          text: op.name
        })
      );
    });
    $(operationSelect).val(operation.ID);
    $(operationSelect).change(function() {
      var newID = $(this).val();
      console.log("load requested for " + newID);
      window.plugin.wasabee.closeAllDialogs();
      var newop = window.plugin.wasabee.makeSelectedOperation(newID);
      context._displayOpInfo(context, newop);
      newop.update();
      context._map.fitBounds(newop.mbr());
      addButtons(newop);
    });

    container.appendChild(operationSelect);
    context._displayOpInfo(context, operation);
    return container;
  },

  _displayOpInfo: function(context, operation) {
    var opinfo = document.getElementById("wasabee-dialog-operation-opinfo");
    if (!opinfo) {
      console.log(
        "unable to get wasabee-dialog-operation-opinfo; skipping display"
      );
      return;
    }
    opinfo.innerHTML = ""; // start clean
    var nameSection = opinfo.appendChild(document.createElement("p"));
    nameSection.innerHTML = "Operation Name: ";
    var input = nameSection.appendChild(document.createElement("input"));
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
    var colorSection = opinfo.appendChild(document.createElement("p"));
    colorSection.innerHTML = "Operation Color: ";
    var operationColor =
      window.plugin.Wasabee.Constants.DEFAULT_OPERATION_COLOR;
    if (operation.color != null) {
      operationColor = operation.color;
    }
    var opColor = colorSection.appendChild(document.createElement("select"));
    window.plugin.Wasabee.layerTypes.forEach(function(a) {
      var option = document.createElement("option");
      if (a.name == operationColor) {
        option.setAttribute("selected", true);
      }
      option.setAttribute("value", a.name);
      option.innerHTML = a.displayName;
      opColor.append(option);
    });
    $(opColor).change(function() {
      operation.color = $(opColor).val();
      operation.update();
    });

    var isServerOp = operation.IsServerOp();
    var isWritableOp = false;
    if (isServerOp) {
      isWritableOp = operation.IsWritableOp(WasabeeMe.get());
    }
    var commentInputEnabled = !isServerOp || isWritableOp;
    var commentSection = opinfo.appendChild(document.createElement("p"));
    var commentInput = commentSection.appendChild(
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

    var buttonSection = opinfo.appendChild(document.createElement("div"));
    buttonSection.className = "temp-op-dialog";
    var exportButton = buttonSection.appendChild(document.createElement("a"));
    exportButton.innerHTML = "Export";
    exportButton.addEventListener(
      "click",
      function() {
        ExportDialog.show(operation);
      },
      false
    );
    var clearOpButton = buttonSection.appendChild(document.createElement("a"));
    clearOpButton.innerHTML = "Clear Portals/Links/Markers";
    clearOpButton.addEventListener(
      "click",
      function() {
        var confirmClear = confirm(
          "Are you sure you want to clear all portals, links, and markers from this operation?"
        );
        if (confirmClear == true) {
          operation.clearAllItems();
        }
      },
      false
    );
    var deleteButton = buttonSection.appendChild(document.createElement("a"));
    deleteButton.innerHTML = "Delete";
    if (window.plugin.wasabee.opsList().size == 0) {
      deleteButton.disabled = true;
    }
    deleteButton.addEventListener(
      "click",
      function() {
        var confirmed = confirm(
          "Are you sure you want to *DELETE* this operation?"
        );
        if (confirmed == true) {
          if (operation.IsOwnedOp(WasabeeMe.get())) {
            var confirmedDeleteServerOp = confirm(
              "Are you sure you want to *DELETE* this operation from the *SERVER*?"
            );
            if (confirmedDeleteServerOp) {
              window.plugin.wasabee.deleteOwnedServerOp(operation.ID);
            }
          }
          var ol = window.plugin.wasabee.opsList();
          var newopID = ol[0];
          console.log(newopID);
          if (newopID == null || newopID == operation.ID) {
            console.log(
              "removing first op in list? I was going to use that...."
            );

            newopID = ol[1];
            console.log(newopID);
            if (newopID == null) {
              console.log("not removing last op... fix this");
            }
          }
          let removeid = operation.ID;
          let operationSelect = document.getElementById(
            "wasabee-operationSelect"
          );
          $(operationSelect).val(newopID);
          $(operationSelect).change();
          window.plugin.wasabee.removeOperation(removeid);
          context._opSelectMenuUpdate(
            context,
            window.plugin.Wasabee.getSelectedOperation()
          );
        }
      },
      false
    );
    // return opinfo;
  }
});

export default opsButtonControl;
