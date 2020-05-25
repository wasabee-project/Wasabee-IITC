import { WDialog } from "../leafletClasses";
import wX from "../wX";
import { getSelectedOperation } from "../selectedOp";
// why trust my own math when someone else has done the work?
import VLatLon from "../../lib/geodesy-2.2.1/latlon-ellipsoidal-vincenty";
// import { datums } from "../../lib/geodesy-2.2.1/latlon-ellipsoidal-datum";

const TrawlDialog = WDialog.extend({
  statics: {
    TYPE: "trawl"
  },

  initialize: function(map = window.map, options) {
    WDialog.prototype.initialize.call(this, map, options);
    this.type = TrawlDialog.TYPE;
  },

  // WDialog is a leaflet L.Handler, which takes add/removeHooks
  addHooks: function() {
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function() {
    WDialog.prototype.removeHooks.call(this);
  },

  _displayTrawlerDialog: function(tiles) {
    const html = L.DomUtil.create("html");
    const container = L.DomUtil.create("div", "container", html);
    const warning = L.DomUtil.create("label", null, container);
    warning.textContent = wX("TRAWLING", tiles);
    const stat = L.DomUtil.create("div", null, container);
    this.remaining = L.DomUtil.create("span", null, stat);
    this.remaining.textContent = wX("TRAWL_REMAINING", tiles);

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
    L.DomEvent.on(trawlSelect, "change", ev => {
      L.DomEvent.stop(ev);
      localStorage[window.plugin.wasabee.static.constants.TRAWL_SKIP_STEPS] =
        trawlSelect.value;
    });

    const buttons = {};
    buttons[wX("OK")] = () => {
      this._trawlerDialog.dialog("close");
    };

    this._trawlerDialog = window.dialog({
      title: wX("TRAWL TITLE"),
      html: html,
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-trawl",
      closeCallback: () => {
        if (window.plugin.wasabee.tileTrawlQueue)
          delete window.plugin.wasabee.tileTrawlQueue;
        this.disable();
        delete this._trawlerDialog;
      }
      // id: window.plugin.wasabee.static.dialogNames.trawl
    });
    this._trawlerDialog.dialog("option", "buttons", buttons);
  },

  _updateTrawlerDialog: function(tiles) {
    if (this && this.remaining)
      this.remaining.textContent = wX("TRAWL_REMAINING", tiles);
  },

  // define our work in _displayDialog
  _displayDialog: function() {
    const html = L.DomUtil.create("html");
    const container = L.DomUtil.create("div", "container", html);
    const warning = L.DomUtil.create("label", null, container);
    warning.textContent = wX("TRAWL WARNING");
    const button = L.DomUtil.create("button", null, container);
    button.textContent = wX("TRAWL");
    L.DomEvent.on(button, "click", () => {
      const tiles = this._doTrawl();
      this._displayTrawlerDialog(tiles);
      this._dialog.dialog("close");
    });

    const buttons = {};
    buttons[wX("OK")] = () => {
      this._dialog.dialog("close");
    };

    this._dialog = window.dialog({
      title: wX("TRAWL TITLE"),
      html: html,
      width: "auto",
      dialogClass: "wasabee-dialog wasabee-dialog-trawl",
      closeCallback: () => {
        // this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.trawl
    });
    this._dialog.dialog("option", "buttons", buttons);
  },

  _doTrawl: function() {
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

    // this gets the tiles from the latlngs, reduces to uniques, puts them in IITCs queue and starts the queue runner
    // console.log("total points", points.length);
    return this.pointTileDataRequest(points, 13);
  },

  // converts lat/lon points to tile names, gets center points of each tile, starts the map moves
  pointTileDataRequest: function(latlngs, mapZoom = 13) {
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
        Number(window.tileToLng(y, tileParams).toFixed(6))
      ]);
      // map so no duplicate tiles are requested
      window.plugin.wasabee.tileTrawlQueue.set(
        tileID,
        JSON.stringify(tilePoint)
      );
    }

    // setup listener
    window.addHook("mapDataRefreshEnd", () => this.tileRequestNext.call(this));
    // dive in
    window.map.setZoom(mapZoom);
    // this is async
    this.tileRequestNext();
    // returns before the first request starts
    return window.plugin.wasabee.tileTrawlQueue.size;
  },

  tileRequestNext: function() {
    if (!window.plugin.wasabee.tileTrawlQueue) {
      window.removeHook("mapDataRefreshEnd", () =>
        this.tileRequestNext.call(this)
      );
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
      this._updateTrawlerDialog(window.plugin.wasabee.tileTrawlQueue.size);
      return;
    }

    // fell off the end without moving the map, must be done
    delete window.plugin.wasabee.tileTrawlQueue;
    window.removeHook("mapDataRefreshEnd", () =>
      this.tileRequestNext.call(this)
    );
    alert("trawl done");
  }
});

export default TrawlDialog;
