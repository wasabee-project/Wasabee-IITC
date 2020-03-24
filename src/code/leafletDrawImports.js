// Put anything from leaflet-draw that we need in here.

export const Tooltip = L.Class.extend({
  initialize: function(map) {
    this._map = map;
    this._popupPane = map._panes.popupPane;

    this._container = L.DomUtil.create(
      "div",
      "leaflet-draw-tooltip",
      this._popupPane
    );
    this._singleLineLabel = false;
  },

  dispose: function() {
    this._popupPane.removeChild(this._container);
    this._container = null;
  },

  updateContent: function(labelText) {
    labelText.subtext = labelText.subtext || "";

    // update the vertical position (only if changed)
    if (labelText.subtext.length === 0 && !this._singleLineLabel) {
      L.DomUtil.addClass(this._container, "leaflet-draw-tooltip-single");
      this._singleLineLabel = true;
    } else if (labelText.subtext.length > 0 && this._singleLineLabel) {
      L.DomUtil.removeClass(this._container, "leaflet-draw-tooltip-single");
      this._singleLineLabel = false;
    }

    this._container.innerHTML =
      (labelText.subtext.length > 0
        ? '<span class="leaflet-draw-tooltip-subtext">' +
          labelText.subtext +
          "</span>" +
          "<br />"
        : "") +
      "<span>" +
      labelText.text +
      "</span>";

    return this;
  },

  updatePosition: function(latlng) {
    const pos = this._map.latLngToLayerPoint(latlng);
    L.DomUtil.setPosition(this._container, pos);
    return this;
  },

  showAsError: function() {
    L.DomUtil.addClass(this._container, "leaflet-error-draw-tooltip");
    return this;
  },

  removeError: function() {
    L.DomUtil.removeClass(this._container, "leaflet-error-draw-tooltip");
    return this;
  }
});

export const Feature = L.Handler.extend({
  // includes: L.Evented,
  includes: L.Mixin.Events,

  initialize: function(map, options) {
    this._map = map;
    this._container = map._container;
    L.Util.extend(this.options, options);
  },

  enable: function() {
    if (this._enabled) return;
    L.Handler.prototype.enable.call(this);
    this.fire("enabled", { handler: this.type });
  },

  disable: function() {
    if (!this._enabled) return;
    L.Handler.prototype.disable.call(this);
    this.fire("disabled", { handler: this.type });
  },

  addHooks: function() {},

  removeHooks: function() {}
});

