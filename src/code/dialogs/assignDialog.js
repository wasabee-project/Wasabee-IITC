import { WDialog } from "../leafletClasses";
import WasabeeLink from "../link";
import WasabeeMarker from "../marker";
import WasabeeAnchor from "../anchor";
import WasabeeTeam from "../team";
import { assignLinkPromise, assignMarkerPromise, teamPromise } from "../server";
import wX from "../wX";

const AssignDialog = WDialog.extend({
  statics: {
    TYPE: "assignDialog"
  },

  initialize: function(map = window.map, options) {
    this.type = AssignDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
  },

  addHooks: function() {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function() {
    WDialog.prototype.removeHooks.call(this);
  },

  _displayDialog: function() {
    this._dialog = window.dialog({
      title: this._name,
      width: "auto",
      height: "auto",
      html: this._html,
      dialogClass: "wasabee-dialog wasabee-dialog-assign",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.assign
    });
  },

  setup: function(target, operation) {
    this._operation = operation;
    this._dialog = null;
    this._targetID = target.ID;
    this._html = L.DomUtil.create("div", null);
    const divtitle = L.DomUtil.create("div", "desc", this._html);

    if (target instanceof WasabeeLink) {
      const portal = operation.getPortal(target.fromPortalId);
      this._type = "Link";
      divtitle.appendChild(target.displayFormat(this._smallScreen));
      const t = L.DomUtil.create("span", null, divtitle);
      t.textContent = wX("LINK ASSIGNMENT");
      this._name = wX("ASSIGN LINK PROMPT", portal.name);
    }

    if (target instanceof WasabeeMarker) {
      const portal = operation.getPortal(target.portalId);
      this._type = "Marker";
      divtitle.appendChild(portal.displayFormat(this._smallScreen));
      const t = L.DomUtil.create("span", null, divtitle);
      t.textContent = wX("MARKER ASSIGNMENT");
      this._name = wX("ASSIGN MARKER PROMPT", portal.name);
    }

    if (target instanceof WasabeeAnchor) {
      const portal = operation.getPortal(target.portalId);
      this._type = "Anchor";
      divtitle.appendChild(portal.displayFormat(this._smallScreen));
      const t = L.DomUtil.create("span", null, divtitle);
      t.textContent = wX("ANCHOR ASSIGNMENT");
      this._name = wX("ASSIGN OUTBOUND PROMPT", portal.name);
    }

    const menu = this._getAgentMenu(target.assignedTo);
    this._html.appendChild(menu);
  },

  _buildContent: function() {
    const content = L.DomUtil.create("div");
    if (typeof this._label == "string") {
      content.textContent = this._label;
    } else {
      content.appendChild(this._label);
    }
    return content;
  },

  // TODO this should return a promise so the draw routine can .then() it...
  _getAgentMenu: function(current) {
    const container = L.DomUtil.create("div", "wasabee-agent-menu");
    const menu = L.DomUtil.create("select", null, container);
    let option = menu.appendChild(L.DomUtil.create("option", null));
    option.setAttribute("value", null);
    option.textContent = wX("UNASSIGNED");
    const alreadyAdded = new Array();

    const mode = localStorage[window.plugin.wasabee.static.constants.MODE_KEY];
    if (mode == "active") {
      menu.addEventListener("change", value => {
        this.activeAssign(value);
      });
    } else {
      menu.addEventListener("change", value => {
        this.designAssign(value);
      });
    }

    // TODO return promise ( ...
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
        if (!alreadyAdded.includes(a.id) && a.state === true) {
          alreadyAdded.push(a.id);
          option = L.DomUtil.create("option", null);
          option.setAttribute("value", a.id);
          option.textContent = a.name;
          if (a.id == current) {
            option.setAttribute("selected", true);
          }
          menu.appendChild(option);
        }
      }
    }

    return container;
  },

  designAssign: function(value) {
    if (this._type == "Marker") {
      this._operation.assignMarker(this._targetID, value.srcElement.value);
    }
    if (this._type == "Link") {
      this._operation.assignLink(this._targetID, value.srcElement.value);
    }
    if (this._type == "Anchor") {
      const links = this._operation.getLinkListFromPortal(
        this._operation.getPortal(this._targetID)
      );
      for (const l of links) {
        if (l.fromPortalId == this._targetID) {
          this._operation.assignLink(l.ID, value.srcElement.value);
        }
      }
    }
  },

  activeAssign: function(value) {
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
