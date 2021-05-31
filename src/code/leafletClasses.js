export const WTooltip = L.Class.extend({
  initialize: function (map) {
    this._map = map;
    // this._pane = map._panes.popupPane;
    this._pane = map._panes.tooltipPane;

    this._container = L.DomUtil.create("div", "wasabee-tooltip", this._pane);
    L.DomUtil.addClass(this._container, "wasabee-tooltip-single");
  },

  dispose: function () {
    this._pane.removeChild(this._container);
    this._container = null;
  },

  updateContent: function (labelText) {
    // const span = L.DomUtil.create("span", null, this._container);
    this._container.textContent = labelText.text;
    return this;
  },

  updatePosition: function (latlng) {
    const pos = this._map.latLngToLayerPoint(latlng);
    L.DomUtil.setPosition(this._container, pos);
    return this;
  },

  showAsError: function () {
    L.DomUtil.addClass(this._container, "wasabee-error-tooltip");
    return this;
  },

  removeError: function () {
    L.DomUtil.removeClass(this._container, "wasabee-error-tooltip");
    return this;
  },
});

// Android pane
export const WPane = L.Handler.extend({
  options: {
    paneId: "wasabee",
    paneName: "Wasabee",
    default: null,
  },

  initialize: function (options) {
    L.setOptions(this, options);
    if (window.useAndroidPanes())
      android.addPane(this.options.paneId, this.options.paneName);
    window.addHook("paneChanged", (pane) => {
      if (pane === this.options.paneId) this.enable();
      else this.disable();
    });
    this._container = L.DomUtil.create(
      "div",
      "wasabee-pane hidden",
      document.body
    );
    window.map.on("wasabee:paneset", (data) => {
      if (data.pane !== this.options.paneId) return;
      if (this._dialog) this._dialog.closeDialog();
      this._dialog = data.dialog;
      this._container.textContent = "";
      this._container.appendChild(this._dialog._container);
      window.show(data.pane);
    });
    window.map.on("wasabee:paneclear", (data) => {
      if (data.pane !== this.options.paneId) return;
      if (this._dialog === data.dialog) delete this._dialog;
    });
  },

  addHooks: function () {
    this._container.classList.remove("hidden");
    if (!this._dialog && this.options.default) {
      const defaultDialog = this.options.default();
      defaultDialog.enable();
    }
  },

  removeHooks: function () {
    this._container.classList.add("hidden");
  },
});

export const WDialog = L.Handler.extend({
  statics: {
    TYPE: "Unextended Wasabee Dialog",
  },

  options: {
    usePane: false,
    paneId: "wasabee",
  },

  initialize: function (options) {
    L.setOptions(this, options);
    // determine large or small screen dialog sizes
    this._smallScreen = this._isMobile();
    window.map.fire("wdialog", this);
    this.options.usePane =
      this.options.usePane &&
      window.isSmartphone() &&
      localStorage[window.plugin.wasabee.static.constants.USE_PANES] === "true";
  },

  addHooks: function () {
    window.map.on("wasabee:ui:skin", this.update, this);
    window.map.on("wasabee:ui:lang", this.update, this);
  },

  removeHooks: function () {
    window.map.off("wasabee:ui:skin", this.update, this);
    window.map.off("wasabee:ui:lang", this.update, this);
  },

  update: function () {},

  createDialog: function (options) {
    this.options.title = options.title;
    options.dialogClass =
      "wasabee-dialog wasabee-dialog-" + options.dialogClass;
    if (this._smallScreen) options.dialogClass += " wasabee-small-screen";
    if (this.options.usePane) {
      this._container = L.DomUtil.create("div", options.dialogClass);
      if (options.id) this._container.id = options.id;

      this._header = L.DomUtil.create("div", "header", this._container);
      if (options.title) this._header.textContent = options.title;

      this._content = L.DomUtil.create("div", "content", this._container);
      if (options.html) this._content.appendChild(options.html);

      this._buttons = L.DomUtil.create("div", "buttonset", this._container);
      if (options.buttons) {
        if (!(options.buttons instanceof Array)) {
          options.buttons = Object.entries(options.buttons).map(([k, v]) => ({
            text: k,
            click: v,
          }));
        }
        for (const entry of options.buttons) {
          const button = L.DomUtil.create("button", null, this._buttons);
          button.textContent = entry.text;
          L.DomEvent.on(button, "click", entry.click);
        }
      }
      window.map.fire("wasabee:paneset", {
        pane: this.options.paneId,
        dialog: this,
      });
    } else {
      if (!options.closeCallback) {
        options.closeCallback = () => {
          this.disable();
          delete this._dialog;
        };
      }
      this._dialog = window.dialog(options);
      // swap in our buttons, replacing the defaults
      if (options.buttons)
        this._dialog.dialog("option", "buttons", options.buttons);
    }
  },

  setTitle: function (title) {
    if (this._dialog) this._dialog.dialog("option", "title", title);
    else if (this._header) this._header.textContent = title;
  },

  setContent: function (content) {
    if (this._dialog) this._dialog.html(content);
    else if (this._container) {
      this._content.textContent = "";
      this._content.appendChild(content);
    }
  },

  closeDialog: function () {
    if (this._dialog) {
      this._dialog.dialog("close");
      delete this._dialog;
    } else if (this._container) {
      window.map.fire("wasabee:paneclear", {
        pane: this.options.paneId,
        dialog: this,
      });
      this.disable();
      delete this._container;
      window.show("map");
    }
  },

  _isMobile: function () {
    // return true;
    // XXX this is a cheap hack -- determine a better check
    if (window.plugin.userLocation) return true;
    return false;
  },
});

