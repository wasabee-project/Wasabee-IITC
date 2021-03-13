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

export const WDialog = L.Handler.extend({
  statics: {
    TYPE: "Unextended Wasabee Dialog",
  },

  initialize: function (options) {
    L.setOptions(this, options);
    // determine large or small screen dialog sizes
    this._smallScreen = this._isMobile();
    window.map.fire("wdialog", this);
  },

  addHooks: function () {},

  removeHooks: function () {},

  createDialog: function (options) {
    options.dialogClass =
      "wasabee-dialog wasabee-dialog-" + options.dialogClass;
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
    return this._dialog;
  },

  closeDialog: function () {
    if (this._dialog) {
      this._dialog.dialog("close");
      delete this._dialog;
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

    return outerDiv;
  },

  // called when wasabeeUIUpdate fires
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
    link.href = "#";
    if (options.text) link.innerHTML = options.text;

    if (options.buttonImage) {
      const img = L.DomUtil.create("img", "wasabee-actions-image", link);
      img.id = this.type;
      img.src = options.buttonImage;
    }

    if (options.title) {
      link.title = options.title;
    }

    if (this._isTouch()) {
      L.DomEvent.on(link, "touchstart", L.DomEvent.stopPropagation)
        .on(link, "touchstart", L.DomEvent.preventDefault)
        .on(link, "touchstart", this.touchstart, options.context)
        .on(link, "touchend", this.touchend, options.context)
        .on(link, "touchmove", this.touchmove, options.context);
    } else {
      L.DomEvent.on(link, "click", L.DomEvent.stopPropagation)
        .on(link, "mousedown", L.DomEvent.stopPropagation)
        .on(link, "dblclick", L.DomEvent.stopPropagation)
        .on(link, "click", L.DomEvent.preventDefault)
        .on(link, "click", options.callback, options.context);
    }

    return link;
  },

  _touches: null,

  touchstart: function (ev) {
    this._touches = ev.changedTouches[0].target.id;
    console.log("first touch", this._touches);
    if (!this._enabled) this.enable();
  },

  touchend: function (ev) {
    this._touches = ev.changedTouches[0].target.id;
    console.log("last touch target", this._touches);
    if (this._enabled) this.disable();
  },

  touchmove: function (ev) {
    if (ev.changedTouches[0].target.id != this._touches) {
      this._touches = ev.changedTouches[0].target.id;
      console.log("new touch target", this._touches);
    }
  },

  _disposeButton: function (button, callback) {
    console.log("WButton _disposeButton");
    L.DomEvent.off(button, "click", L.DomEvent.stopPropagation)
      .off(button, "mousedown", L.DomEvent.stopPropagation)
      .off(button, "dblclick", L.DomEvent.stopPropagation)
      .off(button, "click", L.DomEvent.preventDefault)
      .off(button, "touchstart", L.DomEvent.preventDefault)
      .off(button, "touchend", L.DomEvent.preventDefault)
      .off(button, "click", callback);
  },

  _createSubActions: function (buttons) {
    const container = L.DomUtil.create("ul", "wasabee-actions");
    L.DomEvent.on(container, "touchenter", (ev) => {
      console.log("touchenter", ev);
    });
    L.DomEvent.on(container, "touchleave", (ev) => {
      console.log("touchleave", ev);
    });
    for (const b of buttons) {
      const li = L.DomUtil.create("li", "wasabee-subactions", container);
      this._createButton({
        title: b.title,
        text: b.text,
        buttonImage: b.img,
        container: li,
        callback: b.callback,
        context: b.context,
        className: "wasabee-subactions",
      });
      L.DomEvent.on(li, "touchenter", (ev) => {
        console.log("touchenter", ev);
      });
      L.DomEvent.on(li, "touchleave", (ev) => {
        console.log("touchleave", ev);
      });
    }
    return container;
  },

  _isTouch: function () {
    /* console.log("mobile", L.Browser.mobile);
    console.log("touch", L.Browser.touch);
    console.log("userLocation", window.plugin.userLocation); */
    // if (L.Browser.mobile && L.Browser.touch) return true;
    return false;
  },
});
