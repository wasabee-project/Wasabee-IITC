import WasabeeAgent from "../model/agent";

declare function formatDisplay(
  agent: WasabeeAgent,
  teamID?: number | string
): HTMLAnchorElement;
declare function timeSinceformat(agent: WasabeeAgent): string;

interface WLAgentOptions extends L.MarkerOptions {
  agent: WasabeeAgent;
  id: string;
  zoom: number;
}
declare class WLAgent extends L.Marker {
  options: WLAgentOptions;
  constructor(agent: WasabeeAgent);
  update(): this;
  _getPopup(): HTMLDivElement;
}
declare const _default: {
  formatDisplay: typeof formatDisplay;
  timeSinceformat: typeof timeSinceformat;
  WLAgent: typeof WLAgent;
};
export default _default;
