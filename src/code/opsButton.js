import { Feature } from "./leafletDrawImports";
import { drawThings } from "./mapDrawing";
import ExportDialog from "./exportDialog";

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
      id: "wasabee-operations"
    });
    let operationSelect = document.getElementById("wasabee-operationSelect");
    $(operationSelect).change();
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
  },

  //_closeDialog: function(ctx) {
  _closeDialog: function() {
    console.log("dialog close goes here");
    this._dialog.dialog("close");
    // ctx._dialog.dialog("close");
  },

  _opSelectMenu: function(context, operation) {
    var container = document.createElement("div");

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
      // XXX close all other dialogs or things will get ugly
      var newop = window.plugin.wasabee.makeSelectedOperation(newID);
      context._displayOpInfo(newop);
      window.plugin.wasabee.updateVisual(newop);
      drawThings(newop);
    });

    container.appendChild(operationSelect);
    context._displayOpInfo(operation);
    return container;
  },

  _displayOpInfo: function(operation) {
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
    var colorSection = opinfo.appendChild(document.createElement("p"));
    colorSection.innerHTML = "Op Color: ";
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
      operation.colorSelected(
        $(opColor).val(),
        input.value,
        commentInput.value
      );
    });
    //TODO enable comment section when !serverOp || (ownedServerOp)
    var isServerOp = window.plugin.wasabee.IsServerOp(operation);
    var isWritableOp = false;
    if (isServerOp) {
      isWritableOp = window.plugin.wasabee.IsWritableOp(operation);
    }
    var commentInputEnabled = !isServerOp || isWritableOp;
    var commentSection = opinfo.appendChild(document.createElement("p"));
    var commentInput = commentSection.appendChild(
      document.createElement("textarea")
    );
    // commentInput.type = "text";
    commentInput.rows = "3";
    commentInput.placeholder = "Op Comment";
    commentInput.value = operation.comment;
    $(commentInput).prop("disabled", !commentInputEnabled);
    var buttonSection = opinfo.appendChild(document.createElement("div"));
    buttonSection.className = "temp-op-dialog";
    /*
        var viewOpSummaryButton = buttonSection.appendChild(document.createElement("a"))
        viewOpSummaryButton.innerHTML = "View Op Summary"
        viewOpSummaryButton.addEventListener("click", function (arg) {
            window.plugin.wasabee.viewOpSummary(operation);
        }, false);
        */
    // scb: just auto-save on defocus/change
    var saveButton = buttonSection.appendChild(document.createElement("a"));
    saveButton.innerHTML = "Save Operation Name";
    saveButton.addEventListener(
      "click",
      function() {
        if (input.value == null || input.value == "") {
          alert("That is an invalid operation name");
        } else {
          window.plugin.Wasabee._selectedOp.name = input.value;
          window.plugin.Wasabee._selectedOp.store();
          // window.plugin.wasabee.updateOperationInList(operation);
        }
      },
      false
    );
    if (commentInputEnabled) {
      var saveCommentButton = buttonSection.appendChild(
        document.createElement("a")
      );
      saveCommentButton.innerHTML = "Save Operation Comment";
      saveCommentButton.addEventListener(
        "click",
        function() {
          if (commentInput.value == null || commentInput.value == "") {
            alert("That is an invalid operation comment");
          } else {
            window.plugin.Wasabee._selectedOp.comment = commentInput.value;
            window.plugin.Wasabee._selectedOp.store();
            //window.plugin.wasabee.updateOperationInList(operation);
          }
        },
        false
      );
    }
    var exportButton = buttonSection.appendChild(document.createElement("a"));
    exportButton.innerHTML = "Export";
    exportButton.addEventListener(
      "click",
      function() {
        // XXX this is wrong this.OpsDialog.update(false, true);
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
          if (window.plugin.wasabee.IsOwnedOp(operation)) {
            var confirmedDeleteServerOp = confirm(
              "Are you sure you want to *DELETE* this operation from the *SERVER*?"
            );
            if (confirmedDeleteServerOp) {
              window.plugin.wasabee.deleteOwnedServerOp(operation.ID);
            }
          }
          window.plugin.wasabee.removeOperation(operation.ID);
        }
      },
      false
    );
    // return opinfo;
  }
});

export default opsButtonControl;
