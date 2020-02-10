import { Feature } from "./leafletDrawImports";
import { ImportDialogControl } from "./importDialog";
import WasabeeOp from "./operation";
import PromptDialog from "./promptDialog";

const NewopButtonControl = Feature.extend({
  statics: {
    TYPE: "newopButton"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = NewopButtonControl.TYPE;
    Feature.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    if (!this._map) return;
    Feature.prototype.addHooks.call(this);
    this._displayDialog(this);
  },

  _displayDialog: function(noHandler) {
    const content = document.createElement("div");
    content.className = "wasabee-dialog wasabee-dialog-ops";
    const buttonSet = content.appendChild(document.createElement("div"));
    buttonSet.className = "temp-op-dialog";
    const addButton = buttonSet.appendChild(document.createElement("a"));
    addButton.textContent = "Add New Op";

    const importButton = buttonSet.appendChild(document.createElement("a"));
    importButton.textContent = "Import Op";
    importButton.addEventListener(
      "click",
      () => {
        noHandler._dialog.dialog("close");
        // window.plugin.wasabee.importString();
        const id = new ImportDialogControl(this._map, null);
        id.enable();
      },
      false
    );

    addButton.addEventListener(
      "click",
      () => {
        noHandler._dialog.dialog("close");
        const addDialog = new PromptDialog(this._map);
        addDialog.setup(
          "New Operation",
          "Please Set the New Operation Name",
          () => {
            if (addDialog.inputField.value) {
              const newop = new WasabeeOp(
                PLAYER.nickname,
                addDialog.inputField.value,
                true
              );
              newop.store();
              window.plugin.wasabee.makeSelectedOperation(newop.ID);
              window.runHooks("wasabeeUIUpdate", newop);
            } else {
              alert("Operation Name was Unset");
            }
          }
        );
        addDialog.placeholder = "Must Not Be Empty";
        addDialog.enable();
      },
      false
    );

    this._dialog = window.dialog({
      title: "New Operation",
      width: "auto",
      height: "auto",
      html: content,
      dialogClass: "wasabee-dialog-mustauth",
      closeCallback: function() {
        noHandler.disable();
        delete noHandler._dialog;
      },
      id: window.plugin.Wasabee.static.dialogNames.newopButton
    });
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
  }
});

export default NewopButtonControl;
