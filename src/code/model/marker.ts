import Task from "./task";

const markers = {
  MARKER_TYPE_CAPTURE: "CapturePortalMarker",
  MARKER_TYPE_DECAY: "LetDecayPortalAlert",
  MARKER_TYPE_EXCLUDE: "ExcludeMarker",
  MARKER_TYPE_DESTROY: "DestroyPortalAlert",
  MARKER_TYPE_FARM: "FarmPortalMarker",
  MARKER_TYPE_GOTO: "GotoPortalMarker",
  MARKER_TYPE_KEY: "GetKeyPortalMarker",
  MARKER_TYPE_LINK: "CreateLinkAlert",
  MARKER_TYPE_MEETAGENT: "MeetAgentPortalMarker",
  MARKER_TYPE_OTHER: "OtherPortalAlert",
  MARKER_TYPE_RECHARGE: "RechargePortalAlert",
  MARKER_TYPE_UPGRADE: "UpgradePortalAlert",
  MARKER_TYPE_VIRUS: "UseVirusPortalAlert",
};

const destructMarkerTypes = [
  markers.MARKER_TYPE_DECAY,
  markers.MARKER_TYPE_DESTROY,
  markers.MARKER_TYPE_VIRUS,
];

const markerTypes = new Set(Object.values(markers));

const iconTypes = {
  CapturePortalMarker: "capture",
  LetDecayPortalAlert: "decay",
  ExcludeMarker: "exclude",
  DestroyPortalAlert: "destroy",
  FarmPortalMarker: "farm",
  GotoPortalMarker: "goto",
  GetKeyPortalMarker: "key",
  CreateLinkAlert: "link",
  MeetAgentPortalMarker: "meetagent",
  OtherPortalAlert: "other",
  RechargePortalAlert: "recharge",
  UpgradePortalAlert: "upgrade",
  UseVirusPortalAlert: "virus",
};

export default class WasabeeMarker extends Task {
  portalId: PortalID;
  type: string;
  // future compatibility
  attributes?: any[];

  // static properties is not supported by eslint yet
  static get markerTypes() {
    return markerTypes;
  }

  static get constants() {
    return markers;
  }

  constructor(obj: any) {
    super(obj);
    this.portalId = obj.portalId;
    this.type = obj.type;
    this.attributes = obj.attributes ? Array.from(obj.attributes) : [];
  }

  toJSON(): any {
    return {
      ...super.toJSON(),

      portalId: this.portalId,
      type: this.type,
      // preserve data
      attributes: this.attributes,
    };
  }

  get friendlyType() {
    return iconTypes[this.type];
  }

  isDestructMarker() {
    return destructMarkerTypes.includes(this.type);
  }

  static isDestructMarkerType(type) {
    return destructMarkerTypes.includes(type);
  }
}
