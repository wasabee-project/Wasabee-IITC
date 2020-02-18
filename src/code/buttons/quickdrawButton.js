import { WButton } from "../leafletDrawImports.js";
import QuickDrawControl from "../quickDrawLayers";

const QuickdrawButton = WButton.extend({
  statics: {
    TYPE: "quickdrawButton"
  },

  initialize: function(map, container) {
    if (!map) map = window.map;
    this._map = map;

    this.title = "Quick Draw Layers";
    this.handler = new QuickDrawControl(map);
    this._container = container;
    this.type = QuickdrawButton.TYPE;

    this.button = this._createButton({
      title: "Quick Draw Layers",
      container: container,
      buttonImage: window.plugin.wasabee.static.images.toolbar_quickdraw,
      callback: this.handler.enable,
      context: this.handler
    });

    this.actionsContainer = this._createActions([
      {
        title: "Click to stop drawing fields.",
        text: "End",
        callback: this.handler.disable,
        context: this.handler
      }
    ]);
    this.actionsContainer.style.top = "52px";
    L.DomUtil.addClass(this.actionsContainer, "leaflet-draw-actions-top");
    this._container.appendChild(this.actionsContainer);

    this.handler.on(
      "enabled",
      function() {
        this.actionsContainer.style.display = "block";
      },
      this
    );
    this.handler.on(
      "disabled",
      function() {
        this.actionsContainer.style.display = "none";
      },
      this
    );
  }

  // Wupdate: function(container) { }
});

export default QuickdrawButton;
