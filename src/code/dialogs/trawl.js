import { WDialog } from "../leafletClasses";
import wX from "../wX";
import { getSelectedOperation } from "../selectedOp";
import { blockerAutomark } from "../uiCommands";
import VLatLon from "geodesy/latlon-ellipsoidal-vincenty";

const TrawlerDialog = WDialog.extend({
  statics: {
    TYPE: "trawler",
  },

  options: {
    points: [],
    zoom: 13,
    automark: false,
  },

  addHooks: function () {
    WDialog.prototype.addHooks.call(this);

    this._mapRefreshHook = this.tileRequestNext.bind(this);

    this._pointTileDataRequest(this.options.points, this.options.zoom);
    this._displayDialog();
  },

  removeHooks: function () {
    WDialog.prototype.removeHooks.call(this);

    if (window.plugin.wasabee.tileTrawlQueue)
      delete window.plugin.wasabee.tileTrawlQueue;

    window.removeHook("mapDataRefreshEnd", this._mapRefreshHook);
  },

  _update: function (tiles) {
    if (this && this.remaining)
      this.remaining.textContent = wX("TRAWL_REMAINING", { count: tiles });
  },

  _buildContent: function () {
    const tiles = window.plugin.wasabee.tileTrawlQueue.size;

    const container = L.DomUtil.create("div", "container");
    const warning = L.DomUtil.create("label", null, container);
    warning.textContent = wX("TRAWLING", tiles);
    const stat = L.DomUtil.create("div", null, container);
    this.remaining = L.DomUtil.create("span", null, stat);
    this.remaining.textContent = wX("TRAWL_REMAINING", { count: tiles });

    // same as dialogs/settings.js
    const trawlTitle = L.DomUtil.create("label", null, container);
    trawlTitle.textContent = "Trawl Skip Tiles";
    const trawlSelect = L.DomUtil.create("select", null, container);
    const tss = Number(
      localStorage[window.plugin.wasabee.static.constants.TRAWL_SKIP_STEPS]
    );
    let trawlCount = 0;
    while (trawlCount < 15) {
      const option = L.DomUtil.create("option", null, trawlSelect);
      option.textContent = trawlCount;
      option.value = trawlCount;
      if (tss == trawlCount) option.selected = true;
      trawlCount++;
    }
    L.DomEvent.on(trawlSelect, "change", (ev) => {
      L.DomEvent.stop(ev);
      localStorage[window.plugin.wasabee.static.constants.TRAWL_SKIP_STEPS] =
        trawlSelect.value;
    });

    return container;
  },

  _displayDialog: function () {
    const content = this._buildContent();

    const buttons = {};
    buttons[wX("OK")] = () => {
      this.closeDialog("close");
    };

    this.createDialog({
      title: wX("TRAWL TITLE"),
      html: content,
      width: "auto",
      dialogClass: "trawl",
      buttons: buttons,
      // id: window.plugin.wasabee.static.dialogNames.trawl
    });
  },

  // converts lat/lon points to tile names, gets center points of each tile, starts the map moves
  _pointTileDataRequest: function (latlngs, mapZoom = 13) {
    if (!localStorage[window.plugin.wasabee.static.constants.TRAWL_SKIP_STEPS])
      localStorage[window.plugin.wasabee.static.constants.TRAWL_SKIP_STEPS] = 0;

    if (window.plugin.wasabee.tileTrawlQueue) {
      console.log("pointTileDataRequest already running");
      return;
    }

    if (latlngs.length == 0) return;
    const dataZoom = window.getDataZoomForMapZoom(mapZoom);
    const tileParams = window.getMapZoomTileParameters(dataZoom);

    window.mapDataRequest.setStatus("trawling", undefined, -1);

    window.plugin.wasabee.tileTrawlQueue = new Map();
    for (const ll of latlngs) {
      // figure out which thile this point is in
      const x = window.latToTile(ll.lat, tileParams);
      const y = window.lngToTile(ll.lng, tileParams);
      // why the hell is this swapped?
      const tileID = window.pointToTileId(tileParams, y, x);
      // center point of the tile
      const tilePoint = L.latLng([
        Number(window.tileToLat(x, tileParams).toFixed(6)),
        Number(window.tileToLng(y, tileParams).toFixed(6)),
      ]);
      // map so no duplicate tiles are requested
      window.plugin.wasabee.tileTrawlQueue.set(
        tileID,
        JSON.stringify(tilePoint)
      );
    }

    // setup listener
    window.addHook("mapDataRefreshEnd", this._mapRefreshHook);
    // dive in
    window.map.setZoom(mapZoom);
    // this is async
    this.tileRequestNext();
  },

  tileRequestNext: function () {
    if (!window.plugin.wasabee.tileTrawlQueue) {
      window.removeHook("mapDataRefreshEnd", this._mapRefreshHook);
      return;
    }

    // first things, remove any from the list we already know about
    for (const cached of Object.keys(window.mapDataRequest.cache._cache)) {
      if (window.plugin.wasabee.tileTrawlQueue.has(cached)) {
        window.plugin.wasabee.tileTrawlQueue.delete(cached);
      }
    }

    // look at the remaining
    const tiles = window.plugin.wasabee.tileTrawlQueue.keys();

    let toSkip = Number(
      localStorage[window.plugin.wasabee.static.constants.TRAWL_SKIP_STEPS]
    );

    let current = tiles.next().value;

    // probably not needed now
    while (current && window.mapDataRequest.cache.get(current)) {
      console.log("removing in cache check 2", current);
      window.plugin.wasabee.tileTrawlQueue.delete(current);
      current = tiles.next().value;
      if (toSkip > 0) toSkip--;
    }

    // skip the number requested by the user, helpful for large screens
    while (current && toSkip > 0) {
      window.plugin.wasabee.tileTrawlQueue.delete(current);
      current = tiles.next().value;
      toSkip--;
    }

    if (current) {
      const point = JSON.parse(
        window.plugin.wasabee.tileTrawlQueue.get(current)
      );
      window.plugin.wasabee.tileTrawlQueue.delete(current);
      window.map.panTo(point, { duration: 0.25, animate: true });
      this._update(window.plugin.wasabee.tileTrawlQueue.size);
      return;
    }

    // fell off the end without moving the map, must be done
    delete window.plugin.wasabee.tileTrawlQueue;
    window.removeHook("mapDataRefreshEnd", this._mapRefreshHook);
    if (this.options.automark) blockerAutomark(getSelectedOperation());
    this.closeDialog();
    alert("trawl done");
  },
});

