var _exportdialogs = [];

export default class ExportDialog {
  constructor(operation) {
    _exportdialogs.push(this);
    this._operation = operation;
    this._mainContent = document.createElement("div");
    this.updateContentPane();
    this._dialog = window.dialog({
      title: this._operation.name + " - Export",
      width: "auto",
      height: "auto",
      html: this._mainContent,
      dialogClass: "wasabee-dialog wasabee-dialog-ops",
      closeCallback: () => {
        _exportdialogs = [];
      }
    });
  }

  updateContentPane() {
    const mainContent = this._mainContent;
    mainContent.innerHTML = "";
    const textArea = mainContent.appendChild(document.createElement("div"));
    textArea.className = "ui-dialog-wasabee-copy";
    textArea.innerHTML =
      "<p><a onclick=\"$('.ui-dialog-wasabee-copy textarea').select();\">Select all</a> and press CTRL+C to copy it.</p>" +
      "<textarea readonly onclick=\"$('.ui-dialog-wasabee-copy textarea').select();\">" +
      JSON.stringify(this._operation) +
      "</textarea>";
  }

  focus() {
    this._dialog.dialog("open");
  }

  static show(operation) {
    var parameters = _exportdialogs;
    let show = true;
    if (parameters.length != 0) {
      show = false;
      for (var index in parameters) {
        var page = parameters[index];
        page._operation = operation;
        page.updateContentPane();
        return page.focus(), page;
      }
    }
    if (show) {
      return new ExportDialog(operation);
    } else {
      return;
    }
  }
}
