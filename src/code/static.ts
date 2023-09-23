import mainCSS from "./css/wasabee.css";
import autodrawsCSS from "./css/autodraws.css";
import toolbarCSS from "./css/toolbar.css";
import mapCSS from "./css/map.css";
import panesCSS from "./css/panes.css";
import smallScreenCSS from "./css/smallscreen.css";
import iitcfixCSS from "./css/iitcfix.css";

import anchorPin from "./images/pin_custom.svg";
import translations from "./translations";

const CSS = {
  main: mainCSS,
  autodraws: autodrawsCSS,
  toolbar: toolbarCSS,
  map: mapCSS,
  panes: panesCSS,
  smallScreen: smallScreenCSS,
  // fix for dialogs on mobile from iitc dev version
  // to remove on >IITC-0.30.1
  iitcfix: iitcfixCSS,
};

const dialogNames = {
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
  fanfield: "wasabee-fanfield",
  skinDialog: "wasabee-settings-skins",
  setComment: "wasabee-comment",
  trawl: "wasabee-trawl",
  manageTeam: "wasabee-manageteam",
};

export const constants = {
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
    "269534461245-b767slmcrhllpns01u7omue0n5l3mva0.apps.googleusercontent.com",
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
  WEBUI_DEFAULT: "https://webui.wasabee.rocks",
  JOIN_TEAM_TEMPLATE:
    "https://webui.wasabee.rocks/?server={server}#/team/{teamid}/join/{token}",
  FIREBASE_IFRAME: "https://cdn2.wasabee.rocks/iitcplugin/firebase/",
  FIREBASE_DISABLE: "wasabee-firebase",
  UNDO_HISTORY_SIZE: 100,
  POPULATE_OPPORTALS: "wasabee-populate-opportals",
};

const defaultOperationColor = "orange";

const linkStyle = {
  dashArray: [5, 5, 1, 5],
  assignedDashArray: [4, 2, 1],
  opacity: 1,
  weight: 2,
};

const selfBlockStyle = {
  color: "#ff1111",
  dashArray: [1, 5],
  opacity: 4,
  weight: 3,
};

const backgroundLinkStyle = {
  dashArray: [8, 5],
  opacity: 0.4,
  weight: 2,
  color: "green",
  interactive: false,
};

const anchorTemplate = anchorPin;

const statics = {
  CSS: CSS,
  dialogNames: dialogNames,
  constants: constants,
  publicServers: [
    { name: "Americas", url: "https://am.wasabee.rocks", short: "🇺🇸" },
    { name: "Europe", url: "https://eu.wasabee.rocks", short: "🇪🇺" },
    { name: "Asia/Pacific", url: "https://ap.wasabee.rocks", short: "AP" },
  ],
  strings: translations,
  defaultOperationColor: defaultOperationColor,
  linkStyle: linkStyle,
  selfBlockStyle: selfBlockStyle,
  backgroundLinkStyle: backgroundLinkStyle,
  anchorTemplate: anchorTemplate,
};

export default statics;
