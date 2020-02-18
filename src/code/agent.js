import WasabeePortal from "./portal";
import ConfirmDialog from "./dialogs/confirmDialog";
import { targetPromise } from "./server";

export default class WasabeeAgent {
  constructor() {
    this.id = null;
    this.name = null;
    this.lat = 0;
    this.lng = 0;
    this.date = null;
    this.pic = null;
    this.cansendto = false;
  }

  static create(obj) {
    if (typeof obj == "string") {
      obj = JSON.parse(obj);
    }
    const a = new WasabeeAgent();
    for (var prop in obj) {
      if (a.hasOwnProperty(prop)) {
        a[prop] = obj[prop];
      }
    }

    // push the new data into the agent cache
    window.plugin.Wasabee._agentCache.set(a.id, a);
    return a;
  }

  formatDisplay() {
    const display = L.DomUtil.create("span", "wasabee-agent-label, enl");
    // display.classList.add("enl");
    display.textContent = this.name;
    return display;
  }

  getPopup() {
    // agent.className = "wasabee-dialog wasabee-dialog-ops";
    const content = L.DomUtil.create("div");
    const title = L.DomUtil.create("div", "desc", content);
    title.id = this.id;
    title.innerHTML = this.formatDisplay().outerHTML + this.timeSinceformat();
    const sendTarget = L.DomUtil.create("a", "temp-op-dialog", content);
    sendTarget.innerHTML = "send target";
    L.DomEvent.on(sendTarget, "click", () => {
      const selectedPortal = WasabeePortal.getSelected();
      if (!selectedPortal) {
        alert("Select a portal to send");
        return;
      }

      const f = selectedPortal.name;
      const name = this.name;
      const d = new ConfirmDialog();
      d.setup(
        "Send Target",
        `Do you want to send ${f} target to ${name}?`,
        () => {
          targetPromise(this, selectedPortal).then(
            function() {
              alert("target sent");
            },
            function(reject) {
              console.log(reject);
            }
          );
        }
      );
      d.enable();
    });
    return content;
  }

  timeSinceformat() {
    if (!this.date) return "";
    const date = new Date(this.date);
    if (date == 0) return "";

    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = Math.floor(seconds / 31536000 / 2592000 / 86400);

    if (interval > 1) return " (ages ago)";
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return " (" + interval + " hours ago)";
    interval = Math.floor(seconds / 60);
    if (interval > 1) return " (" + interval + " minutes ago)";
    return " (" + Math.floor(seconds) + " seconds ago)";
  }
}
