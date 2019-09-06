export default function() {
  const Wasabee = window.plugin.Wasabee || {};

  Wasabee.Constants = {
    SELECTED_OP_KEY: "SELECTED_OP_KEY",
    AGENT_INFO_KEY: "AGENT_INFO_KEY",
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
    SCRIPT_URL_NOTY: "http://wasabee.rocks/wasabee_extras/noty.js"
  };

  Wasabee.alertTypes = [
    {
      name: Wasabee.Constants.MARKER_TYPE_DECAY,
      label: "let decay",
      color: "#7D7D7D",
      markerIcon: Wasabee.static.images.marker_alert_decay
    },
    {
      name: Wasabee.Constants.MARKER_TYPE_DESTROY,
      label: "destroy",
      color: "#CE3B37",
      markerIcon: Wasabee.static.images.marker_alert_destroy
    },
    {
      name: Wasabee.Constants.MARKER_TYPE_FARM,
      label: "farm",
      color: "#CE3B37",
      markerIcon: Wasabee.static.images.marker_alert_farm
    },
    {
      name: Wasabee.Constants.MARKER_TYPE_GOTO,
      label: "go to",
      color: "#EDA032",
      markerIcon: Wasabee.static.images.marker_alert_goto
    },
    {
      name: Wasabee.Constants.MARKER_TYPE_KEY,
      label: "get keys",
      color: "#7D7D7D",
      markerIcon: Wasabee.static.images.marker_alert_key
    },
    {
      name: Wasabee.Constants.MARKER_TYPE_LINK,
      label: "link",
      color: "#5994FF",
      markerIcon: Wasabee.static.images.marker_alert_link
    },
    {
      name: Wasabee.Constants.MARKER_TYPE_MEETAGENT,
      label: "meet agent",
      color: "#EDA032",
      markerIcon: Wasabee.static.images.marker_alert_meetagent
    },
    {
      name: Wasabee.Constants.MARKER_TYPE_OTHER,
      label: "other",
      color: "#3679B4",
      markerIcon: Wasabee.static.images.marker_alert_other
    },
    {
      name: Wasabee.Constants.MARKER_TYPE_RECHARGE,
      label: "recharge",
      color: "#53AD53",
      markerIcon: Wasabee.static.images.marker_alert_recharge
    },
    {
      name: Wasabee.Constants.MARKER_TYPE_UPGRADE,
      label: "upgrade",
      color: "#448800",
      markerIcon: Wasabee.static.images.marker_alert_upgrade
    },
    {
      name: Wasabee.Constants.MARKER_TYPE_VIRUS,
      label: "use virus",
      color: "#8920C3",
      markerIcon: Wasabee.static.images.marker_alert_virus
    }
  ];

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
