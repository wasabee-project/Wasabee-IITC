import { WDialog } from "../leafletClasses";
import WasabeeLink from "../link";
import WasabeeMarker from "../marker";
import WasabeeAnchor from "../anchor";
import WasabeeMe from "../me";
import WasabeeTeam from "../team";
import wX from "../wX";
import { getSelectedOperation } from "../selectedOp";

const AssignDialog = WDialog.extend({
  statics: {
    TYPE: "assignDialog",
  },

  addHooks: function () {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    this._setup();
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
  },

  _displayDialog: function () {
    const buttons = {};
    buttons[wX("OK")] = () => {
      this._dialog.dialog("close");
    };

    this._dialog = window.dialog({
      title: this._name,
      html: this._html,
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-assign",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.assign,
    });
    this._dialog.dialog("option", "buttons", buttons);
  },

  _setup: async function () {
    const target = this.options.target;
    const operation = getSelectedOperation();
    this._dialog = null;
    this._targetID = target.ID;
    this._html = L.DomUtil.create("div", null);
    const divtitle = L.DomUtil.create("div", "desc", this._html);
    const menu = await this._getAgentMenu(target.assignedTo);

    if (target instanceof WasabeeLink) {
      const portal = operation.getPortal(target.fromPortalId);
      this._type = "Link";
      this._name = wX("ASSIGN LINK PROMPT", portal.displayName);
      divtitle.appendChild(target.displayFormat(operation, this._smallScreen));
      const t = L.DomUtil.create("label", null);
      t.textContent = wX("LINK ASSIGNMENT");
      menu.prepend(t);
    }

    if (target instanceof WasabeeMarker) {
      const portal = operation.getPortal(target.portalId);
      this._type = "Marker";
      this._name = wX("ASSIGN MARKER PROMPT", portal.displayName);
      divtitle.appendChild(portal.displayFormat(this._smallScreen));
      const t = L.DomUtil.create("label", null);
      t.textContent = wX("MARKER ASSIGNMENT");
      menu.prepend(t);
    }

    if (target instanceof WasabeeAnchor) {
      const portal = operation.getPortal(target.portalId);
      this._type = "Anchor";
      this._name = wX("ASSIGN OUTBOUND PROMPT", portal.displayName);
      divtitle.appendChild(portal.displayFormat(this._smallScreen));
      const t = L.DomUtil.create("label", null);
      t.textContent = wX("ANCHOR ASSIGNMENT");
      menu.prepend(t);
    }

    this._html.appendChild(menu);
  },

  _buildContent: function () {
    const content = L.DomUtil.create("div");
    if (typeof this._label == "string") {
      content.textContent = this._label;
    } else {
      content.appendChild(this._label);
    }
    return content;
  },

  _getAgentMenu: async function (current) {
    const container = L.DomUtil.create("div", "wasabee-agent-menu");
    const menu = L.DomUtil.create("select", null, container);
    let option = menu.appendChild(L.DomUtil.create("option", null));
    option.value = "";
    option.textContent = wX("UNASSIGNED");
    const alreadyAdded = new Array();

    menu.addEventListener("change", (value) => {
      this.localAssign(value);
    });

    const me = await WasabeeMe.waitGet();
    for (const t of getSelectedOperation().teamlist) {
      if (me.teamJoined(t.teamid) == false) continue;
      try {
        // allow teams to be 5 minutes cached
        const tt = await WasabeeTeam.waitGet(t.teamid, 5 * 60);
        for (const a of tt.agents) {
          if (!alreadyAdded.includes(a.id)) {
            alreadyAdded.push(a.id);
            option = L.DomUtil.create("option");
            option.value = a.id;
            option.textContent = a.name;
            if (a.id == current) option.selected = true;
            menu.appendChild(option);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    return container;
  },

  localAssign: function (value) {
    const operation = getSelectedOperation();
    if (this._type == "Marker") {
      operation.assignMarker(this._targetID, value.srcElement.value);
    }
    if (this._type == "Link") {
      operation.assignLink(this._targetID, value.srcElement.value);
    }
    if (this._type == "Anchor") {
      const links = operation.getLinkListFromPortal(
        operation.getPortal(this._targetID)
      );
      for (const l of links) {
        if (l.fromPortalId == this._targetID) {
          operation.assignLink(l.ID, value.srcElement.value);
        }
      }
    }
  },
});

export default AssignDialog;
