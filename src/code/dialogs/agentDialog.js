import { WDialog } from "../leafletClasses";
import wX from "../wX";
import WasabeeAgent from "../model/agent";

const AgentDialog = WDialog.extend({
  statics: {
    TYPE: "agent",
  },

  options: {
    // gid
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  _displayDialog: async function () {
    const html = L.DomUtil.create("div", null);

    try {
      const data = await WasabeeAgent.get(this.options.gid);
      L.DomUtil.create("h2", "wasabee-agent-label", html).textContent =
        data.getName();

      const ul = L.DomUtil.create("ul", "", html);
      const rows = [
        ["Server name: ", data.name],
        ["V name: ", data.vname],
        ["V verified: ", data.Vverified],
        ["Rocks name: ", data.rocksname],
        ["Rocks Verified: ", data.rocks],
      ];
      for (const [label, value] of rows) {
        const li = L.DomUtil.create("li", "", ul);
        L.DomUtil.create("label", null, li).textContent = label;
        L.DomUtil.create("span", null, li).textContent = value;
      }

      const img = L.DomUtil.create("img", null, html);
      img.src = data.pic;
    } catch (e) {
      console.error(e);
      html.innerHTML = e.toString();
    }

    const buttons = {};
    buttons[wX("OK")] = () => {
      this.closeDialog();
    };

    this.createDialog({
      title: wX("AGENT_STATS"),
      html: html,
      width: "auto",
      dialogClass: "agent",
      buttons: buttons,
    });
  },

  _displaySmallDialog: function () {
    this._displayDialog();
  },
});

export default AgentDialog;
