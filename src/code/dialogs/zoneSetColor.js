import { WDialog } from "../leafletClasses";
import { getSelectedOperation } from "../selectedOp";
import { addToColorList } from "../skin";
import wX from "../wX";

const ZoneSetColorDialog = WDialog.extend({
  statics: {
    TYPE: "zoneSetColorDialog",
  },

  needWritePermission: true,

  options: {
    // zone
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  _displayDialog: function () {
    this.createDialog({
      title: wX("dialog.zone_color.title"),
      html: this._buildContent(),
      width: "auto",
      dialogClass: "zone-color",
    });
  },

  _buildContent: function () {
    const container = L.DomUtil.create("div", "container");
    const desc = L.DomUtil.create("div", "desc", container);
    desc.textContent = wX("dialog.zone_color.text", {
      zoneName: this.options.zone.name,
    });

    const picker = L.DomUtil.create("input", "picker", container);
    picker.type = "color";
    picker.setAttribute("list", "wasabee-colors-datalist");

    L.DomEvent.on(picker, "change", async (ev) => {
      L.DomEvent.stop(ev);
      const so = getSelectedOperation();
      for (const l of so.links) {
        if (l.zone == this.options.zone.id) l.color = picker.value;
      }
      await so.store();
      addToColorList(picker.value);
      window.map.fire("wasabee:op:change");
    });

    return container;
  },
});

export default ZoneSetColorDialog;
