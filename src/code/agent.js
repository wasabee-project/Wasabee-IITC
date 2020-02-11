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
    const display = document.createElement("span");
    display.classList.add("wasabee-agent-label");
    display.classList.add("enl");
    display.textContent = this.name;
    return display;
  }

  getPopup() {
    // agent.className = "wasabee-dialog wasabee-dialog-ops";
    const content = document.createElement("div");
    const title = content.appendChild(document.createElement("div"));
    title.classList.add("desc");
    title.id = this.id;
    title.innerHTML = this.formatDisplay().outerHTML + this.timeSinceformat();
    const sendTarget = content.appendChild(document.createElement("a"));
    sendTarget.innerHTML = "send target";
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
