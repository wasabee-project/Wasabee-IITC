import { WDialog } from "../leafletClasses";
import { WasabeeLink, WasabeeMarker, WasabeePortal } from "../model";
import wX from "../wX";
import { getSelectedOperation } from "../selectedOp";

import * as PortalUI from "../ui/portal";
import * as LinkUI from "../ui/link";
import { getTeam, getMe } from "../model/cache";

const AssignDialog = WDialog.extend({
  statics: {
    TYPE: "assignDialog",
  },

  needWritePermission: true,

  options: {
    // target,
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  _displayDialog: function () {
    const buttons = {};
    buttons[wX("OK")] = () => {
      this.localAssign(this._currentAssign);
      this.closeDialog();
    };

    const html = this._buildContent();

    this.createDialog({
      title: this._name,
      html: html,
      width: "auto",
      dialogClass: "assign",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.assign,
      autofocus: true,
    });
  },

  _buildContent: function () {
    const html = L.DomUtil.create("div", "container");

    const target = this.options.target;
    const operation = getSelectedOperation();
    this._currentAssign = null;

    this._targetID = target.ID;

    const divtitle = L.DomUtil.create("div", "desc", html);
    const menu = L.DomUtil.create("div", "wasabee-agent-menu", html);

    if (target instanceof WasabeeLink) {
      const portal = operation.getPortal(target.fromPortalId);
      this._type = "Link";
      this._name = wX("ASSIGN LINK PROMPT", {
        portalName: PortalUI.displayName(portal),
      });
      divtitle.appendChild(LinkUI.displayFormat(target, operation));
      const t = L.DomUtil.create("label", null, menu);
      t.textContent = wX("LINK ASSIGNMENT");
      this._currentAssign = target.assignedTo;
    }

    if (target instanceof WasabeeMarker) {
      const portal = operation.getPortal(target.portalId);
      this._type = "Marker";
      this._name = wX("ASSIGN MARKER PROMPT", {
        portalName: PortalUI.displayName(portal),
      });
      divtitle.appendChild(PortalUI.displayFormat(portal));
      const t = L.DomUtil.create("label", null, menu);
      t.textContent = wX("MARKER ASSIGNMENT");
      this._currentAssign = target.assignedTo;
    }

    if (target instanceof WasabeePortal) {
      const portal = target;
      this._type = "Anchor";
      this._name = wX("ASSIGN OUTBOUND PROMPT", {
        portalName: PortalUI.displayName(portal),
      });
      divtitle.appendChild(PortalUI.displayFormat(portal));
      const t = L.DomUtil.create("label", null, menu);
      t.textContent = wX("ANCHOR ASSIGNMENT");
      for (const l of operation.getLinkListFromPortal(portal)) {
        if (l.fromPortalId === portal.id && l.assignedTo) {
          this._currentAssign = l.assignedTo;
          break;
        }
      }
    }

    const select = L.DomUtil.create("select", null, menu);
    const option = L.DomUtil.create("option", null, select);
    option.value = "";
    option.textContent = wX("UNASSIGNED");

    L.DomEvent.on(select, "change", (value) => {
      this._currentAssign = value.target.value;
      this.localAssign(value.target.value);
    });

    this._populateAgentSelect(select, this._currentAssign);

    return html;
  },

  _populateAgentSelect: async function (select, current) {
    const alreadyAdded = new Array();

    const me = await getMe();
    for (const t of getSelectedOperation().teamlist) {
      if (me.teamJoined(t.teamid) == false) continue;
      try {
        // allow teams to be 5 minutes cached
        const tt = await getTeam(t.teamid, 5 * 60);
        for (const a of tt.agents) {
          if (!alreadyAdded.includes(a.id)) {
            alreadyAdded.push(a.id);
            const option = L.DomUtil.create("option", "", select);
            option.value = a.id;
            option.textContent = a.getName();
            if (a.id == current) option.selected = true;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  },

  localAssign: function (value) {
    const operation = getSelectedOperation();
    if (this._type == "Marker") {
      operation.assignMarker(this._targetID, value);
    }
    if (this._type == "Link") {
      operation.assignLink(this._targetID, value);
    }
    if (this._type == "Anchor") {
      const links = operation.getLinkListFromPortal(this.options.target);
      for (const l of links) {
        if (l.fromPortalId == this.options.target.id) {
          operation.assignLink(l.ID, value);
        }
      }
    }
  },
});

export default AssignDialog;
