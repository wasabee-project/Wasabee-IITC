import { WButton } from "../leafletClasses";
import MarkerAddDialog from "../dialogs/markerAddDialog";
import wX from "../wX";

const MarkerButton = WButton.extend({
  statics: {
    TYPE: "MarkerButton",
  },

  needWritePermission: true,

  initialize: function (container) {
    this.type = MarkerButton.TYPE;
    this.title = wX("ADD MARKER TITLE");

    this.button = this._createButton({
      container: container,
      className: "wasabee-toolbar-marker",
      callback: () => {
        const md = new MarkerAddDialog();
        md.enable();
      },
      context: this,
      title: this.title,
    });

    window.map.on("wasabee:ui:skin wasabee:ui:lang", () => {
      this.button.title = wX("ADD MARKER TITLE");
    });
  },
});

export default MarkerButton;
