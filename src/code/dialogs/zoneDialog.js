import { WDialog, WTooltip } from "../leafletClasses";
import wX from "../wX";
import { getSelectedOperation } from "../selectedOp";
import { addToColorList } from "../skin";
import ZoneSetColorDialog from "./zoneSetColor";
import { convertColorToHex } from "../auxiliar";
import { setMarkersToZones, setLinksToZones } from "../uiCommands";

const ZoneDialog = WDialog.extend({
  statics: {
    TYPE: "zone",
  },

  addHooks: function () {
    this.ZonedrawHandler = new ZonedrawHandler(window.map, { parent: this });
    WDialog.prototype.addHooks.call(this);
    window.map.on("wasabee:op:change wasabee:op:select", this.update, this);

    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);
    window.map.off("wasabee:op:change wasabee:op:select", this.update, this);
    this.ZonedrawHandler.disable();
  },

  update: function () {
    const h = this.buildList();
    this.setContent(h);
  },

  _displayDialog: function () {
    const html = this.buildList();

    const buttons = {};
    buttons[wX("CLOSE")] = () => {
      this.closeDialog();
    };

    buttons[wX("ADD_ZONE")] = () => {
      if (getSelectedOperation().canWrite()) getSelectedOperation().addZone();
    };

    buttons[wX("SET_MARKERS_ZONES")] = () => {
      if (getSelectedOperation().canWrite()) setMarkersToZones();
    };

    buttons[wX("SET_LINKS_ZONES")] = () => {
      if (getSelectedOperation().canWrite()) setLinksToZones();
    };

    this.createDialog({
      title: wX("dialog.zones.title"),
      html: html,
      width: "auto",
      dialogClass: "zone",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.zone,
    });
  },

  buildList: function () {
    const op = getSelectedOperation();
    const canWrite = op.getPermission() === "write";
    const container = L.DomUtil.create("div", null, null);
    const tbody = L.DomUtil.create(
      "tbody",
      "",
      L.DomUtil.create("table", "wasabee-table", container)
    );
    const hr = L.DomUtil.create("tr", null, tbody);
    L.DomUtil.create("th", null, hr).textContent = wX("dialog.zones.id");
    L.DomUtil.create("th", null, hr).textContent = wX("dialog.common.name");
    L.DomUtil.create("th", null, hr).textContent = wX("dialog.zones.color");
    if (canWrite)
      L.DomUtil.create("th", null, hr).textContent = wX(
        "dialog.common.commands"
      );

    for (const z of op.zones) {
      const tr = L.DomUtil.create("tr", null, tbody);
      const idcell = L.DomUtil.create("td", null, tr);
      idcell.textContent = z.id;
      const namecell = L.DomUtil.create("td", null, tr);
      const nameinput = L.DomUtil.create("input", null, namecell);
      nameinput.type = "text";
      nameinput.value = z.name;

      const colorcell = L.DomUtil.create("td", null, tr);
      const picker = L.DomUtil.create("input", "picker", colorcell);
      picker.type = "color";
      picker.value = convertColorToHex(z.color);
      picker.setAttribute("list", "wasabee-colors-datalist");
      picker.disabled = !canWrite;

      L.DomEvent.on(picker, "change", (ev) => {
        L.DomEvent.stop(ev);
        z.color = picker.value;
        op.update();
        addToColorList(picker.value);
      });

      L.DomEvent.on(nameinput, "change", (ev) => {
        L.DomEvent.stop(ev);
        getSelectedOperation().renameZone(z.id, nameinput.value);
      });

      if (canWrite) {
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
        if (z.points.length == 0) {
          const addPoints = L.DomUtil.create("a", null, commandcell);
          addPoints.textContent = " 🖍";
          addPoints.href = "#";
          L.DomEvent.on(addPoints, "click", (ev) => {
            L.DomEvent.stop(ev);
            this.ZonedrawHandler.zoneID = z.id;
            this.ZonedrawHandler.enable();
          });
        } else {
          const delPoints = L.DomUtil.create("a", null, commandcell);
          delPoints.textContent = " 🧽";
          delPoints.href = "#";
          L.DomEvent.on(delPoints, "click", (ev) => {
            L.DomEvent.stop(ev);
            getSelectedOperation().removeZonePoints(z.id);
          });
        }
        if (this.ZonedrawHandler && this.ZonedrawHandler.enabled()) {
          const stopDrawing = L.DomUtil.create("a", null, commandcell);
          stopDrawing.href = "#";
          stopDrawing.textContent = " 🛑";
          L.DomEvent.on(stopDrawing, "click", (ev) => {
            L.DomEvent.stop(ev);
            this.ZonedrawHandler.disable();
            this.update();
          });
        }
      }
    }

    return container;
  },
});

export default ZoneDialog;

const ZonedrawHandler = L.Handler.extend({
  initialize: function (map = window.map, options) {
    this.zoneID = 0;
    // this._enabled = false;

    L.Handler.prototype.initialize.call(this, map);
    this._parent = options.parent;
    this.type = "ZonedrawHandler";
  },

  enable: function () {
    if (this._enabled || this.zoneID == 0) {
      this.disable();
      return;
    }
    L.Handler.prototype.enable.call(this);
  },

  addHooks: function () {
    L.DomUtil.disableTextSelection();

    this._tooltip = new WTooltip(window.map);

    this._opID = getSelectedOperation().ID;
    this._tooltip.updateContent(this._getTooltipText());

    window.map.on("click", this._click, this);
    window.map.on("wasabee:op:select", this._opchange, this);
    window.map.on("keyup", this._keyUpListener, this);
  },

  removeHooks: function () {
    L.DomUtil.enableTextSelection();
    this._tooltip.dispose();
    this._tooltip = null;

    window.map.off("click", this._click, this);
    window.map.off("wasabee:op:select", this._opchange, this);
    window.map.off("keyup", this._keyUpListener, this);
  },

  _opchange: function () {
    if (!this._enabled) return;

    if (getSelectedOperation().ID != this._opID) {
      console.log("operation changed mid-zonedraw - disabling");
      this.disable();
    }
  },

  _keyUpListener: function (e) {
    if (!this._enabled) return;

    // [esc]
    if (e.originalEvent.keyCode === 27) {
      this.disable();
      this._parent.update();
    }
  },

  _click: function (e) {
    getSelectedOperation().addZonePoint(this.zoneID, e.latlng);
  },

  _getTooltipText: function () {
    return wX("ZONE_DRAW");
  },
});
