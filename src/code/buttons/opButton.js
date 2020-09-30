import { WButton } from "../leafletClasses";
import OpSettings from "../dialogs/opSettings";
import BlockersList from "../dialogs/blockersList";
import OperationChecklistDialog from "../dialogs/checklist";
import ExportDialog from "../dialogs/exportDialog";
import KeysList from "../dialogs/keysList";
import wX from "../wX";

const OpButton = WButton.extend({
  statics: {
    TYPE: "opButton",
  },

  initialize: function (map, container) {
    if (!map) map = window.map;
    this._map = map;

    this.type = OpButton.TYPE;
    this.title = wX("OP_BUTTON");
    this.handler = this._toggleActions;
    this._container = container;

    const context = this;

    this.button = this._createButton({
      container: this._container,
      className: "wasabee-toolbar-op",
      callback: this._toggleActions,
      context: context,
      title: this.title,
    });

    this.actionsContainer = this._createSubActions([
      {
        title: wX("OP_SETTINGS_TITLE"),
        text: wX("OP_SETTINGS_BUTTON"),
        callback: () => {
          this.disable();
          const od = new OpSettings(map);
          od.enable();
        },
        context: context,
      },
      {
        title: wX("CHECKLIST BUTTON TITLE"),
        text: wX("CHECKLIST BUTTON"),
        callback: () => {
          this.disable();
          const cl = new OperationChecklistDialog(map);
          cl.enable();
        },
        context: context,
      },
      {
        title: wX("BLOCKER LIST TITLE"),
        text: wX("BLOCKER TITLE"),
        callback: () => {
          this.disable();
          const bl = new BlockersList(map);
          bl.enable();
        },
        context: context,
      },
      {
        title: wX("KEYS"),
        text: wX("KEYS"),
        callback: () => {
          this.disable();
          const kl = new KeysList(map);
          kl.enable();
        },
        context: context,
      },
      {
        title: wX("EXPORT OP TITLE"),
        text: wX("EXPORT OP"),
        callback: () => {
          this.disable();
          const ed = new ExportDialog(map);
          ed.enable();
        },
        context: context,
      },
    ]);

    this.actionsContainer.style.top = "26px";
    this._container.appendChild(this.actionsContainer); // parentNode
  },

  // enable: // default is good
  // disable: // default is good
  // Wupdate: function() { // nothing to do }
});

export default OpButton;
