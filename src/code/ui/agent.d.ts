import WasabeeAgent from "../model/agent";

export function formatDisplay(
  agent: WasabeeAgent,
  teamID?: number | string
): HTMLAnchorElement;

export function timeSinceformat(agent: WasabeeAgent): string;

interface WLAgentOptions extends L.MarkerOptions {
  agent: WasabeeAgent;
  id: string;
  zoom: number;
}

export class WLAgent extends L.Marker {
  options: WLAgentOptions;
  constructor(agent: WasabeeAgent);
  update(): this;
  _getPopup(): HTMLDivElement;
}
