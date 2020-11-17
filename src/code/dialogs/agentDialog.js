import { WDialog } from "../leafletClasses";
import wX from "../wX";
import WasabeeAgent from "../agent";

const AgentDialog = WDialog.extend({
  statics: {
    TYPE: "agent",
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
  },

  _displayDialog: async function () {
    const html = L.DomUtil.create("div", null);
    const agent = L.DomUtil.create("div", null, html);

    try {
      const data = await WasabeeAgent.waitGet(this.options.gid);
      const name = L.DomUtil.create("h2", "enl, wasabee-agent-label", agent);
      name.textContent = data.name;
      const vLabel = L.DomUtil.create("label", null, agent);
      vLabel.textContent = "V Verified: ";
      L.DomUtil.create("div", null, vLabel).textContent = data.Vverified;
      const rocksLabel = L.DomUtil.create("label", null, agent);
      rocksLabel.textContent = "Rocks Verified: ";
      L.DomUtil.create("div", null, rocksLabel).textContent = data.rocks;
      const img = L.DomUtil.create("img", null, agent);
      img.src = data.pic;
    } catch (e) {
      console.error(e);
      agent.innerHTML = e.toString();
    }

    const buttons = {};
    buttons[wX("OK")] = () => {
      this._dialog.dialog("close");
    };

    this._dialog = window.dialog({
      title: wX("AGENT_STATS"),
      html: html,
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-agent",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      // id: window.plugin.wasabee.static.dialogNames.linkList,
    });
    this._dialog.dialog("option", "buttons", buttons);
  },

  _displaySmallDialog: function () {
    this._displayDialog();
  },
});

export default AgentDialog;
