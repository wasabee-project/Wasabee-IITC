import WasabeeLink from "./link";
import WasabeeMarker from "./marker";
import WasabeeTeam from "./team";
import { assignLinkPromise, assignMarkerPromise, teamPromise } from "./server";

// XXX CONVERT TO LEAFLET EXTENDS

export default class AssignDialog {
  constructor(target, operation) {
    this._operation = operation;
    this._dialog = null;
    this._targetID = target.ID;
    this._html = document.createElement("div");
    const divtitle = this._html.appendChild(document.createElement("div"));

    if (target instanceof WasabeeLink) {
      const portal = operation.getPortal(target.fromPortalId);
      this._type = "Link";
      divtitle.innerHTML = portal.name + ": link assignment";
      this._name = "Assign link from: " + portal.name;
    }

    if (target instanceof WasabeeMarker) {
      const portal = operation.getPortal(target.portalId);
      this._type = "Marker";
      divtitle.innerHTML = portal.name + ": marker assignment";
      this._name = "Assign marker for: " + portal.name;
    }

    const menu = this._getAgentMenu(target.assignedTo);
    this._html.appendChild(menu);
    menu.style.align = "center";

    const outofdate = this._html.appendChild(document.createElement("div"));
    outofdate.innerHTML =
      "<br/><br/>Assignments are pushed to the server real-time.<br/>Make sure the server copy is up-to-date <b>before</b> doing assignments";
    outofdate.style.textalign = "center";

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
    for (const t of this._operation.teamlist) {
      if (!window.plugin.Wasabee.teams.has(t.teamid)) {
        teamPromise(t.teamid).then(
          function(team) {
            console.debug(team);
          },
          function(err) {
            console.log(err);
          }
        );
      }
      const tt = window.plugin.Wasabee.teams.get(t.teamid) || new WasabeeTeam();
      for (const a of tt.agents) {
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
      }
    }
    // ( => ) functions inherit the "this" of the caller
    menu.addEventListener("change", value => {
      this.assign(value);
    });

    return container;
  }

  assign(value) {
    if (this._type == "Marker") {
      assignMarkerPromise(
        this._operation.ID,
        this._targetID,
        value.srcElement.value
      ).then(
        function() {
          console.log("assignment processed");
        },
        function(err) {
          console.log(err);
        }
      );
      this._operation.assignMarker(this._targetID, value.srcElement.value);
    }
    if (this._type == "Link") {
      assignLinkPromise(
        this._operation.ID,
        this._targetID,
        value.srcElement.value
      ).then(
        function() {
          console.log("assignment processed");
        },
        function(err) {
          console.log(err);
        }
      );
      this._operation.assignLink(this._targetID, value.srcElement.value);
    }
  }
}
