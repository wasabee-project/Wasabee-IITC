import { WButton } from "../leafletClasses";
import MarkerAddDialog from "../dialogs/markerAddDialog";
import MarkerList from "../dialogs/markerList";
import wX from "../wX";

const MarkerButton = WButton.extend({
  statics: {
    TYPE: "MarkerButton",
  },

  initialize: function (map, container) {
    if (!map) map = window.map;
    this._map = map;

    this.type = MarkerButton.TYPE;
    this.title = wX("MARKERS BUTTON TITLE");
    this.handler = this._toggleActions;
    this._container = container;

    const context = this;

    this.button = this._createButton({
      container: this._container,
      buttonImage: window.plugin.wasabee.skin.images.toolbar_addMarkers.default,
      callback: this._toggleActions,
      context: context,
    });

    this.actionsContainer = this._createSubActions([
      {
        title: wX("ADD MARKER TITLE"),
        text: wX("ADD_MARKER"),
        callback: () => {
          this.disable();
          const md = new MarkerAddDialog(map);
          md.enable();
        },
        context: context,
      },
      {
        title: wX("MARKER LIST TITLE"),
        text: wX("MARKER LIST"),
        callback: () => {
          this.disable();
          const ml = new MarkerList(map);
          ml.enable();
        },
        context: context,
      },
    ]);

    this.actionsContainer.style.top = "106px";
    this._container.appendChild(this.actionsContainer);
  },

  // enable: // default is good
  // disable: // default is good
  // Wupdate: function() { // nothing to do }
});

export default MarkerButton;
