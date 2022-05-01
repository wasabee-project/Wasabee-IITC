import { WButton } from "../leafletClasses";
import OpSettings from "../dialogs/opSettings";
import BlockersList from "../dialogs/blockersList";
import OperationChecklistDialog from "../dialogs/checklist";
import MarkerList from "../dialogs/markerList";
import KeysList from "../dialogs/keysList";
import wX from "../wX";
import { redo, redoable, undo, undoable } from "../undo";
import { postToFirebase } from "../firebase/logger";
import FilterDialog from "../dialogs/filterDialog";

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

  update: function () {
    WButton.prototype.update.call(this);
    this.button.title = wX("OP_BUTTON");
    this.setSubActions(this.getSubActions());
  },

  getSubActions: function () {
    const actions = [
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
        title: wX("MARKER LIST TITLE"),
        text: wX("MARKER LIST"),
        callback: () => {
          this.disable();
          const ml = new MarkerList();
          ml.enable();
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
        title: wX("toolbar.op.filter"),
        text: wX("toolbar.op.filter"),
        callback: () => {
          this.disable();
          const fd = new FilterDialog();
          fd.enable();
        },
        context: this,
      },
    ];

    if (undoable()) {
      actions.push({
        title: wX("toolbar.op.undo"),
        text: wX("toolbar.op.undo"),
        accesskey: "z",
        callback: () => {
          postToFirebase({ id: "analytics", action: "undo" });
          undo();
        },
        context: this,
      });
    }

    if (redoable()) {
      actions.push({
        title: wX("toolbar.op.redo"),
        text: wX("toolbar.op.redo"),
        accesskey: "y",
        callback: () => {
          postToFirebase({ id: "analytics", action: "redo" });
          redo();
        },
        context: this,
      });
    }

    return actions;
  },

  // enable: // default is good
  // disable: // default is good
  // Wupdate: function() { // nothing to do }
});

export default OpButton;
