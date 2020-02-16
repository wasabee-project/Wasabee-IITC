import { WButton } from "../leafletDrawImports.js";
import MultimaxButtonControl from "../dialogs/multimaxDialog";
import LinkDialog from "../dialogs/linkDialog";

const LinkButton = WButton.extend({
  statics: {
    TYPE: "LinkButton"
  },

  initialize: function(map, container) {
    if (!map) map = window.map;
    this._map = map;

    this.type = LinkButton.TYPE;
    this.title = "Links";
    this.handler = this._toggleActions;
    this._container = container;

    const context = this;

    this.button = this._createButton({
      container: this._container,
      buttonImage: window.plugin.Wasabee.static.images.toolbar_addlinks,
      callback: this._toggleActions,
      context: context
    });

    this.actionsContainer = this._createSubActions([
      {
        title: "Add Links Dialog",
        text: "Add Link",
        callback: () => {
          this.disable();
          const ld = new LinkDialog(map);
          ld.enable();
        },
        context: context
      },
      {
        title: "Experimental Multimax Draw",
        text: "Multimax",
        callback: () => {
          this.disable();
          const mm = new MultimaxButtonControl(map);
          mm.enable();
        },
        context: context
      }
    ]);

    this.actionsContainer.style.top = "78px";
    this._container.appendChild(this.actionsContainer);
  }

  // enable: // default is good
  // disable: // default is good
  // Wupdate: function() { // nothing to do }
});

export default LinkButton;
