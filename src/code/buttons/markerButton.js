import { WButton } from "../leafletClasses";
import MarkerAddDialog from "../dialogs/markerAddDialog";
import MarkerList from "../dialogs/markerList";
import { getSelectedOperation } from "../selectedOp";
import wX from "../wX";

const MarkerButton = WButton.extend({
  statics: {
    TYPE: "MarkerButton",
  },

  needWritePermission: true,

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

    this.setSubActions(this.getSubActions());

    window.map.on("wasabee:ui:skin wasabee:ui:lang", this.update, this);
  },

  update: function () {
    this.button.title = wX("MARKERS BUTTON TITLE");
    this.setSubActions(this.getSubActions());
  },

  getSubActions: function () {
    const subActions = [];
    const op = getSelectedOperation();
    if (op.canWrite())
      subActions.push({
        title: wX("ADD MARKER TITLE"),
        text: wX("ADD_MARKER"),
        callback: () => {
          this.disable();
          const md = new MarkerAddDialog();
          md.enable();
        },
        context: this,
      });
    subActions.push({
      title: wX("MARKER LIST TITLE"),
      text: wX("MARKER LIST"),
      callback: () => {
        this.disable();
        const ml = new MarkerList();
        ml.enable();
      },
      context: this,
    });
    return subActions;
  },

  // enable: // default is good
  // disable: // default is good
  // Wupdate: function() { // nothing to do }
});

export default MarkerButton;
