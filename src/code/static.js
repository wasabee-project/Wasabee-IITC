// this file is loaded by the build system
const W = window.plugin.wasabee || {};

W.static = {
  CSS: {
    main: require("./css/wasabee.css")
  },
  images: {
    toolbar_addlinks: require("./images/toolbar_addlinks.png"),
    toolbar_viewOps: require("./images/toolbar_viewOps.png"),
    toolbar_addMarkers: require("./images/toolbar_addMarkers.png"),
    toolbar_sync: require("./images/toolbar_sync.png"),
    toolbar_upload: require("./images/toolbar_upload.png"),
    toolbar_download: require("./images/toolbar_download.png"),
    toolbar_wasabeebutton_in: require("./images/toolbar_wasabeebutton_in.png"),
    toolbar_wasabeebutton_out: require("./images/toolbar_wasabeebutton_out.png"),
    toolbar_wasabeebutton_se: require("./images/toolbar_wasabeebutton_se.png"),
    toolbar_wasabeebutton_seg: require("./images/toolbar_wasabeebutton_seg.png"),
    toolbar_quickdraw: require("./images/toolbar_quickdraw.png"),
    toolbar_settings: require("./images/toolbar_settings.png")
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
    madrid: "wasabee-madrid"
  },
  constants: {
    SELECTED_OP_KEY: "wasabee-selected-op",
    SEND_LOCATION_KEY: "wasabee-send-location",
    LANGUAGE_KEY: "wasabee-language",
    DEFAULT_LANGUAGE: "English",
    SECONDARY_LANGUAGE: "Squirrel",
    MODE_KEY: "wasabee-mode",
    AGENT_INFO_KEY: "wasabee-me",
    MULTIMAX_UNREACHABLE_KEY: "wasabee-mm-unreachable",
    LINK_SOURCE_KEY: "wasabee-link-source",
    ANCHOR_ONE_KEY: "wasabee-anchor-1",
    ANCHOR_TWO_KEY: "wasabee-anchor-2",
    ANCHOR_THREE_KEY: "wasabee-anchor-3",
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
      interactive: true
    }
  }
};

W.static.strings = {}; // empty object, fill it below
W.static.strings.Deutsch = require("./translations/german.json");
W.static.strings.Espanol = require("./translations/spanish.json");
W.static.strings.English = require("./translations/english.json");
W.static.strings.Italiano = require("./translations/italian.json");
W.static.strings.Tagalog = require("./translations/filipino.json");
W.static.strings.Squirrel = require("./translations/squirrel.json");
W.static.strings.Emoji = require("./translations/emoji.json");
W.static.tips = require("./translations/tips.json");

