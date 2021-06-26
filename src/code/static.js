// this file is loaded by the build system
const W = window.plugin.wasabee || {};

W.static = {
  CSS: {
    main: require("./css/wasabee.css"),
    autodraws: require("./css/autodraws.css"),
    toolbar: require("./css/toolbar.css"),
    panes: require("./css/panes.css"),
    smallScreen: require("./css/smallscreen.css"),
    // fix for dialogs on mobile from iitc dev version
    // to remove on >IITC-0.30.1
    iitcfix: require("./css/iitcfix.css"),
  },
  dialogNames: {
    linkDialogButton: "wasabee-addlinks",
    markerButton: "wasabee-marker",
    mustauth: "wasabee-mustauth",
    newopButton: "wasabee-newop",
    opsList: "wasabee-operations",
    opSettings: "wasabee-operation-settings",
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
    savelinks: "wasabee-savelinks",
    settings: "wasabee-settings",
  },
  constants: {
    SELECTED_OP_KEY: "wasabee-selected-op",
    OPS_LIST_KEY: "wasabee-ops",
    OPS_LIST_HIDDEN_KEY: "wasabee-hidden-ops",
    OPS_SHOW_HIDDEN_OPS: "wasabee-show-hidden-ops",
    SEND_LOCATION_KEY: "wasabee-send-location",
    SEND_ANALYTICS_KEY: "wasabee-analytics",
    EXPERT_MODE_KEY: "wasabee-expert-mode",
    LANGUAGE_KEY: "wasabee-language",
    DEFAULT_LANGUAGE: "English",
    AGENT_INFO_KEY: "wasabee-me",
    MULTIMAX_UNREACHABLE_KEY: "wasabee-mm-unreachable",
    LINK_SOURCE_KEY: "wasabee-link-source",
    ANCHOR_ONE_KEY: "wasabee-anchor-1",
    ANCHOR_TWO_KEY: "wasabee-anchor-2",
    ANCHOR_THREE_KEY: "wasabee-anchor-3",
    PORTAL_DETAIL_RATE_KEY: "wasabee-portaldetail-rate",
    SKIN_KEY: "wasabee-skin",
    LAST_MARKER_KEY: "wasabee-last-marker-type",
    AUTO_LOAD_FAKED: "wasabee-autoload-faked",
    TRAWL_SKIP_STEPS: "wasabee-trawl-skip",
    USE_PANES: "wasabee-use-panes",
    SKIP_CONFIRM: "wasabee-skip-confirm",
    OAUTH_CLIENT_ID:
      "269534461245-jbnes60ebd7u0b8naba19h4vqm7ji219.apps.googleusercontent.com",
    SERVER_BASE_KEY: "wasabee-server",
    SERVER_BASE_DEFAULT: "https://am.wasabee.rocks",
    REBASE_UPDATE_KEY: "wasabee-rebase-on-update",
    DEFAULT_MARKER_TYPE: "DestroyPortalAlert",
    QUICKDRAW_GUIDE_STYLE: {
      color: "#0f0",
      dashArray: [8, 2],
      opacity: 0.7,
      weight: 5,
      smoothFactor: 1,
      interactive: false,
    },
  },
  publicServers: [
    { name: "Americas", url: "https://am.wasabee.rocks", short: "🇺🇸" },
    { name: "Europe", url: "https://eu.wasabee.rocks", short: "🇪🇺" },
    { name: "Asia/Pacific", url: "https://ap.wasabee.rocks", short: "AP" },
  ],
};

W.static.strings = {}; // empty object, fill it below
W.static.strings.Deutsch = require("./translations/german.json");
W.static.strings.Espanol = require("./translations/spanish.json");
W.static.strings.English = require("./translations/english.json");
W.static.strings.Italiano = require("./translations/italian.json");
W.static.strings.Tagalog = require("./translations/filipino.json");
W.static.strings.French = require("./translations/french.json");

W.static.defaultOperationColor = "orange";

W.static.linkStyle = {
  dashArray: [5, 5, 1, 5],
  assignedDashArray: [4, 2, 1],
  opacity: 1,
  weight: 2,
};

W.static.selfBlockStyle = {
  color: "#ff1111",
  dashArray: [1, 5],
  opacity: 4,
  weight: 3,
};

W.static.backgroundLinkStyle = {
  dashArray: [8, 5],
  opacity: 0.4,
  weight: 2,
  color: "green",
  interactive: false,
};

W.static.anchorTemplate = require("!raw-loader?esModule=false!./images/pin_custom.svg");

// https://leafletjs.com/reference-1.0.3.html#path
W.static.layerTypes = new Map([
  [
    "main",
    {
      name: "main",
      displayName: "Red",
      color: "#ff0000",
    },
  ],
  [
    "groupa",
    {
      name: "groupa",
      displayName: "Orange",
      color: "#ff6600",
    },
  ],
  [
    "groupb",
    {
      name: "groupb",
      displayName: "Light Orange",
      color: "#ff9900",
    },
  ],
  [
    "groupc",
    {
      name: "groupc",
      displayName: "Tan",
      color: "#bb9900",
    },
  ],
  [
    "groupd",
    {
      name: "groupd",
      displayName: "Purple",
      color: "#bb22cc",
    },
  ],
  [
    "groupe",
    {
      name: "groupe",
      displayName: "Teal",
      color: "#33cccc",
    },
  ],
  [
    "groupf",
    {
      name: "groupf",
      displayName: "Pink",
      color: "#ff55ff",
    },
  ],
]);

export const constants = W.static.constants;
