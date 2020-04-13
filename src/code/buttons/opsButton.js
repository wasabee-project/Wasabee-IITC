import { WButton } from "../leafletClasses";
import OpsDialog from "../dialogs/opsDialog";
import BlockersList from "../dialogs/blockersList";
import OperationChecklistDialog from "../dialogs/operationChecklistDialog";
import ExportDialog from "../dialogs/exportDialog";
import KeysList from "../dialogs/keysList";
import wX from "../wX";

const OpsButton = WButton.extend({
  statics: {
    TYPE: "opsButton"
  },

  initialize: function(map, container) {
    if (!map) map = window.map;
    this._map = map;

    this.type = OpsButton.TYPE;
    this.title = wX("OPS BUTTON TITLE");
    this.handler = this._toggleActions;
    this._container = container;

    const context = this;

    this.button = this._createButton({
      container: this._container,
      buttonImage: window.plugin.wasabee.static.images.toolbar_viewOps.default,
      callback: this._toggleActions,
      context: context
    });

    this.actionsContainer = this._createSubActions([
      {
        title: wX("OPS BUTTON TITLE"),
        text: wX("OPS BUTTON"),
        callback: () => {
          this.disable();
          const od = new OpsDialog(map);
          od.enable();
        },
        context: context
      },
      {
        title: wX("CHECKLIST BUTTON TITLE"),
        text: wX("CHECKLIST BUTTON"),
        callback: () => {
          this.disable();
          const cl = new OperationChecklistDialog(map);
          cl.enable();
        },
        context: context
      },
      {
        title: wX("BLOCKER LIST TITLE"),
        text: wX("BLOCKER TITLE"),
        callback: () => {
          this.disable();
          const bl = new BlockersList(map);
          bl.enable();
        },
        context: context
      },
      {
        title: wX("KEYS"),
        text: wX("KEYS"),
        callback: () => {
          this.disable();
          const kl = new KeysList(map);
          kl.enable();
        },
        context: context
      },
      {
        title: wX("EXPORT OP TITLE"),
        text: wX("EXPORT OP"),
        callback: () => {
          this.disable();
          const ed = new ExportDialog(map);
          ed.enable();
        },
        context: context
      }
    ]);

    this.actionsContainer.style.top = "26px";
    this._container.appendChild(this.actionsContainer); // parentNode
  }

  // enable: // default is good
  // disable: // default is good
  // Wupdate: function() { // nothing to do }
});

export default OpsButton;
