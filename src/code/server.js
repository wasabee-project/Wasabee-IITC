window.plugin.wasabee.authWithWasabee = (() => $.ajax({
    url: Wasabee.Constants.SERVER_BASE_KEY + "/me",
    xhrFields: {
        withCredentials: true
    },
    crossDomain: true,
    method: "GET",
}).done(function (response) {
    if (response.Ops != null) {
        window.plugin.wasabee.updateServerOpList(response.Ops, response.OwnedOps, true);
    }
}).fail(function (jqXHR, textStatus) {
    window.plugin.wasabee.showMustAuthAlert();
}));

window.plugin.wasabee.uploadSingleOp = ((operation) => $.ajax({
    url: Wasabee.Constants.SERVER_BASE_KEY + "/api/v1/draw",
    xhrFields: {
        withCredentials: true
    },
    data: JSON.stringify(operation),
    crossDomain: true,
    method: "POST",
    dataType: "json",
    contentType: "application/json",
}).done(function (response) {
    if (response.Ops != null) {
        window.plugin.wasabee.updateServerOpList(response.Ops, response.OwnedOps, false);
    }
    alert("Upload Complete.")
}).fail(function (jqXHR, textStatus) {
    window.plugin.wasabee.showMustAuthAlert();
}));

window.plugin.wasabee.updateSingleOp = ((operation) => $.ajax({
    url: Wasabee.Constants.SERVER_BASE_KEY + "/api/v1/draw/" + operation.ID,
    xhrFields: {
        withCredentials: true
    },
    data: JSON.stringify(operation),
    crossDomain: true,
    method: "PUT",
    dataType: "json",
    contentType: "application/json",
}).done(function (response) {
    alert("Update Complete.")
}).fail(function (jqXHR, textStatus) {
    window.plugin.wasabee.showMustAuthAlert();
}));

window.plugin.wasabee.downloadSingleOp = ((operation) => $.ajax({
    url: Wasabee.Constants.SERVER_BASE_KEY + "/api/v1/draw/" + operation.ID,
    xhrFields: {
        withCredentials: true
    },
    crossDomain: true,
    method: "GET",
}).done(function (response) {
    console.log("got response -> " + JSON.stringify(response))
}).fail(function (jqXHR, textStatus) {
    alert("Download Failed.")
}));

window.plugin.wasabee.deleteOwnedServerOp = ((opID) => $.ajax({
    url: Wasabee.Constants.SERVER_BASE_KEY + "/api/v1/draw/" + opID + "/delete",
    xhrFields: {
        withCredentials: true
    },
    crossDomain: true,
    method: "GET",
}).done(function (response) {
    console.log("got response -> " + JSON.stringify(response))
}).fail(function (jqXHR, textStatus) {
    window.plugin.wasabee.showMustAuthAlert();
}));

window.plugin.wasabee.getOpDownloads = function (opList) {
    var opCalls = Array()
    opList.forEach(function (op, index) {
        opCalls.push(window.plugin.wasabee.downloadOpInList(op))
        console.log(op, index);
    });
    return opCalls
}

window.plugin.wasabee.downloadOpInList = ((op) => $.ajax({
    url: Wasabee.Constants.SERVER_BASE_KEY + "/api/v1/draw/" + op.ID,
    xhrFields: {
        withCredentials: true
    },
    crossDomain: true,
    method: "GET",
}).done(function (response) {
    window.plugin.wasabee.updateOperationInList(Operation.create(response))
}).fail(function (jqXHR, textStatus) {
    alert("Download Failed.")
}));

window.plugin.wasabee.updateServerOpList = function (opList, ownedOpList, pullFullOps) {
    store.set(Wasabee.Constants.SERVER_OP_LIST_KEY, JSON.stringify(JSON.stringify(opList)));
    store.set(Wasabee.Constants.SERVER_OWNED_OP_LIST_KEY, JSON.stringify(JSON.stringify(ownedOpList)));
    console.log("opList -> " + JSON.stringify(opList))
    if (pullFullOps) {
        console.log("pulling ops")
        Promise.all(window.plugin.wasabee.getOpDownloads(opList)).then(function () {
            alert("Sync Complete.")
        })["catch"](function (data) {
            throw alert(data.message), console.log(data), data;
        });
    }
}

window.plugin.wasabee.opIsOwnedServerOp = function (opID) {
    console.log("opId -> " + opID)
    var isOwnedServerOp = false;
    try {
        var serverOwnedOpList = JSON.parse(JSON.parse(store.get(Wasabee.Constants.SERVER_OWNED_OP_LIST_KEY))) //Gotta do 2 json.parses b/c javascript is dumb?
        if (serverOwnedOpList != null)
            for (let opInList in serverOwnedOpList) {
                if (serverOwnedOpList[opInList].ID == opID) {
                    isOwnedServerOp = true;
                }
            }
    } catch (e) {
        console.log("No Server ops or some other exception")
    }
    return isOwnedServerOp;
}

window.plugin.wasabee.opIsServerOp = function (opID) {
    var isServerOp = false;
    try {
        var serverOpList = JSON.parse(JSON.parse(store.get(Wasabee.Constants.SERVER_OP_LIST_KEY))) //Gotta do 2 json.parses b/c javascript is dumb?
        if (serverOpList != null)
            for (let opInList in serverOpList) {
                if (serverOpList[opInList].ID == opID) {
                    isServerOp = true;
                }
            }
    } catch (e) {
        console.log("No Server ops or some other exception")
    }
    return isServerOp;
}