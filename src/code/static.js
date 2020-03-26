// this file is loaded by the build system
const W = window.plugin.wasabee || {};

W.static = {
  CSS: {
    main: require("./css/wasabee.css"),
  },
  images: {
    toolbar_addlinks: require("./images/toolbar_addlinks.png"),
    toolbar_viewOps: require("./images/toolbar_viewOps.png"),
    toolbar_addMarkers: require("./images/toolbar_addMarkers.png"),
    toolbar_sync: require("./images/toolbar_sync.png"),
    toolbar_upload: require("./images/toolbar_upload.png"),
    toolbar_download: require("./images/toolbar_download.png"),
    toolbar_delete: require("./images/toolbar_delete.png"),
    toolbar_plus: require("./images/toolbar_plus.png"),
    toolbar_wasabeebutton_in: require("./images/toolbar_wasabeebutton_in.png"),
    toolbar_wasabeebutton_out: require("./images/toolbar_wasabeebutton_out.png"),
    toolbar_quickdraw: require("./images/toolbar_quickdraw.png"),
    toolbar_settings: require("./images/toolbar_settings.png"),
    toolbar_multimax: require("./images/toolbar_multimax.png")
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
    multimaxButton: "wasabee-multimax",
    importDialog: "wasabee-import",
    operationChecklist: "wasabee-operation-checklist",
    blockerList: "wasabee-blockerlist",
    exportDialog: "wasabee-export",
    keysList: "wasabee-keys",
    keyListPortal: "wasabee-keyByPortal",
    wasabeeDKeyButton: "wasabee-DKey"
  },
  constants: {
    SELECTED_OP_KEY: "SELECTED_OP_KEY",
    SEND_LOCATION_KEY: "SEND_LOCATION",
    AGENT_INFO_KEY: "AGENT_INFO_KEY",
    OAUTH_CLIENT_ID:
      "269534461245-jbnes60ebd7u0b8naba19h4vqm7ji219.apps.googleusercontent.com",
    SERVER_BASE_KEY: "Wasabee Server",
    SERVER_BASE_DEFAULT: "https://server.wasabee.rocks",
    SERVER_BASE_TEST: "https://server.wasabee.rocks:8444",
    CURRENT_EXPIRE_NUMERIC: 1209600000,
    MARKER_TYPE_DECAY: "LetDecayPortalAlert",
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
    MARKER_TYPE_EXCLUDE: "ExcludeMarker",
    DEFAULT_MARKER_TYPE: "DestroyPortalAlert",
    BREAK_EXCEPTION: {},
    OP_RESTRUCTURE_KEY: "OP_RESTRUCTURE_KEY22",
    SCRIPT_URL_NOTY: "http://wasabee.rocks/wasabee_extras/noty.js"
  }
};

W.static.strings = require("./translations.json");

