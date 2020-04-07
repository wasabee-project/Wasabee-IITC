export const WTooltip = L.Class.extend({
  initialize: function(map) {
    this._map = map;
    // this._pane = map._panes.popupPane;
    this._pane = map._panes.tooltipPane;

    this._container = L.DomUtil.create("div", "wasabee-tooltip", this._pane);
    L.DomUtil.addClass(this._container, "wasabee-tooltip-single");
  },

  dispose: function() {
    this._pane.removeChild(this._container);
    this._container = null;
  },

  updateContent: function(labelText) {
    // const span = L.DomUtil.create("span", null, this._container);
    this._container.textContent = labelText.text;
    return this;
  },

  updatePosition: function(latlng) {
    const pos = this._map.latLngToLayerPoint(latlng);
    L.DomUtil.setPosition(this._container, pos);
    return this;
  },

  showAsError: function() {
    L.DomUtil.addClass(this._container, "wasabee-error-tooltip");
    return this;
  },

  removeError: function() {
    L.DomUtil.removeClass(this._container, "wasabee-error-tooltip");
    return this;
  }
});

export const WDialog = L.Handler.extend({
  initialize: function(map = window.map, options) {
    this.type = "Unextended Wasabee Dialog";
    this._map = map;
    this._container = map._container;
    L.Util.extend(this.options, options);
    this._enabled = false;
    this._smallScreen = this._isMobile();
    this._dialog = null;
    // look for operation in options, if not set, get it
    // determine large or small screen dialog sizes
  },

  enable: function() {
    if (this._enabled) return;
    L.Handler.prototype.enable.call(this);
  },

  disable: function() {
    if (!this._enabled) return;
    L.Handler.prototype.disable.call(this);
  },

  addHooks: function() {},

  removeHooks: function() {},

  _isMobile: function() {
    // return true;
    // XXX this is a cheap hack -- determine a better check
    if (window.plugin.userLocation) return true;
    return false;
  }
});

export const WButton = L.Class.extend({
  statics: {
    TYPE: "unextendedWButton"
  },

  // always have these
  _enabled: false,
  title: "Unset",

  // make sure all these bases are covered in your button
  initialize: function(map, container) {
    if (!map) map = window.map;
    this._map = map;

    this.type = WButton.TYPE;
    this.title = "Unextended WButton";
    this._container = container;
    this.handler = this._toggleActions;

    this.button = this._createButton({
      container: container,
      // buttonImage: null,
      callback: this.handler,
      context: this
      // className: ...,
    });
  },

  Wupdate: function() {},

  _toggleActions: function() {
    if (this._enabled) {
      this.disable();
    } else {
      this.enable();
    }
  },

  disable: function() {
    if (!this._enabled) return;
    this._enabled = false;
    if (this.actionsContainer) {
      this.actionsContainer.style.display = "none";
    }
  },

  enable: function() {
    if (this._enabled) return;
    this._enabled = true;
    if (this.actionsContainer) {
      this.actionsContainer.style.display = "block";
    }
    // disable all the others
    for (const m in window.plugin.wasabee.buttons._modes) {
      if (window.plugin.wasabee.buttons._modes[m].type != this.type)
        window.plugin.wasabee.buttons._modes[m].disable();
    }
  },

  _createButton: function(options) {
    const link = L.DomUtil.create(
      "a",
      options.className || "",
      options.container
    );
    link.href = "#";
    if (options.text) link.innerHTML = options.text;

    if (options.buttonImage) {
      const img = L.DomUtil.create("img", "wasabee-actions-image", link);
      img.src = options.buttonImage;
      // img.style.verticalAlign = "middle";
      // img.style.align = "center";
    }

    if (options.title) link.title = options.title;

    L.DomEvent.on(link, "click", L.DomEvent.stopPropagation)
      .on(link, "mousedown", L.DomEvent.stopPropagation)
      .on(link, "dblclick", L.DomEvent.stopPropagation)
      .on(link, "click", L.DomEvent.preventDefault)
      .on(link, "click", options.callback, options.context);
    return link;
  },

  _disposeButton: function(button, callback) {
    L.DomEvent.off(button, "click", L.DomEvent.stopPropagation)
      .off(button, "mousedown", L.DomEvent.stopPropagation)
      .off(button, "dblclick", L.DomEvent.stopPropagation)
      .off(button, "click", L.DomEvent.preventDefault)
      .off(button, "click", callback);
  },

  _createSubActions: function(buttons) {
    const container = L.DomUtil.create("ul", "wasabee-actions");
    for (const b of buttons) {
      let text = b.text;
      if (this._isMobile && b.text.length > 8) {
        text = b.text.split(0, 6) + "...";
      }

      const li = L.DomUtil.create("li", "wasabee-subactions", container);
      this._createButton({
        title: b.title,
        text: text,
        buttonImage: b.img,
        container: li,
        callback: b.callback,
        context: b.context,
        className: "wasabee-subactions"
      });
      // these should be in the css for wasabee-subactions now
      // li.style.setProperty("width", "auto", "important");
      // li.firstChild.style.setProperty("width", "auto", "important");
    }
    return container;
  },

  _isMobile: function() {
    // return true;
    // XXX this is a cheap hack -- determine a better check
    if (window.plugin.userLocation) return true;
    return false;
  }
});
