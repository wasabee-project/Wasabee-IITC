import { WButton } from "../leafletClasses";
import MultimaxButtonControl from "../dialogs/multimaxDialog";
import FanfieldDialog from "../dialogs/fanfield";
import StarburstDialog from "../dialogs/starburst";
import OnionfieldDialog from "../dialogs/onionfield";
import LinkDialog from "../dialogs/linkDialog";
import wX from "../wX";

const LinkButton = WButton.extend({
  statics: {
    TYPE: "LinkButton"
  },

  initialize: function(map, container) {
    if (!map) map = window.map;
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
        title: wX("MM TITLE"),
        text: wX("MM"),
        callback: () => {
          this.disable();
          const mm = new MultimaxButtonControl(map);
          mm.enable();
        },
        context: context
      },
      {
        title: wX("MAX TITLE"),
        text: wX("MAX"),
        callback: () => {
          this.disable();
          const ff = new FanfieldDialog(map);
          ff.enable();
        },
        context: context
      },
      {
        title: wX("STARBURST TITLE"),
        text: wX("STARBURST"),
        callback: () => {
          this.disable();
          const sb = new StarburstDialog(map);
          sb.enable();
        },
        context: context
      },
      {
        title: "Onion/Rose",
        text: "Onion/Rose",
        callback: () => {
          this.disable();
          const o = new OnionfieldDialog(map);
          o.enable();
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