W.static.markerTypes = new Map([
  [
    W.static.constants.MARKER_TYPE_DECAY,
    {
      name: W.static.constants.MARKER_TYPE_DECAY,
      label: "Let Decay",
      color: "#7D7D7D",
      markerIcon: require("./images/wasabee_markers_decay_pending.png"),
      markerIconAssigned: require("./images/wasabee_markers_decay_assigned.png"),
      markerIconAcknowledged: require("./images/wasabee_markers_decay_assigned.png"),
      markerIconDone: require("./images/wasabee_markers_decay_done.png")
    }
  ],
  [
    W.static.constants.MARKER_TYPE_DESTROY,
    {
      name: W.static.constants.MARKER_TYPE_DESTROY,
      label: "Destroy",
      color: "#CE3B37",
      markerIcon: require("./images/wasabee_markers_destroy_pending.png"),
      markerIconAssigned: require("./images/wasabee_markers_destroy_assigned.png"),
      markerIconAcknowledged: require("./images/wasabee_markers_destroy_assigned.png"),
      markerIconDone: require("./images/wasabee_markers_destroy_done.png")
    }
  ],
  [
    W.static.constants.MARKER_TYPE_FARM,
    {
      name: W.static.constants.MARKER_TYPE_FARM,
      label: "Farm",
      color: "#CE3B37",
      markerIcon: require("./images/wasabee_markers_farm_pending.png"),
      markerIconAssigned: require("./images/wasabee_markers_farm_assigned.png"),
      markerIconAcknowledged: require("./images/wasabee_markers_farm_assigned.png"),
      markerIconDone: require("./images/wasabee_markers_farm_done.png")
    }
  ],
  [
    W.static.constants.MARKER_TYPE_GOTO,
    {
      name: W.static.constants.MARKER_TYPE_GOTO,
      label: "Go To",
      color: "#EDA032",
      markerIcon: require("./images/wasabee_markers_goto_pending.png"),
      markerIconAssigned: require("./images/wasabee_markers_goto_assigned.png"),
      markerIconAcknowledged: require("./images/wasabee_markers_goto_assigned.png"),
      markerIconDone: require("./images/wasabee_markers_goto_done.png")
    }
  ],
  [
    W.static.constants.MARKER_TYPE_KEY,
    {
      name: W.static.constants.MARKER_TYPE_KEY,
      label: "Get Keys",
      color: "#7D7D7D",
      markerIcon: require("./images/wasabee_markers_key_pending.png"),
      markerIconAssigned: require("./images/wasabee_markers_key_assigned.png"),
      markerIconAcknowledged: require("./images/wasabee_markers_key_assigned.png"),
      markerIconDone: require("./images/wasabee_markers_key_done.png")
    }
  ],
  [
    W.static.constants.MARKER_TYPE_LINK,
    {
      name: W.static.constants.MARKER_TYPE_LINK,
      label: "Link",
      color: "#5994FF",
      markerIcon: require("./images/wasabee_markers_link_pending.png"),
      markerIconAssigned: require("./images/wasabee_markers_link_assigned.png"),
      markerIconAcknowledged: require("./images/wasabee_markers_link_assigned.png"),
      markerIconDone: require("./images/wasabee_markers_link_done.png")
    }
  ],
  [
    W.static.constants.MARKER_TYPE_MEETAGENT,
    {
      name: W.static.constants.MARKER_TYPE_MEETAGENT,
      label: "Meet Agent",
      color: "#EDA032",
      markerIcon: require("./images/wasabee_markers_meetagent_pending.png"),
      markerIconAssigned: require("./images/wasabee_markers_meetagent_assigned.png"),
      markerIconAcknowledged: require("./images/wasabee_markers_meetagent_assigned.png"),
      markerIconDone: require("./images/wasabee_markers_meetagent_done.png")
    }
  ],
  [
    W.static.constants.MARKER_TYPE_OTHER,
    {
      name: W.static.constants.MARKER_TYPE_OTHER,
      label: "Other",
      color: "#3679B4",
      markerIcon: require("./images/wasabee_markers_other_pending.png"),
      markerIconAssigned: require("./images/wasabee_markers_other_assigned.png"),
      markerIconAcknowledged: require("./images/wasabee_markers_other_assigned.png"),
      markerIconDone: require("./images/wasabee_markers_other_done.png")
    }
  ],
  [
    W.static.constants.MARKER_TYPE_RECHARGE,
    {
      name: W.static.constants.MARKER_TYPE_RECHARGE,
      label: "Recharge",
      color: "#53AD53",
      markerIcon: require("./images/wasabee_markers_recharge_pending.png"),
      markerIconAssigned: require("./images/wasabee_markers_recharge_assigned.png"),
      markerIconAcknowledged: require("./images/wasabee_markers_recharge_assigned.png"),
      markerIconDone: require("./images/wasabee_markers_recharge_done.png")
    }
  ],
  [
    W.static.constants.MARKER_TYPE_UPGRADE,
    {
      name: W.static.constants.MARKER_TYPE_UPGRADE,
      label: "Upgrade",
      color: "#448800",
      markerIcon: require("./images/wasabee_markers_farm_pending.png"),
      markerIconAssigned: require("./images/wasabee_markers_farm_assigned.png"),
      markerIconAcknowledged: require("./images/wasabee_markers_farm_assigned.png"),
      markerIconDone: require("./images/wasabee_markers_farm_done.png")
    }
  ],
  [
    W.static.constants.MARKER_TYPE_VIRUS,
    {
      name: W.static.constants.MARKER_TYPE_VIRUS,
      label: "Use Virus",
      color: "#8920C3",
      markerIcon: require("./images/wasabee_markers_virus_pending.png"),
      markerIconAssigned: require("./images/wasabee_markers_virus_assigned.png"),
      markerIconAcknowledged: require("./images/wasabee_markers_virus_assigned.png"),
      markerIconDone: require("./images/wasabee_markers_virus_done.png")
    }
  ],
  [
    W.static.constants.MARKER_TYPE_EXCLUDE,
    {
      name: W.static.constants.MARKER_TYPE_EXCLUDE,
      label: "Exclude from auto-draws",
      color: "#E02919",
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
        iconUrl: require("./images/marker_layer_groupa.png")
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