export const Toolbar = L.Class.extend({
  // includes: L.Evented.prototype || L.Mixin.Events,
  includes: L.Mixin.Events,

  initialize: function(options) {
    L.setOptions(this, options);

    this._modes = {};
    this._actionButtons = [];
    this._activeMode = null;
  },

  enabled: function() {
    return this._activeMode !== null;
  },

  disable: function() {
    if (!this.enabled()) {
      return;
    }

    this._activeMode.handler.disable();
  },

  removeToolbar: function() {
    // Dispose each handler
    for (const handlerId in this._modes) {
      //if (this._modes.hasOwnProperty(handlerId)) {
      if (this._modes[handlerId]) {
        // Unbind handler button
        this._disposeButton(
          this._modes[handlerId].button,
          this._modes[handlerId].handler.enable
        );

        // Make sure is disabled
        this._modes[handlerId].handler.disable();

        // Unbind handler
        this._modes[handlerId].handler
          .off("enabled", this._handlerActivated, this)
          .off("disabled", this._handlerDeactivated, this);
      }
    }
    this._modes = {};

    // Dispose the actions toolbar
    for (let i = 0, l = this._actionButtons.length; i < l; i++) {
      this._disposeButton(
        this._actionButtons[i].button,
        this._actionButtons[i].callback
      );
    }
    this._actionButtons = [];
    this._actionsContainer = null;
  },

  _initModeHandler: function(
    handler,
    container,
    buttonIndex,
    classNamePredix,
    buttonTitle
  ) {
    const type = handler.type;
    this._modes[type] = {};
    this._modes[type].handler = handler;
    this._modes[type].button = this._createButton({
      title: buttonTitle,
      className: classNamePredix + "-" + type,
      container: container,
      callback: this._modes[type].handler.enable,
      context: this._modes[type].handler
    });
    this._modes[type].buttonIndex = buttonIndex;
    this._modes[type].handler
      .on("enabled", this._handlerActivated, this)
      .on("disabled", this._handlerDeactivated, this);
  },

  _createButton: function(options) {
    const link = L.DomUtil.create(
      "a",
      options.className || "",
      options.container
    );
    link.href = "#";

    if (options.text) {
      link.innerHTML = options.text;
    }

    if (options.title) {
      link.title = options.title;
    }

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

  _handlerActivated: function(e) {
    // Disable active mode (if present)
    if (this._activeMode && this._activeMode.handler.enabled()) {
      this._activeMode.handler.disable();
    }

    // Cache new active feature
    this._activeMode = this._modes[e.handler];

    L.DomUtil.addClass(
      this._activeMode.button,
      "leaflet-draw-toolbar-button-enabled"
    );

    this._showActionsToolbar();

    this.fire("enable");
  },

  _handlerDeactivated: function() {
    this._hideActionsToolbar();

    L.DomUtil.removeClass(
      this._activeMode.button,
      "leaflet-draw-toolbar-button-enabled"
    );

    this._activeMode = null;

    this.fire("disable");
  },

  _createActions: function(buttons) {
    const container = L.DomUtil.create("ul", "leaflet-draw-actions");

    for (let i = 0; i < buttons.length; i++) {
      const li = L.DomUtil.create("li", null, container);

      const button = this._createButton({
        title: buttons[i].title,
        text: buttons[i].text,
        container: li,
        callback: buttons[i].callback,
        context: buttons[i].context
      });

      this._actionButtons.push({
        button: button,
        callback: buttons[i].callback
      });
    }

    return container;
  },

  _showActionsToolbar: function() {
    const buttonIndex = this._activeMode.buttonIndex,
      lastButtonIndex = this._lastButtonIndex,
      buttonHeight = 26, // TODO: this should be calculated
      borderHeight = 1, // TODO: this should also be calculated
      toolbarPosition =
        buttonIndex * buttonHeight + buttonIndex * borderHeight - 1;

    // Correctly position the cancel button
    this._actionsContainer.style.top = toolbarPosition + "px";

    if (buttonIndex === 0) {
      L.DomUtil.addClass(this._toolbarContainer, "leaflet-draw-toolbar-notop");
      L.DomUtil.addClass(this._actionsContainer, "leaflet-draw-actions-top");
    }

    if (buttonIndex === lastButtonIndex) {
      L.DomUtil.addClass(
        this._toolbarContainer,
        "leaflet-draw-toolbar-nobottom"
      );
      L.DomUtil.addClass(this._actionsContainer, "leaflet-draw-actions-bottom");
    }

    this._actionsContainer.style.display = "block";
  },

  _hideActionsToolbar: function() {
    this._actionsContainer.style.display = "none";

    L.DomUtil.removeClass(this._toolbarContainer, "leaflet-draw-toolbar-notop");
    L.DomUtil.removeClass(
      this._toolbarContainer,
      "leaflet-draw-toolbar-nobottom"
    );
    L.DomUtil.removeClass(this._actionsContainer, "leaflet-draw-actions-top");
    L.DomUtil.removeClass(
      this._actionsContainer,
      "leaflet-draw-actions-bottom"
    );
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

  Wupdate: function() {
    // called Wupdate because I think update might conflict with L.*
    // console.log("WButton Wupdate called");
  },

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
    if (options.text) {
      link.innerHTML = options.text;
    }
    if (options.buttonImage) {
      $(link).append(
        $("<img/>")
          .prop("src", options.buttonImage)
          .css("vertical-align", "middle")
          .css("align", "center")
      );
    }
    if (options.title) {
      link.title = options.title;
    }
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

  _createActions: function(buttons) {
    const container = L.DomUtil.create("ul", "leaflet-draw-actions");
    for (const b of buttons) {
      const li = L.DomUtil.create("li", "", container);
      this._createButton({
        title: b.title,
        text: b.text,
        container: li,
        callback: b.callback,
        context: b.context
      });
    }
    return container;
  },

  _createSubActions: function(buttons) {
    const container = L.DomUtil.create("ul", "leaflet-draw-actions");
    for (const b of buttons) {
      const li = L.DomUtil.create("li", "", container);
      this._createButton({
        title: b.title,
        text: b.text,
        container: li,
        callback: b.callback,
        context: b.context
      });
      li.style.setProperty("width", "auto", "important");
      li.firstChild.style.setProperty("width", "auto", "important");
    }
    return container;
  }
});
