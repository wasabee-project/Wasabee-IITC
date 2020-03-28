import { WDialog } from "../leafletClasses";
import WasabeePortal from "../portal";
import { getSelectedOperation } from "../selectedOp";
// import WasabeeLink from "../link";
import { clearAllItems, getAllPortalsOnScreen } from "../uiCommands";
import wX from "../wX";

const StarburstDialog = WDialog.extend({
  statics: {
    TYPE: "StarburstDialog"
  },

  addHooks: function() {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function() {
    WDialog.prototype.removeHooks.call(this);
  },

  _displayDialog: function() {
    if (!this._map) return;

    const container = L.DomUtil.create("div", null);
    const description = L.DomUtil.create("div", null, container);
    description.textContent =
      "Select the anchor, zoom to area to add to starburst";

    const controls = L.DomUtil.create("div", null, container);

    const anchorDiv = L.DomUtil.create("div", null, controls);
    const anchorLabel = L.DomUtil.create("label", null, anchorDiv);
    anchorLabel.textContent = "Anchor Portal ";
    const anchorButton = L.DomUtil.create("button", null, anchorLabel);
    anchorButton.textContent = "set";
    this._anchorDisplay = L.DomUtil.create("span", null, anchorLabel);
    if (this._anchor) {
      this._anchorDisplay.appendChild(this._anchor.displayFormat());
    } else {
      this._anchorDisplay.textContent = "not set";
    }
    L.DomEvent.on(anchorButton, "click", () => {
      this._anchor = WasabeePortal.getSelected();
      if (this._anchor) {
        localStorage["wasabee-anchor-1"] = JSON.stringify(this._anchor);
        this._anchorDisplay.textContent = "";
        this._anchorDisplay.appendChild(this._anchor.displayFormat());
      } else {
        alert(wX("PLEASE_SELECT_PORTAL"));
      }
    });

    // Bottom buttons bar
    const element = L.DomUtil.create("div", "buttonbar", container);
    const div = L.DomUtil.create("span", null, element);
    // Enter arrow
    const opt = L.DomUtil.create("span", "arrow", div);
    opt.textContent = "\u21b3";
    // Go button
    const button = L.DomUtil.create("button", null, div);
    button.textContent = wX("STARBURST");
    L.DomEvent.on(button, "click", () => {
      const context = this;
      this.starburst(context);
    });

    const context = this;
    this._dialog = window.dialog({
      title: wX("STARBURST TITLE"),
      width: "auto",
      height: "auto",
      html: container,
      dialogClass: "wasabee-dialog",
      closeCallback: function() {
        context.disable();
        delete context._dialog;
      },
      buttons: {
        OK: () => {
          this._dialog.dialog("close");
        },
        "Clear All": () => {
          clearAllItems(getSelectedOperation());
        }
      }
    });
  },

  initialize: function(map, options) {
    if (!map) map = window.map;
    this.type = StarburstDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
    this.title = wX("STARBURST");
    this.label = wX("STARBURST TITLE");
    this._operation = getSelectedOperation();
    let p = localStorage["wasabee-anchor-1"];
    if (p) this._anchor = WasabeePortal.create(p);
  },

  // fanfiled determines the portals between start/end and their angle (and order)
  starburst: context => {
    if (!context._anchor) {
      alert("Select an anchor portal");
      return;
    }

    context._operation.startBatchMode();
    for (const p of getAllPortalsOnScreen(context._operation)) {
      if (p.options.guid == context._anchor.id) continue;
      const wp = WasabeePortal.get(p.options.guid);
      context._operation.addLink(wp, context._anchor, "auto starburst");
    }
    context._operation.endBatchMode();
  }
});

export default StarburstDialog;
