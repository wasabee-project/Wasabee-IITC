import UiCommands from "./uiCommands.js";
import UiHelper from "./uiHelper.js";

var _dialogs = [];

export default  class LinkDialog {
    constructor(op) {
        var self = this;
        self.clearLocalPortalSelections();
        this._broadcast = new BroadcastChannel("wasabee-linkdialog");
        this._portals = {};
        this._links = [];
        this._operation = op;
        _dialogs.push(this);
        var container = document.createElement("div");
        this._desc = container.appendChild(document.createElement("textarea"));
        this._desc.placeholder = "Description (optional)";
        this._desc.className = "desc";
        var tr;
        var node;
        var button;
        var filter;
        var rdnTable = container.appendChild(document.createElement("table"));
        [0, 1, 2].forEach((string) => {
            var type = 0 == string ? "src" : "dst-" + string;
            tr = rdnTable.insertRow();
            tr.setAttribute("data-portal", type);
            node = tr.insertCell();
            if (0 != string) {
                filter = node.appendChild(document.createElement("input"));
                // filter.type = "checkbox";
                filter.checked = true;
                filter.value = type;
                self._links.push(filter);
            }
            node = tr.insertCell();
            node.textContent = 0 == string ? "from" : "to (#" + string + ")";
            node = tr.insertCell();
            button = node.appendChild(document.createElement("button"));
            button.textContent = "set";
            button.addEventListener("click", (arg) => self.setPortal(arg), false);
            node = tr.insertCell();
            if (0 != string) {
                button = node.appendChild(document.createElement("button"));
                button.textContent = "add";
                button.addEventListener("click", (other) => self.addLinkTo(other, self._operation), false);
            }
            node = tr.insertCell();
            node.className = "portal portal-" + type;
            self._portals[type] = node;
            self.updatePortal(type);
        });
        var element = container.appendChild(document.createElement("div"));
        element.className = "buttonbar";
        var div = element.appendChild(document.createElement("span"));
        var opt = div.appendChild(document.createElement("span"));
        opt.className = "arrow";
        opt.textContent = "\u21b3";
        button = div.appendChild(document.createElement("button"));
        button.textContent = "add all";
        button.addEventListener("click", () => self.addAllLinks(self._operation), false);
        var cardHeader = element.appendChild(document.createElement("label"));
        this._reversed = cardHeader.appendChild(document.createElement("input"));
        this._reversed.type = "checkbox";
        cardHeader.appendChild(document.createTextNode(" reverse"));
        //var layerSelector = new Wasabee.LayerSelector(this._layerManager, this._operation.data);
        //layerSelector.label = false;
        //element.appendChild(layerSelector.container);
        button = element.appendChild(document.createElement("button"));
        button.textContent = "close";
        button.addEventListener("click", () => self._dialog.dialog("close"), false);
        var sendMessage = (name) => self.onMessage(name);
        this._broadcast.addEventListener("message", sendMessage, false);
        this._dialog = window.dialog({
            title: this._operation.name + " - Wasabee Links",
            width: "auto",
            height: "auto",
            html: container,
            dialogClass: "wasabee-dialog wasabee-dialog-links",
            closeCallback: () => {
                self._broadcast.removeEventListener("message", sendMessage, false);
                var paneIndex = _dialogs.indexOf(self);
                if (-1 !== paneIndex) {
                    _dialogs.splice(paneIndex, 1);
                }
                self.clearLocalPortalSelections();
            }
        });
        this._dialog.dialog("option", "buttons", {});
    }
    focus() {
        this._dialog.dialog("open");
    }
    onMessage(command) {
        if ("setPortal" === command.data.type) {
            this.updatePortal(command.data.name);
        }
        //***Function to clear local selections of portals for the dialog
    }
    clearLocalPortalSelections() {
        delete localStorage["wasabee-portal-dst-1"];
        delete localStorage["wasabee-portal-dst-2"];
        delete localStorage["wasabee-portal-dst-3"];
        delete localStorage["wasabee-portal-src"];
        //***Function to set portal -- called from 'Set' Button
    }
    setPortal(event) {
        var updateID = event.currentTarget.parentNode.parentNode.getAttribute("data-portal");
        var selectedPortal = UiHelper.getSelectedPortal();
        if (selectedPortal) {
            localStorage["wasabee-portal-" + updateID] = JSON.stringify(selectedPortal);
        }
        else {
            alert("No Portal Selected.");
            delete localStorage["wasabee-portal-" + updateID];
        }
        this.updatePortal(updateID);
        this._broadcast.postMessage({
            type: "setPortal",
            name: updateID
        });
        //***Function to get portal -- called in updatePortal, addLinkTo, and addAllLinks
    }
    getPortal(name) {
        try {
            return JSON.parse(localStorage["wasabee-portal-" + name]);
        }
        catch (b) {
            return null;
        }
        //***Function to update portal in the dialog
    }
    updatePortal(key) {
        var i = this.getPortal(key);
        var viewContainer = this._portals[key];
        $(viewContainer).empty();
        if (i) {
            viewContainer.appendChild(UiHelper.getPortalLink(i));
        }
        //***Function to add link between the portals -- called from 'Add' Button next to To portals
    }
    addLinkTo(instance, operation) {
        var item = this;
        var server = instance.currentTarget.parentNode.parentNode.getAttribute("data-portal");
        var linkTo = this.getPortal(server);
        var source = this.getPortal("src");
        if (!source || !linkTo) {
            return void alert("Please select target and destination portals first!");
        }
        var isReversed = this._reversed.checked;
        if (source.id == linkTo.id) {
            return void alert("Target and destination portals must be different.");
        }
        else {
            Promise.all([
                item.addPortal(source),
                item.addPortal(linkTo),
                isReversed ? item.addLink(linkTo, source) : item.addLink(source, linkTo)
            ])
            .then(() => operation.update())
            .catch((data) => {
                throw alert(data.message), console.log(data), data;
            });
        }
        //***Function to add all the links between the from and all the to portals -- called from 'Add All Links' Button
    }
    addAllLinks(operation) {
        var item = this;
        var source = this.getPortal("src");
        if (!source) {
            return void alert("Please select a target portal first!");
        }
        var resolvedSourceMapConfigs = this._links
            .map((b) => b.checked ? item.getPortal(b.value) : null)
            .filter((a) => null != a);
        if (0 == resolvedSourceMapConfigs.length) {
            return void alert("Please select a destination portal first!");
        }
        var isReversedChecked = this._reversed.checked;
        var documentBodyPromise = this.addPortal(source);
        Promise.all(resolvedSourceMapConfigs.map((linkTo) => {
            return Promise.all([
                documentBodyPromise,
                item.addPortal(linkTo),
                isReversedChecked ? item.addLink(linkTo, source) : item.addLink(source, linkTo)
            ]).then(() => operation.update());
        })).catch((data) => {
            throw alert(data.message), console.log(data), data;
        });
        //***Function to add a portal -- called in addLinkTo and addAllLinks functions
    }
    addPortal(sentPortal) {
        var resolvedLocalData = Promise.resolve(this._operation.opportals);
        return sentPortal ?
            (this._operation.opportals.some((gotPortal) => gotPortal.id == sentPortal.id) ?
                resolvedLocalData :
                UiCommands.addPortal(this._operation, sentPortal, "", true))
            : Promise.reject("no portal given");
    }
    //***Function to add a single link -- called in addLinkTo and addAllLinks functions
    addLink(fromPortal, toPortal) {
        var description = this._desc.value;
        if (!toPortal || !fromPortal) {
            return Promise.reject("no portal given");
        }
        return this._operation.addLink(fromPortal, toPortal, description);
    }
    static update(operation, show) {
        var p = 0;
        var parameters = _dialogs;
        for (; p < parameters.length; p++) {
            var page = parameters[p];
            if (page._operation.ID == operation.ID) {
                page._operation = operation;
                return page.focus(), page;
            }
            else {
                return page._dialog.dialog("close");
            }
        }
        if (show)
            {return new LinkDialog(operation);}
        else
            {return;}
    }
    static closeDialogs() {
        var parameters = _dialogs;
        for (p = 0; p < parameters.length; p++) {
            var page = parameters[p];
            page._dialog.dialog("close");
        }
    }
}