// the wrapper class for the buttons
// pass in the WButtons as a Map in options.buttons
export const ButtonsControl = L.Control.extend({
  // options: { position: "topleft", },

  // From L.Control: onAdd is called when this is added to window.map
  onAdd: function () {
    // allow the buttons to call this ButtonsControl...
    for (const b of this.options.buttons.values()) {
      b.setControl(this);
    }

    const outerDiv = L.DomUtil.create("div", "wasabee-buttons");
    outerDiv.appendChild(this.options.container);

    window.map.on("wasabee:login wasabee:logout", this.update, this);
    window.map.on("wasabee:op:select wasabee:op:change", this.update, this);

    return outerDiv;
  },

  onRemove: function () {
    this.disableAllExcept();
    window.map.off("wasabee:op:select wasabee:op:change", this.update, this);
    window.map.off("wasabee:login wasabee:logout", this.update, this);
  },

  // called on skin, lang, login/logout and op change/select
  update: function () {
    for (const b of this.options.buttons.values()) {
      b.Wupdate();
    }
  },

  // called by a WButton when it is enabled
  disableAllExcept: function (name) {
    for (const [n, b] of this.options.buttons) {
      if (n != name) b.disable();
    }
  },

  // we could add logic for adding new buttons, removing existing, etc
  // but there is not need at the moment since hiding/showing seems
  // to work fine
});

export const WButton = L.Class.extend({
  statics: {
    TYPE: "unextendedWButton",
  },

  // always have these
  _enabled: false,
  title: "Unset",

  // make sure all these bases are covered in your button
  // XXX this initializer is not used by any buttons
  initialize: function (map, container) {
    console.log("WButton init");
    if (!map) map = window.map;
    this._map = map;

    this.type = WButton.TYPE;
    this.title = "Unextended WButton";
    this._container = container;
    this.handler = this._toggleActions;
    // this.actionsContainer == the sub menu items created by the individual buttons

    this.button = this._createButton({
      container: container,
      // buttonImage: null,
      callback: this.handler,
      context: this,
      // className: ...,
    });
  },

  Wupdate: function () {},

  _toggleActions: function () {
    if (this._enabled) {
      this.disable();
    } else {
      this.enable();
    }
  },

  setControl: function (control) {
    this.control = control;
  },

  disable: function () {
    if (!this._enabled) return;
    this._enabled = false;
    if (this.actionsContainer) {
      this.actionsContainer.style.display = "none";
    }
  },

  enable: function () {
    if (this._enabled) return;
    if (this.control) this.control.disableAllExcept(this.type);
    this._enabled = true;
    if (this.actionsContainer) {
      this.actionsContainer.style.display = "block";
    }
  },

  _createButton: function (options) {
    const link = L.DomUtil.create(
      "a",
      options.className || "",
      options.container
    );

    if (options.text) link.innerHTML = options.text;
    if (options.html) link.appendChild(options.html);

    if (options.buttonImage) {
      const img = L.DomUtil.create("img", "wasabee-actions-image", link);
      img.id = this.type;
      img.src = options.buttonImage;
    }

    if (options.title) {
      link.title = options.title;
    }

    L.DomEvent.disableClickPropagation(link);
    L.DomEvent.on(link, "click", options.callback, options.context);

    return link;
  },

  _createSubActions: function (buttons) {
    const container = L.DomUtil.create("ul", "wasabee-actions");
    for (const b of buttons) {
      const li = L.DomUtil.create("li", "wasabee-subactions", container);
      this._createButton({
        title: b.title,
        text: b.text,
        html: b.html,
        buttonImage: b.img,
        container: li,
        callback: b.callback,
        context: b.context,
        className: "wasabee-subactions",
      });
    }
    return container;
  },
});
