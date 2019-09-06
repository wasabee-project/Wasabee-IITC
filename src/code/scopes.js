export default function() {
  const Wasabee = window.plugin.Wasabee || {};

  Wasabee.Constants = {
    OP_LIST_KEY: "OP_LIST_KEY",
    PASTE_LIST_KEY: "PASTE_LIST_KEY",
    SERVER_BASE_KEY: "https://server.wasabee.rocks",
    SERVER_BASE_TEST_KEY: "https://server.wasabee.rocks:8444",
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
    DEFAULT_ALERT_TYPE: "OtherPortalAlert",
    BREAK_EXCEPTION: {},
    OP_RESTRUCTURE_KEY: "OP_RESTRUCTURE_KEY22",
    SERVER_OP_LIST_KEY: "SERVER_OP_LIST_KEY",
    SERVER_OWNED_OP_LIST_KEY: "SERVER_OWNED_OP_LIST_KEY",
    SCRIPT_URL_NOTY: "http/://wasabee.rocks/wasabee_extras/noty.js"
  };

  Wasabee.markerTypes = new Map([
    [
      Wasabee.Constants.MARKER_TYPE_DECAY,
      {
        name: Wasabee.Constants.MARKER_TYPE_DECAY,
        label: "let decay",
        color: "#7D7D7D",
        markerIcon: Wasabee.static.images.marker_alert_decay,
        markerIconAssigned: Wasabee.static.images.marker_alert_decay_assigned,
        markerIconDone: Wasabee.static.images.marker_alert_decay_done
      }
    ],
    [
      Wasabee.Constants.MARKER_TYPE_DESTROY,
      {
        name: Wasabee.Constants.MARKER_TYPE_DESTROY,
        label: "destroy",
        color: "#CE3B37",
        markerIcon: Wasabee.static.images.marker_alert_destroy,
        markerIconAssigned: Wasabee.static.images.marker_alert_destroy_assigned,
        markerIconDone: Wasabee.static.images.marker_alert_destroy_done
      }
    ],
    [
      Wasabee.Constants.MARKER_TYPE_FARM,
      {
        name: Wasabee.Constants.MARKER_TYPE_FARM,
        label: "farm",
        color: "#CE3B37",
        markerIcon: Wasabee.static.images.marker_alert_farm,
        markerIconAssigned: Wasabee.static.images.marker_alert_farm_assigned,
        markerIconDone: Wasabee.static.images.marker_alert_farm_done
      }
    ],
    [
      Wasabee.Constants.MARKER_TYPE_GOTO,
      {
        name: Wasabee.Constants.MARKER_TYPE_GOTO,
        label: "go to",
        color: "#EDA032",
        markerIcon: Wasabee.static.images.marker_alert_goto,
        markerIconAssigned: Wasabee.static.images.marker_alert_goto_assigned,
        markerIconDone: Wasabee.static.images.marker_alert_goto_done
      }
    ],
    [
      Wasabee.Constants.MARKER_TYPE_KEY,
      {
        name: Wasabee.Constants.MARKER_TYPE_KEY,
        label: "get keys",
        color: "#7D7D7D",
        markerIcon: Wasabee.static.images.marker_alert_key,
        markerIconAssigned: Wasabee.static.images.marker_alert_key_assigned,
        markerIconDone: Wasabee.static.images.marker_alert_key_done
      }
    ],
    [
      Wasabee.Constants.MARKER_TYPE_LINK,
      {
        name: Wasabee.Constants.MARKER_TYPE_LINK,
        label: "link",
        color: "#5994FF",
        markerIcon: Wasabee.static.images.marker_alert_link,
        markerIconAssigned: Wasabee.static.images.marker_alert_link_assigned,
        markerIconDone: Wasabee.static.images.marker_alert_link_done
      }
    ],
    [
      Wasabee.Constants.MARKER_TYPE_MEETAGENT,
      {
        name: Wasabee.Constants.MARKER_TYPE_MEETAGENT,
        label: "meet agent",
        color: "#EDA032",
        markerIcon: Wasabee.static.images.marker_alert_meetagent,
        markerIconAssigned:
          Wasabee.static.images.marker_alert_meetagent_assigned,
        markerIconDone: Wasabee.static.images.marker_alert_meetagent_done
      }
    ],
    [
      Wasabee.Constants.MARKER_TYPE_OTHER,
      {
        name: Wasabee.Constants.MARKER_TYPE_OTHER,
        label: "other",
        color: "#3679B4",
        markerIcon: Wasabee.static.images.marker_alert_other,
        markerIconAssigned: Wasabee.static.images.marker_alert_other_assigned,
        markerIconDone: Wasabee.static.images.marker_alert_other_done
      }
    ],
    [
      Wasabee.Constants.MARKER_TYPE_RECHARGE,
      {
        name: Wasabee.Constants.MARKER_TYPE_RECHARGE,
        label: "recharge",
        color: "#53AD53",
        markerIcon: Wasabee.static.images.marker_alert_recharge,
        markerIconAssigned:
          Wasabee.static.images.marker_alert_recharge_assigned,
        markerIconDone: Wasabee.static.images.marker_alert_recharge_done
      }
    ],
    [
      Wasabee.Constants.MARKER_TYPE_UPGRADE,
      {
        name: Wasabee.Constants.MARKER_TYPE_UPGRADE,
        label: "upgrade",
        color: "#448800",
        markerIcon: Wasabee.static.images.marker_alert_upgrade,
        markerIconAssigned: Wasabee.static.images.marker_alert_upgrade_assigned,
        markerIconDone: Wasabee.static.images.marker_alert_upgrade_done
      }
    ],
    [
      Wasabee.Constants.MARKER_TYPE_VIRUS,
      {
        name: Wasabee.Constants.MARKER_TYPE_VIRUS,
        label: "use virus",
        color: "#8920C3",
        markerIcon: Wasabee.static.images.marker_alert_virus,
        markerIconAssigned: Wasabee.static.images.marker_alert_virus_assigned,
        markerIconDone: Wasabee.static.images.marker_alert_virus_done
      }
    ],
    [
      Wasabee.Constants.DEFAULT_ALERT_TYPE,
      {
        name: Wasabee.Constants.MARKER_TYPE_OTHER,
        label: "unknown",
        color: "#8920C3",
        markerIcon: Wasabee.static.images.marker_alert_other,
        markerIconAssigned: Wasabee.static.images.marker_alert_other_assigned,
        markerIconDone: Wasabee.static.images.marker_alert_other_done
      }
    ]
  ]);

  Wasabee.layerTypes = [
    {
      name: "main",
      displayName: "Red",
      color: "#FF0000",
      link: {
        dashArray: [5, 5, 1, 5],
        sharedKeysDashArray: [5, 5],
        opacity: 1,
        weight: 2
      },
      portal: {
        iconUrl: Wasabee.static.images.marker_layer_main
      }
    },
    {
      name: "groupa",
      displayName: "Orange",
      color: "#ff6600",
      link: {
        dashArray: [5, 5, 1, 5],
        sharedKeysDashArray: [5, 5],
        opacity: 1,
        weight: 2
      },
      portal: {
        iconUrl: Wasabee.static.images.marker_layer_groupa
      }
    },
    {
      name: "groupb",
      displayName: "Light Orange",
      color: "#ff9900",
      link: {
        dashArray: [5, 5, 1, 5],
        sharedKeysDashArray: [5, 5],
        opacity: 1,
        weight: 2
      },
      portal: {
        iconUrl: Wasabee.static.images.marker_layer_groupb
      }
    },
    {
      name: "groupc",
      displayName: "Tan",
      color: "#BB9900",
      link: {
        dashArray: [5, 5, 1, 5],
        sharedKeysDashArray: [5, 5],
        opacity: 1,
        weight: 2
      },
      portal: {
        iconUrl: Wasabee.static.images.marker_layer_groupc
      }
    },
    {
      name: "groupd",
      displayName: "Purple",
      color: "#bb22cc",
      link: {
        dashArray: [5, 5, 1, 5],
        sharedKeysDashArray: [5, 5],
        opacity: 1,
        weight: 2
      },
      portal: {
        iconUrl: Wasabee.static.images.marker_layer_groupd
      }
    },
    {
      name: "groupe",
      displayName: "Teal",
      color: "#33cccc",
      link: {
        dashArray: [5, 5, 1, 5],
        sharedKeysDashArray: [5, 5],
        opacity: 1,
        weight: 2
      },
      portal: {
        iconUrl: Wasabee.static.images.marker_layer_groupe
      }
    },
    {
      name: "groupf",
      displayName: "Pink",
      color: "#ff55ff",
      link: {
        dashArray: [5, 5, 1, 5],
        sharedKeysDashArray: [5, 5],
        opacity: 1,
        weight: 2
      },
      portal: {
        iconUrl: Wasabee.static.images.marker_layer_groupf
      }
    }
  ];
}
