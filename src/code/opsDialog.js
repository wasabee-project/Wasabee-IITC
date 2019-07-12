import store from "store";
import LinkListDialog from "./linkListDialog";
import { drawThings } from "./mapDrawing";
import { MarkerDialog } from "./markerDialog";

var Wasabee = window.plugin.Wasabee;

window.plugin.wasabee.showAddOpDialog = () => {
    var content = document.createElement("div");
    content.className = "wasabee-dialog wasabee-dialog-ops";
    buttonSet = content.appendChild(document.createElement("div"));
    buttonSet.className = "temp-op-dialog";
    var addButton = buttonSet.appendChild(document.createElement("a"));
    addButton.textContent = "Add New Op";

    var windowDialog = window.dialog({
        title: "Add Operation",
        width: "auto",
        height: "auto",
        html: content,
    });

    var importButton = buttonSet.appendChild(document.createElement("a"));
    importButton.textContent = "Import Op";
    importButton.addEventListener("click", () => {
        windowDialog.dialog("close");
        window.plugin.wasabee.importString();
    }, false);

    addButton.addEventListener("click", () => {
        windowDialog.dialog("close");
        var promptAction = prompt("Enter an operation name.  Must not be empty.", "");
        if (promptAction !== null && promptAction !== "") {
            console.log("promptaction -> " + promptAction);
            window.plugin.wasabee.updateOperationInList(new Operation(PLAYER.nickname, promptAction, true), true);
        } else {
            alert("You must enter a valid Operation name. Try again.");
        }
    }, false);
};

window.plugin.wasabee.showMustAuthAlert = () => {
    var content = document.createElement("div");
    var title = content.appendChild(document.createElement("div"));
    title.className = "desc";
    title.innerHTML = "In order to sync operations, you must log in.<br/>";
    buttonSet = content.appendChild(document.createElement("div"));
    buttonSet.className = "temp-op-dialog";
    var visitButton = buttonSet.appendChild(document.createElement("a"));
    visitButton.innerHTML = "Visit Site";
    visitButton.addEventListener("click", () => window.open("https://server.wasabee.rocks"), false);
    window.dialog({
        title: "You Must Authenticate",
        width: "auto",
        height: "auto",
        html: content,
        dialogClass: "wasabee-dialog-mustauth"
    });
};

window.plugin.wasabee.addCSS = (content) => {
    $("head").append("<link rel=\"stylesheet\" type=\"text/css\" href=\"" + content + "\" />");
};

//*** This function iterates through the opList and returns the selected one.
window.plugin.wasabee.getSelectedOperation = () => {
    for (let operation of Wasabee.opList) {
        if (operation.isSelected == true) {
            return Operation.create(operation);
        }
    }
    return null;
};

window.plugin.wasabee.getOperationById = (opId) => {
    for (let operation of Wasabee.opList) {
        if (operation.ID == opId) {
            return Operation.create(operation);
        }
    }
    return null;
};

//*** This function creates an op list if one doesn't exist and sets the op list for the plugin
window.plugin.wasabee.setupLocalStorage = () => {
    if (store.get(Wasabee.Constants.OP_RESTRUCTURE_KEY) == null) {
        window.plugin.wasabee.resetOpList();
        store.set(Wasabee.Constants.OP_RESTRUCTURE_KEY, true);
    }
    //This sets up the op list
    var opList = null;
    var opListObj = store.get(Wasabee.Constants.OP_LIST_KEY);
    if (opListObj != null) {
        opList = JSON.parse(opListObj);
    }

    if (opList == null) {
        var baseOp = new Operation(PLAYER.nickname, "Default Op", true);
        var listToStore = [];
        listToStore.push(baseOp);
        store.set(Wasabee.Constants.OP_LIST_KEY, JSON.stringify(listToStore));
        opList = JSON.parse(store.get(Wasabee.Constants.OP_LIST_KEY));
    }
    Wasabee.opList = opList;

    //This sets up the paste list
    var pasteList = null;
    var pasteListObj = store.get(Wasabee.Constants.PASTE_LIST_KEY);
    if (pasteListObj != null) { pasteList = JSON.parse(pasteListObj); }
    if (pasteList == null) {
        var emptyList = [];
        store.set(Wasabee.Constants.PASTE_LIST_KEY, JSON.stringify(emptyList));
        pasteList = JSON.parse(store.get(Wasabee.Constants.PASTE_LIST_KEY));
    }
    Wasabee.pasteList = pasteList;
};



