import Link from "./link";
import Marker from "./marker";
import Team from "./team";

export default class AssignDialog {
  constructor(target, operation) {
    this._operation = operation;
    this._dialog = null;
    this._html = "unable to determine target type";
    this._targetID = target.ID;
    this._html = document.createElement("div");
    const divtitle = this._html.appendChild(document.createElement("div"));
    this._html.appendChild(this._getAgentMenu(target.assignedTo));
    const note = this._html.appendChild(document.createElement("div"));
    note.innerHTML =
      "If the menu is empty, close and reopen this assignment, this is a known bug";

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

    divtitle.innerHTML = this._name;

    this._dialog = window.dialog({
      html: this._html,
      dialogClass: "wasabee-dialog",
      title: this._name,
      width: "auto",
      // closeCallback: () => { window.removeHook("wasabeeUIUpdate", this.update); },
      id: window.plugin.Wasabee.static.dialogNames.assign
    });
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
    const alreadyAdded = new Array();

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
        if (alreadyAdded.indexOf(a.id) == -1) {
          alreadyAdded.push(a.id);
          option = document.createElement("option");
          option.setAttribute("value", a.id);
          option.innerHTML = a.name;
          if (a.id == current) {
            option.setAttribute("selected", true);
          }
          menu.appendChild(option);
        }
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
      this._operation.assignMarker(this._targetID, value.srcElement.value);
    }
    if (this._type == "Link") {
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
      this._operation.assignLink(this._targetID, value.srcElement.value);
    }
  }
}
