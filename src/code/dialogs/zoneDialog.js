import { WDialog, WTooltip } from "../leafletClasses";
import wX from "../wX";
import { getSelectedOperation } from "../selectedOp";
import { addToColorList } from "../skin";
import ZoneSetColorDialog from "./zoneSetColor";
import { convertColorToHex } from "../auxiliar";

const ZoneDialog = WDialog.extend({
  statics: {
    TYPE: "zone",
  },

  addHooks: function () {
    this.ZonedrawHandler = new ZonedrawHandler(window.map, {});
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
    this.ZonedrawHandler.disable();
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
    L.DomUtil.create("th", null, hr).textContent = "Color";
    L.DomUtil.create("th", null, hr).textContent = "Commands";

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
      if (this.ZonedrawHandler && this.ZonedrawHandler._enabled) {
        const stopDrawing = L.DomUtil.create("a", null, commandcell);
        stopDrawing.href = "#";
        stopDrawing.textcontent = " 🛑";
        L.DomEvent.on(stopDrawing, "click", (ev) => {
          L.DomEvent.stop(ev);
          this.ZonedrawHandler.disable();
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

    const assign = L.DomUtil.create("a", null, container);
    assign.href = "#";
    assign.textContent = "set markers to zones";
    L.DomEvent.on(assign, "click", (ev) => {
      L.DomEvent.stop(ev);
      this.setMarkersToZones();
    });

    return container;
  },

  setMarkersToZones: function () {
    const op = getSelectedOperation();

    op.startBatchMode();
    for (const m of op.markers) {
      const ll = op.getPortal(m.portalId).latLng;

      const zone = this.determineZone(ll, op);
      op.setZone(m, zone);
    }
    op.endBatchMode();
  },

  determineZone: function (latlng, op) {
    // sort first, lowest ID wins if a marker is in 2 overlapping zones
    op.zones.sort((a, b) => {
      return a.id - b.id;
    });
    for (const z of op.zones) {
      z.points.sort((a, b) => {
        return a.position - b.position;
      });
      console.log(z.points);
      if (this.inZone(latlng, z.points)) return z.id;
    }
    // default to primary zone
    return 1;
  },

  //ray casting algo
  inZone: function (latlng, points) {
    let inside = false;

    console.log(latlng);

    const x = latlng.lat,
      y = latlng.lng;

    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi = points[i].lat,
        yi = points[i].lng;
      const xj = points[j].lat,
        yj = points[j].lng;

      const intersect =
        yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    return inside;
  },
});

export default ZoneDialog;

const ZonedrawHandler = L.Handler.extend({
  initialize: function (map = window.map, options) {
    this.zoneID = 0;
    this._enabled = false;

    L.Handler.prototype.initialize.call(this, map, options);
    this.options = options;

    this.type = "ZonedrawHandler";
  },

  enable: function () {
    if (this._enabled || this.zoneID == 0) {
      this.disable();
      return;
    }
    L.Handler.prototype.enable.call(this);
    // postToFirebase({ id: "analytics", action: "zonedrawStart" });
  },

  disable: function () {
    if (!this._enabled) return;
    L.Handler.prototype.disable.call(this);
    // postToFirebase({ id: "analytics", action: "zonedrawEnd" });
  },

  addHooks: function () {
    L.DomUtil.disableTextSelection();

    this._tooltip = new WTooltip(window.map);

    this._opID = getSelectedOperation().ID;
    this._tooltip.updateContent(this._getTooltipText());

    window.map.on("click", this._click, this);
    window.map.on("wasabee:op:select", this._opchange, this);
    window.map.on("keyup", this._keyUpListener, this);
    window.map.on("mousemove", this._onMouseMove, this);
  },

  removeHooks: function () {
    L.DomUtil.enableTextSelection();
    this._tooltip.dispose();
    this._tooltip = null;

    window.map.off("click", this._click, this);
    window.map.off("wasabee:op:select", this._opchange, this);
    window.map.off("keyup", this._keyUpListener, this);
    window.map.off("mousemove", this._onMouseMove, this);
  },

  _opchange: function () {
    // postToFirebase({ id: "analytics", action: "zonedrawOpchange" });
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
    }
  },

  _click: function (e) {
    getSelectedOperation().addZonePoint(this.zoneID, e.latlng);
  },

  _onMouseMove: function (e) {
    if (e.latlng) {
      this._tooltip.updatePosition(e.latlng);
    }
    L.DomEvent.preventDefault(e.originalEvent);
  },

  _getTooltipText: function () {
    return { text: "Click to set the zone boundaries" };
  },
});
