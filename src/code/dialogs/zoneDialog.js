import { WDialog } from "../leafletClasses";
import wX from "../wX";
import { getSelectedOperation } from "../selectedOp";
import ZoneSetColorDialog from "./zoneSetColor";

const ZoneDialog = WDialog.extend({
  statics: {
    TYPE: "zone",
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    window.map.on("wasabee:op:change wasabee:op:select", this.update, this);

    if (this._smallScreen) {
      this._displaySmallDialog();
    } else {
      this._displayDialog();
    }
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.map.off("wasabee:op:change wasabee:op:select", this.update, this);
  },

  update: function () {
    const h = this.buildList();
    this.setContent(h);
  },

  _displayDialog: function () {
    const html = this.buildList();

    const buttons = {};
    buttons[wX("OK")] = () => {
      this.closeDialog();
    };

    this.createDialog({
      title: "Zones",
      html: html,
      width: "auto",
      dialogClass: "zone",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.zone,
    });
  },

  _displaySmallDialog: function () {
    this._displayDialog();
  },

  buildList: function () {
    const op = getSelectedOperation();
    const container = L.DomUtil.create("div", null, null);
    const tbody = L.DomUtil.create(
      "tbody",
      "",
      L.DomUtil.create("table", "wasabee-table", container)
    );
    const hr = L.DomUtil.create("tr", null, tbody);
    L.DomUtil.create("th", null, hr).textContent = "ID";
    L.DomUtil.create("th", null, hr).textContent = "Name";
    L.DomUtil.create("th", null, hr).textContent = "Commands";

    for (const z of op.zones) {
      const tr = L.DomUtil.create("tr", null, tbody);
      const idcell = L.DomUtil.create("td", null, tr);
      idcell.textContent = z.id;
      const namecell = L.DomUtil.create("td", null, tr);
      const nameinput = L.DomUtil.create("input", null, namecell);
      nameinput.type = "text";
      nameinput.value = z.name;
      L.DomEvent.on(nameinput, "change", (ev) => {
        L.DomEvent.stop(ev);
        getSelectedOperation().renameZone(z.id, nameinput.value);
      });
      const commandcell = L.DomUtil.create("td", null, tr);

      const color = L.DomUtil.create("a", null, commandcell);
      color.textContent = "🖌";
      color.href = "#";
      L.DomEvent.on(color, "click", (ev) => {
        L.DomEvent.stop(ev);
        const zoneSetColorDialog = new ZoneSetColorDialog({
          zone: z,
        });
        zoneSetColorDialog.enable();
      });
      if (z.id != 1) {
        const del = L.DomUtil.create("a", null, commandcell);
        del.textContent = "🗑";
        del.href = "#";
        L.DomEvent.on(del, "click", (ev) => {
          L.DomEvent.stop(ev);
          getSelectedOperation().removeZone(z.id);
        });
      }
    }

    const add = L.DomUtil.create("a", null, container);
    add.href = "#";
    add.textContent = "add zone";
    L.DomEvent.on(add, "click", (ev) => {
      L.DomEvent.stop(ev);
      getSelectedOperation().addZone();
    });

    return container;
  },
});

export default ZoneDialog;
