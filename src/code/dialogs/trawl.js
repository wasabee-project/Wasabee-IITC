import { WDialog } from "../leafletClasses";
import wX from "../wX";
import { getSelectedOperation } from "../selectedOp";
import { pointTileDataRequest } from "../uiCommands";
// why trust my own math when someone else has done the work?
import VLatLon from "../../lib/geodesy-2.2.1/latlon-ellipsoidal-vincenty";
// import { datums } from "../../lib/geodesy-2.2.1/latlon-ellipsoidal-datum";

const TrawlDialog = WDialog.extend({
  statics: {
    TYPE: "trawl"
  },

  initialize: function(map = window.map, options) {
    this.type = TrawlDialog.TYPE;
    WDialog.prototype.initialize.call(this, map, options);
    this._tiles = new Array();
  },

  // WDialog is a leaflet L.Handler, which takes add/removeHooks
  addHooks: function() {
    WDialog.prototype.addHooks.call(this);
    this._displayDialog();
  },

  removeHooks: function() {
    WDialog.prototype.removeHooks.call(this);
  },

  // define our work in _displayDialog
  _displayDialog: function() {
    const html = L.DomUtil.create("html");
    const container = L.DomUtil.create("div", "container", html);
    const notice = L.DomUtil.create("label", null, container);
    notice.innerHTML = "<h1>THIS DOES NOT WORK YET</h1>";
    const warning = L.DomUtil.create("label", null, container);
    warning.textContent = wX("TRAWL WARNING");
    const button = L.DomUtil.create("button", null, container);
    button.textContent = wX("TRAWL");
    L.DomEvent.on(button, "click", () => {
      this._doTrawl();
    });

    const buttons = {};
    buttons[wX("OK")] = () => {
      this._dialog.dialog("close");
    };

    this._dialog = window.dialog({
      title: wX("TRAWL TITLE"),
      html: html,
      dialogClass: "wasabee-dialog wasabee-dialog-trawl",
      closeCallback: () => {
        this.disable();
        delete this._dialog;
      },
      id: window.plugin.wasabee.static.dialogNames.trawl
    });
    this._dialog.dialog("option", "buttons", buttons);
  },

  _doTrawl: function() {
    const trawlPrecision = 250;
    const operation = getSelectedOperation();

    // precision can be dynamic based on bearing, closer to 0 or 90 can be larger
    // closer to 45 must be smaller

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
        let tmp = p.destinationPoint(trawlPrecision, bearing);
        // recalc bearing every X -- good enough, save some CPU
        if (bearingTick % 10 == 0) {
          bearing = p.initialBearingTo(end);
        }
        points.push(
          new L.LatLng(Number(tmp.lat.toFixed(6)), Number(tmp.lon.toFixed(6)))
        );
        p = tmp;
      }
    }

    // this gets the tiles from the latlngs, reduces to uniques, puts them in IITCs queue and starts the queue runner
    console.log("total points", points.length);
    pointTileDataRequest(points, 12);
  }
});

export default TrawlDialog;
