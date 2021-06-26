import { WDialog } from "../leafletClasses";
import WasabeeMarker from "../model/marker";
import WasabeeAnchor from "../model/anchor";
import WasabeeMe from "../model/me";
import WasabeeTeam from "../model/team";
import { targetPromise } from "../server";
import wX from "../wX";
import { getSelectedOperation } from "../selectedOp";

import PortalUI from "../ui/portal";

const SendTargetDialog = WDialog.extend({
  statics: {
    TYPE: "sendTargetDialog",
  },

  options: {
    // target
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  _displayDialog: function () {
    const buttons = {};
    buttons[wX("OK")] = () => {
      this._sendTarget();
    };

    this._html = L.DomUtil.create("div", null);
    this._setup();

    this.createDialog({
      title: wX("SEND TARGET AGENT"),
      html: this._html,
      width: "auto",
      dialogClass: "sendtarget",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.assign,
    });
  },

  _setup: async function () {
    const divtitle = L.DomUtil.create("div", "desc", this._html);
    const menu = await this._getAgentMenu(this.options.target.assignedTo);
    this._targettype = "ad hoc target";

    const operation = getSelectedOperation();

    if (this.options.target instanceof WasabeeMarker) {
      const portal = operation.getPortal(this.options.target.portalId);
      this._targettype = this.options.target.type;
      divtitle.appendChild(PortalUI.displayFormat(portal, this._smallScreen));
      const t = L.DomUtil.create("label", null);
      t.textContent = wX("SEND TARGET AGENT");
      menu.prepend(t);
    }

    if (this.options.target instanceof WasabeeAnchor) {
      const portal = operation.getPortal(this.options.target.portalId);
      this._targettype = "anchor";
      divtitle.appendChild(PortalUI.displayFormat(portal, this._smallScreen));
      const t = L.DomUtil.create("label", null);
      t.textContent = wX("SEND TARGET AGENT");
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

    const operation = getSelectedOperation();

    menu.addEventListener("change", () => {
      this._value = menu.value;
    });

    const me = await WasabeeMe.waitGet();
    for (const t of operation.teamlist) {
      if (me.teamJoined(t.teamid) == false) continue;
      try {
        // allow teams to be 5 minutes cached
        const tt = await WasabeeTeam.get(t.teamid, 5 * 60);
        const agents = tt.getAgents();
        for (const a of agents) {
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

  _sendTarget: function () {
    if (!this._value) {
      this.closeDialog();
      return;
    }
    const operation = getSelectedOperation();
    const portal = operation.getPortal(this.options.target.portalId);
    targetPromise(this._value, portal, this._targettype)
      .then(() => {
        alert(wX("TARGET SENT"));
        this.closeDialog();
      })
      .catch((e) => alert(e));
  },
});

export default SendTargetDialog;
