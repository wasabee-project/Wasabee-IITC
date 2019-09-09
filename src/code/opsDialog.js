import { drawThings } from "./mapDrawing";
import LinkListDialog from "./linkListDialog";
import ExportDialog from "./exportDialog";
import { MarkerDialog } from "./markerDialog";
import LinkDialog from "./linkDialog";
import Operation from "./operation";
// import addButtons from "./addButtons";

var Wasabee = window.plugin.Wasabee;

export function initOpsDialog() {
  window.plugin.wasabee.showAddOpDialog = () => {
    var content = document.createElement("div");
    content.className = "wasabee-dialog wasabee-dialog-ops";
    var buttonSet = content.appendChild(document.createElement("div"));
    buttonSet.className = "temp-op-dialog";
    var addButton = buttonSet.appendChild(document.createElement("a"));
    addButton.textContent = "Add New Op";

    var windowDialog = window.dialog({
      title: "Add Operation",
      width: "auto",
      height: "auto",
      html: content
    });

    var importButton = buttonSet.appendChild(document.createElement("a"));
    importButton.textContent = "Import Op";
    importButton.addEventListener(
      "click",
      () => {
        windowDialog.dialog("close");
        window.plugin.wasabee.importString();
      },
      false
    );

    addButton.addEventListener(
      "click",
      () => {
        windowDialog.dialog("close");
        var promptAction = prompt(
          "Enter an operation name.  Must not be empty.",
          ""
        );
        if (promptAction !== null && promptAction !== "") {
          console.log("promptaction -> " + promptAction);
          var newop = new Operation(PLAYER.nickname, promptAction, true);
          newop.store();
          window.plugin.wasabee.makeSelectedOperation(newop.ID);
          window.plugin.wasabee.updateVisual(newop);
        } else {
          alert("You must enter a valid Operation name. Try again.");
        }
      },
      false
    );
  };

  window.plugin.wasabee.showMustAuthAlert = () => {
    var content = document.createElement("div");
    var title = content.appendChild(document.createElement("div"));
    title.className = "desc";
    title.innerHTML = "In order to sync operations, you must log in.<br/>";
    var buttonSet = content.appendChild(document.createElement("div"));
    buttonSet.className = "temp-op-dialog";
    var visitButton = buttonSet.appendChild(document.createElement("a"));
    visitButton.innerHTML = "Visit Site";
    visitButton.addEventListener(
      "click",
      () => window.open("https://server.wasabee.rocks"),
      false
    );
    window.dialog({
      title: "You Must Authenticate",
      width: "auto",
      height: "auto",
      html: content,
      dialogClass: "wasabee-dialog-mustauth"
    });
  };

  window.plugin.wasabee.addCSS = content => {
    $("head").append('<style type="text/css">\n' + content + "\n</style>");
  };

  window.plugin.wasabee.updateVisual = op => {
    console.log("updateVisual");
    console.log("cleanPortalList");
    op.cleanPortalList();
    console.log("OpsDialog.update");
    OpsDialog.update(false); // update but do not show
    console.log("LinksDialog.update");
    LinkDialog.update(op, false);
    console.log("LinkListDialog.update");
    LinkListDialog.update(op, null, false);
    console.log("MarkerDialog.update");
    MarkerDialog.update(op, false, false);
    console.log("drawThings");
    drawThings(op);
  };
}

var _dialogs = [];

export class OpsDialog {
  constructor() {
    _dialogs.push(this);
    this.container = document.createElement("div");
    this.container.id = "op-dialog-tabs";
    this._dialog = window.dialog({
      title: "Operation List",
      width: "auto",
      height: "auto",
      html: this.container,
      dialogClass: "wasabee-dialog wasabee-dialog-ops",
      closeCallback: function() {
        var paneIndex = _dialogs.indexOf(self);
        if (-1 !== paneIndex) {
          _dialogs.splice(paneIndex, 1);
        }
      }
    });
    this.setupSpinner(window.plugin.wasabee.getSelectedOperation());
  }

