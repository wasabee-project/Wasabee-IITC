! function(scope) {
    var b;
    ! function(a) {
        a.OP_LIST_KEY = "OP_LIST_KEY";
        a.PASTE_LIST_KEY = "PASTE_LIST_KEY";
        a.SERVER_BASE_KEY = "https://server.wasabee.rocks";
        a.SERVER_BASE_TEST_KEY = "https://server.wasabee.rocks:8444";
        a.CURRENT_EXPIRE_NUMERIC = 1209600000;
        a.MARKER_TYPE_DESTROY = "DestroyPortalAlert";
        a.MARKER_TYPE_VIRUS = "UseVirusPortalAlert";
        a.MARKER_TYPE_DECAY = "LetDecayPortalAlert";
        a.DEFAULT_ALERT_TYPE = "DestroyPortalAlert";
        a.BREAK_EXCEPTION = {};
        a.OP_RESTRUCTURE_KEY = "OP_RESTRUCTURE_KEY22";
        a.SERVER_OP_LIST_KEY = "SERVER_OP_LIST_KEY";
        a.SERVER_OWNED_OP_LIST_KEY = "SERVER_OWNED_OP_LIST_KEY";
        a.SCRIPT_URL_NOTY = "http/://wasabee.rocks/wasabee_extras/noty.js";
    }(b = scope.Constants || (scope.Constants = {}));
}(Wasabee || (Wasabee = {}));

! function(scope) {
    scope.alertTypes = [{
            name: Wasabee.Constants.MARKER_TYPE_DESTROY,
            label: "destroy",
            color: "#CE3B37",
            markerIcon: scope.static.images.marker_alert_destroy,
        }, {
            name: Wasabee.Constants.MARKER_TYPE_VIRUS,
            label: "use virus",
            color: "#8920C3",
            markerIcon: scope.static.images.marker_alert_virus,
        }, {
            name: Wasabee.Constants.MARKER_TYPE_DECAY,
            label: "let decay",
            color: "#7D7D7D",
            markerIcon: scope.static.images.marker_alert_decay
        }, {
	    name: Wasabee.Constants.MARKER_TYPE_KEY,
	    label: "get key",
	    color: "#7D7D7D",
	    markerIcon: scope.static.images.marker_alert_key
	}, {
	    name: Wasabee.Constants.MARKER_TYPE_LINK,
          name : "CreateLinkAlert",
          label : "link",
          color : "#5994FF",
          markerIcon : data.Images.marker_alert_link,
        }, {
	    name: Wasabee.Constants.MARKER_TYPE_MEETAGENT,
          name : "MeetAgentPortalAlert",
          label : "go to",
          color : "#EDA032",
          markerIcon : data.Images.marker_alert_meetagent,
        }, {
	    name: Wasabee.Constants.MARKER_TYPE_OTHER,
          name : "OtherPortalAlert",
          label : "other",
          color : "#3679B4",
          markerIcon : data.Images.marker_alert_other,
        }, {
	    name: Wasabee.Constants.MARKER_TYPE_RECHARGE,
          name : "RechargePortalAlert",
          label : "recharge",
          color : "#53AD53",
          markerIcon : data.Images.marker_alert_recharge,
        }, {
	    name: Wasabee.Constants.MARKER_TYPE_UPGRADE,
          name : "UpgradePortalAlert",
          label : "upgrade",
          color : "#448800",
          markerIcon : data.Images.marker_alert_upgrade,
        }
    ];
}(Wasabee || (Wasabee = {}));

! function(scope) {
    scope.layerTypes = [{
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
            iconUrl: scope.static.images.marker_layer_main
        }
    }, {
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
            iconUrl: scope.static.images.marker_layer_groupa
        }
    }, {
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
            iconUrl: scope.static.images.marker_layer_groupb
        }
    }, {
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
            iconUrl: scope.static.images.marker_layer_groupc
        }
    }, {
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
            iconUrl: scope.static.images.marker_layer_groupd
        }
    }, {
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
            iconUrl: scope.static.images.marker_layer_groupe
        }
    }, {
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
            iconUrl: scope.static.images.marker_layer_groupf
        }
    }];
}(Wasabee || (Wasabee = {}));
