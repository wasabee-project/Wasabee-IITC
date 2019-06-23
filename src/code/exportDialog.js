!function (scope) {
    var exportDialogFunction = function () {
        function init(operation) {
            init._dialogs.push(this);
            this._operation = operation
            this._mainContent = document.createElement("div")
            this.updateContentPane()
            var self = this
            this._dialog = window.dialog({
                title: this._operation.name + " - Export",
                width: "auto",
                height: "auto",
                html: this._mainContent,
                dialogClass: "wasabee-dialog wasabee-dialog-ops",
                closeCallback: function (popoverName) {
                    init._dialogs = Array()
                }
            });
        }
        return init.show = function (operation) {
            var parameters = init._dialogs;
            if (parameters.length != 0) {
                show = false;
                for (index in parameters) {
                    var page = parameters[index]
                    page._operation = operation
                    page.updateContentPane()
                    return page.focus(), page;
                }
            }
            if (show)
                return new init(operation);
            else
                return;
        }, init.prototype.updateContentPane = function () {
            var mainContent = this._mainContent
            var operation = this._operation
            mainContent.innerHTML = "";
            var textArea = mainContent.appendChild(document.createElement("div"))
            textArea.className = "ui-dialog-wasabee-copy"
            textArea.innerHTML = '<p><a onclick="$(\'.ui-dialog-wasabee-copy textarea\').select();">Select all</a> and press CTRL+C to copy it.</p>'
                + '<textarea readonly onclick="$(\'.ui-dialog-wasabee-copy textarea\').select();">' + JSON.stringify(operation) + '</textarea>'

            var linkArea = mainContent.appendChild(document.createElement("div"))
            linkArea.className = "temp-op-dialog";

            var pasteLink = window.plugin.wasabee.getPasteLink(operation);
            if (pasteLink == null) {
                var createLinkButton = linkArea.appendChild(document.createElement("a"))
                createLinkButton.innerHTML = "Create Sharing Link"
                createLinkButton.addEventListener("click", function (arg) {
                    var confirmedCreate = confirm("Are you sure you want to create a share link? This will make data for this Op accessable to anyone with the link.")
                    if (confirmedCreate) {
                        window.plugin.wasabee.qbin_put(btoa(JSON.stringify(operation))).then(link => window.plugin.wasabee.gotQbinLink(link, operation));
                    }
                }, false);
            } else {
                linkArea.appendChild(document.createElement("p"))
                var paragraph = linkArea.appendChild(document.createElement("p"))
                paragraph.innerHTML = "<b>Operation Share Link</b>"
                var urlInputBox = linkArea.appendChild(document.createElement("textarea"));
                urlInputBox.setAttribute("readonly", true)
                urlInputBox.innerHTML = pasteLink;
                $(urlInputBox).css("max-width", "100%");
                $(urlInputBox).css("min-width", "100%");
                var createLinkButton = linkArea.appendChild(document.createElement("a"))
                createLinkButton.innerHTML = "Re-create Sharing Link"
                createLinkButton.addEventListener("click", function (arg) {
                    var confirmedCreate = confirm("Are you sure you want to re-create a share link? The URL will differ from the original link, and the original link will still function until it expires.")
                    if (confirmedCreate) {
                        window.plugin.wasabee.qbin_put(btoa(JSON.stringify(operation))).then(link => window.plugin.wasabee.gotQbinLink(link, operation));
                    }
                }, false);
            }
        }, init.prototype.focus = function () {
            this._dialog.dialog("open");
        }, init._dialogs = [], init;
    }();
    scope.ExportDialog = exportDialogFunction;
}(Wasabee || (Wasabee = {}));