import Link from "./link";
import Marker from "./marker";

// don't use this _dialog[] any more. Use the new framework.
//var Wasabee = window.plugin.Wasabee;

export default class AssignDialog {
  constructor(operation, target) {
    console.log(operation);
    console.log(target);

    this._operation = operation;
    this._dialog = null;
    this._html = "unable to determine target type";
    this._targetID = target.id;

    // determine target type - link or marker
    if (target instanceof Link) {
      this._html = "looking for a link";
      this._name = "Assign marker for " + target.name;
    }

    if (target instanceof Marker) {
      this._html = "looking for a marker";
      this._name = "Assign link from " + target.fromPortalID;
    }

    this._dialog = window.dialog({
      html: this._html,
      dialogClass: "wasabee-dialog",
      title: this._name,
      width: "auto",
      closeCallback: () => {
        window.removeHook("wasabeeUIUpdate", this.update);
      },
      id: window.plugin.Wasabee.static.dialogNames.assign + this._targetID // this breaks determinism?
    });
    window.addHook("wasabeeUIUpdate", this.update);
  }

  update(operation) {
    console.log("assignDialog.update called");
    console.log(this);
    console.log(operation);
  }
}
