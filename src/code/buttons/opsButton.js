import { WButton } from "../leafletDrawImports.js";
import OpsDialog from "../dialogs/opsDialog";
import BlockersList from "../dialogs/blockersList";
import MarkerList from "../dialogs/markerList";
import OperationChecklistDialog from "../dialogs/operationChecklistDialog";
import ExportDialog from "../dialogs/exportDialog";
import KeysList from "../dialogs/keysList";

const OpsButton = WButton.extend({
  statics: {
    TYPE: "opsButton"
  },

  initialize: function(map, container) {
    if (!map) map = window.map;
    this._map = map;

    this.type = OpsButton.TYPE;
    this.title = "Operations";
    this.handler = this._toggleActions;
    this._container = container;

    const context = this;

    this.button = this._createButton({
      container: this._container,
      buttonImage: window.plugin.Wasabee.static.images.toolbar_viewOps,
      callback: this._toggleActions,
      context: context
    });

    this.actionsContainer = this._createSubActions([
      {
        title: "Show Ops Menu",
        text: "Ops",
        callback: () => {
          this.disable();
          const od = new OpsDialog(map);
          od.enable();
        },
        context: context
      },
      {
        title: "Operation Checklist",
        text: "Checklist",
        callback: () => {
          this.disable();
          const cl = new OperationChecklistDialog(map);
          cl.enable();
        },
        context: context
      },
      {
        title: "Show all markers",
        text: "Markers",
        callback: () => {
          this.disable();
          const md = new MarkerList(map);
          md.enable();
        },
        context: context
      },
      {
        title: "Show all blockers",
        text: "Blockers",
        callback: () => {
          this.disable();
          const bl = new BlockersList(map);
          bl.enable();
        },
        context: context
      },
      {
        title: "Keys",
        text: "Keys",
        callback: () => {
          this.disable();
          const kl = new KeysList(map);
          kl.enable();
        },
        context: context
      },
      {
        title: "Export current op",
        text: "Export",
        callback: () => {
          this.disable();
          const ed = new ExportDialog(map);
          ed.enable();
        },
        context: context
      }
    ]);

    this.actionsContainer.style.top = "26px";
    // L.DomUtil.addClass(this.actionsContainer, "leaflet-draw-actions-top");
    this._container.appendChild(this.actionsContainer); // parentNode
  }

  // enable: // default is good
  // disable: // default is good
  // Wupdate: function() { // nothing to do }
});

export default OpsButton;
/*
const closeAllDialogs = skip => {
  skip = skip || "nothing";
  for (const name of Object.values(window.plugin.Wasabee.static.dialogNames)) {
    if (name != skip) {
      let id = "dialog-" + name;
      if (window.DIALOGS[id]) {
        try {
          let selector = $(window.DIALOGS[id]);
          selector.dialog("close");
          selector.remove();
        } catch (err) {
          console.log("closing dialog: " + err);
        }
      }
    }
  }
}; */
