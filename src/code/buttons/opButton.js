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

  initialize: function (container) {
    this.type = OpButton.TYPE;
    this.title = wX("OP_BUTTON");
    this.handler = this._toggleActions;
    this._container = container;

    this.button = this._createButton({
      container: this._container,
      className: "wasabee-toolbar-op",
      callback: this._toggleActions,
      context: this,
      title: this.title,
    });

    this.setSubActions(this.getSubActions());

    window.map.on("wasabee:ui:skin wasabee:ui:lang", () => {
      this.button.title = wX("OP_BUTTON");
      this.setSubActions(this.getSubActions());
    });
  },

  getSubActions: function () {
    return [
      {
        title: wX("OP_SETTINGS_TITLE"),
        text: wX("OP_SETTINGS_BUTTON"),
        callback: () => {
          this.disable();
          const od = new OpSettings();
          od.enable();
        },
        context: this,
      },
      {
        title: wX("CHECKLIST BUTTON TITLE"),
        text: wX("CHECKLIST BUTTON"),
        callback: () => {
          this.disable();
          const cl = new OperationChecklistDialog();
          cl.enable();
        },
        context: this,
      },
      {
        title: wX("BLOCKER LIST TITLE"),
        text: wX("BLOCKER TITLE"),
        callback: () => {
          this.disable();
          const bl = new BlockersList();
          bl.enable();
        },
        context: this,
      },
      {
        title: wX("KEYS"),
        text: wX("KEYS"),
        callback: () => {
          this.disable();
          const kl = new KeysList();
          kl.enable();
        },
        context: this,
      },
      {
        title: wX("EXPORT OP TITLE"),
        text: wX("EXPORT OP"),
        callback: () => {
          this.disable();
          const ed = new ExportDialog();
          ed.enable();
        },
        context: this,
      },
    ];
  },

  // enable: // default is good
  // disable: // default is good
  // Wupdate: function() { // nothing to do }
});

export default OpButton;
