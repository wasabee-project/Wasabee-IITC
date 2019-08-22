const Wasabee = window.plugin.Wasabee || {};
Wasabee.static = {
  html: {
    exampleButton: require("./html/exampleButton.html"),
    exampleDialog: require("./html/exampleDialog.html")
  },
  CSS: {
    example: require("./css/styles.css"),
    ui: require("./css/ui.css"),
    main: require("./css/main.css")
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
    toolbar_settings: require("./images/toolbar_settings.png"),
    marker_layer_main: require("./images/marker_layer_main.png"),
    marker_layer_groupa: require("./images/marker_layer_groupa.png"),
    marker_layer_groupb: require("./images/marker_layer_groupb.png"),
    marker_layer_groupc: require("./images/marker_layer_groupc.png"),
    marker_layer_groupd: require("./images/marker_layer_groupd.png"),
    marker_layer_groupe: require("./images/marker_layer_groupe.png"),
    marker_layer_groupf: require("./images/marker_layer_groupf.png"),

    marker_alert_decay: require("./images/wasabee_markers_decay_pending.png"),
    marker_alert_destroy: require("./images/wasabee_markers_destroy_pending.png"),
    marker_alert_farm: require("./images/wasabee_markers_farm_pending.png"),
    marker_alert_goto: require("./images/wasabee_markers_goto_pending.png"),
    marker_alert_key: require("./images/wasabee_markers_key_pending.png"),
    marker_alert_link: require("./images/wasabee_markers_link_pending.png"),
    marker_alert_meetagent: require("./images/wasabee_markers_meetagent_pending.png"),
    marker_alert_other: require("./images/wasabee_markers_other_pending.png"),
    marker_alert_recharge: require("./images/wasabee_markers_recharge_pending.png"),
    marker_alert_upgrade: require("./images/wasabee_markers_farm_pending.png"),
    marker_alert_virus: require("./images/wasabee_markers_virus_pending.png")
  }
  // Other static data, like: LocalStorage keys, encoded images, texts etc.
};
