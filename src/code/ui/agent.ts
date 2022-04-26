import AgentDialog from "../dialogs/agentDialog";
import type { WasabeeAgent } from "../model";
import wX from "../wX";

/**
 * @returns html anchor with agent name (and verification states)
 */
export function formatDisplay(agent: WasabeeAgent) {
  const display = L.DomUtil.create("a", "wasabee-agent-label");
  if (agent.Vverified || agent.rocks) {
    L.DomUtil.addClass(display, "enl");
  }
  if (agent.blacklisted) {
    L.DomUtil.addClass(display, "res");
  }
  L.DomEvent.on(display, "click", (ev) => {
    L.DomEvent.stop(ev);
    const ad = new AgentDialog({ gid: agent.id });
    ad.enable();
  });

  let prefix = "";
  if (agent.communityname) prefix += "C";
  if (agent.Vverified) prefix += "V";
  else if (agent.vname === agent.name) prefix += "v";
  if (agent.rocks) prefix += "R";
  else if (agent.rocksname === agent.name) prefix += "r";
  if (agent.intelname) {
    // no identity source exept intel
    if (!agent.rocksname && !agent.vname) prefix += "I";
    // no verified source
    else if (!agent.rocks && !agent.Vverified) prefix += "I";
    // match server preference
    else if (agent.intelname === agent.name) prefix += "I";
    // match server preference, in lower case
    else if (agent.intelname.toLowerCase() === agent.name.toLowerCase())
      prefix += "i";
  }

  display.textContent = prefix
    ? `[${prefix}] ` + agent.getName()
    : agent.getName();
  return display;
}

export function timeSinceformat(agent: WasabeeAgent) {
  if (!agent.date) return "";
  const date = Date.parse(agent.date + "Z");
  if (Number.isNaN(date)) return `(${agent.date} UTC)`; // FireFox Date.parse no good
  if (date == 0) return "";

  const seconds = Math.floor((Date.now() - date) / 1000);
  if (seconds < 0) return "";
  let interval = Math.floor(seconds / 31536000 / 2592000 / 86400);

  if (interval > 1) return wX("AGES");
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return wX("HOURS", { hours: interval });
  interval = Math.floor(seconds / 60);
  if (interval > 1) return wX("MINUTES", { minutes: interval });
  interval = Math.floor(seconds);
  return wX("SECONDS", { seconds: interval });
}
