import { Feature } from "../leafletDrawImports";
import WasabeeLink from "../link";
import WasabeeMarker from "../marker";
import WasabeeAnchor from "../anchor";
import WasabeeTeam from "../team";
import {
  updateOpPromise,
  assignLinkPromise,
  assignMarkerPromise,
  teamPromise
} from "../server";
import wX from "../wX";

const AssignDialog = Feature.extend({
  statics: {
    TYPE: "assignDialog"
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = AssignDialog.TYPE;
    Feature.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    if (!this._map) return;
    Feature.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function() {
    Feature.prototype.removeHooks.call(this);
  },

  _displayDialog: function() {
    if (!this._map) return;
    const assignDialog = this;
    this._dialog = window.dialog({
      title: this._name,
      width: "auto",
      height: "auto",
      html: this._html,
      dialogClass: "wasabee-dialog",
      closeCallback: () => {
        assignDialog.disable();
        delete assignDialog._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.assign
    });
  },

  setup: function(target, operation) {
    this._upload(operation);

    this._operation = operation;
    this._dialog = null;
    this._targetID = target.ID;
    this._html = L.DomUtil.create("div", "temp-op-dialog");
    const divtitle = L.DomUtil.create("div", "", this._html);

    if (target instanceof WasabeeLink) {
      const portal = operation.getPortal(target.fromPortalId);
      this._type = "Link";
      divtitle.appendChild(target.displayFormat(this._operation));
      const t = L.DomUtil.create("span", "", divtitle);
      t.innerHTML = wX("LINK ASSIGNMENT");
      this._name = wX("ASSIGN LINK PROMPT", portal.name);
    }

    if (target instanceof WasabeeMarker) {
      const portal = operation.getPortal(target.portalId);
      this._type = "Marker";
      divtitle.appendChild(portal.displayFormat());
      const t = L.DomUtil.create("span", "", divtitle);
      t.innerHTML = wX("MARKER ASSIGNMENT");
      this._name = wX("ASSIGN MARKER PROMPT", portal.name);
    }

    if (target instanceof WasabeeAnchor) {
      const portal = operation.getPortal(target.portalId);
      this._type = "Anchor";
      divtitle.appendChild(portal.displayFormat());
      const t = L.DomUtil.create("span", "", divtitle);
      t.innerHTML = wX("ANCHOR ASSIGNMENT");
      this._name = wX("ASSIGN OUTBOUND PROMPT", portal.name);
    }

    const menu = this._getAgentMenu(target.assignedTo);
    this._html.appendChild(menu);
    menu.style.align = "center";
  },

  _upload: function(operation) {
    if (!operation.localchanged) return;
    updateOpPromise(operation).then(
      function() {
        console.log(
          "modified op: " +
            operation.name +
            " uploaded before making assignments."
        );
      },
      function(err) {
        alert(err);
      }
    );
  },

  _buildContent: function() {
    const content = L.DomUtil.create("div", "");
    if (typeof this._label == "string") {
      content.innerText = this._label;
    } else {
      content.appendChild(this._label);
    }
    return content;
  },

  _getAgentMenu: function(current) {
    const container = L.DomUtil.create("div", "");
    const menu = L.DomUtil.create("select", "", container);
    let option = menu.appendChild(L.DomUtil.create("option", ""));
    option.setAttribute("value", "");
    option.innerHTML = wX("UNASSIGNED");
    const alreadyAdded = new Array();

    // this needs to make sure not to add the same agent multiple times...
    for (const t of this._operation.teamlist) {
      if (!window.plugin.wasabee.teams.has(t.teamid)) {
        teamPromise(t.teamid).then(
          function(team) {
            console.debug(team);
          },
          function(err) {
            console.log(err);
          }
        );
      }
      const tt = window.plugin.wasabee.teams.get(t.teamid) || new WasabeeTeam();
      for (const a of tt.agents) {
        if (!alreadyAdded.includes(a.id)) {
          alreadyAdded.push(a.id);
          option = L.DomUtil.create("option", "");
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
  },

  assign: function(value) {
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
    if (this._type == "Anchor") {
      const links = this._operation.getLinkListFromPortal(
        this._operation.getPortal(this._targetID)
      );
      for (const l of links) {
        assignLinkPromise(
          this._operation.ID,
          l.ID,
          value.srcElement.value
        ).then(
          function() {
            console.log("assignment processed");
          },
          function(err) {
            console.log(err);
          }
        );
        this._operation.assignLink(l.ID, value.srcElement.value);
      }
    }
  }
});

export default AssignDialog;
