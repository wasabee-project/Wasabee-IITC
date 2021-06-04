import { WButton } from "../leafletClasses";
import MarkerAddDialog from "../dialogs/markerAddDialog";
import MarkerList from "../dialogs/markerList";
import wX from "../wX";

const MarkerButton = WButton.extend({
  statics: {
    TYPE: "MarkerButton",
  },

  initialize: function (container) {
    this.type = MarkerButton.TYPE;
    this.title = wX("MARKERS BUTTON TITLE");
    this.handler = this._toggleActions;
    this._container = container;

    this.button = this._createButton({
      container: this._container,
      className: "wasabee-toolbar-marker",
      callback: this._toggleActions,
      context: this,
      title: this.title,
    });

    this.actionsContainer = this._createSubActions(this.getSubActions());

    this._container.appendChild(this.actionsContainer);

    window.map.on("wasabee:ui:skin wasabee:ui:lang", () => {
      this.button.title = wX("MARKERS BUTTON TITLE");
      const newSubActions = this._createSubActions(this.getSubActions());
      this._container.replaceChild(newSubActions, this.actionsContainer);
      newSubActions.style.display = this.actionsContainer.style.display;
      this.actionsContainer = newSubActions;
    });
  },

  getSubActions: function () {
    return [
      {
        title: wX("ADD MARKER TITLE"),
        text: wX("ADD_MARKER"),
        callback: () => {
          this.disable();
          const md = new MarkerAddDialog();
          md.enable();
        },
        context: this,
      },
      {
        title: wX("MARKER LIST TITLE"),
        text: wX("MARKER LIST"),
        callback: () => {
          this.disable();
          const ml = new MarkerList();
          ml.enable();
        },
        context: this,
      },
    ];
  },

  // enable: // default is good
  // disable: // default is good
  // Wupdate: function() { // nothing to do }
});

export default MarkerButton;