  setupSpinner(selectedOp) {
    console.log("setupSpinner");
    console.log(selectedOp);

    this.container.innerHTML = "";
    $(this.container).css({
      "text-align": "center"
    });
    var operationSelect = document.createElement("select");
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
    $(operationSelect).val(selectedOp.ID);
    $(operationSelect).change(function() {
      var newID = $(this).val();
      if (newID != selectedOp.ID) {
        console.log("load requested for" + newID);
        try {
          var newop = window.plugin.wasabee.makeSelectedOperation(newID);
          this.updateContentPane(newop, ol.length);
          window.plugin.wasabee.updateVisual(newop);
        } catch (e) {
          console.log(e);
          alert(e);
        }
      } else {
        console.log("not bothering to load the current op");
      }
    });
    this.container.appendChild(operationSelect);
    var _content = this.container.appendChild(document.createElement("div"));
    _content.id = "operation-dialog-tabs";
    this._opContent = _content.appendChild(document.createElement("div"));
    this._opContent.className = "op-dialog-content-pane";
    this._opContent.id = "a";
    $(operationSelect).change();
  }

  updateContentPane(operation, opListSize) {
    // console.log("update content pane: " + JSON.stringify(operation));
    var tabContent = this._opContent;
    tabContent.innerHTML = "";
    var nameSection = tabContent.appendChild(document.createElement("p"));
    nameSection.innerHTML = "Op Name -> ";
    var input = nameSection.appendChild(document.createElement("input"));
    // input.type = "text";
    input.id = "op-dialog-content-nameinput";
    input.value = operation.name;
    var colorSection = tabContent.appendChild(document.createElement("p"));
    colorSection.innerHTML = "Op Color -> ";
    var operationColor = Wasabee.Constants.DEFAULT_OPERATION_COLOR;
    if (operation.color != null) {
      operationColor = operation.color;
    }
    var opColor = colorSection.appendChild(document.createElement("select"));
    Wasabee.layerTypes.forEach(function(a) {
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
    var commentSection = tabContent.appendChild(document.createElement("p"));
    var commentInput = commentSection.appendChild(
      document.createElement("textarea")
    );
    // commentInput.type = "text";
    commentInput.rows = "3";
    commentInput.placeholder = "Op Comment";
    commentInput.value = operation.comment;
    $(commentInput).prop("disabled", !commentInputEnabled);
    var buttonSection = tabContent.appendChild(document.createElement("div"));
    buttonSection.className = "temp-op-dialog";
    /*
        var viewOpSummaryButton = buttonSection.appendChild(document.createElement("a"))
        viewOpSummaryButton.innerHTML = "View Op Summary"
        viewOpSummaryButton.addEventListener("click", function (arg) {
            window.plugin.wasabee.viewOpSummary(operation);
        }, false);
        */
    var saveButton = buttonSection.appendChild(document.createElement("a"));
    saveButton.innerHTML = "Save Operation Name";
    saveButton.addEventListener(
      "click",
      function() {
        if (input.value == null || input.value == "") {
          alert("That is an invalid operation name");
        } else {
          Wasabee._selectedOp.name = input.value;
          Wasabee._selectedOp.store();
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
            Wasabee._selectedOp.comment = commentInput.value;
            Wasabee._selectedOp.store();
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
        OpsDialog.update(false, true);
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
    deleteButton.disabled = opListSize == 0;
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
  }

  /* eslint-disable no-unused-vars */
  // what does this do?
  saveOperation(operation) {
    console.log("saveOperation called: " + operation);
    operation.store();
  }
  /* eslint-enable no-unused-vars */

  focus() {
    this._dialog.dialog("open");
  }

  static update(show = true, close = false) {
    var parameters = _dialogs;
    if (parameters.length != 0) {
      show = false;
      for (var index in parameters) {
        var page = parameters[index];
        if (close) {
          return page._dialog.dialog("close");
        }
        var op = window.plugin.wasabee.getSelectedOperation();
        page.setupSpinner(op);
        return page.focus(), page;
      }
    }
    if (show) {
      return new OpsDialog();
    } else {
      return;
    }
  }

  static closeDialogs() {
    var parameters = _dialogs;
    for (let p = 0; p < parameters.length; p++) {
      var page = parameters[p];
      page._dialog.dialog("close");
    }
  }

  static updateOperation() {
    console.log("updateOperation called");
    // this._operationList = window.plugin.wasabee.opsList();
  }
}
