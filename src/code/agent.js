var markdown = require("markdown").markdown;

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
    display.className = "wasabee-agent-label";
    display.textContent = this.name;
    return display;
  }

  getPopup() {
    // agent.className = "wasabee-dialog wasabee-dialog-ops";
    const content = document.createElement("div");
    const title = content.appendChild(document.createElement("div"));
    title.className = "desc";
    title.id = this.id;
    title.innerHTML = markdown.toHTML(this.name);
    const date = content.appendChild(document.createElement("span"));
    date.innerHTML = markdown.toHTML("Last update: " + this.date);
    return content;
  }
}
