window.plugin.wasabee.showAddOpDialog = function () {
    var content = document.createElement("div");
    content.className = "wasabee-dialog wasabee-dialog-ops"
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
    importButton.addEventListener("click", function () {
        windowDialog.dialog('close')
        window.plugin.wasabee.importString();
    }, false);

    addButton.addEventListener("click", function () {
        windowDialog.dialog('close')
        var promptAction = prompt('Enter an operation name.  Must not be empty.', '');
        if (promptAction !== null && promptAction !== '') {
            console.log("promptaction -> " + promptAction)
            window.plugin.wasabee.updateOperationInList(new Operation(PLAYER.nickname, promptAction, true), true)
        } else {
            alert("You must enter a valid Operation name. Try again.")
        }
    }, false);
}

window.plugin.wasabee.showMustAuthAlert = function () {
    var content = document.createElement("div");
    var title = content.appendChild(document.createElement("div"));
    title.className = "desc";
    title.innerHTML = "In order to sync operations, you must log in.<br/>"
    buttonSet = content.appendChild(document.createElement("div"));
    buttonSet.className = "temp-op-dialog";
    var visitButton = buttonSet.appendChild(document.createElement("a"));
    visitButton.innerHTML = "Visit Site"
    visitButton.addEventListener("click", function () {
        window.open("https://server.wasabee.rocks")
    }, false);
    window.dialog({
        title: "You Must Authenticate",
        width: "auto",
        height: "auto",
        html: content,
        dialogClass: "wasabee-dialog-mustauth"
    });
}

window.plugin.wasabee.addCSS = function (content) {
    $("head").append('<link rel="stylesheet" type="text/css" href="' + content + '" />');
}

//*** This function iterates through the opList and returns the selected one.
window.plugin.wasabee.getSelectedOperation = function () {
    for (let operation of Wasabee.opList) {
        if (operation.isSelected == true) {
            return Operation.create(operation);
        }
    }
    return null;
}

window.plugin.wasabee.getOperationById = function (opId) {
    for (let operation of Wasabee.opList) {
        if (operation.ID == opId) {
            return Operation.create(operation);
        }
    }
    return null;
}

//*** This function creates an op list if one doesn't exist and sets the op list for the plugin
window.plugin.wasabee.setupLocalStorage = function () {
    if (store.get(Wasabee.Constants.OP_RESTRUCTURE_KEY) == null) {
        window.plugin.wasabee.resetOpList();
        store.set(Wasabee.Constants.OP_RESTRUCTURE_KEY, true)
    }
    //This sets up the op list
    var opList = null;
    var opListObj = store.get(Wasabee.Constants.OP_LIST_KEY)
    if (opListObj != null) {
        opList = JSON.parse(opListObj);
    }

    if (opList == null) {
        var baseOp = new Operation(PLAYER.nickname, "Default Op", true);
        var listToStore = new Array();
        listToStore.push(baseOp);
        store.set(Wasabee.Constants.OP_LIST_KEY, JSON.stringify(listToStore));
        opList = JSON.parse(store.get(Wasabee.Constants.OP_LIST_KEY));
    }
    Wasabee.opList = opList;

    //This sets up the paste list
    var pasteList = null;
    var pasteListObj = store.get(Wasabee.Constants.PASTE_LIST_KEY)
    if (pasteListObj != null)
        pasteList = JSON.parse(pasteListObj);
    if (pasteList == null) {
        var emptyList = Array();
        store.set(Wasabee.Constants.PASTE_LIST_KEY, JSON.stringify(emptyList))
        pasteList = JSON.parse(store.get(Wasabee.Constants.PASTE_LIST_KEY))
    }
    Wasabee.pasteList = pasteList;
}



//** This function takes an operation and updates the entry in the op list that matches it */
window.plugin.wasabee.updateOperationInList = function (operation, makeSelected = false, clearAllBut = false, showExportDialog = false) {
    var updatedArray = new Array();
    if (!(operation instanceof Operation)) {
        operation = Operation.create(operation)
    }
    operation.cleanPortalList();

    var selectedOpID = null;
    for (let opInList of Wasabee.opList) {
        if (!makeSelected) {
            if (opInList.isSelected) {
                selectedOpID = opInList.ID
            }
        }
        if (opInList.ID != operation.ID && clearAllBut != true) {
            if (makeSelected)
                opInList.isSelected = false;
            updatedArray.push(opInList);
        }
    }

    if (makeSelected || selectedOpID == operation.ID)
        operation.isSelected = true;
    updatedArray.push(operation);

    if (updatedArray.length != 0) {
        updatedArray.sort(function (a, b) {
            if (a.name.toLowerCase() < b.name.toLowerCase()) { return -1; }
            if (a.name.toLowerCase() > b.name.toLowerCase()) { return 1; }
            return 0;
        })
        store.set(Wasabee.Constants.OP_LIST_KEY, JSON.stringify(updatedArray));
        Wasabee.opList = updatedArray;
        var selectedOp = window.plugin.wasabee.getSelectedOperation();
        Wasabee.LinkDialog.update(selectedOp, false)
        Wasabee.LinkListDialog.update(selectedOp, null, false);
        Wasabee.OpsDialog.update(Wasabee.opList, false);
        Wasabee.MarkerDialog.update(selectedOp, false, false)

        window.plugin.wasabee.drawThings();
    } else
        alert("Parse Error -> Saving Op List Failed");

    if (showExportDialog)
        Wasabee.ExportDialog.show(operation)

    window.plugin.wasabee.addButtons();
}

//** This function removes an operation from the main list */
window.plugin.wasabee.removeOperationFromList = function (operation) {
    if (Wasabee.opList.length > 1) {
        var updatedArray = new Array();
        for (let opInList of Wasabee.opList) {
            if (opInList.ID != operation.ID) {
                updatedArray.push(opInList);
            }
        }
        store.set(Wasabee.Constants.OP_LIST_KEY, JSON.stringify(updatedArray));
        Wasabee.opList = updatedArray;
        window.plugin.wasabee.updateOperationInList(Wasabee.opList[0], operation.isSelected)
    }
}