const TrawlDialog = WDialog.extend({
  statics: {
    TYPE: "trawl",
  },

  // WDialog is a leaflet L.Handler, which takes add/removeHooks
  addHooks: function () {
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  // define our work in _displayDialog
  _displayDialog: function () {
    const container = L.DomUtil.create("div", "container");

    const options = L.DomUtil.create("div", null, container);
    const clearLabel = L.DomUtil.create("label", null, options);
    clearLabel.textContent = wX("TRAWL_CLEAR_MARKERS");
    clearLabel.htmlFor = "wasabee-trawl-clear";
    const clearMarkers = L.DomUtil.create("input", null, options);
    clearMarkers.type = "checkbox";
    clearMarkers.checked = false;
    clearMarkers.id = "wasabee-trawl-clear";

    const amLabel = L.DomUtil.create("label", null, options);
    amLabel.textContent = wX("TRAWL_AUTOMARK");
    amLabel.htmlFor = "wasabee-trawl-automark";
    this.automark = L.DomUtil.create("input", null, options);
    this.automark.type = "checkbox";
    this.automark.checked = false;
    this.automark.id = "wasabee-trawl-automark";

    const warning = L.DomUtil.create("h4", null, container);
    warning.textContent = wX("TRAWL WARNING");

    const button = L.DomUtil.create("button", null, container);
    button.textContent = wX("TRAWL");
    L.DomEvent.on(button, "click", () => {
      const op = getSelectedOperation();
      if (clearMarkers.checked == true) this._clearMarkers();
      op.blockers = Array();
      const points = this._getTrawlPoints();
      const td = new TrawlerDialog({
        points: points,
        zoom: 13,
        automark: this.automark.checked,
      });
      td.enable();
      this.closeDialog();
    });

    const crazyWarning = L.DomUtil.create("h4", null, container);
    crazyWarning.textContent = wX("TRAWL_BULK_LOAD_WARNING");
    const crazyButton = L.DomUtil.create("button", null, container);
    crazyButton.textContent = wX("TRAWL_BULK_LOAD");
    L.DomEvent.on(crazyButton, "click", () => {
      const op = getSelectedOperation();
      op.blockers = Array();
      if (clearMarkers.checked == true) this._clearMarkers();
      const points = this._getTrawlPoints();
      this._bulkLoad(points, 14);
      this.closeDialog();
    });

    const buttons = {};
    buttons[wX("OK")] = () => {
      this.closeDialog();
    };

    this.createDialog({
      title: wX("TRAWL TITLE"),
      html: container,
      width: "auto",
      dialogClass: "trawl",
      buttons: buttons,
      id: window.plugin.wasabee.static.dialogNames.trawl,
    });
  },

  _getTrawlPoints: function () {
    const operation = getSelectedOperation();

    const trawlPrecision = 250;
    // XXX precision can be dynamic based on bearing, closer to 0 or 90 can be larger
    // closer to 45 must be smaller
    const bearingRecalc = 10;
    // XXX bearingRecalc can be dynamic too

    window.mapDataRequest.setStatus("calculating", undefined, -1);

    const points = new Array();
    for (const l of operation.links) {
      const lls = l.getLatLngs();
      const start = new VLatLon(lls[0].lat, lls[0].lng);
      const end = new VLatLon(lls[1].lat, lls[1].lng);
      const distance = start.distanceTo(end);
      let bearing = start.initialBearingTo(end);

      let traveled = 0;
      points.push(lls[0]);
      let p = start;
      let bearingTick = 0;
      // from start, get bearing, get new tile name, move (n)m along bearing, get new bearing, record point, repeat
      while (traveled < distance) {
        traveled += trawlPrecision;
        bearingTick++;
        const tmp = p.destinationPoint(trawlPrecision, bearing);
        // recalc bearing every X -- good enough, save some CPU
        if (bearingTick % bearingRecalc == 0) {
          bearing = p.initialBearingTo(end);
        }
        points.push(
          new L.LatLng(Number(tmp.lat.toFixed(6)), Number(tmp.lon.toFixed(6)))
        );
        p = tmp;
      }
    }
    return points;
  },

  _clearMarkers: function () {
    const operation = getSelectedOperation();

    operation.startBatchMode();
    for (const m of operation.markers) {
      if (
        m.type == window.plugin.wasabee.static.constants.MARKER_TYPE_DESTROY ||
        m.type == window.plugin.wasabee.static.constants.MARKER_TYPE_VIRUS
      )
        operation.removeMarker(m);
    }
    operation.endBatchMode();
  },

  _bulkLoad: function (latlngs, mapZoom) {
    this._mapRefreshHook = this.bulkLoadDone.bind(this);
    window.addHook("mapDataRefreshEnd", this._mapRefreshHook);

    if (latlngs.length == 0) return;
    const mdr = window.mapDataRequest;
    mdr.debugTiles.reset();
    this.oldDebugTiles = window.mapDataRequest.debugTiles;
    window.mapDataRequest.debugTiles = new FakeDebugTiles();

    const dataZoom = window.getDataZoomForMapZoom(mapZoom);
    const tileParams = window.getMapZoomTileParameters(dataZoom);

    const bounds = new L.latLngBounds(latlngs);
    window.map.fitBounds(bounds);

    const tiles = new Map();
    for (const ll of latlngs) {
      const x = window.latToTile(ll.lat, tileParams);
      const y = window.lngToTile(ll.lng, tileParams);
      const tileID = window.pointToTileId(tileParams, y, x);
      tiles.set(tileID, tileID);
    }
    const q = {};
    for (const t of tiles.keys()) {
      q[t] = t;
    }

    // stop the render queue to not trigger crosslinks etc
    mdr.resetRenderQueue();
    mdr.pauseRenderQueue(true);
    mdr.clearTimeout();
    // put our requests in the queue
    mdr.queuedTiles = q;
    // run the queue
    mdr.processRequestQueue(true);
    // render the results
    mdr.pauseRenderQueue(false);

    this.bulkAlert = alert(
      "please wait until status says 'done'; If the first didn't trigger a load, close this dialog and try again"
    );
  },

  bulkLoadDone: function () {
    if (this.automark.checked == true) blockerAutomark(getSelectedOperation());
    window.mapDataRequest.debugTiles = this.oldDebugTiles;
    this.bulkAlert.dialog("close");
    alert("bulk data load done");
    window.removeHook("mapDataRefreshEnd", this._mapRefreshHook);
  },
});

class FakeDebugTiles {
  reset() {
    console.log("fdt reset");
  }

  create() {
    console.log("fdt create");
  }

  setState() {
    // console.log("fdt setState");
  }

  runClearPass() {
    console.log("fdt runClearPass");
  }
}

export default TrawlDialog;
