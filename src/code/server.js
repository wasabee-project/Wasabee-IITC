import store from "store";
import Operation from "./operation";

var Wasabee = window.plugin.Wasabee;

export default function() {
    function sendServerRequest(endpoint, method, data) {
        method = method || "GET";
        let options = {
            url: Wasabee.Constants.SERVER_BASE_KEY + endpoint,
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            method: method
        };

        if (data) {
            $.extend(options, {
                data: JSON.stringify(data),
                dataType: "json",
                contentType: "application/json"
            });
        }

        return $.ajax(options);
    }

    window.plugin.wasabee.authWithWasabee = () =>
        sendServerRequest("/me")
        .done((response) => {
            if (response.Ops != null) {
                window.plugin.wasabee.updateServerOpList(response.Ops, true);
            }
        }).fail(() => {
            window.plugin.wasabee.showMustAuthAlert();
        });

    window.plugin.wasabee.uploadSingleOp = (operation) =>
        sendServerRequest("/api/v1/draw", "POST", operation)
        .done((response) => {
            //  We shouldn't read an answer to this. It's a POST.
            if (response.Ops != null) {
                window.plugin.wasabee.updateServerOpList(response.Ops, false);
            }
            alert("Upload Complete.");
        }).fail(() => {
            window.plugin.wasabee.showMustAuthAlert();
        });

    window.plugin.wasabee.updateSingleOp = (operation) =>
        sendServerRequest("/api/v1/draw/" + operation.ID, "PUT", operation)
        .done(() => {
            alert("Update Complete.");
        }).fail(() => {
            window.plugin.wasabee.showMustAuthAlert();
        });

    window.plugin.wasabee.downloadSingleOp = (operation) =>
        sendServerRequest("/api/v1/draw/" + operation.ID)
        .done((response) => {
            console.log("got response -> " + JSON.stringify(response));
        }).fail(() => {
            alert("Download Failed.");
        });

    //TODO: Should this use the DELETE verb?
    window.plugin.wasabee.deleteOwnedServerOp = (opID) =>
        sendServerRequest("/api/v1/draw/" + opID + "/delete")
        .done((response) => {
            console.log("got response -> " + JSON.stringify(response));
        }).fail(() => {
            window.plugin.wasabee.showMustAuthAlert();
        });

    window.plugin.wasabee.getOpDownloads = (opList) => {
        var opCalls = [];
        opList.forEach((op, index) => {
            opCalls.push(window.plugin.wasabee.downloadOpInList(op));
            console.log(op, index);
        });
        return opCalls;
    };

    window.plugin.wasabee.downloadOpInList = (op) =>
        sendServerRequest("/api/v1/draw/" + op.ID)
        .done((response) => {
            window.plugin.wasabee.updateOperationInList(Operation.create(response));
        }).fail(() => {
            alert("Download Failed.");
        });

    window.plugin.wasabee.updateServerOpList = (opList, pullFullOps) => {
        let ownedOpList = opList.filter((op) => op.IsOwner);
        store.set(Wasabee.Constants.SERVER_OP_LIST_KEY, JSON.stringify(JSON.stringify(opList)));
        store.set(Wasabee.Constants.SERVER_OWNED_OP_LIST_KEY, JSON.stringify(JSON.stringify(ownedOpList)));
        console.log("opList -> " + JSON.stringify(opList));
        if (pullFullOps) {
            console.log("pulling ops");
            Promise.all(window.plugin.wasabee.getOpDownloads(opList)).then(() => {
                alert("Sync Complete.");
            }).catch((data) => {
                throw alert(data.message), console.log(data), data;
            });
        }
    };

    window.plugin.wasabee.opIsOwnedServerOp = (opID) => {
        console.log("opId -> " + opID);
        var isOwnedServerOp = false;
        try {
            var serverOwnedOpList = JSON.parse(JSON.parse(store.get(Wasabee.Constants.SERVER_OWNED_OP_LIST_KEY))) //Gotta do 2 json.parses b/c javascript is dumb?
            if (serverOwnedOpList != null) {
                for (let opInList in serverOwnedOpList) {
                    if (serverOwnedOpList[opInList].ID == opID) {
                        isOwnedServerOp = true;
                    }
                }
            }
        } catch (e) {
            console.log("No Server ops or some other exception")
        }
        return isOwnedServerOp;
    };

    window.plugin.wasabee.opIsServerOp = (opID) => {
        var isServerOp = false;
        try {
            var serverOpList = JSON.parse(JSON.parse(store.get(Wasabee.Constants.SERVER_OP_LIST_KEY))) //Gotta do 2 json.parses b/c javascript is dumb?
            if (serverOpList != null) {
                for (let opInList in serverOpList) {
                    if (serverOpList[opInList].ID == opID) {
                        isServerOp = true;
                    }
                }
            }
        } catch (e) {
            console.log("No Server ops or some other exception")
        }
        return isServerOp;
    };
}