//** This function takes an operation and updates the entry in the op list that matches it */
window.plugin.wasabee.updateOperationInList = (operation, makeSelected = false, clearAllBut = false, showExportDialog = false) => {
    var updatedArray = [];
    if (!(operation instanceof Operation)) {
        operation = Operation.create(operation);
    }
    operation.cleanPortalList();

    var selectedOpID = null;
    for (let opInList of Wasabee.opList) {
        if (!makeSelected) {
            if (opInList.isSelected) {
                selectedOpID = opInList.ID;
            }
        }
        if (opInList.ID != operation.ID && clearAllBut != true) {
            if (makeSelected) { opInList.isSelected = false; }
            updatedArray.push(opInList);
        }
    }

    if (makeSelected || selectedOpID == operation.ID) { operation.isSelected = true; }
    updatedArray.push(operation);

    if (updatedArray.length != 0) {
        updatedArray.sort((a, b) => {
            if (a.name.toLowerCase() < b.name.toLowerCase()) { return -1; }
            if (a.name.toLowerCase() > b.name.toLowerCase()) { return 1; }
            return 0;
        });
        store.set(Wasabee.Constants.OP_LIST_KEY, JSON.stringify(updatedArray));
        Wasabee.opList = updatedArray;
        var selectedOp = window.plugin.wasabee.getSelectedOperation();
        LinkDialog.update(selectedOp, false);
        LinkListDialog.update(selectedOp, null, false);
        OpsDialog.update(Wasabee.opList, false);
        MarkerDialog.update(selectedOp, false, false);

        drawThings();
    } else { alert("Parse Error -> Saving Op List Failed"); }

    if (showExportDialog) { Wasabee.ExportDialog.show(operation); }

    window.plugin.wasabee.addButtons();
};

//** This function removes an operation from the main list */
window.plugin.wasabee.removeOperationFromList = (operation) => {
    if (Wasabee.opList.length > 1) {
        var updatedArray = [];
        for (let opInList of Wasabee.opList) {
            if (opInList.ID != operation.ID) {
                updatedArray.push(opInList);
            }
        }
        store.set(Wasabee.Constants.OP_LIST_KEY, JSON.stringify(updatedArray));
        Wasabee.opList = updatedArray;
        window.plugin.wasabee.updateOperationInList(Wasabee.opList[0], operation.isSelected);
    }
};

var _dialogs = [];

