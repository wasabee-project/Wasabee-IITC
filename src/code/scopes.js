export default function() {
  const Wasabee = window.plugin.Wasabee || {};

  Wasabee.Constants = {
    OP_LIST_KEY: "OP_LIST_KEY",
    PASTE_LIST_KEY: "PASTE_LIST_KEY",
    SERVER_BASE_KEY: "https://server.wasabee.rocks",
    SERVER_BASE_TEST_KEY: "https://server.wasabee.rocks:8444",
    CURRENT_EXPIRE_NUMERIC: 1209600000,
    MARKER_TYPE_DESTROY: "DestroyPortalAlert",
    MARKER_TYPE_VIRUS: "UseVirusPortalAlert",
    MARKER_TYPE_DECAY: "LetDecayPortalAlert",
    DEFAULT_ALERT_TYPE: "DestroyPortalAlert",
    BREAK_EXCEPTION: {},
    OP_RESTRUCTURE_KEY: "OP_RESTRUCTURE_KEY22",
    SERVER_OP_LIST_KEY: "SERVER_OP_LIST_KEY",
    SERVER_OWNED_OP_LIST_KEY: "SERVER_OWNED_OP_LIST_KEY",
    SCRIPT_URL_NOTY: "http/://wasabee.rocks/wasabee_extras/noty.js"
  };

  Wasabee.alertTypes = [
    {
      name: Wasabee.Constants.MARKER_TYPE_DESTROY,
      label: "destroy",
      color: "#CE3B37",
      markerIcon: Wasabee.static.images.marker_alert_destroy
    },
    {
      name: Wasabee.Constants.MARKER_TYPE_VIRUS,
      label: "use virus",
      color: "#8920C3",
      markerIcon: Wasabee.static.images.marker_alert_virus
    },
    {
      name: Wasabee.Constants.MARKER_TYPE_DECAY,
      label: "let decay",
      color: "#7D7D7D",
      markerIcon: Wasabee.static.images.marker_alert_decay
    }
    /* , {
        name : "CreateLinkAlert",
        label : "link",
        color : "#5994FF",
        markerIcon : data.Images.marker_alert_link,
      }, {
        name : "GotoPortalAlert",
        label : "go to",
        color : "#EDA032",
        markerIcon : data.Images.marker_alert_goto,
      }, {
        name : "UpgradePortalAlert",
        label : "upgrade",
        color : "#3679B4",
        markerIcon : data.Images.marker_alert_upgrade,
      }, {
        name : "FarmPortalAlert",
        label : "farm",
        color : "#53AD53",
        markerIcon : data.Images.marker_alert_farm,
      }, {
        name : "MessageAlert",
        label : "message",
        color : "transparent",
        markerIcon : data.Images.marker_alert_unknown,
      } */
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
