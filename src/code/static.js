const Wasabee = window.plugin.Wasabee || {};
Wasabee.static = {
  html: {
    exampleButton: require("./html/exampleButton.html"),
    exampleDialog: require("./html/exampleDialog.html")
  },
  CSS: {
    example: require("./css/styles.css"),
    ui: require("./css/ui.css"),
    main: require("./css/main.css"),
    leafletdraw: require("./css/leaflet.draw.css")
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
    marker_layer_main: require("./images/marker_layer_main.png"),
    marker_layer_groupa: require("./images/marker_layer_groupa.png"),
    marker_layer_groupb: require("./images/marker_layer_groupb.png"),
    marker_layer_groupc: require("./images/marker_layer_groupc.png"),
    marker_layer_groupd: require("./images/marker_layer_groupd.png"),
    marker_layer_groupe: require("./images/marker_layer_groupe.png"),
    marker_layer_groupf: require("./images/marker_layer_groupf.png")
  },
  dialogNames: {
    linkDialogButton: "wasabee-addlinks",
    markerButton: "wasabee-marker",
    mustauth: "wasabee-mustauth",
    newopButton: "wasabee-newop",
    opsButton: "wasabee-operations",
    wasabeeButton: "wasabee-userinfo"
  }
  // Other static data, like: LocalStorage keys, encoded images, texts etc.
};
