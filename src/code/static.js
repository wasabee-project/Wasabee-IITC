// this file is loaded by the build system
const W = window.plugin.wasabee || {};

W.static = {
  CSS: {
    main: require("./css/wasabee.css"),
  },
  dialogNames: {
    linkDialogButton: "wasabee-addlinks",
    markerButton: "wasabee-marker",
    mustauth: "wasabee-mustauth",
    newopButton: "wasabee-newop",
    opsButton: "wasabee-operations",
    wasabeeButton: "wasabee-userinfo",
    linkList: "wasabee-linklist",
    markerList: "wasabee-markerlist",
    assign: "wasabee-assign",
    state: "wasabee-state",
    multimaxButton: "wasabee-multimax",
    importDialog: "wasabee-import",
    operationChecklist: "wasabee-operation-checklist",
    blockerList: "wasabee-blockerlist",
    exportDialog: "wasabee-export",
    keysList: "wasabee-keys",
    keyListPortal: "wasabee-keyByPortal",
    wasabeeDKeyButton: "wasabee-DKey",
    wasabeeDList: "wasabee-DList",
    madrid: "wasabee-madrid",
    autodraws: "wasabee-autodraws",
    starburst: "wasabee-starburst",
  },
  constants: {
    SELECTED_OP_KEY: "wasabee-selected-op",
    SEND_LOCATION_KEY: "wasabee-send-location",
    SEND_ANALYTICS_KEY: "wasabee-analytics",
    EXPERT_MODE_KEY: "wasabee-expert-mode",
    LANGUAGE_KEY: "wasabee-language",
    DEFAULT_LANGUAGE: "English",
    MODE_KEY: "wasabee-mode",
    AGENT_INFO_KEY: "wasabee-me",
    MULTIMAX_UNREACHABLE_KEY: "wasabee-mm-unreachable",
    LINK_SOURCE_KEY: "wasabee-link-source",
    ANCHOR_ONE_KEY: "wasabee-anchor-1",
    ANCHOR_TWO_KEY: "wasabee-anchor-2",
    ANCHOR_THREE_KEY: "wasabee-anchor-3",
    PORTAL_DETAIL_RATE_KEY: "wasabee-portaldetail-rate",
    SKIN_KEY: "wasabee-skin",
    AUTO_LOAD_FAKED: "wasabee-autoload-faked",
    TRAWL_SKIP_STEPS: "wasabee-trawl-skip",
    OAUTH_CLIENT_ID:
      "269534461245-jbnes60ebd7u0b8naba19h4vqm7ji219.apps.googleusercontent.com",
    SERVER_BASE_KEY: "wasabee-server",
    SERVER_BASE_DEFAULT: "https://server.wasabee.rocks",
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
    DEFAULT_MARKER_TYPE: "DestroyPortalAlert",
    QUICKDRAW_GUIDE_STYLE: {
      color: "#0f0",
      dashArray: [8, 2],
      opacity: 0.7,
      weight: 5,
      smoothFactor: 1,
      clickable: false,
      interactive: true,
    },
  },
};

W.static.strings = {}; // empty object, fill it below
W.static.strings.Deutsch = require("./translations/german.json");
W.static.strings.Espanol = require("./translations/spanish.json");
W.static.strings.English = require("./translations/english.json");
W.static.strings.Italiano = require("./translations/italian.json");
W.static.strings.Tagalog = require("./translations/filipino.json");
W.static.strings.French = require("./translations/french.json");
W.static.tips = require("./translations/tips.json");

W.static.markerTypes = new Set([
  W.static.constants.MARKER_TYPE_CAPTURE,
  W.static.constants.MARKER_TYPE_DECAY,
  W.static.constants.MARKER_TYPE_DESTROY,
  W.static.constants.MARKER_TYPE_FARM,
  W.static.constants.MARKER_TYPE_GOTO,
  W.static.constants.MARKER_TYPE_KEY,
  W.static.constants.MARKER_TYPE_LINK,
  W.static.constants.MARKER_TYPE_MEETAGENT,
  W.static.constants.MARKER_TYPE_OTHER,
  W.static.constants.MARKER_TYPE_RECHARGE,
  W.static.constants.MARKER_TYPE_UPGRADE,
  W.static.constants.MARKER_TYPE_VIRUS,
  W.static.constants.MARKER_TYPE_EXCLUDE,
]);

// https://leafletjs.com/reference-1.0.3.html#path
W.static.layerTypes = new Map([
  [
    "main",
    {
      name: "main",
      displayName: "Red",
      color: "#ff0000",
      link: {
        dashArray: [5, 5, 1, 5],
        assignedDashArray: [4, 2, 1],
        opacity: 1,
        weight: 2,
      },
    },
  ],
  [
    "groupa",
    {
      name: "groupa",
      displayName: "Orange",
      color: "#ff6600",
      link: {
        dashArray: [5, 5, 1, 5],
        assignedDashArray: [4, 2, 1],
        opacity: 1,
        weight: 2,
      },
    },
  ],
  [
    "groupb",
    {
      name: "groupb",
      displayName: "Light Orange",
      color: "#ff9900",
      link: {
        dashArray: [5, 5, 1, 5],
        assignedDashArray: [4, 1, 4, 1],
        opacity: 1,
        weight: 2,
      },
    },
  ],
  [
    "groupc",
    {
      name: "groupc",
      displayName: "Tan",
      color: "#bb9900",
      link: {
        dashArray: [5, 5, 1, 5],
        assignedDashArray: [4, 2, 1],
        opacity: 1,
        weight: 2,
      },
    },
  ],
  [
    "groupd",
    {
      name: "groupd",
      displayName: "Purple",
      color: "#bb22cc",
      link: {
        dashArray: [5, 5, 1, 5],
        assignedDashArray: [4, 2, 1],
        opacity: 1,
        weight: 2,
      },
    },
  ],
  [
    "groupe",
    {
      name: "groupe",
      displayName: "Teal",
      color: "#33cccc",
      link: {
        dashArray: [5, 5, 1, 5],
        assignedDashArray: [4, 2, 1],
        opacity: 1,
        weight: 2,
      },
    },
  ],
  [
    "groupf",
    {
      name: "groupf",
      displayName: "Pink",
      color: "#ff55ff",
      link: {
        dashArray: [5, 5, 1, 5],
        assignedDashArray: [4, 2, 1],
        opacity: 1,
        weight: 2,
      },
    },
  ],
  [
    "self-block",
    {
      name: "self-block",
      displayName: "Self Block",
      color: "#ff1111",
      link: {
        dashArray: [1, 5, 1, 5],
        assignedDashArray: [4, 2, 1],
        opacity: 4,
        weight: 3,
      },
    },
  ],
]);