W.static.markerTypes = new Map([
  [
    W.static.constants.MARKER_TYPE_CAPTURE,
    {
      markerIcon: require("./images/wasabee_markers_capture_pending.png"),
      markerIconAssigned: require("./images/wasabee_markers_capture_assigned.png"),
      markerIconAcknowledged: require("./images/wasabee_markers_capture_assigned.png"),
      markerIconDone: require("./images/wasabee_markers_capture_done.png")
    }
  ],
  [
    W.static.constants.MARKER_TYPE_DECAY,
    {
      markerIcon: require("./images/wasabee_markers_decay_pending.png"),
      markerIconAssigned: require("./images/wasabee_markers_decay_assigned.png"),
      markerIconAcknowledged: require("./images/wasabee_markers_decay_assigned.png"),
      markerIconDone: require("./images/wasabee_markers_decay_done.png")
    }
  ],
  [
    W.static.constants.MARKER_TYPE_DESTROY,
    {
      markerIcon: require("./images/wasabee_markers_destroy_pending.png"),
      markerIconAssigned: require("./images/wasabee_markers_destroy_assigned.png"),
      markerIconAcknowledged: require("./images/wasabee_markers_destroy_assigned.png"),
      markerIconDone: require("./images/wasabee_markers_destroy_done.png")
    }
  ],
  [
    W.static.constants.MARKER_TYPE_FARM,
    {
      markerIcon: require("./images/wasabee_markers_farm_pending.png"),
      markerIconAssigned: require("./images/wasabee_markers_farm_assigned.png"),
      markerIconAcknowledged: require("./images/wasabee_markers_farm_assigned.png"),
      markerIconDone: require("./images/wasabee_markers_farm_done.png")
    }
  ],
  [
    W.static.constants.MARKER_TYPE_GOTO,
    {
      markerIcon: require("./images/wasabee_markers_goto_pending.png"),
      markerIconAssigned: require("./images/wasabee_markers_goto_assigned.png"),
      markerIconAcknowledged: require("./images/wasabee_markers_goto_assigned.png"),
      markerIconDone: require("./images/wasabee_markers_goto_done.png")
    }
  ],
  [
    W.static.constants.MARKER_TYPE_KEY,
    {
      markerIcon: require("./images/wasabee_markers_key_pending.png"),
      markerIconAssigned: require("./images/wasabee_markers_key_assigned.png"),
      markerIconAcknowledged: require("./images/wasabee_markers_key_assigned.png"),
      markerIconDone: require("./images/wasabee_markers_key_done.png")
    }
  ],
  [
    W.static.constants.MARKER_TYPE_LINK,
    {
      markerIcon: require("./images/wasabee_markers_link_pending.png"),
      markerIconAssigned: require("./images/wasabee_markers_link_assigned.png"),
      markerIconAcknowledged: require("./images/wasabee_markers_link_assigned.png"),
      markerIconDone: require("./images/wasabee_markers_link_done.png")
    }
  ],
  [
    W.static.constants.MARKER_TYPE_MEETAGENT,
    {
      markerIcon: require("./images/wasabee_markers_meetagent_pending.png"),
      markerIconAssigned: require("./images/wasabee_markers_meetagent_assigned.png"),
      markerIconAcknowledged: require("./images/wasabee_markers_meetagent_assigned.png"),
      markerIconDone: require("./images/wasabee_markers_meetagent_done.png")
    }
  ],
  [
    W.static.constants.MARKER_TYPE_OTHER,
    {
      markerIcon: require("./images/wasabee_markers_other_pending.png"),
      markerIconAssigned: require("./images/wasabee_markers_other_assigned.png"),
      markerIconAcknowledged: require("./images/wasabee_markers_other_assigned.png"),
      markerIconDone: require("./images/wasabee_markers_other_done.png")
    }
  ],
  [
    W.static.constants.MARKER_TYPE_RECHARGE,
    {
      markerIcon: require("./images/wasabee_markers_recharge_pending.png"),
      markerIconAssigned: require("./images/wasabee_markers_recharge_assigned.png"),
      markerIconAcknowledged: require("./images/wasabee_markers_recharge_assigned.png"),
      markerIconDone: require("./images/wasabee_markers_recharge_done.png")
    }
  ],
  [
    W.static.constants.MARKER_TYPE_UPGRADE,
    {
      markerIcon: require("./images/wasabee_markers_upgrade_pending.png"),
      markerIconAssigned: require("./images/wasabee_markers_upgrade_assigned.png"),
      markerIconAcknowledged: require("./images/wasabee_markers_upgrade_assigned.png"),
      markerIconDone: require("./images/wasabee_markers_upgrade_done.png")
    }
  ],
  [
    W.static.constants.MARKER_TYPE_VIRUS,
    {
      markerIcon: require("./images/wasabee_markers_virus_pending.png"),
      markerIconAssigned: require("./images/wasabee_markers_virus_assigned.png"),
      markerIconAcknowledged: require("./images/wasabee_markers_virus_assigned.png"),
      markerIconDone: require("./images/wasabee_markers_virus_done.png")
    }
  ],
  [
    W.static.constants.MARKER_TYPE_EXCLUDE,
    {
      markerIcon: require("./images/wasabee_markers_exclude_pending.png"),
      markerIconAssigned: require("./images/wasabee_markers_exclude_assigned.png"),
      markerIconAcknowledged: require("./images/wasabee_markers_exclude_assigned.png"),
      markerIconDone: require("./images/wasabee_markers_exclude_done.png")
    }
  ]
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
        weight: 2
      },
      portal: {
        iconUrl: require("./images/marker_layer_main.png")
      }
    }
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
        weight: 2
      },
      portal: {
        iconUrl: require("./images/marker_layer_groupa.png")
      }
    }
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
        weight: 2
      },
      portal: {
        iconUrl: require("./images/marker_layer_groupb.png")
      }
    }
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
        weight: 2
      },
      portal: {
        iconUrl: require("./images/marker_layer_groupc.png")
      }
    }
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
        weight: 2
      },
      portal: {
        iconUrl: require("./images/marker_layer_groupd.png")
      }
    }
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
        weight: 2
      },
      portal: {
        iconUrl: require("./images/marker_layer_groupe.png")
      }
    }
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
        weight: 2
      },
      portal: {
        iconUrl: require("./images/marker_layer_groupf.png")
      }
    }
  ],
  [
    "SE",
    {
      name: "SE",
      displayName: "Special Edition",
      color: "#333333",
      link: {
        dashArray: [5, 1, 1, 5],
        assignedDashArray: [4, 2, 1],
        opacity: 1,
        weight: 2
      },
      portal: {
        iconUrl: require("./images/marker_layer_groupSE.png")
      }
    }
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
        weight: 3
      },
      portal: {
        iconUrl: require("./images/marker_layer_groupa.png")
      }
    }
  ]
]);