export class OpsDialog {
    constructor(operationList) {
        this._operationList = operationList;
        _dialogs.push(this);
        this.container = document.createElement("div");
        this.container.id = "op-dialog-tabs";
        this.setupSpinner();
        var self = this;
        this._dialog = window.dialog({
            title: "Operation List",
            width: "auto",
            height: "auto",
            html: this.container,
            dialogClass: "wasabee-dialog wasabee-dialog-ops",
            closeCallback: function (popoverName) {
                var paneIndex = _dialogs.indexOf(self);
                if (-1 !== paneIndex) {
                    _dialogs.splice(paneIndex, 1);
                }
            }
        });
    }
    setupSpinner() {
        var self = this;
        this.container.innerHTML = "";
        $(this.container).css({
            "text-align": "center",
        });
        var operationSelect = document.createElement("select");
        $(operationSelect).css({
            "width": "50%"
        });
        this._operationList.forEach(function (op) {
            $(operationSelect).append($("<option>").prop({
                value: op.ID,
                text: op.name
            }));
        });
        $(operationSelect).val(window.plugin.wasabee.getSelectedOperation().ID);
        $(operationSelect).change(function () {
            self.updateContentPane(window.plugin.wasabee.getOperationById($(this).val()), self._operationList.length);
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
        var tabContent = this._opContent;
        tabContent.innerHTML = "";
        var nameSection = tabContent.appendChild(document.createElement("p"));
        nameSection.innerHTML = "Op Name -> ";
        var input = nameSection.appendChild(document.createElement("input"));
        input.type = "text";
        input.id = "op-dialog-content-nameinput";
        input.value = operation.name;
        var colorSection = tabContent.appendChild(document.createElement("p"));
        colorSection.innerHTML = "Op Color -> ";
        var operationColor = Wasabee.Constants.DEFAULT_OPERATION_COLOR;
        if (operation.color != null) {
            operationColor = operation.color;
        }
        var opColor = colorSection.appendChild(document.createElement("select"));
        scope.layerTypes.forEach(function (a) {
            var option = document.createElement("option");
            if (a.name == operationColor) {
                option.setAttribute("selected", true);
            }
            option.setAttribute("value", a.name);
            option.innerHTML = a.displayName;
            opColor.append(option);
        });
        $(opColor).change(function () {
            Operation.create(operation).colorSelected($(opColor).val(), input.value, commentInput.value);
        });
        //TODO enable comment section when !serverOp || (ownedServerOp)
        var opIsOwnedServerOp = window.plugin.wasabee.opIsOwnedServerOp(operation.ID);
        var opIsServerOp = window.plugin.wasabee.opIsServerOp(operation.ID);
        var commentInputEnabled = !opIsServerOp || opIsOwnedServerOp;
        var commentSection = tabContent.appendChild(document.createElement("p"));
        var commentInput = commentSection.appendChild(document.createElement("textarea"));
        commentInput.type = "text";
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
        saveButton.addEventListener("click", function (arg) {
            if (input.value == null || input.value == "") {
                alert("That is an invalid operation name");
            }
            else {
                operation.name = input.value;
                window.plugin.wasabee.updateOperationInList(Operation.create(operation));
            }
        }, false);
        if (commentInputEnabled) {
            var saveCommentButton = buttonSection.appendChild(document.createElement("a"));
            saveCommentButton.innerHTML = "Save Operation Comment";
            saveCommentButton.addEventListener("click", function (arg) {
                if (commentInput.value == null || commentInput.value == "") {
                    alert("That is an invalid operation comment");
                }
                else {
                    operation.comment = commentInput.value;
                    window.plugin.wasabee.updateOperationInList(Operation.create(operation));
                }
            }, false);
        }
        if (!operation.isSelected) {
            var selectedButton = buttonSection.appendChild(document.createElement("a"));
            selectedButton.innerHTML = "Set Selected";
            selectedButton.addEventListener("click", function (arg) {
                var confirmed = confirm("Are you sure you want to select this operation?");
                if (confirmed) {
                    window.plugin.wasabee.updateOperationInList(Operation.create(operation), true);
                }
            }, false);
        }
        var exportButton = buttonSection.appendChild(document.createElement("a"));
        exportButton.innerHTML = "Export";
        exportButton.addEventListener("click", function () {
            OpsDialog.update([], false, true);
            Wasabee.ExportDialog.show(operation);
        }, false);
        var clearOpButton = buttonSection.appendChild(document.createElement("a"));
        clearOpButton.innerHTML = "Clear Portals/Links/Markers";
        clearOpButton.addEventListener("click", function (arg) {
            var confirmClear = confirm("Are you sure you want to clear all portals, links, and markers from this operation?");
            if (confirmClear == true) {
                Operation.create(operation).clearAllItems();
            }
        }, false);
        var deleteButton = buttonSection.appendChild(document.createElement("a"));
        deleteButton.innerHTML = "Delete";
        deleteButton.disabled = opListSize == 0;
        deleteButton.addEventListener("click", function (arg) {
            var confirmed = confirm("Are you sure you want to *DELETE* this operation?");
            if (confirmed == true) {
                if (window.plugin.wasabee.opIsOwnedServerOp(operation.ID)) {
                    var confirmedDeleteServerOp = confirm("Are you sure you want to *DELETE* this operation on the *SERVER*?");
                    if (confirmedDeleteServerOp) {
                        window.plugin.wasabee.deleteOwnedServerOp(operation.ID);
                    }
                }
                window.plugin.wasabee.removeOperationFromList(Operation.create(operation));
            }
        }, false);
    }
    saveOperation(operation) {
    }
    focus() {
        this._dialog.dialog("open");
    }
    static update(operationList, show = true, close = false) {
        var parameters = _dialogs;
        if (parameters.length != 0) {
            show = false;
            for (var index in parameters) {
                var page = parameters[index];
                if (close) {
                    return page._dialog.dialog("close");
                }
                page._operationList = operationList; //doesn't update, need to manually?
                page.setupSpinner();
                return page.focus(), page;
            }
        }
        if (show) {
            return new init(operationList);
        }
        else {
            return;
        }
    }
    static closeDialogs() {
        var parameters = _dialogs;
        for (p = 0; p < parameters.length; p++) {
            var page = parameters[p];
            page._dialog.dialog("close");
        }
    }
    static updateOperation(operationList) {
        this._operationList = operationList;
    }
}