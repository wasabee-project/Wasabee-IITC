import WasabeeAgent from "../model/agent";

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
