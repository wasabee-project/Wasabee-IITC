import { WDialog } from "../leafletClasses";
import WasabeeLink from "../link";
import WasabeeMarker from "../marker";
import WasabeeAnchor from "../anchor";
import WasabeeMe from "../me";
import WasabeeTeam from "../team";
import {
  assignLinkPromise,
  assignMarkerPromise,
  updateOpPromise,
  opPromise,
} from "../server";
import wX from "../wX";
import { postToFirebase } from "../firebaseSupport";
import { getSelectedOperation, makeSelectedOperation } from "../selectedOp";

const AssignDialog = WDialog.extend({
  statics: {
    TYPE: "assignDialog",
  },

  initialize: function (map = window.map, options) {
    this.type = AssignDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
    postToFirebase({ id: "analytics", action: AssignDialog.TYPE });
  },

  addHooks: function () {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
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

  setup: async function (target) {
    const operation = getSelectedOperation();
    this._opID = operation.ID;
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

    const mode = localStorage[window.plugin.wasabee.static.constants.MODE_KEY];
    if (mode == "active") {
      menu.addEventListener("change", (value) => {
        this.activeAssign(value); // async, but no need to await
      });
    } else {
      menu.addEventListener("change", (value) => {
        this.designAssign(value);
      });
    }

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
        console.log(e);
      }
    }

    return container;
  },

  designAssign: function (value) {
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

  activeAssign: async function (value) {
    const operation = getSelectedOperation();
    // if operation.localchanged...
    try {
      console.log("pushing op to server");
      await updateOpPromise(operation);
      console.log("update pushed");
    } catch (e) {
      console.log(e);
      throw e;
    }

    if (this._type == "Marker") {
      try {
        await assignMarkerPromise(
          operation.ID,
          this._targetID,
          value.srcElement.value
        );
        console.log("assignment processed by server");
        // operation.assignMarker(this._targetID, value.srcElement.value);
      } catch (e) {
        console.log(e);
        operation.assignMarker(this._targetID, value.srcElement.value);
        throw e;
      }
    }
    if (this._type == "Link") {
      try {
        await assignLinkPromise(
          operation.ID,
          this._targetID,
          value.srcElement.value
        );
        console.log("assignment processed by server");
        // operation.assignLink(this._targetID, value.srcElement.value);
      } catch (e) {
        console.log(e);
        operation.assignLink(this._targetID, value.srcElement.value);
        throw e;
      }
    }
    if (this._type == "Anchor") {
      const links = operation.getLinkListFromPortal(
        operation.getPortal(this._targetID)
      );
      for (const l of links) {
        try {
          await assignLinkPromise(operation.ID, l.ID, value.srcElement.value);
          console.log("assignment processed by server");
          // operation.assignLink(l.ID, value.srcElement.value);
        } catch (e) {
          console.log(e);
          operation.assignLink(l.ID, value.srcElement.value);
          throw e;
        }
      }
    }

    try {
      console.log("refreshing local copy of op from server");
      const updated = await opPromise(operation.ID);
      updated.store();
      makeSelectedOperation(updated.ID);
    } catch (e) {
      console.log(e);
      throw e;
    }
  },
});

export default AssignDialog;
