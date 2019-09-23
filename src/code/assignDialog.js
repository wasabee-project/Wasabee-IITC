import Link from "./link";
import Marker from "./marker";
import Team from "./team";

export default class AssignDialog {
  constructor(target, operation) {
    this._operation = operation;
    this._dialog = null;
    this._html = "unable to determine target type";
    this._targetID = target.ID;
    this._html = this._getAgentMenu(target.assignedTo);

    // determine target type - link or marker
    if (target instanceof Link) {
      this._type = "Link";
      const portal = operation.getPortal(target.fromPortalId);
      this._name = "Assign link from: " + portal.name;
    }

    if (target instanceof Marker) {
      this._type = "Marker";
      const portal = operation.getPortal(target.portalId);
      this._name = "Assign marker for: " + portal.name;
    }

    this._dialog = window.dialog({
      html: this._html,
      dialogClass: "wasabee-dialog",
      title: this._name,
      width: "auto",
      // closeCallback: () => { window.removeHook("wasabeeUIUpdate", this.update); },
      id: window.plugin.Wasabee.static.dialogNames.assign + this._targetID
    });
    // window.addHook("wasabeeUIUpdate", this.update);
  }

  /* no need to do anything
  update() {
    console.log("assignDialog.update called");
  } */

  _getAgentMenu(current) {
    const container = document.createElement("div");
    const menu = container.appendChild(document.createElement("select"));
    let option = menu.appendChild(document.createElement("option"));
    option.setAttribute("value", "");
    option.innerHTML = "Unassigned";

    // this needs to make sure not to add the same agent multiple times...
    this._operation.teamlist.forEach(function(t) {
      if (!window.plugin.Wasabee.teams.has(t.teamid)) {
        window.plugin.wasabee.teamPromise(t.teamid).then(
          function(team) {
            console.debug(team);
          },
          function(err) {
            console.log(err);
          }
        );
      }
      const tt = window.plugin.Wasabee.teams.get(t.teamid) || new Team();
      tt.agents.forEach(function(a) {
        option = document.createElement("option");
        option.setAttribute("value", a.id);
        option.innerHTML = a.name;
        if (a.id == current) {
          option.setAttribute("selected", true);
        }
        menu.appendChild(option);
      });
    });
    // ( => ) functions inherit the "this" of the caller
    menu.addEventListener("change", value => {
      this.assign(value);
    });

    return container;
  }

  assign(value) {
    if (this._type == "Marker") {
      this._operation.assignMarker(this._targetID, value.srcElement.value);
      window.plugin.wasabee
        .assignMarkerPromise(
          this._operation.ID,
          this._targetID,
          value.srcElement.value
        )
        .then(
          function(result) {
            console.log(result);
          },
          function(err) {
            console.log(err);
          }
        );
    }
    if (this._type == "Link") {
      this._operation.assignLink(this._targetID, value.srcElement.value);
      window.plugin.wasabee
        .assignLinkPromise(
          this._operation.ID,
          this._targetID,
          value.srcElement.value
        )
        .then(
          function(result) {
            console.log(result);
          },
          function(err) {
            console.log(err);
          }
        );
    }
  }
}
