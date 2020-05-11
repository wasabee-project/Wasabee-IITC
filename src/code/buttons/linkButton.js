import { WButton } from "../leafletClasses";
import LinkDialog from "../dialogs/linkDialog";
import AutodrawsDialog from "../dialogs/autodraws";
import wX from "../wX";

const LinkButton = WButton.extend({
  statics: {
    TYPE: "LinkButton"
  },

  initialize: function(map = window.map, container) {
    this._map = map;

    this.type = LinkButton.TYPE;
    this.title = wX("LINKS BUTTON TITLE");
    this.handler = this._toggleActions;
    this._container = container;

    const context = this;

    this.button = this._createButton({
      container: this._container,
      buttonImage: window.plugin.wasabee.static.images.toolbar_addlinks.default,
      callback: this._toggleActions,
      context: context
    });

    this.actionsContainer = this._createSubActions([
      {
        title: wX("ADD LINK TITLE"),
        text: wX("ADD_LINKS"),
        callback: () => {
          this.disable();
          const ld = new LinkDialog(map);
          ld.enable();
        },
        context: context
      },
      {
        title: wX("AUTO_DRAWS"),
        text: wX("AUTO_DRAWS"),
        callback: () => {
          this.disable();
          const a = new AutodrawsDialog(map);
          a.enable();
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
