import { WButton } from "../leafletDrawImports.js";
import MarkerAddDialog from "../dialogs/markerAddDialog";
import MarkerList from "../dialogs/markerList";

const MarkerButton = WButton.extend({
  statics: {
    TYPE: "MarkerButton"
  },

  initialize: function(map, container) {
    if (!map) map = window.map;
    this._map = map;

    this.type = MarkerButton.TYPE;
    this.title = "Markers";
    this.handler = this._toggleActions;
    this._container = container;

    const context = this;

    this.button = this._createButton({
      container: this._container,
      buttonImage: window.plugin.wasabee.static.images.toolbar_addMarkers,
      callback: this._toggleActions,
      context: context
    });

    this.actionsContainer = this._createSubActions([
      {
        title: "Add Markers Dialog",
        text: "Add Markers",
        callback: () => {
          this.disable();
          const md = new MarkerAddDialog(map);
          md.enable();
        },
        context: context
      },
      {
        title: "Markers List",
        text: "List",
        callback: () => {
          this.disable();
          const ml = new MarkerList(map);
          ml.enable();
        },
        context: context
      }
    ]);

    this.actionsContainer.style.top = "106px";
    this._container.appendChild(this.actionsContainer);
  }

  // enable: // default is good
  // disable: // default is good
  // Wupdate: function() { // nothing to do }
});

export default MarkerButton;
