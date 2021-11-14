export {};

declare global {
  type OpID = string;
  type PortalID = string;
  type TeamID = string;
  type TaskID = string;
  type LinkID = TaskID;
  type MarkerID = TaskID;
  type GoogleID = string;
  type ZoneID = number;

  const plugin_info: any;
  var wasabeewebui: any;
}
