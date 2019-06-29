window.plugin.wasabee.getColorMarker = (color) => {
    var marker = null;
    Wasabee.layerTypes.forEach((type) => {
        if (type.name == color) {
            marker = type.portal["iconUrl"];
        }
    });
    return marker;
}

window.plugin.wasabee.getColorHex = (color) => {
    var hex = null;
    Wasabee.layerTypes.forEach((type) => {
        if (type.name == color) {
            hex = type.color;
        }
    });
    return hex;
}


Wasabee.markerDialog = class {
    constructor(operation) {
        markerDialogFunction._dialogs.push(this);
        var self = this;
        this._target = null;
        this._operation = operation;
        this._type = $("<select>");
        Wasabee.alertTypes.forEach((a) => {
            self._type.append($("<option>").prop({
                value: a.name,
                text: a.label
            }));
        });
        this._type.val(Wasabee.Constants.DEFAULT_ALERT_TYPE);
        this._comment = $("<input>").attr("placeholder", "comment");
        /*  Uncomment this when adding specific targetting to agents
        this._agent = $('<select class="wasabee-agentselect"></select>').css({
          width : "100%",
          boxSizing : "border-box"
        });
        */
        var $element = $("<div>").addClass("wasabee-targetselect").text("To: ");
        this._targetLink = $("<strong>").text("(not set)").appendTo($element);
        $("<button>")
            .text("set")
            .click(() => self.setTarget(Wasabee.UiHelper.getSelectedPortal()))
            .appendTo($element);
        this._targetMenu = new Wasabee.OverflowMenu;
        this._targetMenu.button.firstElementChild.textContent = "\u25bc";
        $element.append(this._targetMenu.button);
        this._container = $("<div />").append($("<div>").addClass("flex").append(this._type).append(this._comment)).append(document.createTextNode(" ")).append(this._agent).append($element);
        $element.hide(); //TODO remove this when create link alert added
        this._type.change(() => {
            //console.log("Changed to type -> " + self._type.val())
            /*
            self._preferences.save();
            if ("CreateLinkAlert" == self._type.val()) {
              $element.css("display", "");
            } else {
              $element.hide();
            }
            */
        });
        this._type.change();
        this._dialog = window.dialog({
            title: this._operation.name + " Markers",
            dialogClass: "wasabee-dialog-alerts",
            html: this._container,
            width: "300",
            height: "auto",
            position: {
                my: "center top",
                at: "center center+30"
            },
            closeCallback: () => markerDialogFunction._dialogs = [],
        });
        this._dialog.dialog("option", "buttons", {
            "add marker": () => self.sendAlert(self._type.val(), self._operation, self._comment.val()),
            close: () => {
                markerDialogFunction._dialogs = Array();
                self._dialog.dialog("close");
            }
        });
    }
    focus() {
        this._dialog.dialog("open");
    }
    sendAlert(selectedType, operation, comment) {
        operation.addMarker(selectedType, Wasabee.UiHelper.getSelectedPortal(), comment);
    }
    static update(operation, close = false, show = true) {
        var parameters = markerDialogFunction._dialogs;
        if (parameters.length != 0) {
            show = false;
            for (index in parameters) {
                var page = parameters[index];
                if (operation.ID != page._operation.ID || close) {
                    return page._dialog.dialog('close');
                }
                else {
                    page._operation = operation;
                    return page.focus(), page;
                }
            }
        }
        if (show)
            return new markerDialogFunction(operation);
        else
            return;
    }
    static closeDialogs() {
        var parameters = markerDialogFunction._dialogs;
        for (p = 0; p < parameters.length; p++) {
            var page = parameters[p];
            page._dialog.dialog('close');
        }
    }
};
Wasabee.markerDialog._dialogs = [];