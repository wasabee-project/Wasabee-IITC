import { WDialog } from "../leafletClasses";
import { WasabeeMarker, WasabeePortal } from "../model";
import { targetPromise } from "../server";
import wX from "../wX";
import { getSelectedOperation } from "../selectedOp";

import * as PortalUI from "../ui/portal";
import { displayError, displayInfo } from "../error";
import { getTeams, getMe } from "../model/cache";
import statics from "../static";

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
      id: statics.dialogNames.assign,
      autofocus: true,
    });
  },

  _setup: async function () {
    const divtitle = L.DomUtil.create("div", "desc", this._html);
    const menu = await this._getAgentMenu(this.options.target.assignedTo);
    this._targettype = "ad hoc target";

    const operation = getSelectedOperation();

    if (this.options.target instanceof WasabeeMarker) {
      this._portal = operation.getPortal(this.options.target.portalId);
      this._targettype = this.options.target.type;
      divtitle.appendChild(PortalUI.displayFormat(this._portal));
      const t = L.DomUtil.create("label", null);
      t.textContent = wX("SEND TARGET AGENT");
      menu.prepend(t);
    }

    if (this.options.target instanceof WasabeePortal) {
      this._portal = this.options.target;
      this._targettype = "anchor";
      divtitle.appendChild(PortalUI.displayFormat(this._portal));
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

    const me = await getMe();
    const teams = await getTeams(
      operation.teamlist.map((t) => t.teamid).filter((id) => me.teamJoined(id)),
      5 * 60
    );
    for (const team of teams) {
      for (const a of team.agents) {
        if (!alreadyAdded.has(a.id)) {
          alreadyAdded.add(a.id);
          const option = L.DomUtil.create("option");
          option.value = a.id;
          option.textContent = a.getName();
          if (a.id == current) option.selected = true;
          menu.appendChild(option);
        }
      }
    }

    return container;
  },

  _sendTarget: function () {
    if (!this._value || !this._portal) {
      this.closeDialog();
      return;
    }
    targetPromise(this._value, this._portal, this._targettype)
      .then(() => {
        displayInfo(wX("TARGET SENT"));
        this.closeDialog();
      })
      .catch((e) => displayError(e));
  },
});

export default SendTargetDialog;
