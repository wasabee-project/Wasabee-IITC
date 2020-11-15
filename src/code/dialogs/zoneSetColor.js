import { WDialog } from "../leafletClasses";
import { postToFirebase } from "../firebaseSupport";
import { getSelectedOperation } from "../selectedOp";
import { addToColorList } from "./skin";

const ZoneSetColorDialog = WDialog.extend({
  statics: {
    TYPE: "zoneSetColorDialog",
  },

  initialize: function (map = window.map, options) {
    this.type = ZoneSetColorDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
    postToFirebase({ id: "analytics", action: ZoneSetColorDialog.TYPE });
  },

  addHooks: function () {
    if (!this._map) return;
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.runHooks("wasabeeUIUpdate");
  },

  _displayDialog: function () {
    this._dialog = window.dialog({
      title: "Zone color",
      html: this._buildContent(),
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-zone-color",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
    });
  },

  setup: function (zone) {
    this._zone = zone;
  },

  _buildContent: function () {
    const container = L.DomUtil.create("div", "container");
    const desc = L.DomUtil.create("div", "desc", container);
    desc.textContent = "Set the color of all links in zone " + this._zone.name;

    const picker = L.DomUtil.create("input", "picker", container);
    picker.type = "color";
    picker.setAttribute("list", "wasabee-colors-datalist");

    L.DomEvent.on(picker, "change", (ev) => {
      L.DomEvent.stop(ev);
      const so = getSelectedOperation();
      for (const l of so.links) {
        if (l.zone == this._zone.id) l.color = picker.value;
      }
      so.store();
      addToColorList(picker.value);
      window.runHooks("wasabeeUIUpdate");
    });

    return container;
  },
});

export default ZoneSetColorDialog;
