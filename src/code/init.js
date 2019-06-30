//PLUGIN START
window.plugin.wasabee = function () { };

//** LAYER DEFINITIONS */
window.plugin.wasabee.portalLayers = {};
window.plugin.wasabee.portalLayerGroup = null;
window.plugin.wasabee.linkLayers = {};
window.plugin.wasabee.linkLayerGroup = null;
window.plugin.wasabee.targetLayers = {};
window.plugin.wasabee.targetLayerGroup = null;

window.plugin.wasabee.loadExternals = function () {
    try {

    } catch (e) {
        alert(JSON.stringify(e));
    }

    /* jshint ignore:start */
    /* arc.js by Dane Springmeyer, https://github.com/springmeyer/arc.js */
    var D2R = Math.PI / 180, R2D = 180 / Math.PI, Coord = function (c, e) { this.lon = c; this.lat = e; this.x = D2R * c; this.y = D2R * e; }; Coord.prototype.view = function () { return String(this.lon).slice(0, 4) + "," + String(this.lat).slice(0, 4); }; Coord.prototype.antipode = function () { return new Coord(0 > this.lon ? 180 + this.lon : -1 * (180 - this.lon), -1 * this.lat); }; var LineString = function () { this.coords = []; this.length = 0; }; LineString.prototype.move_to = function (c) { this.length++; this.coords.push(c); };
    var Arc = function (c) { this.properties = c || {}; this.geometries = []; };
    Arc.prototype.json = function () { if (0 >= this.geometries.length) {return { geometry: { type: "LineString", coordinates: null }, type: "Feature", properties: this.properties };} if (1 == this.geometries.length) {return { geometry: { type: "LineString", coordinates: this.geometries[0].coords }, type: "Feature", properties: this.properties };} var c = []; for (i = 0; i < this.geometries.length; i++){c.push(this.geometries[i].coords);} return { geometry: { type: "MultiLineString", coordinates: c }, type: "Feature", properties: this.properties }; };
    Arc.prototype.wkt = function () { var c = ""; for (i = 0; i < this.geometries.length; i++) { if (0 === this.geometries[i].coords.length) {return "LINESTRING(empty)";} var e = "LINESTRING("; this.geometries[i].coords.forEach(function (a, c) { e += a[0] + " " + a[1] + ","; }); c += e.substring(0, e.length - 1) + ")"; } return c; };
    var GreatCircle = function (c, e, a) {
        this.start = c; this.end = e; this.properties = a || {}; a = this.start.x - this.end.x; a = Math.pow(Math.sin((this.start.y - this.end.y) / 2), 2) + Math.cos(this.start.y) * Math.cos(this.end.y) * Math.pow(Math.sin(a / 2), 2); this.g = 2 * Math.asin(Math.sqrt(a)); if (this.g == Math.PI) {throw Error("it appears " + c.view() + " and " + e.view() + " are 'antipodal', e.g diametrically opposite, thus there is no single route but rather infinite");} if (isNaN(this.g)) {throw Error("could not calculate great circle between " +
            c + " and " + e);}
    };
    GreatCircle.prototype.interpolate = function (c) { var e = Math.sin((1 - c) * this.g) / Math.sin(this.g), a = Math.sin(c * this.g) / Math.sin(this.g); c = e * Math.cos(this.start.y) * Math.cos(this.start.x) + a * Math.cos(this.end.y) * Math.cos(this.end.x); var g = e * Math.cos(this.start.y) * Math.sin(this.start.x) + a * Math.cos(this.end.y) * Math.sin(this.end.x), e = e * Math.sin(this.start.y) + a * Math.sin(this.end.y), e = R2D * Math.atan2(e, Math.sqrt(Math.pow(c, 2) + Math.pow(g, 2))); return [R2D * Math.atan2(g, c), e]; };
    GreatCircle.prototype.Arc = function (c, e) {
        var a = []; if (2 >= c) {a.push([this.start.lon, this.start.lat]), a.push([this.end.lon, this.end.lat]);} else {for (var g = 1 / (c - 1), b = 0; b < c; b++) { var k = this.interpolate(g * b); a.push(k) }} for (var d = !1, h = 0, b = 1; b < a.length; b++) { var g = a[b - 1][0], k = a[b][0], m = Math.abs(k - g); 350 < m && (170 < k && -170 > g || 170 < g && -170 > k) ? d = !0 : m > h && (h = m) } g = []; if (d && 10 > h) {for (d = [], g.push(d), b = 0; b < a.length; b++){if (k = parseFloat(a[b][0]), 0 < b && 350 < Math.abs(k - a[b - 1][0])) {
            var f = parseFloat(a[b - 1][0]), h = parseFloat(a[b - 1][1]),
                l = parseFloat(a[b][0]), m = parseFloat(a[b][1]); if (-180 < f && -170 > f && 180 == l && b + 1 < a.length && -180 < a[b - 1][0] && -170 > a[b - 1][0]) {d.push([-180, a[b][1]]), b++ , d.push([a[b][0], a[b][1]]);} else if (170 < f && 180 > f && -180 == l && b + 1 < a.length && 170 < a[b - 1][0] && 180 > a[b - 1][0]) {d.push([180, a[b][1]]), b++ , d.push([a[b][0], a[b][1]]);} else {
                    if (-170 > f && 170 < l) {var n = f, f = l, l = n, n = h, h = m, m = n;} 170 < f && -170 > l && (l += 360); 180 >= f && 180 <= l && f < l ? (f = (180 - f) / (l - f), h = f * m + (1 - f) * h, d.push([170 < a[b - 1][0] ? 180 : -180, h]), d = [], d.push([170 < a[b - 1][0] ? -180 : 180, h])) : d = [];
                    g.push(d); d.push([k, a[b][1]])
                }
        } else {d.push([a[b][0], a[b][1]]);}}} else {for (d = [], g.push(d), b = 0; b < a.length; b++){d.push([a[b][0], a[b][1]]);}} a = new Arc(this.properties); for (b = 0; b < g.length; b++){for (k = new LineString, a.geometries.push(k), d = g[b], h = 0; h < d.length; h++){k.move_to(d[h]);}} return a
    }; if ("undefined" === typeof window) {module.exports.Coord = Coord, module.exports.Arc = Arc, module.exports.GreatCircle = GreatCircle;} else { var arc = {}; arc.Coord = Coord; arc.Arc = Arc; arc.GreatCircle = GreatCircle };
    /* jshint ignore:end */

    window.plugin.wasabee.arc = arc;
    Wasabee.opList = Array();
    Wasabee.pasteList = Array();

    window.plugin.wasabee.addCSS(Wasabee.CSS.ui);
    window.plugin.wasabee.addCSS(Wasabee.CSS.main);
    window.plugin.wasabee.addCSS(Wasabee.CSS.toastr);

    window.plugin.wasabee.setupLocalStorage();
    window.plugin.wasabee.addButtons();

    window.plugin.wasabee.portalLayerGroup = new L.LayerGroup();
    window.plugin.wasabee.linkLayerGroup = new L.LayerGroup();
    window.plugin.wasabee.targetLayerGroup = new L.LayerGroup();
    window.addLayerGroup("Wasabee Draw Portals", window.plugin.wasabee.portalLayerGroup, true);
    window.addLayerGroup("Wasabee Draw Links", window.plugin.wasabee.linkLayerGroup, true);
    window.addLayerGroup("Wasabee Draw Targets", window.plugin.wasabee.targetLayerGroup, true);
    window.plugin.wasabee.initCrossLinks();
    window.plugin.wasabee.drawThings();
    //window.plugin.wasabee.addScriptToBase(Wasabee.Constants.SCRIPT_URL_NOTY)

    var shareKey = window.plugin.wasabee.getUrlParams("wasabeeShareKey", null);
    if (shareKey != null) {
        window.plugin.wasabee.qbin_get(shareKey);
    }
};