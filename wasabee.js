// ==UserScript==
// @id           wasabee
// @name         IITC Plugin: Wasabee Draw Tools
// @namespace    http://tampermonkey.net/
// @version      0.11.2
// @updateURL    http://wasabee.rocks/wasabee.meta.js
// @downloadURL  http:/wasabee.rocks/wasabee.user.js
// @description  Less terrible draw tools, hopefully.
// @author       Wasabee
// @include      https://*.ingress.com/*
// @include      http://*.ingress.com/*
// @match        https://*.ingress.com/*
// @match        http://*.ingress.com/*
// @include      https://*.ingress.com/mission/*
// @include      http://*.ingress.com/mission/*
// @match        https://*.ingress.com/mission/*
// @match        http://*.ingress.com/mission/*
// @grant        none
// ==/UserScript==

// Wrapper function that will be stringified and injected
// into the document. Because of this, normal closure rules
// do not apply here.
function wrapper(plugin_info) {
    if (typeof window.plugin !== 'function')
        window.plugin = function () { };

    /* store.js - Copyright (c) 2010-2017 Marcus Westin */
    !function (t) { if ("object" == typeof exports && "undefined" != typeof module) module.exports = t(); else if ("function" == typeof define && define.amd) define([], t); else { var e; e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this, e.store = t() } }(function () { var define, module, exports; return function t(e, n, r) { function o(u, s) { if (!n[u]) { if (!e[u]) { var a = "function" == typeof require && require; if (!s && a) return a(u, !0); if (i) return i(u, !0); var c = new Error("Cannot find module '" + u + "'"); throw c.code = "MODULE_NOT_FOUND", c } var f = n[u] = { exports: {} }; e[u][0].call(f.exports, function (t) { var n = e[u][1][t]; return o(n ? n : t) }, f, f.exports, t, e, n, r) } return n[u].exports } for (var i = "function" == typeof require && require, u = 0; u < r.length; u++)o(r[u]); return o }({ 1: [function (t, e, n) { "use strict"; var r = t("../src/store-engine"), o = t("../storages/all"), i = t("../plugins/all"); e.exports = r.createStore(o, i) }, { "../plugins/all": 2, "../src/store-engine": 15, "../storages/all": 17 }], 2: [function (t, e, n) { "use strict"; e.exports = [t("./compression"), t("./defaults"), t("./dump"), t("./events"), t("./observe"), t("./expire"), t("./json2"), t("./operations"), t("./update"), t("./v1-backcompat")] }, { "./compression": 3, "./defaults": 4, "./dump": 5, "./events": 6, "./expire": 7, "./json2": 8, "./observe": 11, "./operations": 12, "./update": 13, "./v1-backcompat": 14 }], 3: [function (t, e, n) { "use strict"; function r() { function t(t, e) { var n = t(e); if (!n) return n; var r = o.decompress(n); return null == r ? n : this._deserialize(r) } function e(t, e, n) { var r = o.compress(this._serialize(n)); t(e, r) } return { get: t, set: e } } var o = t("./lib/lz-string"); e.exports = r }, { "./lib/lz-string": 10 }], 4: [function (t, e, n) { "use strict"; function r() { function t(t, e) { n = e } function e(t, e) { var r = t(); return void 0 !== r ? r : n[e] } var n = {}; return { defaults: t, get: e } } e.exports = r }, {}], 5: [function (t, e, n) { "use strict"; function r() { function t(t) { var e = {}; return this.each(function (t, n) { e[n] = t }), e } return { dump: t } } e.exports = r }, {}], 6: [function (t, e, n) { "use strict"; function r() { function t(t, e, n) { return c.on(e, u(this, n)) } function e(t, e) { c.off(e) } function n(t, e, n) { c.once(e, u(this, n)) } function r(t, e, n) { var r = this.get(e); t(), c.fire(e, n, r) } function i(t, e) { var n = this.get(e); t(), c.fire(e, void 0, n) } function a(t) { var e = {}; this.each(function (t, n) { e[n] = t }), t(), s(e, function (t, e) { c.fire(e, void 0, t) }) } var c = o(); return { watch: t, unwatch: e, once: n, set: r, remove: i, clearAll: a } } function o() { return a(f, { _id: 0, _subSignals: {}, _subCallbacks: {} }) } var i = t("../src/util"), u = i.bind, s = i.each, a = i.create, c = i.slice; e.exports = r; var f = { _id: null, _subCallbacks: null, _subSignals: null, on: function (t, e) { return this._subCallbacks[t] || (this._subCallbacks[t] = {}), this._id += 1, this._subCallbacks[t][this._id] = e, this._subSignals[this._id] = t, this._id }, off: function (t) { var e = this._subSignals[t]; delete this._subCallbacks[e][t], delete this._subSignals[t] }, once: function (t, e) { var n = this.on(t, u(this, function () { e.apply(this, arguments), this.off(n) })) }, fire: function (t) { var e = c(arguments, 1); s(this._subCallbacks[t], function (t) { t.apply(this, e) }) } } }, { "../src/util": 16 }], 7: [function (t, e, n) { "use strict"; function r() { function t(t, e, n, r) { return this.hasNamespace(o) || s.set(e, r), t() } function e(t, e) { return this.hasNamespace(o) || u.call(this, e), t() } function n(t, e) { return this.hasNamespace(o) || s.remove(e), t() } function r(t, e) { return s.get(e) } function i(t) { var e = []; this.each(function (t, n) { e.push(n) }); for (var n = 0; n < e.length; n++)u.call(this, e[n]) } function u(t) { var e = s.get(t, Number.MAX_VALUE); e <= (new Date).getTime() && (this.raw.remove(t), s.remove(t)) } var s = this.createStore(this.storage, null, this._namespacePrefix + o); return { set: t, get: e, remove: n, getExpiration: r, removeExpiredKeys: i } } var o = "expire_mixin"; e.exports = r }, {}], 8: [function (t, e, n) { "use strict"; function r() { return t("./lib/json2"), {} } e.exports = r }, { "./lib/json2": 9 }], 9: [function (require, module, exports) { "use strict"; var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (t) { return typeof t } : function (t) { return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t }; "object" !== ("undefined" == typeof JSON ? "undefined" : _typeof(JSON)) && (JSON = {}), function () { function f(t) { return t < 10 ? "0" + t : t } function this_value() { return this.valueOf() } function quote(t) { return rx_escapable.lastIndex = 0, rx_escapable.test(t) ? '"' + t.replace(rx_escapable, function (t) { var e = meta[t]; return "string" == typeof e ? e : "\\u" + ("0000" + t.charCodeAt(0).toString(16)).slice(-4) }) + '"' : '"' + t + '"' } function str(t, e) { var n, r, o, i, u, s = gap, a = e[t]; switch (a && "object" === ("undefined" == typeof a ? "undefined" : _typeof(a)) && "function" == typeof a.toJSON && (a = a.toJSON(t)), "function" == typeof rep && (a = rep.call(e, t, a)), "undefined" == typeof a ? "undefined" : _typeof(a)) { case "string": return quote(a); case "number": return isFinite(a) ? String(a) : "null"; case "boolean": case "null": return String(a); case "object": if (!a) return "null"; if (gap += indent, u = [], "[object Array]" === Object.prototype.toString.apply(a)) { for (i = a.length, n = 0; n < i; n += 1)u[n] = str(n, a) || "null"; return o = 0 === u.length ? "[]" : gap ? "[\n" + gap + u.join(",\n" + gap) + "\n" + s + "]" : "[" + u.join(",") + "]", gap = s, o } if (rep && "object" === ("undefined" == typeof rep ? "undefined" : _typeof(rep))) for (i = rep.length, n = 0; n < i; n += 1)"string" == typeof rep[n] && (r = rep[n], o = str(r, a), o && u.push(quote(r) + (gap ? ": " : ":") + o)); else for (r in a) Object.prototype.hasOwnProperty.call(a, r) && (o = str(r, a), o && u.push(quote(r) + (gap ? ": " : ":") + o)); return o = 0 === u.length ? "{}" : gap ? "{\n" + gap + u.join(",\n" + gap) + "\n" + s + "}" : "{" + u.join(",") + "}", gap = s, o } } var rx_one = /^[\],:{}\s]*$/, rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, rx_four = /(?:^|:|,)(?:\s*\[)+/g, rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g; "function" != typeof Date.prototype.toJSON && (Date.prototype.toJSON = function () { return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null }, Boolean.prototype.toJSON = this_value, Number.prototype.toJSON = this_value, String.prototype.toJSON = this_value); var gap, indent, meta, rep; "function" != typeof JSON.stringify && (meta = { "\b": "\\b", "\t": "\\t", "\n": "\\n", "\f": "\\f", "\r": "\\r", '"': '\\"', "\\": "\\\\" }, JSON.stringify = function (t, e, n) { var r; if (gap = "", indent = "", "number" == typeof n) for (r = 0; r < n; r += 1)indent += " "; else "string" == typeof n && (indent = n); if (rep = e, e && "function" != typeof e && ("object" !== ("undefined" == typeof e ? "undefined" : _typeof(e)) || "number" != typeof e.length)) throw new Error("JSON.stringify"); return str("", { "": t }) }), "function" != typeof JSON.parse && (JSON.parse = function (text, reviver) { function walk(t, e) { var n, r, o = t[e]; if (o && "object" === ("undefined" == typeof o ? "undefined" : _typeof(o))) for (n in o) Object.prototype.hasOwnProperty.call(o, n) && (r = walk(o, n), void 0 !== r ? o[n] = r : delete o[n]); return reviver.call(t, e, o) } var j; if (text = String(text), rx_dangerous.lastIndex = 0, rx_dangerous.test(text) && (text = text.replace(rx_dangerous, function (t) { return "\\u" + ("0000" + t.charCodeAt(0).toString(16)).slice(-4) })), rx_one.test(text.replace(rx_two, "@").replace(rx_three, "]").replace(rx_four, ""))) return j = eval("(" + text + ")"), "function" == typeof reviver ? walk({ "": j }, "") : j; throw new SyntaxError("JSON.parse") }) }() }, {}], 10: [function (t, e, n) { "use strict"; var r = function () { function t(t, e) { if (!o[t]) { o[t] = {}; for (var n = 0; n < t.length; n++)o[t][t.charAt(n)] = n } return o[t][e] } var e = String.fromCharCode, n = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", r = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$", o = {}, i = { compressToBase64: function (t) { if (null == t) return ""; var e = i._compress(t, 6, function (t) { return n.charAt(t) }); switch (e.length % 4) { default: case 0: return e; case 1: return e + "==="; case 2: return e + "=="; case 3: return e + "=" } }, decompressFromBase64: function (e) { return null == e ? "" : "" == e ? null : i._decompress(e.length, 32, function (r) { return t(n, e.charAt(r)) }) }, compressToUTF16: function (t) { return null == t ? "" : i._compress(t, 15, function (t) { return e(t + 32) }) + " " }, decompressFromUTF16: function (t) { return null == t ? "" : "" == t ? null : i._decompress(t.length, 16384, function (e) { return t.charCodeAt(e) - 32 }) }, compressToUint8Array: function (t) { for (var e = i.compress(t), n = new Uint8Array(2 * e.length), r = 0, o = e.length; r < o; r++) { var u = e.charCodeAt(r); n[2 * r] = u >>> 8, n[2 * r + 1] = u % 256 } return n }, decompressFromUint8Array: function (t) { if (null === t || void 0 === t) return i.decompress(t); for (var n = new Array(t.length / 2), r = 0, o = n.length; r < o; r++)n[r] = 256 * t[2 * r] + t[2 * r + 1]; var u = []; return n.forEach(function (t) { u.push(e(t)) }), i.decompress(u.join("")) }, compressToEncodedURIComponent: function (t) { return null == t ? "" : i._compress(t, 6, function (t) { return r.charAt(t) }) }, decompressFromEncodedURIComponent: function (e) { return null == e ? "" : "" == e ? null : (e = e.replace(/ /g, "+"), i._decompress(e.length, 32, function (n) { return t(r, e.charAt(n)) })) }, compress: function (t) { return i._compress(t, 16, function (t) { return e(t) }) }, _compress: function (t, e, n) { if (null == t) return ""; var r, o, i, u = {}, s = {}, a = "", c = "", f = "", l = 2, p = 3, h = 2, d = [], g = 0, v = 0; for (i = 0; i < t.length; i += 1)if (a = t.charAt(i), Object.prototype.hasOwnProperty.call(u, a) || (u[a] = p++ , s[a] = !0), c = f + a, Object.prototype.hasOwnProperty.call(u, c)) f = c; else { if (Object.prototype.hasOwnProperty.call(s, f)) { if (f.charCodeAt(0) < 256) { for (r = 0; r < h; r++)g <<= 1, v == e - 1 ? (v = 0, d.push(n(g)), g = 0) : v++; for (o = f.charCodeAt(0), r = 0; r < 8; r++)g = g << 1 | 1 & o, v == e - 1 ? (v = 0, d.push(n(g)), g = 0) : v++ , o >>= 1 } else { for (o = 1, r = 0; r < h; r++)g = g << 1 | o, v == e - 1 ? (v = 0, d.push(n(g)), g = 0) : v++ , o = 0; for (o = f.charCodeAt(0), r = 0; r < 16; r++)g = g << 1 | 1 & o, v == e - 1 ? (v = 0, d.push(n(g)), g = 0) : v++ , o >>= 1 } l-- , 0 == l && (l = Math.pow(2, h), h++), delete s[f] } else for (o = u[f], r = 0; r < h; r++)g = g << 1 | 1 & o, v == e - 1 ? (v = 0, d.push(n(g)), g = 0) : v++ , o >>= 1; l-- , 0 == l && (l = Math.pow(2, h), h++), u[c] = p++ , f = String(a) } if ("" !== f) { if (Object.prototype.hasOwnProperty.call(s, f)) { if (f.charCodeAt(0) < 256) { for (r = 0; r < h; r++)g <<= 1, v == e - 1 ? (v = 0, d.push(n(g)), g = 0) : v++; for (o = f.charCodeAt(0), r = 0; r < 8; r++)g = g << 1 | 1 & o, v == e - 1 ? (v = 0, d.push(n(g)), g = 0) : v++ , o >>= 1 } else { for (o = 1, r = 0; r < h; r++)g = g << 1 | o, v == e - 1 ? (v = 0, d.push(n(g)), g = 0) : v++ , o = 0; for (o = f.charCodeAt(0), r = 0; r < 16; r++)g = g << 1 | 1 & o, v == e - 1 ? (v = 0, d.push(n(g)), g = 0) : v++ , o >>= 1 } l-- , 0 == l && (l = Math.pow(2, h), h++), delete s[f] } else for (o = u[f], r = 0; r < h; r++)g = g << 1 | 1 & o, v == e - 1 ? (v = 0, d.push(n(g)), g = 0) : v++ , o >>= 1; l-- , 0 == l && (l = Math.pow(2, h), h++) } for (o = 2, r = 0; r < h; r++)g = g << 1 | 1 & o, v == e - 1 ? (v = 0, d.push(n(g)), g = 0) : v++ , o >>= 1; for (; ;) { if (g <<= 1, v == e - 1) { d.push(n(g)); break } v++ } return d.join("") }, decompress: function (t) { return null == t ? "" : "" == t ? null : i._decompress(t.length, 32768, function (e) { return t.charCodeAt(e) }) }, _decompress: function (t, n, r) { var o, i, u, s, a, c, f, l, p = [], h = 4, d = 4, g = 3, v = "", m = [], y = { val: r(0), position: n, index: 1 }; for (i = 0; i < 3; i += 1)p[i] = i; for (s = 0, c = Math.pow(2, 2), f = 1; f != c;)a = y.val & y.position, y.position >>= 1, 0 == y.position && (y.position = n, y.val = r(y.index++)), s |= (a > 0 ? 1 : 0) * f, f <<= 1; switch (o = s) { case 0: for (s = 0, c = Math.pow(2, 8), f = 1; f != c;)a = y.val & y.position, y.position >>= 1, 0 == y.position && (y.position = n, y.val = r(y.index++)), s |= (a > 0 ? 1 : 0) * f, f <<= 1; l = e(s); break; case 1: for (s = 0, c = Math.pow(2, 16), f = 1; f != c;)a = y.val & y.position, y.position >>= 1, 0 == y.position && (y.position = n, y.val = r(y.index++)), s |= (a > 0 ? 1 : 0) * f, f <<= 1; l = e(s); break; case 2: return "" }for (p[3] = l, u = l, m.push(l); ;) { if (y.index > t) return ""; for (s = 0, c = Math.pow(2, g), f = 1; f != c;)a = y.val & y.position, y.position >>= 1, 0 == y.position && (y.position = n, y.val = r(y.index++)), s |= (a > 0 ? 1 : 0) * f, f <<= 1; switch (l = s) { case 0: for (s = 0, c = Math.pow(2, 8), f = 1; f != c;)a = y.val & y.position, y.position >>= 1, 0 == y.position && (y.position = n, y.val = r(y.index++)), s |= (a > 0 ? 1 : 0) * f, f <<= 1; p[d++] = e(s), l = d - 1, h--; break; case 1: for (s = 0, c = Math.pow(2, 16), f = 1; f != c;)a = y.val & y.position, y.position >>= 1, 0 == y.position && (y.position = n, y.val = r(y.index++)), s |= (a > 0 ? 1 : 0) * f, f <<= 1; p[d++] = e(s), l = d - 1, h--; break; case 2: return m.join("") }if (0 == h && (h = Math.pow(2, g), g++), p[l]) v = p[l]; else { if (l !== d) return null; v = u + u.charAt(0) } m.push(v), p[d++] = u + v.charAt(0), h-- , u = v, 0 == h && (h = Math.pow(2, g), g++) } } }; return i }(); "function" == typeof define && define.amd ? define(function () { return r }) : "undefined" != typeof e && null != e && (e.exports = r) }, {}], 11: [function (t, e, n) { "use strict"; function r() { function t(t, e, n) { var r = this.watch(e, n); return n(this.get(e)), r } function e(t, e) { this.unwatch(e) } return { observe: t, unobserve: e } } var o = t("./events"); e.exports = [o, r] }, { "./events": 6 }], 12: [function (t, e, n) { "use strict"; function r() { function t(t, e, n, r, o, i) { return a.call(this, "push", arguments) } function e(t, e) { return a.call(this, "pop", arguments) } function n(t, e) { return a.call(this, "shift", arguments) } function r(t, e, n, r, o, i) { return a.call(this, "unshift", arguments) } function i(t, e, n, r, i, a) { var c = u(arguments, 2); return this.update(e, {}, function (t) { if ("object" != ("undefined" == typeof t ? "undefined" : o(t))) throw new Error('store.assign called for non-object value with key "' + e + '"'); return c.unshift(t), s.apply(Object, c) }) } function a(t, e) { var n, r = e[1], o = u(e, 2); return this.update(r, [], function (e) { n = Array.prototype[t].apply(e, o) }), n } return { push: t, pop: e, shift: n, unshift: r, assign: i } } var o = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (t) { return typeof t } : function (t) { return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t }, i = t("../src/util"), u = i.slice, s = i.assign, a = t("./update"); e.exports = [a, r] }, { "../src/util": 16, "./update": 13 }], 13: [function (t, e, n) { "use strict"; function r() { function t(t, e, n, r) { 3 == arguments.length && (r = n, n = void 0); var o = this.get(e, n), i = r(o); this.set(e, void 0 != i ? i : o) } return { update: t } } e.exports = r }, {}], 14: [function (t, e, n) { "use strict"; function r() { return this.disabled = !this.enabled, { has: o, transact: i, clear: u, forEach: s, getAll: a, serialize: c, deserialize: f } } function o(t, e) { return void 0 !== this.get(e) } function i(t, e, n, r) { null == r && (r = n, n = null), null == n && (n = {}); var o = this.get(e, n), i = r(o); this.set(e, void 0 === i ? o : i) } function u(t) { return this.clearAll.call(this) } function s(t, e) { return this.each.call(this, function (t, n) { e(n, t) }) } function a(t) { return this.dump.call(this) } function c(t, e) { return JSON.stringify(e) } function f(t, e) { if ("string" == typeof e) try { return JSON.parse(e) } catch (n) { return e || void 0 } } var l = t("./dump"), p = t("./json2"); e.exports = [l, p, r] }, { "./dump": 5, "./json2": 8 }], 15: [function (t, e, n) { "use strict"; function r() { var t = "undefined" == typeof console ? null : console; if (t) { var e = t.warn ? t.warn : t.log; e.apply(t, arguments) } } function o(t, e, n) { n || (n = ""), t && !l(t) && (t = [t]), e && !l(e) && (e = [e]); var o = n ? "__storejs_" + n + "_" : "", i = n ? new RegExp("^" + o) : null, g = /^[a-zA-Z0-9_\-]*$/; if (!g.test(n)) throw new Error("store.js namespaces can only have alphanumerics + underscores and dashes"); var v = { _namespacePrefix: o, _namespaceRegexp: i, _testStorage: function (t) { try { var e = "__storejs__test__"; t.write(e, e); var n = t.read(e) === e; return t.remove(e), n } catch (r) { return !1 } }, _assignPluginFnProp: function (t, e) { var n = this[e]; this[e] = function () { function e() { if (n) return a(arguments, function (t, e) { r[e] = t }), n.apply(o, r) } var r = u(arguments, 0), o = this, i = [e].concat(r); return t.apply(o, i) } }, _serialize: function (t) { return JSON.stringify(t) }, _deserialize: function (t, e) { if (!t) return e; var n = ""; try { n = JSON.parse(t) } catch (r) { n = t } return void 0 !== n ? n : e }, _addStorage: function (t) { this.enabled || this._testStorage(t) && (this.storage = t, this.enabled = !0) }, _addPlugin: function (t) { var e = this; if (l(t)) return void a(t, function (t) { e._addPlugin(t) }); var n = s(this.plugins, function (e) { return t === e }); if (!n) { if (this.plugins.push(t), !p(t)) throw new Error("Plugins must be function values that return objects"); var r = t.call(this); if (!h(r)) throw new Error("Plugins must return an object of function properties"); a(r, function (n, r) { if (!p(n)) throw new Error("Bad plugin property: " + r + " from plugin " + t.name + ". Plugins should only return functions."); e._assignPluginFnProp(n, r) }) } }, addStorage: function (t) { r("store.addStorage(storage) is deprecated. Use createStore([storages])"), this._addStorage(t) } }, m = f(v, d, { plugins: [] }); return m.raw = {}, a(m, function (t, e) { p(t) && (m.raw[e] = c(m, t)) }), a(t, function (t) { m._addStorage(t) }), a(e, function (t) { m._addPlugin(t) }), m } var i = t("./util"), u = i.slice, s = i.pluck, a = i.each, c = i.bind, f = i.create, l = i.isList, p = i.isFunction, h = i.isObject; e.exports = { createStore: o }; var d = { version: "2.0.12", enabled: !1, get: function (t, e) { var n = this.storage.read(this._namespacePrefix + t); return this._deserialize(n, e) }, set: function (t, e) { return void 0 === e ? this.remove(t) : (this.storage.write(this._namespacePrefix + t, this._serialize(e)), e) }, remove: function (t) { this.storage.remove(this._namespacePrefix + t) }, each: function (t) { var e = this; this.storage.each(function (n, r) { t.call(e, e._deserialize(n), (r || "").replace(e._namespaceRegexp, "")) }) }, clearAll: function () { this.storage.clearAll() }, hasNamespace: function (t) { return this._namespacePrefix == "__storejs_" + t + "_" }, createStore: function () { return o.apply(this, arguments) }, addPlugin: function (t) { this._addPlugin(t) }, namespace: function (t) { return o(this.storage, this.plugins, t) } } }, { "./util": 16 }], 16: [function (t, e, n) { (function (t) { "use strict"; function n() { return Object.assign ? Object.assign : function (t, e, n, r) { for (var o = 1; o < arguments.length; o++)s(Object(arguments[o]), function (e, n) { t[n] = e }); return t } } function r() { if (Object.create) return function (t, e, n, r) { var o = u(arguments, 1); return h.apply(this, [Object.create(t)].concat(o)) }; var t = function () { }; return function (e, n, r, o) { var i = u(arguments, 1); return t.prototype = e, h.apply(this, [new t].concat(i)) } } function o() { return String.prototype.trim ? function (t) { return String.prototype.trim.call(t) } : function (t) { return t.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "") } } function i(t, e) { return function () { return e.apply(t, Array.prototype.slice.call(arguments, 0)) } } function u(t, e) { return Array.prototype.slice.call(t, e || 0) } function s(t, e) { c(t, function (t, n) { return e(t, n), !1 }) } function a(t, e) { var n = f(t) ? [] : {}; return c(t, function (t, r) { return n[r] = e(t, r), !1 }), n } function c(t, e) { if (f(t)) { for (var n = 0; n < t.length; n++)if (e(t[n], n)) return t[n] } else for (var r in t) if (t.hasOwnProperty(r) && e(t[r], r)) return t[r] } function f(t) { return null != t && "function" != typeof t && "number" == typeof t.length } function l(t) { return t && "[object Function]" === {}.toString.call(t) } function p(t) { return t && "[object Object]" === {}.toString.call(t) } var h = n(), d = r(), g = o(), v = "undefined" != typeof window ? window : t; e.exports = { assign: h, create: d, trim: g, bind: i, slice: u, each: s, map: a, pluck: c, isList: f, isFunction: l, isObject: p, Global: v } }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {}) }, {}], 17: [function (t, e, n) { "use strict"; e.exports = [t("./localStorage"), t("./oldFF-globalStorage"), t("./oldIE-userDataStorage"), t("./cookieStorage"), t("./sessionStorage"), t("./memoryStorage")] }, { "./cookieStorage": 18, "./localStorage": 19, "./memoryStorage": 20, "./oldFF-globalStorage": 21, "./oldIE-userDataStorage": 22, "./sessionStorage": 23 }], 18: [function (t, e, n) { "use strict"; function r(t) { if (!t || !a(t)) return null; var e = "(?:^|.*;\\s*)" + escape(t).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"; return unescape(p.cookie.replace(new RegExp(e), "$1")) } function o(t) { for (var e = p.cookie.split(/; ?/g), n = e.length - 1; n >= 0; n--)if (l(e[n])) { var r = e[n].split("="), o = unescape(r[0]), i = unescape(r[1]); t(i, o) } } function i(t, e) { t && (p.cookie = escape(t) + "=" + escape(e) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/") } function u(t) { t && a(t) && (p.cookie = escape(t) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/") } function s() { o(function (t, e) { u(e) }) } function a(t) { return new RegExp("(?:^|;\\s*)" + escape(t).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=").test(p.cookie) } var c = t("../src/util"), f = c.Global, l = c.trim; e.exports = { name: "cookieStorage", read: r, write: i, each: o, remove: u, clearAll: s }; var p = f.document }, { "../src/util": 16 }], 19: [function (t, e, n) { "use strict"; function r() { return f.localStorage } function o(t) { return r().getItem(t) } function i(t, e) { return r().setItem(t, e) } function u(t) { for (var e = r().length - 1; e >= 0; e--) { var n = r().key(e); t(o(n), n) } } function s(t) { return r().removeItem(t) } function a() { return r().clear() } var c = t("../src/util"), f = c.Global; e.exports = { name: "localStorage", read: o, write: i, each: u, remove: s, clearAll: a } }, { "../src/util": 16 }], 20: [function (t, e, n) { "use strict"; function r(t) { return a[t] } function o(t, e) { a[t] = e } function i(t) { for (var e in a) a.hasOwnProperty(e) && t(a[e], e) } function u(t) { delete a[t] } function s(t) { a = {} } e.exports = { name: "memoryStorage", read: r, write: o, each: i, remove: u, clearAll: s }; var a = {} }, {}], 21: [function (t, e, n) { "use strict"; function r(t) { return f[t] } function o(t, e) { f[t] = e } function i(t) { for (var e = f.length - 1; e >= 0; e--) { var n = f.key(e); t(f[n], n) } } function u(t) { return f.removeItem(t) } function s() { i(function (t, e) { delete f[t] }) } var a = t("../src/util"), c = a.Global; e.exports = { name: "oldFF-globalStorage", read: r, write: o, each: i, remove: u, clearAll: s }; var f = c.globalStorage }, { "../src/util": 16 }], 22: [function (t, e, n) { "use strict"; function r(t, e) { if (!g) { var n = a(t); d(function (t) { t.setAttribute(n, e), t.save(p) }) } } function o(t) { if (!g) { var e = a(t), n = null; return d(function (t) { n = t.getAttribute(e) }), n } } function i(t) { d(function (e) { for (var n = e.XMLDocument.documentElement.attributes, r = n.length - 1; r >= 0; r--) { var o = n[r]; t(e.getAttribute(o.name), o.name) } }) } function u(t) { var e = a(t); d(function (t) { t.removeAttribute(e), t.save(p) }) } function s() { d(function (t) { var e = t.XMLDocument.documentElement.attributes; t.load(p); for (var n = e.length - 1; n >= 0; n--)t.removeAttribute(e[n].name); t.save(p) }) } function a(t) { return t.replace(/^\d/, "___$&").replace(v, "___") } function c() { if (!h || !h.documentElement || !h.documentElement.addBehavior) return null; var t, e, n, r = "script"; try { e = new ActiveXObject("htmlfile"), e.open(), e.write("<" + r + ">document.w=window</" + r + '><iframe src="/favicon.ico"></iframe>'), e.close(), t = e.w.frames[0].document, n = t.createElement("div") } catch (o) { n = h.createElement("div"), t = h.body } return function (e) { var r = [].slice.call(arguments, 0); r.unshift(n), t.appendChild(n), n.addBehavior("#default#userData"), n.load(p), e.apply(this, r), t.removeChild(n) } } var f = t("../src/util"), l = f.Global; e.exports = { name: "oldIE-userDataStorage", write: r, read: o, each: i, remove: u, clearAll: s }; var p = "storejs", h = l.document, d = c(), g = (l.navigator ? l.navigator.userAgent : "").match(/ (MSIE 8|MSIE 9|MSIE 10)\./), v = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g") }, { "../src/util": 16 }], 23: [function (t, e, n) { "use strict"; function r() { return f.sessionStorage } function o(t) { return r().getItem(t) } function i(t, e) { return r().setItem(t, e) } function u(t) { for (var e = r().length - 1; e >= 0; e--) { var n = r().key(e); t(o(n), n) } } function s(t) { return r().removeItem(t) } function a() { return r().clear() } var c = t("../src/util"), f = c.Global; e.exports = { name: "sessionStorage", read: o, write: i, each: u, remove: s, clearAll: a } }, { "../src/util": 16 }] }, {}, [1])(1) });

    /* Markdown Extension? */
    !function (b) { function c() { return "Markdown.mk_block( " + uneval(this.toString()) + ", " + uneval(this.trailing) + ", " + uneval(this.lineNumber) + " )" } function d() { var a = require("util"); return "Markdown.mk_block( " + a.inspect(this.toString()) + ", " + a.inspect(this.trailing) + ", " + a.inspect(this.lineNumber) + " )" } function e(a) { for (var b = 0, c = -1; -1 !== (c = a.indexOf("\n", c + 1));)b++; return b } function f(a, b) { function c(a) { this.len_after = a, this.name = "close_" + b } var d = a + "_state", e = "strong" == a ? "em_state" : "strong_state"; return function (f, g) { if (this[d][0] == b) return this[d].shift(), [f.length, new c(f.length - b.length)]; var h = this[e].slice(), i = this[d].slice(); this[d].unshift(b); { var j = this.processInline(f.substr(b.length)), k = j[j.length - 1]; this[d].shift() } if (k instanceof c) { j.pop(); var l = f.length - k.len_after; return [l, [a].concat(j)] } return this[e] = h, this[d] = i, [b.length, b] } } function g(a) { for (var b = a.split(""), c = [""], d = !1; b.length;) { var e = b.shift(); switch (e) { case " ": d ? c[c.length - 1] += e : c.push(""); break; case "'": case '"': d = !d; break; case "\\": e = b.shift(); default: c[c.length - 1] += e } } return c } function h(a) { return q(a) && a.length > 1 && "object" == typeof a[1] && !q(a[1]) ? a[1] : void 0 } function i(a) { return a.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;") } function j(a) { if ("string" == typeof a) return i(a); var b = a.shift(), c = {}, d = []; for (!a.length || "object" != typeof a[0] || a[0] instanceof Array || (c = a.shift()); a.length;)d.push(j(a.shift())); var e = ""; for (var f in c) e += " " + f + '="' + i(c[f]) + '"'; return "img" == b || "br" == b || "hr" == b ? "<" + b + e + "/>" : "<" + b + e + ">" + d.join("") + "</" + b + ">" } function k(a, b, c) { var d; c = c || {}; var e = a.slice(0); "function" == typeof c.preprocessTreeNode && (e = c.preprocessTreeNode(e, b)); var f = h(e); if (f) { e[1] = {}; for (d in f) e[1][d] = f[d]; f = e[1] } if ("string" == typeof e) return e; switch (e[0]) { case "header": e[0] = "h" + e[1].level, delete e[1].level; break; case "bulletlist": e[0] = "ul"; break; case "numberlist": e[0] = "ol"; break; case "listitem": e[0] = "li"; break; case "para": e[0] = "p"; break; case "markdown": e[0] = "html", f && delete f.references; break; case "code_block": e[0] = "pre", d = f ? 2 : 1; var g = ["code"]; g.push.apply(g, e.splice(d, e.length - d)), e[d] = g; break; case "inlinecode": e[0] = "code"; break; case "img": e[1].src = e[1].href, delete e[1].href; break; case "linebreak": e[0] = "br"; break; case "link": e[0] = "a"; break; case "link_ref": e[0] = "a"; var i = b[f.ref]; if (!i) return f.original; delete f.ref, f.href = i.href, i.title && (f.title = i.title), delete f.original; break; case "img_ref": e[0] = "img"; var i = b[f.ref]; if (!i) return f.original; delete f.ref, f.src = i.href, i.title && (f.title = i.title), delete f.original }if (d = 1, f) { for (var j in e[1]) { d = 2; break } 1 === d && e.splice(d, 1) } for (; d < e.length; ++d)e[d] = k(e[d], b, c); return e } function l(a) { for (var b = h(a) ? 2 : 1; b < a.length;)"string" == typeof a[b] ? b + 1 < a.length && "string" == typeof a[b + 1] ? a[b] += a.splice(b + 1, 1)[0] : ++b : (l(a[b]), ++b) } var m = b.Markdown = function (a) { switch (typeof a) { case "undefined": this.dialect = m.dialects.Gruber; break; case "object": this.dialect = a; break; default: if (!(a in m.dialects)) throw new Error("Unknown Markdown dialect '" + String(a) + "'"); this.dialect = m.dialects[a] }this.em_state = [], this.strong_state = [], this.debug_indent = "" }; b.parse = function (a, b) { var c = new m(b); return c.toTree(a) }, b.toHTML = function (a, c, d) { var e = b.toHTMLTree(a, c, d); return b.renderJsonML(e) }, b.toHTMLTree = function (a, b, c) { "string" == typeof a && (a = this.parse(a, b)); var d = h(a), e = {}; d && d.references && (e = d.references); var f = k(a, e, c); return l(f), f }; var n = m.mk_block = function (a, b, e) { 1 == arguments.length && (b = "\n\n"); var f = new String(a); return f.trailing = b, f.inspect = d, f.toSource = c, void 0 != e && (f.lineNumber = e), f }; m.prototype.split_blocks = function (a, b) { a = a.replace(/(\r\n|\n|\r)/g, "\n"); var c, d = /([\s\S]+?)($|\n#|\n(?:\s*\n|$)+)/g, f = [], g = 1; for (null != (c = /^(\s*\n)/.exec(a)) && (g += e(c[0]), d.lastIndex = c[0].length); null !== (c = d.exec(a));)"\n#" == c[2] && (c[2] = "\n", d.lastIndex--), f.push(n(c[1], c[2], g)), g += e(c[0]); return f }, m.prototype.processBlock = function (a, b) { var c = this.dialect.block, d = c.__order__; if ("__call__" in c) return c.__call__.call(this, a, b); for (var e = 0; e < d.length; e++) { var f = c[d[e]].call(this, a, b); if (f) return (!q(f) || f.length > 0 && !q(f[0])) && this.debug(d[e], "didn't return a proper array"), f } return [] }, m.prototype.processInline = function (a) { return this.dialect.inline.__call__.call(this, String(a)) }, m.prototype.toTree = function (a, b) { var c = a instanceof Array ? a : this.split_blocks(a), d = this.tree; try { for (this.tree = b || this.tree || ["markdown"]; c.length;) { var e = this.processBlock(c.shift(), c); e.length && this.tree.push.apply(this.tree, e) } return this.tree } finally { b && (this.tree = d) } }, m.prototype.debug = function () { var a = Array.prototype.slice.call(arguments); a.unshift(this.debug_indent), "undefined" != typeof print && print.apply(print, a), "undefined" != typeof console && "undefined" != typeof console.log && console.log.apply(null, a) }, m.prototype.loop_re_over_block = function (a, b, c) { for (var d, e = b.valueOf(); e.length && null != (d = a.exec(e));)e = e.substr(d[0].length), c.call(this, d); return e }, m.dialects = {}, m.dialects.Gruber = { block: { atxHeader: function (a, b) { var c = a.match(/^(#{1,6})\s*(.*?)\s*#*\s*(?:\n|$)/); if (!c) return void 0; var d = ["header", { level: c[1].length }]; return Array.prototype.push.apply(d, this.processInline(c[2])), c[0].length < a.length && b.unshift(n(a.substr(c[0].length), a.trailing, a.lineNumber + 2)), [d] }, setextHeader: function (a, b) { var c = a.match(/^(.*)\n([-=])\2\2+(?:\n|$)/); if (!c) return void 0; var d = "=" === c[2] ? 1 : 2, e = ["header", { level: d }, c[1]]; return c[0].length < a.length && b.unshift(n(a.substr(c[0].length), a.trailing, a.lineNumber + 2)), [e] }, code: function (a, b) { var c = [], d = /^(?: {0,3}\t| {4})(.*)\n?/; if (!a.match(d)) return void 0; a: for (; ;) { var e = this.loop_re_over_block(d, a.valueOf(), function (a) { c.push(a[1]) }); if (e.length) { b.unshift(n(e, a.trailing)); break a } if (!b.length) break a; if (!b[0].match(d)) break a; c.push(a.trailing.replace(/[^\n]/g, "").substring(2)), a = b.shift() } return [["code_block", c.join("\n")]] }, horizRule: function (a, b) { var c = a.match(/^(?:([\s\S]*?)\n)?[ \t]*([-_*])(?:[ \t]*\2){2,}[ \t]*(?:\n([\s\S]*))?$/); if (!c) return void 0; var d = [["hr"]]; return c[1] && d.unshift.apply(d, this.processBlock(c[1], [])), c[3] && b.unshift(n(c[3])), d }, lists: function () { function a(a) { return new RegExp("(?:^(" + i + "{0," + a + "} {0,3})(" + f + ")\\s+)|(^" + i + "{0," + (a - 1) + "}[ ]{0,4})") } function b(a) { return a.replace(/ {0,3}\t/g, "    ") } function c(a, b, c, d) { if (b) return void a.push(["para"].concat(c)); var e = a[a.length - 1] instanceof Array && "para" == a[a.length - 1][0] ? a[a.length - 1] : a; d && a.length > 1 && c.unshift(d); for (var f = 0; f < c.length; f++) { var g = c[f], h = "string" == typeof g; h && e.length > 1 && "string" == typeof e[e.length - 1] ? e[e.length - 1] += g : e.push(g) } } function d(a, b) { for (var c = new RegExp("^(" + i + "{" + a + "}.*?\\n?)*$"), d = new RegExp("^" + i + "{" + a + "}", "gm"), e = []; b.length > 0 && c.exec(b[0]);) { var f = b.shift(), g = f.replace(d, ""); e.push(n(g, f.trailing, f.lineNumber)) } return e } function e(a, b, c) { var d = a.list, e = d[d.length - 1]; if (!(e[1] instanceof Array && "para" == e[1][0])) if (b + 1 == c.length) e.push(["para"].concat(e.splice(1, e.length - 1))); else { var f = e.pop(); e.push(["para"].concat(e.splice(1, e.length - 1)), f) } } var f = "[*+-]|\\d+\\.", g = /[*+-]/, h = new RegExp("^( {0,3})(" + f + ")[ 	]+"), i = "(?: {0,3}\\t| {4})"; return function (f, i) { function j(a) { var b = g.exec(a[2]) ? ["bulletlist"] : ["numberlist"]; return n.push({ list: b, indent: a[1] }), b } var k = f.match(h); if (!k) return void 0; for (var l, m, n = [], p = j(k), q = !1, r = [n[0].list]; ;) { for (var s = f.split(/(?=\n)/), t = "", u = 0; u < s.length; u++) { var v = "", w = s[u].replace(/^\n/, function (a) { return v = a, "" }), x = a(n.length); if (k = w.match(x), void 0 !== k[1]) { t.length && (c(l, q, this.processInline(t), v), q = !1, t = ""), k[1] = b(k[1]); var y = Math.floor(k[1].length / 4) + 1; if (y > n.length) p = j(k), l.push(p), l = p[1] = ["listitem"]; else { var z = !1; for (m = 0; m < n.length; m++)if (n[m].indent == k[1]) { p = n[m].list, n.splice(m + 1, n.length - (m + 1)), z = !0; break } z || (y++ , y <= n.length ? (n.splice(y, n.length - y), p = n[y - 1].list) : (p = j(k), l.push(p))), l = ["listitem"], p.push(l) } v = "" } w.length > k[0].length && (t += v + w.substr(k[0].length)) } t.length && (c(l, q, this.processInline(t), v), q = !1, t = ""); var A = d(n.length, i); A.length > 0 && (o(n, e, this), l.push.apply(l, this.toTree(A, []))); var B = i[0] && i[0].valueOf() || ""; if (!B.match(h) && !B.match(/^ /)) break; f = i.shift(); var C = this.dialect.block.horizRule(f, i); if (C) { r.push.apply(r, C); break } o(n, e, this), q = !0 } return r } }(), blockquote: function (a, b) { if (!a.match(/^>/m)) return void 0; var c = []; if (">" != a[0]) { for (var d = a.split(/\n/), e = [], f = a.lineNumber; d.length && ">" != d[0][0];)e.push(d.shift()), f++; var g = n(e.join("\n"), "\n", a.lineNumber); c.push.apply(c, this.processBlock(g, [])), a = n(d.join("\n"), a.trailing, f) } for (; b.length && ">" == b[0][0];) { var i = b.shift(); a = n(a + a.trailing + i, i.trailing, a.lineNumber) } var j = a.replace(/^> ?/gm, ""), k = (this.tree, this.toTree(j, ["blockquote"])), l = h(k); return l && l.references && (delete l.references, r(l) && k.splice(1, 1)), c.push(k), c }, referenceDefn: function (a, b) { var c = /^\s*\[(.*?)\]:\s*(\S+)(?:\s+(?:(['"])(.*?)\3|\((.*?)\)))?\n?/; if (!a.match(c)) return void 0; h(this.tree) || this.tree.splice(1, 0, {}); var d = h(this.tree); void 0 === d.references && (d.references = {}); var e = this.loop_re_over_block(c, a, function (a) { a[2] && "<" == a[2][0] && ">" == a[2][a[2].length - 1] && (a[2] = a[2].substring(1, a[2].length - 1)); var b = d.references[a[1].toLowerCase()] = { href: a[2] }; void 0 !== a[4] ? b.title = a[4] : void 0 !== a[5] && (b.title = a[5]) }); return e.length && b.unshift(n(e, a.trailing)), [] }, para: function (a, b) { return [["para"].concat(this.processInline(a))] } } }, m.dialects.Gruber.inline = { __oneElement__: function (a, b, c) { var d, e; b = b || this.dialect.inline.__patterns__; var f = new RegExp("([\\s\\S]*?)(" + (b.source || b) + ")"); if (d = f.exec(a), !d) return [a.length, a]; if (d[1]) return [d[1].length, d[1]]; var e; return d[2] in this.dialect.inline && (e = this.dialect.inline[d[2]].call(this, a.substr(d.index), d, c || [])), e = e || [d[2].length, d[2]] }, __call__: function (a, b) { function c(a) { "string" == typeof a && "string" == typeof e[e.length - 1] ? e[e.length - 1] += a : e.push(a) } for (var d, e = []; a.length > 0;)d = this.dialect.inline.__oneElement__.call(this, a, b, e), a = a.substr(d.shift()), o(d, c); return e }, "]": function () { }, "}": function () { }, __escape__: /^\\[\\`\*_{}\[\]()#\+.!\-]/, "\\": function (a) { return this.dialect.inline.__escape__.exec(a) ? [2, a.charAt(1)] : [1, "\\"] }, "![": function (a) { var b = a.match(/^!\[(.*?)\][ \t]*\([ \t]*([^")]*?)(?:[ \t]+(["'])(.*?)\3)?[ \t]*\)/); if (b) { b[2] && "<" == b[2][0] && ">" == b[2][b[2].length - 1] && (b[2] = b[2].substring(1, b[2].length - 1)), b[2] = this.dialect.inline.__call__.call(this, b[2], /\\/)[0]; var c = { alt: b[1], href: b[2] || "" }; return void 0 !== b[4] && (c.title = b[4]), [b[0].length, ["img", c]] } return b = a.match(/^!\[(.*?)\][ \t]*\[(.*?)\]/), b ? [b[0].length, ["img_ref", { alt: b[1], ref: b[2].toLowerCase(), original: b[0] }]] : [2, "!["] }, "[": function s(a) { var b = String(a), c = m.DialectHelpers.inline_until_char.call(this, a.substr(1), "]"); if (!c) return [1, "["]; var s, d, e = 1 + c[0], f = c[1]; a = a.substr(e); var g = a.match(/^\s*\([ \t]*([^"']*)(?:[ \t]+(["'])(.*?)\2)?[ \t]*\)/); if (g) { var h = g[1]; if (e += g[0].length, h && "<" == h[0] && ">" == h[h.length - 1] && (h = h.substring(1, h.length - 1)), !g[3]) for (var i = 1, j = 0; j < h.length; j++)switch (h[j]) { case "(": i++; break; case ")": 0 == --i && (e -= h.length - j, h = h.substring(0, j)) }return h = this.dialect.inline.__call__.call(this, h, /\\/)[0], d = { href: h || "" }, void 0 !== g[3] && (d.title = g[3]), s = ["link", d].concat(f), [e, s] } return g = a.match(/^\s*\[(.*?)\]/), g ? (e += g[0].length, d = { ref: (g[1] || String(f)).toLowerCase(), original: b.substr(0, e) }, s = ["link_ref", d].concat(f), [e, s]) : 1 == f.length && "string" == typeof f[0] ? (d = { ref: f[0].toLowerCase(), original: b.substr(0, e) }, s = ["link_ref", d, f[0]], [e, s]) : [1, "["] }, "<": function (a) { var b; return null != (b = a.match(/^<(?:((https?|ftp|mailto):[^>]+)|(.*?@.*?\.[a-zA-Z]+))>/)) ? b[3] ? [b[0].length, ["link", { href: "mailto:" + b[3] }, b[3]]] : "mailto" == b[2] ? [b[0].length, ["link", { href: b[1] }, b[1].substr("mailto:".length)]] : [b[0].length, ["link", { href: b[1] }, b[1]]] : [1, "<"] }, "`": function (a) { var b = a.match(/(`+)(([\s\S]*?)\1)/); return b && b[2] ? [b[1].length + b[2].length, ["inlinecode", b[3]]] : [1, "`"] }, "  \n": function (a) { return [3, ["linebreak"]] } }, m.dialects.Gruber.inline["**"] = f("strong", "**"), m.dialects.Gruber.inline.__ = f("strong", "__"), m.dialects.Gruber.inline["*"] = f("em", "*"), m.dialects.Gruber.inline._ = f("em", "_"), m.buildBlockOrder = function (a) { var b = []; for (var c in a) "__order__" != c && "__call__" != c && b.push(c); a.__order__ = b }, m.buildInlinePatterns = function (a) { var b = []; for (var c in a) if (!c.match(/^__.*__$/)) { var d = c.replace(/([\\.*+?|()\[\]{}])/g, "\\$1").replace(/\n/, "\\n"); b.push(1 == c.length ? d : "(?:" + d + ")") } b = b.join("|"), a.__patterns__ = b; var e = a.__call__; a.__call__ = function (a, c) { return void 0 != c ? e.call(this, a, c) : e.call(this, a, b) } }, m.DialectHelpers = {}, m.DialectHelpers.inline_until_char = function (a, b) { for (var c = 0, d = []; ;) { if (a.charAt(c) == b) return c++ , [c, d]; if (c >= a.length) return null; var e = this.dialect.inline.__oneElement__.call(this, a.substr(c)); c += e[0], d.push.apply(d, e.slice(1)) } }, m.subclassDialect = function (a) { function b() { } function c() { } return b.prototype = a.block, c.prototype = a.inline, { block: new b, inline: new c } }, m.buildBlockOrder(m.dialects.Gruber.block), m.buildInlinePatterns(m.dialects.Gruber.inline), m.dialects.Maruku = m.subclassDialect(m.dialects.Gruber), m.dialects.Maruku.processMetaHash = function (a) { for (var b = g(a), c = {}, d = 0; d < b.length; ++d)if (/^#/.test(b[d])) c.id = b[d].substring(1); else if (/^\./.test(b[d])) c["class"] ? c["class"] = c["class"] + b[d].replace(/./, " ") : c["class"] = b[d].substring(1); else if (/\=/.test(b[d])) { var e = b[d].split(/\=/); c[e[0]] = e[1] } return c }, m.dialects.Maruku.block.document_meta = function (a, b) { if (a.lineNumber > 1) return void 0; if (!a.match(/^(?:\w+:.*\n)*\w+:.*$/)) return void 0; h(this.tree) || this.tree.splice(1, 0, {}); var c = a.split(/\n/); for (p in c) { var d = c[p].match(/(\w+):\s*(.*)$/), e = d[1].toLowerCase(), f = d[2]; this.tree[1][e] = f } return [] }, m.dialects.Maruku.block.block_meta = function (b, c) { var d = b.match(/(^|\n) {0,3}\{:\s*((?:\\\}|[^\}])*)\s*\}$/); if (!d) return void 0; var e, f = this.dialect.processMetaHash(d[2]); if ("" === d[1]) { var g = this.tree[this.tree.length - 1]; if (e = h(g), "string" == typeof g) return void 0; e || (e = {}, g.splice(1, 0, e)); for (a in f) e[a] = f[a]; return [] } var i = b.replace(/\n.*$/, ""), j = this.processBlock(i, []); e = h(j[0]), e || (e = {}, j[0].splice(1, 0, e)); for (a in f) e[a] = f[a]; return j }, m.dialects.Maruku.block.definition_list = function (a, b) { var c, d, e = /^((?:[^\s:].*\n)+):\s+([\s\S]+)$/, f = ["dl"]; if (!(d = a.match(e))) return void 0; for (var g = [a]; b.length && e.exec(b[0]);)g.push(b.shift()); for (var h = 0; h < g.length; ++h) { var d = g[h].match(e), i = d[1].replace(/\n$/, "").split(/\n/), j = d[2].split(/\n:\s+/); for (c = 0; c < i.length; ++c)f.push(["dt", i[c]]); for (c = 0; c < j.length; ++c)f.push(["dd"].concat(this.processInline(j[c].replace(/(\n)\s+/, "$1")))) } return [f] }, m.dialects.Maruku.block.table = function t(a, b) { var c, d, e = function (a, b) { b = b || "\\s", b.match(/^[\\|\[\]{}?*.+^$]$/) && (b = "\\" + b); for (var c, d = [], e = new RegExp("^((?:\\\\.|[^\\\\" + b + "])*)" + b + "(.*)"); c = a.match(e);)d.push(c[1]), a = c[2]; return d.push(a), d }, f = /^ {0,3}\|(.+)\n {0,3}\|\s*([\-:]+[\-| :]*)\n((?:\s*\|.*(?:\n|$))*)(?=\n|$)/, g = /^ {0,3}(\S(?:\\.|[^\\|])*\|.*)\n {0,3}([\-:]+\s*\|[\-| :]*)\n((?:(?:\\.|[^\\|])*\|.*(?:\n|$))*)(?=\n|$)/; if (d = a.match(f)) d[3] = d[3].replace(/^\s*\|/gm, ""); else if (!(d = a.match(g))) return void 0; var t = ["table", ["thead", ["tr"]], ["tbody"]]; d[2] = d[2].replace(/\|\s*$/, "").split("|"); var h = []; for (o(d[2], function (a) { h.push(a.match(/^\s*-+:\s*$/) ? { align: "right" } : a.match(/^\s*:-+\s*$/) ? { align: "left" } : a.match(/^\s*:-+:\s*$/) ? { align: "center" } : {}) }), d[1] = e(d[1].replace(/\|\s*$/, ""), "|"), c = 0; c < d[1].length; c++)t[1][1].push(["th", h[c] || {}].concat(this.processInline(d[1][c].trim()))); return o(d[3].replace(/\|\s*$/gm, "").split("\n"), function (a) { var b = ["tr"]; for (a = e(a, "|"), c = 0; c < a.length; c++)b.push(["td", h[c] || {}].concat(this.processInline(a[c].trim()))); t[2].push(b) }, this), [t] }, m.dialects.Maruku.inline["{:"] = function (a, b, c) { if (!c.length) return [2, "{:"]; var d = c[c.length - 1]; if ("string" == typeof d) return [2, "{:"]; var e = a.match(/^\{:\s*((?:\\\}|[^\}])*)\s*\}/); if (!e) return [2, "{:"]; var f = this.dialect.processMetaHash(e[1]), g = h(d); g || (g = {}, d.splice(1, 0, g)); for (var i in f) g[i] = f[i]; return [e[0].length, ""] }, m.dialects.Maruku.inline.__escape__ = /^\\[\\`\*_{}\[\]()#\+.!\-|:]/, m.buildBlockOrder(m.dialects.Maruku.block), m.buildInlinePatterns(m.dialects.Maruku.inline); var o, q = Array.isArray || function (a) { return "[object Array]" == Object.prototype.toString.call(a) }; o = Array.prototype.forEach ? function (a, b, c) { return a.forEach(b, c) } : function (a, b, c) { for (var d = 0; d < a.length; d++)b.call(c || a, a[d], d, a) }; var r = function (a) { for (var b in a) if (hasOwnProperty.call(a, b)) return !1; return !0 }; b.renderJsonML = function (a, b) { b = b || {}, b.root = b.root || !1; var c = []; if (b.root) c.push(j(a)); else for (a.shift(), !a.length || "object" != typeof a[0] || a[0] instanceof Array || a.shift(); a.length;)c.push(j(a.shift())); return c.join("\n\n") } }(function () { return "undefined" == typeof exports ? (window.markdown = {}, window.markdown) : exports }());

    //adds Base64 Strings for images used in the script
    var Wasabee;
    !function (scope) {
        var b;
        !function (a) {
            a.toolbar_addlinks = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAAASAAAAEgARslrPgAAALZJREFUOMvt0b1tAkEQhuEHQYZjSOjCQgIicA/0gc7UgUQb1wg4oYpLyJ2YwBAwB8sKhC4g45NGq9nd+XuHt1qZ38cnuuFv4hzH+Ysd9veSLXHAMbF5WHr3h+88+Av/WCTV76mLIv5O0xHWGGISfoFRFrzFKhntB4tOQ2ZlxuSiWbRV4ONJgvLRYxGAcoh14DGzMmVQq+e8xrqLDapoeRBFBIvKdc2NGNyM0G6YoHLeRtW08ut0AlmCLOTqNNpMAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE4LTExLTI5VDE5OjE3OjUwKzAwOjAwCdB9iwAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOC0xMS0yOVQxOToxNzo1MCswMDowMHiNxTcAAAAodEVYdHN2ZzpiYXNlLXVyaQBmaWxlOi8vL3RtcC9tYWdpY2steWVVelVwNFNNj+slAAAAAElFTkSuQmCC";
            a.toolbar_viewOps = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAAASAAAAEgARslrPgAAAIJJREFUOMvF0rENwkAQRNGHER1YrgCJMhAB5AR2MQQkJK7BJUBIEbRAATRARmaSk4xI0C3B/WQ22dXMaCnN7GNukz5wixwYk17Q4fxjt4OqeIRv1v842GPAEs/cDhboUeMQcVBjk+YXrpH8DXaYRzu4Y4UTjrkdMD3SKEiDbW6E8rwBF5gTIsXCVDcAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTgtMTItMTdUMjE6NDY6MDYrMDA6MDBKWVyZAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE4LTEyLTE3VDIxOjQ2OjA2KzAwOjAwOwTkJQAAACh0RVh0c3ZnOmJhc2UtdXJpAGZpbGU6Ly8vdG1wL21hZ2ljay1pZ1pvenF3TFAypWwAAAAASUVORK5CYII="
            a.toolbar_addMarkers = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAJ2AAACdgBx6C5rQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADhSURBVDiNpZI/DgFBFIc/G40tbRQcgQtwCpVOKQpaVHsNfxo6zeq4w7biAkLUhEayFKswG89mZhAvmcy83/zeN29nB/6MTCp3gSZQU3kIzIHrN7AKsAPi1NgC5U/FrqFYQnI2QFuYL0AP6Kt1ordsgJkw9oU+EPpUV+io+Wajq7jrxKyaN0Lzef0dX+hrG70ARJgvMQK8Ty1OLICh8AVAVQco8X7ryTgDReGLgYapi64G0BEnB0oLk06cFGAErES+BMam00zhAXueLzOv2X/7hKzGcATqan3S7C+Aw69dGeMBIk1M+lR0jGEAAAAASUVORK5CYII="
            a.toolbar_sync = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABT0lEQVQ4jb2RsUpDQRBFzzxSBLGSdEpAwTatdnYmRDC7NpbBVhA/wEJsBVvBSq1MGrNYBPULrAXBKohYSUqRFIFr4b74kjzsdJpl5s7ePTML/x3OObz3SZoX8hrMbAtoAhVJCfBsZldACzgDnoDjKQPv/SzQBuppzcwAysA6cALMAYepPkJxziGpDdQl9SXtSVoGFiXtAMN4eSxGBBG7LqkPrIQQepEqAap5406O0IxGR51Op5cWJc2Y2Ttwmqk95BlUonibfSGE8AHsR5oisAkUpwwk7UfhLQ819iyYWRt4AW4mCQZA1czWvPdIGgIHkYA4Xi2ej1MEZrYK7GbylqTPNHfOLfHzfZd5O8iiDs3szszK3vsCUIuXS0BX0vVvBn0zKwHnOVpX0nYIYVRIMuIAuADmgR1J95Je+V5YkOSBjexOxsJ7nzQajVztT+MLPDWCvXqGCZkAAAAASUVORK5CYII=";
            a.marker_layer_main = "data:image/png;base64,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";
            a.marker_layer_groupa = "data:image/png;base64,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";
            a.marker_layer_groupb = "data:image/png;base64,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";
            a.marker_layer_groupc = "data:image/png;base64,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";
            a.marker_layer_groupd = "data:image/png;base64,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";
            a.marker_layer_groupe = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAs4SURBVHjaYtQ1CWT4+/0Hg5C7I4OIiyPD7x8/GP4zMjAw/PvPIMLBxqDJwcNw8OM7LVYGRg2gqPz////FgPRbVhbmB1wszLc//fx1kZGRkeE3UL0kFwfDpz9/GD7/+sPABFTExsTI8B9IAwQQC5iEArDhUADS+O3vX5O7v74FMzMweLAwMaoCMQcLExPzn/////35++/Hl1+/H/5jYNjO9J9hLVDLMQYcACCAWBgYMS0AAoV///9X/fr7P/4X0z82DW4eBi4WFgZmqOWMf/8z/WVk4Pr8/6/mx7+/Nd/9+JX/6++/JUBftgCV3EG3BCCAWJA5jP/BltkBqQUinOyKUuwcDJxAj//6+5fh2/+/DEAfgD0Ocg8TkGQHWijLyskgzsLO/PjXj/jXv345///HkAIMpZ3IIQQQQEz///5j+P/vH9CC/6BoCARKbpHn4lRU4eBi+AMUf/n3F8O7/38YfgPlA7nFGBo01RkiuMUZgEHE8OHvH7D8L6DJquxcDLLcXDJAR64HSkUhOx4ggFiYODkZGEERxMJi9u/v//mKPFy8gsysDC/+/GL4A7QR5DsbTgEGH2UpBjYOZgYOHhYGXU4RBq3fQgzbbj5j2P/jPcNHhr8MX4EOEmZiZWDh5ea8/enLLKDZj4BajzAwMTEABBCj89JdIMv4gPF5Qk6QT1OShY3h9d/fQF/9Z1Bj52aIlpZmEJLkYjhx+SXDAaCBxbqqDJMv32UwYuNlsNORYPj05gfDisdPGa7+/MLABAw+YaADX/3+yfDo6/fbQHNN///69REggJiYOYA+YePIBTpAU4KZjeEN0AJeZhaGHCE5hgJzNYav3/8wtJ66zrDk83OGb//+MrBzsQDj5h/Dmq8vGVpPX2d49+knQ7a5KkOBiDwDKATeAvWLsbIz8LKzqf7+/iP/5eQ5DAABxKwUmiAKjMiFCjxc3H+BwWMBDJp0HSUGdmZmhoVXHzCs+fiC4dP/v5D0DvS6zn9uhqNfPoAt/AIUP/btA8Odl58ZzEUFGVyVJBj+vfvDcO/PdwZuVhaGt79+6wK9txgggJiAweLOycosxg1ML5///WHwVpFkuHn/A0PNnRsM539+BqciVmBssgHxD2Aq63x0l+HTr99gMVD6B+EbP74w1N+7xXDh9hsGF1UJsDmcQAfxsLOJ8NnauAEEEMvfv//d+YF54BfQrT+B8fD7x1+Gc98/McgzczDkG6kCU95/BqAahr+//zEwswLzMTQN/wPymViYGJiZGRmYgOLTL91lOPXjE4PqTz6IOcBUywv0zcdP390AAgjkEFV2VmaGH8BwhiVtLqD7b/36xvDx3U8GaTU+hn9//jMcPv2M4cTPj+AEwQzUBIp4BxNpBhZ2JoZX978wXAX6xgoY1OC8BjTjOzC1cbAAs+///2oAAQRKvBIgTaDkCrQHli2BiZKBYd6zxwy/v/9luHftPYORkjCDv4AYWM6DT4TBQk2M4f6N9wx/gD5f8PAxw1+g5QzMkGIDZM5fRohjGJkYxAECCFSOsYKs/vcPlBn/gYsXUL4GFhEMN759Ybh27S0wqTMyNFy+wcAKDOcKe00Gfk42hsZLN4CZ9T/DvRsfGC5++wQuDRj/QEIDZA7IPGjQsAAEENO/f/+eAnMFsEyCll9Q34AUgfjTXj9ikFHgZVBi4WRoeHqH4cfnPwxtT+4yCAEznoqGIMOUt48gDgOVGGBvQM0BOuwXA8iyf88AAojp/5+/977+/gP0KRPEdqCCHwz/wL4x4OBlEGJlZdh5/glDjIYcgwgLK8Ofn38Z+IH5KFVZnuHw2WcMLEATjTn4IPHABNEPMgcU2d+A5gKLrIcAAcTEwsJ85PPPX5DSFeQDYEqSZGJjKBFVZCi20mDQA0bw0o/PGf4CIz+OT4rh+9c/DKG84gyswBQ159MzBk1WboY8CzWGKjElBlkmdrB+iEcYGUDmsjIzHQYIIKa/v37v/fbj1++/wHBkYQYmSRZGBm8beQZhbnaGmiNXGNZ9fAmMVGBuvfuIwcBUjEFQgpPB1EyCYeXNx+ACdNfnNwzVR68wcLAxMwRZKzCwAlMbyBxgfcPw7fvP33/+/N0DEEBMwLC88efHrwMfvv1g4ADm8jNP34HzwKdvvxje/PkJzif/gE47+vEdw53L7xhYOZkZHl7/wLDry1twHICC6c3vXwzvf/wCx8v5R++AGZGZ4f3PH8A893sfw99/1wACiFkhKAaY3v79AZZHwYI8XAzHPr1nuPjsPYOdqDBDkIYsg8BnRoZrv76Cq9e7wOLCTkSYYeLNuwyvgQazAIMkil+SIddQlYH9PxND98VbDDs/vWHgAmbCF+8+ATPx3wrGf/+vAQQQo+2MDaDI4vnPxHxRVkpECVSMgIoNULi68YswRKnJMYCywOI7jxgOfHzLIAusGh5/+85gwyfIEA+MfFDwrLzxmGHL+1fgSOcHtgtAQfXkxZsbjP/+GQKN+QEQQMwK/lGgSAf5VfgvM6O9IBcnww9gqgCBuz+/Mex49YpB+CcLQ4i+HIM1Cz/DY2BDI09KgcFFR4rh9J03DM337jBc/fYZUgMCLeEFpsDXnz+DgqqHkYXlICMwbwEEEKP9gm3QXPpfHmjROWkJYSFQSgYla1i1Dwp3KQ4OhlxReQYVVQGGB/c+Mkx584jhEdBH4HzxH5J0eVkg7ZKnz9+8AIYkyBcvQPoBAogFlO/BBQkwPv/9/DXr/eevFeJ8fAxfgQXNX2h9DtL5FNhsKn90E1jfoTYSwJkYSDMDCVD18Oz9R1BmnAr0wQuYGoAAYvr/+zcDDAOr4UlfP39/9R1UVAMLN1BhCCluIPg/FgyTBxWGX4FmfP/64wkTE9MMZIcABBATmqbnwHCb+uHTVwZ2oCYmaBFBCIOaSiD1Hz5/BflqIihVI1sCEEBMGC0xRsZpQNc8BUU+JxsLuC4B5eK//yAYxv4HEwdiTmCS/Q5MkT9+/LoPjPw54OSIhAECiIkRGI5gzASlmZnfgFwDchU7MGWASmBYwcfwH05BSluQK4HFOyswXkHqgaCfkZXlAyPQV8gYIIBApSIDGP+H0kAMNHf2j28/738HhjEobtDjAdRAA7OBkAvosO/AxsPPbz9vMfz+Pf/fj58M6BgggJjAyQOEmaA0BH8AVma9Hz9/Y2BjhvoG3RfgOooRLP8JqI7x/78eoPAX9KACYYAAYmJiY2UAY1YoDcXM7GwLfn3/eRPsG6Br/wFz8V9oHEDi5B+4rPsGLGl///h1FeiSJcAKnwEbBggglr9A7+AAX4G+6f7y6dscISE+BhZgo+H3H2jlBgxVViAfhN+9+wyKxy5GNrbvEJfDa3A4AAggFlC2R/QdoJIIhUv//P6d9+PnLz1QSvv99yfcABAfKA6sxH6fB9q64j+QjQsABBBKZvz/B4mG4B/A0q7z25fv4PBnAcXNn79gGsT/ChQHZuAOoEN/MQLjBhcGCCAWULIlAFb/+f2nEOhqE3Zg2fT7528GEP3j1y+QhSc5BfnWMf7HbwBAALFwCvDhVQAsoX//+v6j7fuXb+t4BfkY2NnZwKnt26fvDP++f2v/+vXLH0KuBAgglp/ff2LEFTIfyt707+/fI79+/LLhBvYLvwF98efbt0Oflq3Z8u/rd3CQ/EeNaxRzAAKI5R+wOEARRFL5H6HzL7CGa/v14+c2FmDy/gWsqoE5uZ3DQPfvf3Ddwwh3ECMWRwIEEMt/RLMR1Xp0PhPjDqBv9nz98tUFaPBuYHmyk9PCFJJ5sQBknwEEEAsjDkU49HX+//nbHmhhF1Dff1BKJKQBBAACiImBNHAIaEEWmCYBAAQYAJ0bQcCycrauAAAAAElFTkSuQmCC";
            a.marker_layer_groupf = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAArlSURBVHjaDMwxCsJAEEDRP+OaRixdsNouhBxEsBTSpPWqOUFqGy9gsYSAJO6MW/3m82RMT9bfyhAf3M53NvuCC46hF0VapUyl1yMdkByPtR8J+pYTL8s2i9R/h3BVbIGSDTlUpnG0Wn8BxMIABowM6ACkkeHbfxPGB/+CGVj+ezCyMKr+Z2XgYGJhYmb4A3TB7/8//n7+/xDomu1AlWuBWo4x4AAAAcSCQ1wBaEwV40/GeIZfDGysakBlXECXMf+HWM7wn+n/P0Yu1q+Mmv8+/NNkePc//++v/0v+MfxvATrvDrphAAGEacl/Rrt//xkWsIgwKTJJMzEwsAOFfv9j+PedkYHxD5D/H6QEaBGIyQEMDhlmhv/iDMysT//F/379z5np3/8UBmaGnchGAgQQ09//fxlA8B8oiP4yBgK1b2FTYFRkUgYaCgxnxtdA178HhvdvYLh7MTDwNHMyMASAghNoz4f/YPn/v4C0IiMDqyyzDNAF64EOiUK2BCCAWHiZeRiYGJkYWP+zmDH+/zefWZmJ9z8/0IBXIB/8B7v4rxkjA18oFwMrJxMDGy8LA6sNM1DsP8OntV8YGI4ClXwEqv0GNE2QgYGZhZnzz60/s4C8R8BIP8L4n4kBIIAYr5s8BFnGx87IfIJDnl3zvwTQiW+BhgO99h/oG84odgZuOQ6G1zs+MTAd+88gUMXD8KHnK8N/XQYGYR9ehu8vfjJ8XfGTgekGxEGMQsAU9vovw58H/24DzTX99f/XR4AAYuIGxijXP85cNj52TQZxYJJ9BwxnXiCdwsIgXiPA8OfTP4Z31R8ZmFYDk+V3BgZWbmA0An3IuOkfw4eazww/X/1hkCgXYGDMYGZgFGBi+P8OlPSZGdj4mFV//vmZ3/amnQEggBgfmLwUBdp4hU2TWewfUD+jASODQCQPw8/3vxm+LP/OwHQFlNaZIWmCDxjueSwMv2f+Zvj/5h8kqYPylDoDA2cMGwOnGDvDu1XAjHIa6Km/jAzfrv54c/THUV2AAGJ8YPwihpmHaTGzBiPDP2Aw8U3gZfhy6TvD/4V/GRj+AF3MAklJTNCs9I+ZEWjAfwj7P8SSP8DUxwRSF8HMwGvKyfCpAGiRMFDTTaD4J5Z4gABiYfjzzx3kzX+/gIp+ASP5OzClXQQaLsvAIFDGxwBMfAz/gIb++wXUwAZJwqC8C0rWwFwPNpyRlZHhQ+8XBsZz/xn+6AA1QM1iBCagX+9/uAEEEAvQ06qMbECFP4FJ8T/EuYycQEvuMjB8f/mbQViHh+Ef0EfP1r9nYDkLNPw/JEP+0f3PIBEiyMDCzsTw/s5XoKuBtpsCzYH6jvEH0Dw2UPH0Xw0ggIBOYZBgYGEAlz1MIFcCMTMofP4wMvye/4vhN9Bnb05/ZhC05WZg9GYCZS2G/66MDEKuvAxvz35m+PPjL8OPub8Y/gMdAs6kDBBz/v+BZPX/TIziAAEE0sUKkmIEeunPv3+gspHh7/9/YBf/u/WP4c3Rz2DFH6q/MjCxAl3ULsDAIsjC8Kn2C9jgd2eA9BVgEP1lABeqIP0gc0DmQaORBSCAmIDh/RRY7jD8A/oTJMHwD5pNgbEKitj/c38zCGhyMfwHlr+/238x/Pz0h+FP9y+GfwLAuDXlZfgz5y9E3X+EfhAN5AHjERyfzwACCJhQ/txjBAYpsHQFKwaFFCjigJ5hYNEBigEz16uVHxkEUrgZ/gszMvz98Q+clLkzOBherv8AClsGJmCyB7scFOGM0FTHCjTnKzAh/Pv7ECCAmJhYmY/8+vIHHJngZAqMGwZRYN7IYWEQbQQ6F1iLMK75B458plAmBpBaJj+g2cCUxrgM6F5VoPJqAQamYlaG/xJAvX+gyR3oWJBaZg6mwwABxPT376+9v78AU/ofkNMZwS6QShRmYBZjZnhV+IGBcQsoGBgZvs75ziDhLsDAI83BIOEtxPBp0VdwPvq3/x/D2wJgicDFyCCVJsTAxMkIMQdYKvz6+uv3n19/9gAEIKkMVgCEYRjanvz/HxpelN28id8gDGQeZHbdfMN7m5SEpDRzP6yW2dFaJ8DWIo0M2MVnSsNNgEZWossZMyUJ+ZalBzRx/TsuNXFmhy/38nC9yst+LRZU2/4JIKCfGYHZ49/8b+9+MjCC/LnkL8PzgvcMbGIsDEIz+BkYI4FKOBjAmfLvPGBy/fib4c+832ADgTUmA0MosBiaycfArsjG8Dz/HQPDIqBlwKD68QHoWKb/s38BkyBAADFe0L0Oyho8rP+ZL/LLCygBS32Gfx//g+sLRidgMZHIBfIMw+d53xj+H/rLwCIHTAyPgLnfkomBK4mLgRlY/H9a+JXh346/4MKACVRIAoPx/aMPN/4x/TMECv0ACCAWRiYmUIL48ufvvyU/3v+o45IEGsr0B1Lw7fvL8Pk4sM4IZ2YQKeBj+OzzneH3mj8MLGmsDAI6XAxvtnxmYFoGTBRfIOkeWCkzsADz0ufXoMoFWLsysPwAMQACiPGK/l1otftfHqj8nKCsgBAjKA6+/UeplZmlgJGZysogaMzN8OES0OWzwXUGOMX/Z/wPzl4svIxgX394/P4FMMhAvngB0gsQQCzMoACEgIf//v2b9ePdzwpuCU6gJX/BEQvKpCAVf58Ag7DuN8Mbhg+IuhskDpIHpj4mUCMDWI59e/oNVAZOZfrP9AKmDiCAmH4zAssnKGZg/j/px5dvr/58/wdOiv//gQyAlgL/ILkaHYPkweqA6v99/cvw89v3J0xMTDOQQwEggJj+gxXB8fO///9PBcYNsJXCCC7p/oOLDPwYnMqA6r8B9QHjciJQ5A2yJQABxISlUTcN6Jqn/4HFBzMwT4BKZ1BqYUDCKHygPEjdP2Bp/ev7r/v/mP/PAcYtCgQIICZmYHsSDb8Buebbux/g/AENeHDTFdx8RaL/A8VBNTOwCcvw7QM4IfUD2zIfWBiB6QoJAwQQMM6ApSg6Zv4/+/ePn/f/AF3Hyg1qgiDiADmcQKmKmRuYu7+BfXHrD7AG+vnvJwM6BgggJpgL0fAHYKrp/Q503X92YKphghTfKMEKKnWBvmBkA/ri0w+gZ//2AIW/QOpnVAwQQEysQFXYMBsz24JfP3/d/PMNGDdcwFz+D1yrwTGIzwLM7b+/Ad3/6+dVYBW7hAlcp2JigABi+QX0Dg4ArA3+d3//8m0OrxAvuNHw//dfSPsUXF8wgevUr2+/M7AxsnSxM7B/B+UpbL0EgABiYWRkxGUJKKUt/f3rTx7QR3qsXKwMPz/+gdgBSrFA3wHFgSX23/O/Gf8C25C/IKGDBQAEEKhmZMCDfwATQuePLz8g7Sqgy//+AfqGlQHMB4kDM3AHMPP9ApeBODBAALEwMTEzEACr//75Uwh0tQkrBzPDj19/GED0T6Av/vz9e5KPi38dnsAAA4AAYuHn5MOrABhkv7//+tH29eu3dXz8fAxs7KzAVMXI8P3Td4bP/7+0f/r2+Q+ib4MWHVA+QACx/Pj+k4EIsOnvv39Hfv/4ZcPBywHMF78Zvv79emjWl9lbvv/9Ak5B/8HtE3BjDtWRQAgQQCzApj0xlvwFZsi2H79+bmNhZWX4/vMH0FjWdisOC2Br6jcDEwP+8AIIIMaLujcZiASMwEy5C1hsuABzxm5gYerOxsj2n5AFIAAQQCyMTMTaAQ6HTqAF9kC6ixGUbRiICgUGgAAi3goIOATEWVCaaAAQYAA2AOFP3j2UaAAAAABJRU5ErkJggg==";
            a.marker_alert_decay = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAABmJLR0QAiQAgAMN/lbx2AAAACXBIWXMAAAhUAAAIVAGeUdvKAAAAB3RJTUUH4AEFEjQsRn6AqgAABH9JREFUWMO1ls9uGlcUxn/3zh1ggBj8R06UWGmxHCuq0jiVkifIIi+QdRV5aWXRV8iyqyyy6ZK3yLKtWrUL6koxlrGS2MDCHgE1OGYCMzAztxtDzb8UJ+ZILDj36n73fN853x3x6tUrCcR9308opQyuKHzfDyzLcrrdblu5rptwHCcLfAeYw5ullFiWJaWUAtAXDsHzvDAMw7EgQoh/lFI/uK77t1JKxYH1MAwzYzZy/fp1Hj9+TCqVwvd9hBAEQcC7d+/I5XI0m82xIFLKtNb6W8uyCgqQ57+RME2T1dVV1tbWBvKtVot2u0273f4UY4bW2tJaS6mU0hdpuBjJZJLV1dWBXBiG2LZNuVzG9/2p9OlVoMdpcePGDVZWVgbynudxdHTEycnJ1E0gJwkXiURYW1sjGo32c1prTk9PKZfLeJ43PcgkuhYWFshkMsNtiW3b2LZ9qXYeS5eUkkwmw+Li4sBmx3EolUo4jnM5kE6nM5JMJBLcuXNnIBcEAbVajePj4/5FhBBIKf8XRI2r5ObNm9y6dWukq8IwZHl5mfn5eQzDQErJx48fsW0b13UngwxropRifX19QHAAwzBYWVnpUyilxPd9CoUCtVptqkoGBB+ejd6hyWSSZDLZz/WaoNVqXU74u3fvjgg+LprNJjs7OxweHjJpDCbSZZompVIJrfVAFalUinQ6DUC32+X9+/cUCoWp5kUNl5rP59nf3+8PX6/bHj16RDqdRmtNpVIhn89Tr9enamF17rb9a9dqtYEqAJaWllBK9Wna3d2lXC5PPScqGo3qs7MzfdE6hu3+2rVrLC0tEYYhh4eH7O/v0+12CcOQVCrFvXv3MAyDvb29sZ6mzg/VE/3aMJifn2dubo5qtcrOzs4ATclkko2NDaLRKLZtU6/XRy4qh+ka96YsLy/T6XR48+YNxWJxoEohBEoplFITp18qpbQehr4QlmWRSqUolUrs7u4SBEF/LRaLEY/H+2CWZWFZFkKIQbrOe1xPeKdJJBIIIcjlcnz48GFg/fbt2zx48IC5uTmklGxsbKC15u3bt3S73f8qOfccPUkP0zQ5ODjg4OBgZL1arVKr1Wi323iex8nJCZVKZWR2VCQS0cDYkdVa4zgOjUZj7FSfnp6yvb2N67qYptnvrmH2FdCRUv4qpYwIIZLDBzUajX4DjAvXddne3gYwgiD4GoiMaAK0FhYWfpRS/uT7vvkF33OLjUYjC3wzMifPnz8PgTPg7NmzZ+JzER4+fFgF/hoLcvFPNpvVnwvy+vXrdr1e/wX4fpLVf3E8efIkjMfjOSllc2Ygm5ubKKUawNHMQLLZrFZKNYUQ+eGH8MpAep/JQojfZgqytbUVxOPx34UQ7ZmB5PN5YrFYTQhxDIQ9d79SkJcvXxKJRJpCiD0g6Ln7lYJks1mdTqdbQog/gC7gz0J4nj596luW9TPgCSG8mYCcm+kxUAHcmYBsbm4SBIEjhPgTqEspA/GJl/ez48WLF2YsFvsqFouJTqdzPBO6isWif//+/aJhGGXLstr/AnwwBhGBAAySAAAAAElFTkSuQmCC";
            a.marker_alert_destroy = "data:image/png;base64,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";
            a.marker_alert_farm = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAIVAAACFQBnlHbygAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAARCSURBVFiFtZZLbFRlFMd/57uPeTDttDS0tlWUVxkrVSBh4dZoZONjIa5kZUTjyo3r6dbElXFh4gZlR+KCtRoQFUPwlUrbkCKEAMV2prePmbnzuvceFy3NTNqhUzr8Nzf33u98v3vOdx5XxsfHDZCs1Zxdrlu36JBqNSes9brFVKlUtn0/sSv38o2zkUTHRMXpFMSEVn54av8nvu//adt2kARGwniwr1MAAKckPUTRWDK5Z9oARlRMq8VhJYD8EhrqdjmWRpoANbbrOqpo0w6xis8b9gxPuz5D/XUGM8LErM2lhT6uJQ+Atb2js8FHRNYhA6U8Hz81g0XEd/PDVIoWxxfnOXnA58WhOb6/XeBcdQyNue1DSg03fUs5spkb/Hg3xYUgQ5CIr3pWqnMSH4DX9vncnZzhYuyFtiHGcRwlQgFeSdxjuWq4UB9ZBwCkQ7/J6L3DC7jeYvsQAATVUBlLF7nwYA9BMtng3RynM80burYw5nrbgKzFK6gGpJMRcQ3XX/bnZ/lo6Babhb/frbQNsdeuagRqoeHVAY90foKgFvLOsSJ2i0SqavsZZrtuXQVRK+FwNdfFWyMFnt29vKXhnWoSYu1BDEBEBMCV8gD18JHr13U04aHaXoEaAGG1TmbTg3xzfXdbhm8fKnBw5V57ENd1FVj/pEupDF9O9FMqb26gCpevVVCF510PDaMtIXahQJPbYllc7T7MXzeHycg83SZARYkQTqRXODFU5sBehz8ma7x5cJnyjev8kDqCWC3b32p2PQxXo2pdKSZINT2bXFrm76UHvD7o0ddT5f58yLuHl6hMT/FrzxGQzSEmFnMVoa0TXEmmuZzM8PmdQ+Si1YL9LxdyOuNxfGG6pZ2BItAe5KEWe/bwtTfCQL9NGMH8Qsj7mRyjuZlWEGjXk0ZVenr5cPIo4tjUA8VbDvng0H0yCzc3QlzXXW+Q25XV18W5hf2kemPUAwgC+PSlWXqW882QAjTNk+3qVtcw3959Bi+Kky8a8ktKNWheY7Oawo8NAZhM7WWSvWikRF6E1WfhNAwqE4vVFJGtK6oNiREsd2PjtIGaU3J+ipXirkSS2mjaphSrtLvwXOgGGwaDDfiD/w58Vrftr8IgeOz/Lic0fdWu8tnQDUY3QLLZbASsACsi0qJmt9b4+Pi8CczvwAZIU8PRHWh0dLRsVe1LD/eSVpCd6NSpU1HK67lmBVbhkZ7sRCJCLCeLVtW6/8QgqqqO4xQksv5Zw67XXscga/JN3f4ZoPHXt6OQbDYbdufTv5jQlGno7B2FCNDlxXNWzZ4FIjGrIetsuESIx+MFE1hTCKFG2nmIqmpvb69vIuuKGq0DAfgdP3jOnDkTdHndF0WkKkaq0PnsAiBxr3uWgDmIKk8EIiKEoVV06s5vinhV1w07DlFV9bzbxfRy9xcETNc9x5cdDsVNJSJy/vx5MzU1ZQHB/3UN/t91W4cEAAAAAElFTkSuQmCC";
            a.marker_alert_goto = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAIVAAACFQBnlHbygAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAARKSURBVFiFtZdNbFRVGIafc+fcOzOdae20FvmTv0ptGkmgLGhMCOCCRMREQ3BHEBdgNFVjjEZDbONGJS4IujAGDBsNEmIIBmGhEQVEA4EoMlU0LREoFPozdqZ3Zu7POS6g2PHecUqdvpubnJzvfe4533e+c6/o7u42gBrHMROW5UaokhzH9J2UlUuOjeWlbccT21qO7hVaL1MYZrUgRSUH9w2sfsm27bNSSq9GaVoarbGFUzG7cNkm7yiWzE8QleLO+GCxrh6lltTUNPUYgIEwjLs1BfjgyHVWbr/A2rd66NzdVzJPQ0QrHQdtGJZlaqG1LmeadxSb3/+DA6eGOHIuw8rtF3jx40sMZj3e3Hf5zrwDp4a42J8P9ZBggyAA8XxN70ABX8EXZ0Y42zvGy4/PAqDoKjI5L2BWEw2vGzl2a2kB7TjYz3uH+tmxaT4bOhqojUfYvGYG99aZdCxOUp+UrGqr49v0KACbVjUxp8EKh5imqbUu5bi+ZkVLkkTMoOAqtjwyg89ODtHaeQ4ZEaSSkvXLU+x5vpljv4wSNQXr2lMIEcpA3nqIO5CBjMvSV37m1Sdmk965lNc/+bNk7wGuZ1x6ruT58fccB197MNx5ggzGgAl5b6iVtC9KMJBx6dzTx6fHB8sGf5ce5evzf00CAiWJNyOCw2+08tTDjRw6PVLR4MuzmcoQy3I1QgRy/1uZcvy3auOVO5EBEHZMegeKFYNb58R5ek1TxXkSQGAEKNczTtmguniEbWvvo3PdTJKxyiuRlmXpkszf1gMzY6EB9QnJ0e2ttMyOVzQfl5HNhh/Gh+bVhAY81l5/VwAYr64QTsfiWhKxYN+MmpPupf9AolFLTzyM40rEDDZ0NAYC9p0c5NLNykVRAoEcIqRBAmxeHawcu6h4YXcfqmzfDoUQXsPAsoUJHl1WHxg/8WuWXYevTR5iWVagQU7Uzi0LaEjKwPjbn1/l2kj5Mi+BZIGwnIyr6R6Tnc8sKLlaAXylKbiT2zODLIiQczJR65en+OGdJTy5ooFZKYv2RQk+eraZhTOik4LIaNTRCFSlifOboux5rnlSpgEI4Nwo1n57w6m3PG0kp+QCaC0izYlrC5KRQuB6lID91eDSd10pP/Q9b8rfXaZvNM6cN7I3GSm0BSBdXV0KGAVGhSh3gVZWd3f3DVfJM0AAUtIj9P9QW1tbftSLHwt7gbtvRGW0ceNGdd6eezqvzOy0QYQQXMnUjthe7Oq0QbTW2jTNbFFZ58eHqg65LTvnR49PK6Srq8u/mJ93wtEyL6YLIoDebOPNnBvvF2gljFs9sbrbJQSxWCxb8K20ENrXSlcforXWqVTKLiC/N4RyAQ/sqieerVu3er323G8EFIUhilD96gLgp6G5/UUlB0AVpgUihMD3I7m8ip7SiOGiZflVh2it9fBwX67PuX8XHj3usGn/1+/ilCWEEPv37zfS6XQE8P4G8uDlVRBMTgcAAAAASUVORK5CYII=";
            a.marker_alert_link = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAhUAAAIVAGeUdvKAAAAB3RJTUUH4AEFExkigC6ddQAAA/VJREFUWMO1l0tsVGUUx3/fmXvn0Q6ltNhOC/XVR2ilQo0iKomILIyvjYkmJLhhYVyYaOLSlXRj4l7dsdG4Y2+MSMQiASpJEbAPKZB2GIbadjqd573nczGtUDp9DMyc5Obem+/e+/vO/3znnO+az3+wAtQVPepdhwBVsqKHHw2TzntknWyB+lSWE8AA4K71zjpja9ld1+HTbIFhxxHqgB7P5ymqaE6ARqA/EuSqAMtHtS2glgggjutgAVvpFyJBcATyRSj4G3i1dN40pLsVXnha6Y5B2BXic8q5CTg3sbYYjlbgw+Hd8MazSlujwRgDwOPbhe6YEhBlaKw8yHFkc3K9/ozy/j4hGhGshdlFGI8ryTS0boWDvXD5FqRyDynX7g54ay9EI2AtDF9XfroM16aFog9bI8qRl6Ezpvw5udobyRc3CLCrvNYLscbSyxcnlR//EEZulQAA81nh0k1obyz/DdnIk31d8PxSBs0swM8jMDW7+rmJhBByBUFXy7XeEo6GYX+n4C6JenESRm6tlKNvh6IKt+eFxJziOEJvOxQ8AnPZlTEpa307YFd76TqTVy5Ngn0gb5vq4cUuS3xOWczDuwNKZyv8PgZzWVk/8GKgf6cScksPJuaFieRqKc6MCrfnobddaY7C3TScvCBMJPFbGpblCpSXqyGidLfdm/XNGUhny+fBeALGE4IYRa0s1657E07nykvV0gDN0SU3LUzPbZxMy4B1V9e2OmhpKEnSFBVCzv+9gTvzYICwC05AK6pzEnJLcvV3KB8fVt4ZsDgCM2kYjSs5D9J5ZT4DsUbl2Ks+R1+BbfUVlP1lT7aEYWdTKat3tcHobfjuF6GloVRlJ5OwpwO6Y4aQA2fHldlFqQwyNCaEXHh7r3LsoJJYgFQGSjET3twDXa2wmIeTF+Hv+OZb0IrVdeoKxGehvwN62qAnVhqwFnJF5dINYWgcrk5V2CV9XZkn1+LCtWmoC0E0rICgFgqesJgHXytvkU62UCYZDWQKkClUpysvry6lhuYABTGcDjoEgeijbBw8nyfVEiwHyTzWwFdi+NbTivdW91tzMsUJ9elbBfn6iFEgBaSe+8KahyUc6uMOcAHKQO6/GR409mEhn5y22WSKX4EP16pdj2wf7EejYc6LYaFmkAPHwRFmRZiqGWR40FjXYQEYebARVnsPnBHDbzWFfPkefjTMGTFkawY5/w9EgiRFmAZUTAlUVchn30OoFJcrgK+2BpDhQWO3b7EZMQwt/Z15tQg8Hx0yXl2QU0BeDPmaQACCDtNAAsjVBHLgOHhKGjgL/CsG39TCk6PfWDcS5In6ICZXZLomcv01hfdSF9cDAW7Uh8n+B/Bae7g+zl60AAAAAElFTkSuQmCC";
            a.marker_alert_unknown = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAACp0lEQVRYw7WXTUsbURSGn4mTYpogDYY0uyQgXQhZVHQdEXQjggjuFdy4ELop/oaibmOXBUFw5y+wlhYLbWmxknblMkqTkmrUWJuPt5sxmJgxY5x54TAwd+Y+c8575s4dQ5IPeAwEgR7cUw04By5Na/I3wHPAb3ND5Y4xO/0GXgBfTSuLZ0ASd/UESAE/fcB1uK0eIAD4fICsaKuLiwvW1tYYHh6mt7eXaDTK+Pg4m5ubSHKGkxSTdKA2ymazSiQSuvEgTTEzM6NKpSIblSW9lBSzhVSrVSWTycaECwsL2t7e1sbGhoaGhhrnV1ZWHEGeSvreesXx8bEMwxCgTCbTNFYsFhUKhQQolUp1hJjXVWstYywWY2dnh3q9ztjYWNNYOBwmHo+TzWbJ5/MdLTHvGhwdHW3/0lQq5HI5AAYHBztCfHaZ2KlQKLC0tMTJyQkAc3NzjrorKumbOmhra0sDAwNN3TU5OalarWZ3y9VN4x1BpqenG5MHAgEtLy/f1b5NENNpuYrFIgCzs7NkMhkikYiTBbLhiZxASqUSABMTE04AbY3vqGAw2HTsBtIxk3A4DIDf7783xHRarsXFRUZGRpiamrr/eiwpIumT3FdjWXFcrv39fdbX1xsN4Hq5JJFOpzk9PeXw8JDV1VX3jTcMg/n5efr6+kin01150i9pz2tPBNTxUCbwD3gHPAJCD9w4JKx5bkHKwCvgdRd7q5vqt/Zvtz4wpmEYdaAElCQZD4DkgS/tIL6WLlK3AVwCuw9aIB2oDnwGzryEAPwBcp5BrJKdAQetL7jbmZSB915DasAHqwk8gwAUgCOrEeQV5Az4YWXlPsQyvwzsWX9nVa8yqQJvgSsrPIFgefIL+Osl5Bz4CBSBmuEFQZIfiAMGcOQVxLCq1ANU/wNGYf1RfBw/igAAAABJRU5ErkJggg==";
            a.marker_alert_upgrade = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAITgAACE4BjDEA7AAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAOQSURBVFiFtddLbFRVGMDx/3fm3Nvpg5QWSwEBQRM1JcQnGmoUJNHE+FiYNOrCx0KrCQtdmRgXMwtdsDK6UKMbYlxoQ1wIxmCNAhoktpKAUBJjU0GofTnoTOe2M/fxuWiRjvNox95+u5l89/zuPd93zrlX0um0AZqKRafZdf0EMUWx6ITFNne6JZ+fsZ7X2Hx2zY79NJrbhMiJC7HJYGr7zOArnuedtNYGTSA3zpimrXEBAM1RdjVRtL2pqeOcAYyImjgBAFESGmkjqDGu6ygqGjeyMCx4gFZEHr1lLfff3F7XgG8cGiaT90uRfJXkJ3aso3fXproAANeWz7x1HEfR0id5pnsDz3ZfWzdQLSyAcrUmL9y3kSfvWh8bMIfkQVrnfxjh8JkpDp+ZqnrBHVta2btnM1IXAiAoQBApFzKzVZO7b1jNi7s21QUAWNf1FUUXu3L3Te289vD1WFMvAfOtENVMenDbNbz+SDnw6cAY+UK4NESovhgfu3Utrz60FSOlwEfHR/ng6O+LAgDWdV1FKiM9d67jpd3la+XDYxf55Mc/lgQA2FwOaFX4zyb/9M4NPHdP6VpR4N1vLvDZyfElA/DvOqHkSZ6/dyNP3V26VlThrf7f+OL0ZF0AgG1ocFXkKrJ3z2Yev72zJClSZd+XI3w99GfNwb46O8V4tlCOwDSyYIMczxZLEoJIefPQMMd+uVwTOHhqgrf7z1OpuBYgWlD4A4NjFPyIlx+4jiBU0p//yonhv2oCBwbHeO9I9U6b665IdGHhD56aYNYPyeR9fjqfrQl8fGKUvoGxmjk2B4iUnyf9i8z/lVgMADDkyrsr7jANDUVFF9lXlhkWKDbq30dX+TnXaNiyjLESU7Zji2+SbiXE21Y4vc+39v0wCP73e5cTmjXTq3bu90l2lSGpVCoCskBWROrfx+cjnU5PmCgcJEEZUnLq6zKiq6trpiEsHKl0A7G91PX09ESdjAxY9XMrhogILd7kZVcLl1YMUVV1HCfnqP/zlb9iR+bDs/jfzQsrg6RSqXB9cez7hAYzLDjSY0UEaI8uTrpaGAUiMXNQvNMlQjKZzNmoOKQioUYaP6Kq2tbW5iVMdFxJ+EAAXuyFp7e3N+hk7FuEghgpQPzdBUB79tKoifxxiGZXBBERwjAx7Yj/gyKZguuGsSOqqpnMyHSHGX+HgHN+xvFEK3/JLStERPr6+szQ0FACCP4BM4yjbDv7K3QAAAAASUVORK5CYII=";
            a.marker_alert_virus = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAhUAAAIVAGeUdvKAAAAB3RJTUUH4AEFEhsoUw983gAABHxJREFUWMO1lktsVFUYx3/n3Hvn3Wmn72kLZXi0aYXiIwo2hSqk1YULIcZgjBhloTEBSVzYEImGkCgLMdEQMcYEF2piIomJugCkUFASMUikQKyEhj6n0/e0nelM773HRWFiaRv6mPkn926+k/PL9zjf94nvnr4tAY8ZV17dLTTSJDOuLFdAGzcn7bieiNreoeHBE8AjgJEuiIY+UOgO7E9E7Su6ZggPUDFlJ0OkUULKHGWzwZWt3ZTAvW9JKltRyory0jmdUTZupZSUulsoQC0VYiUU9UeKKF9bNu+Zex4sGFJcEJzpSZ2HWMSk9mABFY+unBtim4tIptB4+M1ctuypBODxF9ZSWuvhp/1ttByI8NjbeXN6JDXnwsNlKYvWEyNUv5LN1jcqseKKM+92krQnGewdJjFqseVw4awc6YsJV8AoYtvRYtpORtEMgadIY9waxqcF2P5RGV0XY3Q0T6C7ZtaRPjVuLyhUPi3AlsOFtJ8ap2Szh7+ODVL1UjZ1r1cQ67PovRznj+9vpc47pGtxic9zF9H4yQr85QZtJ6OcbwoT67c409SBK6DhK9NnAO6X/qASztbzefbLUm58O0LflUm8hTq3b3am7JG/c6k7VIgyK7nw1T/zl7CY5y369Vye+jDIaEeS0joPEwPJGYD19SGqduXw88vdeEv0WeX9wMTneYrZdrQYZ47kl1e7yX/Iib/UyeidafvGxtWEGn2c2dvLYCxM1+FeLGXNDdEccla4/HoujZ8HuXp8CEeWRm6lk7YrHSl7de0q1u3I4vTebkbNgVR5z5uTyWFrVhVtPVSCsiH4hIfzn7bNuKCmIUTFTj8tTZEU4EGS0z+Z8mTN9gDKhB/2XCc+YJKfW5g6vLFxNaufyeLs/jCR0d4Fdwrp8EllY6cgA9cTOHMktrK49M2/9A1OX1b1ZDnrdmRxrinMUKJvUU1UKqVmJL63pwfdJQmWFaPdHZQ1DSE2vBagpSnCiBlZdKfW7w/XhoYQwU1uag8WMBXLIxm1MTySU2/1LAmQqq574VpfH+Lpj4tofqePa6fbKSkrIa/KSfvZEaLm0JKnpG5bCoWtivKCbD6Qz6/7wlxrbgegq7Obrs7lj2I9GbURSCUk/PZBhJuX7pBu6YZXKAaww/29hPvJiHQg6RDu8w7N7ZBC+JazBU1Yo6ssZTnmgsRyV3qOCE0ctxJqOXtX3lR38kRcjVfPguw6G7KBKBBd790qlkp4b9PXEeBPoHq+LgxA60TLkleji+9H4kMdsXPA7vlWomWr9mCB7c1xXdaFMZYxSE12PZohhoUQ3RmDtE60KN0txnQc1+4fhDLNTyKmCeNCRiEvnlpleXNcF6UQcfW/8ZFWyK0fx3D6Zb8mjB7AFnLam7RCdu5+DsMjxzT0G4Cl7AxAWidalK/UiGnC+B2YAsxMJJ6GY0HT5/c0AwkhSWQEAqC7RY9A9gGTGYHUZNdjTalxDf0SMCQ0YYm7i0Ra9dmaq4bP5yt3ZGnCjNk9GQnXF+F95rrn/e2agzvOHBn/DxoMsgKpcNi5AAAAAElFTkSuQmCC";

        }(b = scope.Images || (scope.Images = {}));
    }(Wasabee || (Wasabee = {}));

    !function (scope) {
        var b;
        !function (es) {
            es.main = "data:text/css;base64,Lndhc2FiZWUtdGFibGUgewoJYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsKCWVtcHR5LWNlbGxzOiBzaG93OwoJd2lkdGg6IDEwMCU7CgljbGVhcjogYm90aDsKfQoud2FzYWJlZS10YWJsZSB0ZCwgLndhc2FiZWUtdGFibGUgdGggewoJYm9yZGVyLXdpZHRoOiAwIDFweDsKCWJvcmRlci1zdHlsZTogc29saWQ7Cglib3JkZXItY29sb3I6IHJnYmEoOCwgNDgsIDc4LCAwLjc1KTsKCXBhZGRpbmc6IDNweCA0cHg7Cgl0ZXh0LWFsaWduOiBsZWZ0Owp9Ci53YXNhYmVlLXRhYmxlIHRkOmZpcnN0LWNoaWxkLCAud2FzYWJlZS10YWJsZSB0aDpmaXJzdC1jaGlsZCB7IGJvcmRlci1sZWZ0LXdpZHRoOiAwOyB9Ci53YXNhYmVlLXRhYmxlIHRkOmxhc3QtY2hpbGQsICAud2FzYWJlZS10YWJsZSB0aDpsYXN0LWNoaWxkIHsgYm9yZGVyLXJpZ2h0LXdpZHRoOiAwOyB9Ci53YXNhYmVlLXRhYmxlIHRib2R5IHRyOm50aC1jaGlsZCgybisxKSB0ZCB7Cglib3JkZXItY29sb3I6IHJnYmEoMjUsIDYzLCA5NSwgMC43NSk7Cn0KLndhc2FiZWUtdGFibGUgdHIgewoJYmFja2dyb3VuZDogcmdiYSgyNSwgNjMsIDk1LCAwLjc1KTsKfQoud2FzYWJlZS10YWJsZSB0Ym9keSB0cjpudGgtY2hpbGQoMm4rMSkgewoJYmFja2dyb3VuZDogcmdiYSg4LCA0OCwgNzgsIDAuNzUpOwp9Ci53YXNhYmVlLXRhYmxlID4gdGhlYWQgLnNvcnRhYmxlIHsKCWN1cnNvcjogcG9pbnRlcjsKfQoud2FzYWJlZS10YWJsZSA+IHRoZWFkIC5zb3J0ZWQgewoJY29sb3I6ICNmZmNlMDA7Cn0KLndhc2FiZWUtdGFibGUgPiB0aGVhZCAuc29ydGFibGU6YmVmb3JlIHsKCWNvbnRlbnQ6ICIgIjsKCWRpc3BsYXk6IGlubGluZS1ibG9jazsKCWZsb2F0OiByaWdodDsKCW1pbi13aWR0aDogMWVtOwoJdGV4dC1hbGlnbjogcmlnaHQ7Cn0KLndhc2FiZWUtdGFibGUgPiB0aGVhZCAuc29ydGFibGUuYXNjOmJlZm9yZSB7Cgljb250ZW50OiAiXDI1YjIiOwp9Ci53YXNhYmVlLXRhYmxlID4gdGhlYWQgLnNvcnRhYmxlLmRlc2M6YmVmb3JlIHsKCWNvbnRlbnQ6ICJcMjViYyI7Cn0KLndhc2FiZWUtdGFibGUgdGQubWVudSB7Cglwb3NpdGlvbjogcmVsYXRpdmU7CgltaW4taGVpZ2h0OiAyMHB4OwoJbWluLXdpZHRoOiAyNHB4Owp9Ci53YXNhYmVlLXRhYmxlIHRkLm1lbnUgPiAud2FzYWJlZS1vdmVyZmxvdy1idXR0b24gewoJcG9zaXRpb246IGFic29sdXRlOwoJdG9wOiAwOwoJbGVmdDogMDsKCXJpZ2h0OiAwOwoJYm90dG9tOiAwOwoJZGlzcGxheTogZmxleDsKfQoKLndhc2FiZWUtZGlhbG9nLXBvcnRhbGxpc3QgLmtleXMsCi53YXNhYmVlLWRpYWxvZy1wb3J0YWxsaXN0IC5saW5rcyB7Cgl3aWR0aDogMy41ZW07IC8qIHdpbGwgZXhwYW5kIHRvIGZpdCBjb250ZW50ICovCgl0ZXh0LWFsaWduOiByaWdodDsKfQoud2FzYWJlZS1kaWFsb2ctcG9ydGFsbGlzdCAud2FybiB7Cgljb2xvcjogI2ZmMDsKCWZsb2F0OiBsZWZ0OwoJZm9udC1zaXplOiAxLjVlbTsKCWZvbnQtd2VpZ2h0OiBib2xkOwp9Ci53YXNhYmVlLWRpYWxvZy1wb3J0YWxsaXN0IC53YXJuLmVycm9yIHsKCWNvbG9yOiAjZjAwOwp9CgovKiBzdHlsZS5jc3Mgc2V0cyBkaWFsb2cgbWF4LXdpZHRoIHRvIDcwMHB4IC0gb3ZlcnJpZGUgdGhhdCBoZXJlICovCi53YXNhYmVlLWRpYWxvZy1saW5rbGlzdCB7CgltYXgtd2lkdGg6IDEwMDBweCAhaW1wb3J0YW50Owp9Ci53YXNhYmVlLWRpYWxvZy1wb3J0YWxsaXN0ID4gLnVpLWRpYWxvZy1jb250ZW50LAoud2FzYWJlZS1kaWFsb2ctbGlua2xpc3QgPiAudWktZGlhbG9nLWNvbnRlbnQsCi53YXNhYmVlLWRpYWxvZy1hbGVydGxpc3QgPiAudWktZGlhbG9nLWNvbnRlbnQgewoJcGFkZGluZzogMDsKfQoud2FzYWJlZS1kaWFsb2ctbGlua2xpc3QgLndhc2FiZWUtbGF5ZXIgewoJbWFyZ2luOiAtNHB4IDAgLTRweCAtNHB4Owp9Ci53YXNhYmVlLWRpYWxvZy1saW5rbGlzdCB0ZC5rZXlzLAoud2FzYWJlZS1kaWFsb2ctbGlua2xpc3QgdGQubGVuZ3RoIHsKCXRleHQtYWxpZ246IHJpZ2h0Owp9Cgoud2FzYWJlZS1kaWFsb2ctYWxlcnRsaXN0IHRkIHsKCXZlcnRpY2FsLWFsaWduOiBiYXNlbGluZTsKfQoud2FzYWJlZS1kaWFsb2ctYWxlcnRsaXN0IC5hc3NpZ25lZSB7Cgl3aGl0ZS1zcGFjZTogbm93cmFwOwoJb3ZlcmZsb3c6IGhpZGRlbjsKCXRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzOwoJbWF4LXdpZHRoOiAxMGVtOwp9Ci53YXNhYmVlLWRpYWxvZy1hbGVydGxpc3QgLnJlc29sdmVkIGJ1dHRvbiB7CgltYXJnaW46IC0zcHggMDsKCXBhZGRpbmc6IDAgMC41ZW0gMXB4Owp9Cgojd2FzYWJlZS1mYWtlLWJ1dHRvbiB7Cglwb3NpdGlvbjogYWJzb2x1dGU7Cgl0b3A6IC05OTk5ZW07CglsZWZ0OiAtOTk5OWVtOwp9Cgoud2FzYWJlZS1hbGVydHMtbnVtIHsKCWNvbG9yOiAjMDBGRjAwOwp9Ci53YXNhYmVlLWFsZXJ0cy1udW0ubmV3IHsKCWNvbG9yOiAjZmYwMDAwOwoJZm9udC13ZWlnaHQ6IGJvbGQ7Cn0KCi53YXNhYmVlLWFnZW50c2VsZWN0IC53YXNhYmVlLWdyb3VwLWluZGljYXRvciB7CglmbG9hdDogcmlnaHQ7CgltYXJnaW4tbGVmdDogMC4yNWVtOwp9Cgoud2FzYWJlZS1ncm91cC1jb250YWluZXIgewoJYm9yZGVyOiAxcHggc29saWQgY3VycmVudENvbG9yOwoJZGlzcGxheTogaW5saW5lLWJsb2NrOwoJaGVpZ2h0OiAxLjJlbTsKCWxpbmUtaGVpZ2h0OiAxLjJlbTsKCW1hcmdpbjogMXB4IDAuMjVlbSAxcHggMDsKCXBhZGRpbmc6IDAgMC4yNWVtOwp9Ci53YXNhYmVlLWdyb3VwLWNvbnRhaW5lciA+IC53YXNhYmVlLWdyb3VwLWluZGljYXRvciB7CgltYXJnaW4tbGVmdDogLTAuMjVlbTsKCW1hcmdpbi1yaWdodDogMC4yNWVtOwoJaGVpZ2h0OiAxLjJlbTsKCXdpZHRoOiAxLjJlbTsKfQoKLndhc2FiZWUtZ3JvdXAtaW5kaWNhdG9yIHsKCWRpc3BsYXk6IGlubGluZS1ibG9jazsKCXBvc2l0aW9uOiByZWxhdGl2ZTsKCXdpZHRoOiAxZW07CgloZWlnaHQ6IDFlbTsKCXZlcnRpY2FsLWFsaWduOiB0b3A7Cn0KLndhc2FiZWUtZ3JvdXAtaW5kaWNhdG9yID4gZGl2IHsKCWhlaWdodDogMWVtOwoJZmxvYXQ6IGxlZnQ7Cn0KCi53YXNhYmVlLXBvcHVwIHsKCW1heC13aWR0aDogMzAwcHg7Cn0KLndhc2FiZWUtZGlhbG9nIC5kZXNjIHAsCi53YXNhYmVlLWRpYWxvZyAuZGVzYyB1bCwKLndhc2FiZWUtcG9wdXAgcCwKLndhc2FiZWUtcG9wdXAgdWwgewoJbWFyZ2luOiAwOwp9Ci53YXNhYmVlLXBvcHVwIGEgewoJY29sb3I6ICMwMDk5Q0M7Cn0KLndhc2FiZWUtZGlhbG9nIC5kZXNjIHVsLAoud2FzYWJlZS1wb2x5Z29uLWxhYmVsIHVsLAoud2FzYWJlZS1wb3B1cCAuZGVzYyB1bCB7CglwYWRkaW5nLWxlZnQ6IDEuNWVtOwp9Ci53YXNhYmVlLWRpYWxvZyAuZGVzYyBlbSwKLndhc2FiZWUtcG9seWdvbi1sYWJlbCBlbSwKLndhc2FiZWUtcG9wdXAgLmRlc2MgZW0gewoJY29sb3I6IGluaGVyaXQ7Cglmb250LXN0eWxlOiBpdGFsaWM7Cn0KLndhc2FiZWUtcG9wdXAucG9ydGFsIC51aS1kaWFsb2ctYnV0dG9uc2V0IHsKCWRpc3BsYXk6IGJveDsKCWRpc3BsYXk6IGZsZXg7CgltYXJnaW4tdG9wOiA2cHg7Cn0KLndhc2FiZWUtcG9wdXAucG9ydGFsIC51aS1kaWFsb2ctYnV0dG9uc2V0IGJ1dHRvbiB7CglmbGV4LWdyb3c6IDE7Cglib3gtZ3JvdzogMTsKfQoud2FzYWJlZS1wb3B1cCBpbWcuYXZhdGFyIHsKCW1heC13aWR0aDogOTZweDsKCW1heC1oZWlnaHQ6IDk2cHg7CgltYXJnaW4tbGVmdDogNHB4OwoJZmxvYXQ6IHJpZ2h0Owp9Cgoud2FzYWJlZS1rZXlzLW92ZXJsYXksIC53YXNhYmVlLWFnZW50LWxhYmVsLCAud2FzYWJlZS1wb2x5Z29uLWxhYmVsIHsKCWNvbG9yOiAjRkZGRkJCOwoJZm9udC1zaXplOiAxMnB4OwoJbGluZS1oZWlnaHQ6IDE2cHg7Cgl0ZXh0LWFsaWduOiBjZW50ZXI7CglwYWRkaW5nOiAycHg7CglvdmVyZmxvdzogaGlkZGVuOwoJd2hpdGUtc3BhY2U6IG5vd3JhcDsKCXRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzOwoJdGV4dC1zaGFkb3c6IDFweCAxcHggIzAwMCwgMXB4IC0xcHggIzAwMCwgLTFweCAxcHggIzAwMCwgLTFweCAtMXB4ICMwMDAsIDAgMCA1cHggIzAwMDsKCXBvaW50ZXItZXZlbnRzOm5vbmU7Cn0KLndhc2FiZWUta2V5cy1vdmVybGF5IHsKCWxpbmUtaGVpZ2h0OiAyMXB4OwoJdmVydGljYWwtYWxpZ246IG1pZGRsZTsKCWZvbnQtc2l6ZTogMTRweDsKCWZvbnQtd2VpZ2h0OiBib2xkOwp9Ci53YXNhYmVlLXBvbHlnb24tbGFiZWwgewoJdmVydGljYWwtYWxpZ246IG1pZGRsZTsKCWZvbnQtd2VpZ2h0OiBib2xkZXI7Cgl0ZXh0LXNoYWRvdzogMCAwIDFweCB3aGl0ZTsKfQoud2FzYWJlZS1wb2x5Z29uLWxhYmVsIHAsCi53YXNhYmVlLXBvbHlnb24tbGFiZWwgdWwgewoJbWFyZ2luOiAwOwoJb3ZlcmZsb3c6IGhpZGRlbjsKCXRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzOwp9Cgoud2FzYWJlZS1vdmVyZmxvdy1idXR0b24gewoJZGlzcGxheTogaW5saW5lLWJveDsKCWRpc3BsYXk6IGlubGluZS1mbGV4OwoJbWluLXdpZHRoOiAyNHB4OwoJbWluLWhlaWdodDogMjBweDsKCXRleHQtYWxpZ246IGNlbnRlcjsKCXZlcnRpY2FsLWFsaWduOiBtaWRkbGU7Cglmb250LXdlaWdodDogYm9sZDsKCXRleHQtZGVjb3JhdGlvbjogbm9uZSAhaW1wb3J0YW50OwoJY29sb3I6ICNmZmNlMDA7CgljdXJzb3I6IHBvaW50ZXI7CglhbGlnbi1pdGVtczogY2VudGVyOwoJanVzdGlmeS1jb250ZW50OiBjZW50ZXI7Cn0KLndhc2FiZWUtb3ZlcmZsb3ctYnV0dG9uIHNwYW4gewoJZmxleDogMCAwIGF1dG87Cglib3g6IDAgMCBhdXRvOwp9Ci53YXNhYmVlLW92ZXJmbG93LW1lbnUgewoJYm9yZGVyOiAxcHggc29saWQgIzIwYThiMTsKCWJhY2tncm91bmQ6IHJnYmEoOCwgNDgsIDc4LCAwLjkpOwoJY29sb3I6ICNmZmNlMDA7CglwYWRkaW5nOiAwOwoJbWFyZ2luOiAwOwoJcG9zaXRpb246IGFic29sdXRlOwoJbGlzdC1zdHlsZTogbm9uZTsKCXotaW5kZXg6IDMwMDAwOwoJbWF4LWhlaWdodDogNzAlOwoJbWF4LXdpZHRoOiAyNWVtOwoJb3ZlcmZsb3cteTogYXV0bzsKCW92ZXJmbG93LXg6IGhpZGRlbjsKfQoud2FzYWJlZS1vdmVyZmxvdy1tZW51IGEgewoJZGlzcGxheTogYmxvY2s7CglwYWRkaW5nOiAwLjVlbTsKCW1pbi13aWR0aDogOGVtOwoJdGV4dC1kZWNvcmF0aW9uOiBub25lOwoJb3V0bGluZTogMCB0cmFuc3BhcmVudCBub25lICFpbXBvcnRhbnQ7Cn0KLndhc2FiZWUtb3ZlcmZsb3ctbWVudSBhOmhvdmVyIHsKCXRleHQtZGVjb3JhdGlvbjogbm9uZTsKCWJhY2tncm91bmQtY29sb3I6IHJnYmEoMzIsIDE2OCwgMTc3LCAwLjcpOwp9Ci53YXNhYmVlLW92ZXJmbG93LW1lbnUgYTpmb2N1cywKLndhc2FiZWUtb3ZlcmZsb3ctbWVudSBhOmFjdGl2ZSB7Cgl0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTsKfQoKesmad1pe3LLasS53YXNhYmVlLXRhYmxlIHsKCWJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7CgllbXB0eS1jZWxsczogc2hvdzsKCXdpZHRoOiAxMDAlOwoJY2xlYXI6IGJvdGg7Cn0KLndhc2FiZWUtdGFibGUgdGQsIC53YXNhYmVlLXRhYmxlIHRoIHsKCWJvcmRlci13aWR0aDogMCAxcHg7Cglib3JkZXItc3R5bGU6IHNvbGlkOwoJYm9yZGVyLWNvbG9yOiByZ2JhKDgsIDQ4LCA3OCwgMC43NSk7CglwYWRkaW5nOiAzcHggNHB4OwoJdGV4dC1hbGlnbjogbGVmdDsKfQoud2FzYWJlZS10YWJsZSB0ZDpmaXJzdC1jaGlsZCwgLndhc2FiZWUtdGFibGUgdGg6Zmlyc3QtY2hpbGQgeyBib3JkZXItbGVmdC13aWR0aDogMDsgfQoud2FzYWJlZS10YWJsZSB0ZDpsYXN0LWNoaWxkLCAgLndhc2FiZWUtdGFibGUgdGg6bGFzdC1jaGlsZCB7IGJvcmRlci1yaWdodC13aWR0aDogMDsgfQoud2FzYWJlZS10YWJsZSB0Ym9keSB0cjpudGgtY2hpbGQoMm4rMSkgdGQgewoJYm9yZGVyLWNvbG9yOiByZ2JhKDI1LCA2MywgOTUsIDAuNzUpOwp9Ci53YXNhYmVlLXRhYmxlIHRyIHsKCWJhY2tncm91bmQ6IHJnYmEoMjUsIDYzLCA5NSwgMC43NSk7Cn0KLndhc2FiZWUtdGFibGUgdGJvZHkgdHI6bnRoLWNoaWxkKDJuKzEpIHsKCWJhY2tncm91bmQ6IHJnYmEoOCwgNDgsIDc4LCAwLjc1KTsKfQoud2FzYWJlZS10YWJsZSA+IHRoZWFkIC5zb3J0YWJsZSB7CgljdXJzb3I6IHBvaW50ZXI7Cn0KLndhc2FiZWUtdGFibGUgPiB0aGVhZCAuc29ydGVkIHsKCWNvbG9yOiAjZmZjZTAwOwp9Ci53YXNhYmVlLXRhYmxlID4gdGhlYWQgLnNvcnRhYmxlOmJlZm9yZSB7Cgljb250ZW50OiAiICI7CglkaXNwbGF5OiBpbmxpbmUtYmxvY2s7CglmbG9hdDogcmlnaHQ7CgltaW4td2lkdGg6IDFlbTsKCXRleHQtYWxpZ246IHJpZ2h0Owp9Ci53YXNhYmVlLXRhYmxlID4gdGhlYWQgLnNvcnRhYmxlLmFzYzpiZWZvcmUgewoJY29udGVudDogIlwyNWIyIjsKfQoud2FzYWJlZS10YWJsZSA+IHRoZWFkIC5zb3J0YWJsZS5kZXNjOmJlZm9yZSB7Cgljb250ZW50OiAiXDI1YmMiOwp9Ci53YXNhYmVlLXRhYmxlIHRkLm1lbnUgewoJcG9zaXRpb246IHJlbGF0aXZlOwoJbWluLWhlaWdodDogMjBweDsKCW1pbi13aWR0aDogMjRweDsKfQoud2FzYWJlZS10YWJsZSB0ZC5tZW51ID4gLndhc2FiZWUtb3ZlcmZsb3ctYnV0dG9uIHsKCXBvc2l0aW9uOiBhYnNvbHV0ZTsKCXRvcDogMDsKCWxlZnQ6IDA7CglyaWdodDogMDsKCWJvdHRvbTogMDsKCWRpc3BsYXk6IGZsZXg7Cn0KCi53YXNhYmVlLWRpYWxvZy1wb3J0YWxsaXN0IC5rZXlzLAoud2FzYWJlZS1kaWFsb2ctcG9ydGFsbGlzdCAubGlua3MgewoJd2lkdGg6IDMuNWVtOyAvKiB3aWxsIGV4cGFuZCB0byBmaXQgY29udGVudCAqLwoJdGV4dC1hbGlnbjogcmlnaHQ7Cn0KLndhc2FiZWUtZGlhbG9nLXBvcnRhbGxpc3QgLndhcm4gewoJY29sb3I6ICNmZjA7CglmbG9hdDogbGVmdDsKCWZvbnQtc2l6ZTogMS41ZW07Cglmb250LXdlaWdodDogYm9sZDsKfQoud2FzYWJlZS1kaWFsb2ctcG9ydGFsbGlzdCAud2Fybi5lcnJvciB7Cgljb2xvcjogI2YwMDsKfQoKLyogc3R5bGUuY3NzIHNldHMgZGlhbG9nIG1heC13aWR0aCB0byA3MDBweCAtIG92ZXJyaWRlIHRoYXQgaGVyZSAqLwoud2FzYWJlZS1kaWFsb2ctbGlua2xpc3QgewoJbWF4LXdpZHRoOiAxMDAwcHggIWltcG9ydGFudDsKfQoud2FzYWJlZS1kaWFsb2ctcG9ydGFsbGlzdCA+IC51aS1kaWFsb2ctY29udGVudCwKLndhc2FiZWUtZGlhbG9nLWxpbmtsaXN0ID4gLnVpLWRpYWxvZy1jb250ZW50LAoud2FzYWJlZS1kaWFsb2ctYWxlcnRsaXN0ID4gLnVpLWRpYWxvZy1jb250ZW50IHsKCXBhZGRpbmc6IDA7Cn0KLndhc2FiZWUtZGlhbG9nLWxpbmtsaXN0IC53YXNhYmVlLWxheWVyIHsKCW1hcmdpbjogLTRweCAwIC00cHggLTRweDsKfQoud2FzYWJlZS1kaWFsb2ctbGlua2xpc3QgdGQua2V5cywKLndhc2FiZWUtZGlhbG9nLWxpbmtsaXN0IHRkLmxlbmd0aCB7Cgl0ZXh0LWFsaWduOiByaWdodDsKfQoKLndhc2FiZWUtZGlhbG9nLWFsZXJ0bGlzdCB0ZCB7Cgl2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7Cn0KLndhc2FiZWUtZGlhbG9nLWFsZXJ0bGlzdCAuYXNzaWduZWUgewoJd2hpdGUtc3BhY2U6IG5vd3JhcDsKCW92ZXJmbG93OiBoaWRkZW47Cgl0ZXh0LW92ZXJmbG93OiBlbGxpcHNpczsKCW1heC13aWR0aDogMTBlbTsKfQoud2FzYWJlZS1kaWFsb2ctYWxlcnRsaXN0IC5yZXNvbHZlZCBidXR0b24gewoJbWFyZ2luOiAtM3B4IDA7CglwYWRkaW5nOiAwIDAuNWVtIDFweDsKfQoKI3dhc2FiZWUtZmFrZS1idXR0b24gewoJcG9zaXRpb246IGFic29sdXRlOwoJdG9wOiAtOTk5OWVtOwoJbGVmdDogLTk5OTllbTsKfQoKLndhc2FiZWUtYWxlcnRzLW51bSB7Cgljb2xvcjogIzAwRkYwMDsKfQoud2FzYWJlZS1hbGVydHMtbnVtLm5ldyB7Cgljb2xvcjogI2ZmMDAwMDsKCWZvbnQtd2VpZ2h0OiBib2xkOwp9Cgoud2FzYWJlZS1hZ2VudHNlbGVjdCAud2FzYWJlZS1ncm91cC1pbmRpY2F0b3IgewoJZmxvYXQ6IHJpZ2h0OwoJbWFyZ2luLWxlZnQ6IDAuMjVlbTsKfQoKLndhc2FiZWUtZ3JvdXAtY29udGFpbmVyIHsKCWJvcmRlcjogMXB4IHNvbGlkIGN1cnJlbnRDb2xvcjsKCWRpc3BsYXk6IGlubGluZS1ibG9jazsKCWhlaWdodDogMS4yZW07CglsaW5lLWhlaWdodDogMS4yZW07CgltYXJnaW46IDFweCAwLjI1ZW0gMXB4IDA7CglwYWRkaW5nOiAwIDAuMjVlbTsKfQoud2FzYWJlZS1ncm91cC1jb250YWluZXIgPiAud2FzYWJlZS1ncm91cC1pbmRpY2F0b3IgewoJbWFyZ2luLWxlZnQ6IC0wLjI1ZW07CgltYXJnaW4tcmlnaHQ6IDAuMjVlbTsKCWhlaWdodDogMS4yZW07Cgl3aWR0aDogMS4yZW07Cn0KCi53YXNhYmVlLWdyb3VwLWluZGljYXRvciB7CglkaXNwbGF5OiBpbmxpbmUtYmxvY2s7Cglwb3NpdGlvbjogcmVsYXRpdmU7Cgl3aWR0aDogMWVtOwoJaGVpZ2h0OiAxZW07Cgl2ZXJ0aWNhbC1hbGlnbjogdG9wOwp9Ci53YXNhYmVlLWdyb3VwLWluZGljYXRvciA+IGRpdiB7CgloZWlnaHQ6IDFlbTsKCWZsb2F0OiBsZWZ0Owp9Cgoud2FzYWJlZS1wb3B1cCB7CgltYXgtd2lkdGg6IDMwMHB4Owp9Ci53YXNhYmVlLWRpYWxvZyAuZGVzYyBwLAoud2FzYWJlZS1kaWFsb2cgLmRlc2MgdWwsCi53YXNhYmVlLXBvcHVwIHAsCi53YXNhYmVlLXBvcHVwIHVsIHsKCW1hcmdpbjogMDsKfQoud2FzYWJlZS1wb3B1cCBhIHsKCWNvbG9yOiAjMDA5OUNDOwp9Ci53YXNhYmVlLWRpYWxvZyAuZGVzYyB1bCwKLndhc2FiZWUtcG9seWdvbi1sYWJlbCB1bCwKLndhc2FiZWUtcG9wdXAgLmRlc2MgdWwgewoJcGFkZGluZy1sZWZ0OiAxLjVlbTsKfQoud2FzYWJlZS1kaWFsb2cgLmRlc2MgZW0sCi53YXNhYmVlLXBvbHlnb24tbGFiZWwgZW0sCi53YXNhYmVlLXBvcHVwIC5kZXNjIGVtIHsKCWNvbG9yOiBpbmhlcml0OwoJZm9udC1zdHlsZTogaXRhbGljOwp9Ci53YXNhYmVlLXBvcHVwLnBvcnRhbCAudWktZGlhbG9nLWJ1dHRvbnNldCB7CglkaXNwbGF5OiBib3g7CglkaXNwbGF5OiBmbGV4OwoJbWFyZ2luLXRvcDogNnB4Owp9Ci53YXNhYmVlLXBvcHVwLnBvcnRhbCAudWktZGlhbG9nLWJ1dHRvbnNldCBidXR0b24gewoJZmxleC1ncm93OiAxOwoJYm94LWdyb3c6IDE7Cn0KLndhc2FiZWUtcG9wdXAgaW1nLmF2YXRhciB7CgltYXgtd2lkdGg6IDk2cHg7CgltYXgtaGVpZ2h0OiA5NnB4OwoJbWFyZ2luLWxlZnQ6IDRweDsKCWZsb2F0OiByaWdodDsKfQoKLndhc2FiZWUta2V5cy1vdmVybGF5LCAud2FzYWJlZS1hZ2VudC1sYWJlbCwgLndhc2FiZWUtcG9seWdvbi1sYWJlbCB7Cgljb2xvcjogI0ZGRkZCQjsKCWZvbnQtc2l6ZTogMTJweDsKCWxpbmUtaGVpZ2h0OiAxNnB4OwoJdGV4dC1hbGlnbjogY2VudGVyOwoJcGFkZGluZzogMnB4OwoJb3ZlcmZsb3c6IGhpZGRlbjsKCXdoaXRlLXNwYWNlOiBub3dyYXA7Cgl0ZXh0LW92ZXJmbG93OiBlbGxpcHNpczsKCXRleHQtc2hhZG93OiAxcHggMXB4ICMwMDAsIDFweCAtMXB4ICMwMDAsIC0xcHggMXB4ICMwMDAsIC0xcHggLTFweCAjMDAwLCAwIDAgNXB4ICMwMDA7Cglwb2ludGVyLWV2ZW50czpub25lOwp9Ci53YXNhYmVlLWtleXMtb3ZlcmxheSB7CglsaW5lLWhlaWdodDogMjFweDsKCXZlcnRpY2FsLWFsaWduOiBtaWRkbGU7Cglmb250LXNpemU6IDE0cHg7Cglmb250LXdlaWdodDogYm9sZDsKfQoud2FzYWJlZS1wb2x5Z29uLWxhYmVsIHsKCXZlcnRpY2FsLWFsaWduOiBtaWRkbGU7Cglmb250LXdlaWdodDogYm9sZGVyOwoJdGV4dC1zaGFkb3c6IDAgMCAxcHggd2hpdGU7Cn0KLndhc2FiZWUtcG9seWdvbi1sYWJlbCBwLAoud2FzYWJlZS1wb2x5Z29uLWxhYmVsIHVsIHsKCW1hcmdpbjogMDsKCW92ZXJmbG93OiBoaWRkZW47Cgl0ZXh0LW92ZXJmbG93OiBlbGxpcHNpczsKfQoKLndhc2FiZWUtb3ZlcmZsb3ctYnV0dG9uIHsKCWRpc3BsYXk6IGlubGluZS1ib3g7CglkaXNwbGF5OiBpbmxpbmUtZmxleDsKCW1pbi13aWR0aDogMjRweDsKCW1pbi1oZWlnaHQ6IDIwcHg7Cgl0ZXh0LWFsaWduOiBjZW50ZXI7Cgl2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlOwoJZm9udC13ZWlnaHQ6IGJvbGQ7Cgl0ZXh0LWRlY29yYXRpb246IG5vbmUgIWltcG9ydGFudDsKCWNvbG9yOiAjZmZjZTAwOwoJY3Vyc29yOiBwb2ludGVyOwoJYWxpZ24taXRlbXM6IGNlbnRlcjsKCWp1c3RpZnktY29udGVudDogY2VudGVyOwp9Ci53YXNhYmVlLW92ZXJmbG93LWJ1dHRvbiBzcGFuIHsKCWZsZXg6IDAgMCBhdXRvOwoJYm94OiAwIDAgYXV0bzsKfQoud2FzYWJlZS1vdmVyZmxvdy1tZW51IHsKCWJvcmRlcjogMXB4IHNvbGlkICMyMGE4YjE7CgliYWNrZ3JvdW5kOiByZ2JhKDgsIDQ4LCA3OCwgMC45KTsKCWNvbG9yOiAjZmZjZTAwOwoJcGFkZGluZzogMDsKCW1hcmdpbjogMDsKCXBvc2l0aW9uOiBhYnNvbHV0ZTsKCWxpc3Qtc3R5bGU6IG5vbmU7Cgl6LWluZGV4OiAzMDAwMDsKCW1heC1oZWlnaHQ6IDcwJTsKCW1heC13aWR0aDogMjVlbTsKCW92ZXJmbG93LXk6IGF1dG87CglvdmVyZmxvdy14OiBoaWRkZW47Cn0KLndhc2FiZWUtb3ZlcmZsb3ctbWVudSBhIHsKCWRpc3BsYXk6IGJsb2NrOwoJcGFkZGluZzogMC41ZW07CgltaW4td2lkdGg6IDhlbTsKCXRleHQtZGVjb3JhdGlvbjogbm9uZTsKCW91dGxpbmU6IDAgdHJhbnNwYXJlbnQgbm9uZSAhaW1wb3J0YW50Owp9Ci53YXNhYmVlLW92ZXJmbG93LW1lbnUgYTpob3ZlciB7Cgl0ZXh0LWRlY29yYXRpb246IG5vbmU7CgliYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDMyLCAxNjgsIDE3NywgMC43KTsKfQoud2FzYWJlZS1vdmVyZmxvdy1tZW51IGE6Zm9jdXMsCi53YXNhYmVlLW92ZXJmbG93LW1lbnUgYTphY3RpdmUgewoJdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7Cn0="
            es.ui = "data:text/css;base64,Ym9keS5wcml2YWN5X2FjdGl2ZSAud2FzYWJlZS10b29sYmFyIHsKCWRpc3BsYXk6IG5vbmU7Cn0KCiN3YXNhYmVlLWJ0bi1zeW5jLnJ1bm5pbmcgewoJLXdlYmtpdC1hbmltYXRpb24tZHVyYXRpb246IDFzOwoJICAgICAgICBhbmltYXRpb24tZHVyYXRpb246IDFzOwoJLXdlYmtpdC1hbmltYXRpb24tbmFtZTogd2FzYWJlZS1zeW5jLXJ1bm5pbmc7CgkgICAgICAgIGFuaW1hdGlvbi1uYW1lOiB3YXNhYmVlLXN5bmMtcnVubmluZzsKCS13ZWJraXQtYW5pbWF0aW9uLXRpbWluZy1mdW5jdGlvbjogbGluZWFyOwoJICAgICAgICBhbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uOiBsaW5lYXI7Cgktd2Via2l0LWFuaW1hdGlvbi1pdGVyYXRpb24tY291bnQ6IGluZmluaXRlOwoJICAgICAgICBhbmltYXRpb24taXRlcmF0aW9uLWNvdW50OiBpbmZpbml0ZTsKfQpALXdlYmtpdC1rZXlmcmFtZXMgd2FzYWJlZS1zeW5jLXJ1bm5pbmcgewoJMCUgewoJCS13ZWJraXQtdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7CgkJICAgICAgICB0cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTsKCX0KCTEwMCUgewoJCS13ZWJraXQtdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTsKCQkgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7Cgl9Cn0KQGtleWZyYW1lcyB3YXNhYmVlLXN5bmMtcnVubmluZyB7CgkwJSB7CgkJLXdlYmtpdC10cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTsKCQkgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpOwoJfQoJMTAwJSB7CgkJLXdlYmtpdC10cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpOwoJCSAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTsKCX0KfQoKI3dhc2FiZWUtbWVudS1jb25maWcgewoJZGlzcGxheTogYm94OyAvKiBvbGQgdmFsdWUsIGZvciBBbmRyb2lkICovCglkaXNwbGF5OiBmbGV4OwoJbWFyZ2luOiAtMTJweDsKCXBvc2l0aW9uOiByZWxhdGl2ZTsKfQojd2FzYWJlZS1tZW51LWNvbmZpZy5tb2JpbGUgewoJYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7CglwYWRkaW5nOiAwOwoJYm9yZGVyOiAwIG5vbmU7CgltYXJnaW46IDA7CgloZWlnaHQ6IDEwMCU7Cgl3aWR0aDogMTAwJTsKCWxlZnQ6IDA7Cgl0b3A6IDA7Cglwb3NpdGlvbjogYWJzb2x1dGU7CglvdmVyZmxvdzogYXV0bzsKfQojd2FzYWJlZS1tZW51LWNvbmZpZyAucHJvZ3Jlc3MgewoJcG9zaXRpb246IGFic29sdXRlOwoJdG9wOiAwOwoJbGVmdDogMDsKCXJpZ2h0OiAwOwoJaGVpZ2h0OiAzcHg7CgliYWNrZ3JvdW5kLWNvbG9yOiAjRUVFRUVFOwoJZGlzcGxheTogbm9uZTsKfQojd2FzYWJlZS1tZW51LWNvbmZpZy5zaG93cHJvZ3Jlc3MgLnByb2dyZXNzIHsKCWRpc3BsYXk6IGJsb2NrOwp9CiN3YXNhYmVlLW1lbnUtY29uZmlnIC5wcm9ncmVzcyAucHJvZ3Jlc3MtdmFsdWUgewoJcG9zaXRpb246IGFic29sdXRlOwoJdG9wOiAwOwoJbGVmdDogMDsKCWhlaWdodDogMTAwJTsKCWJhY2tncm91bmQtY29sb3I6ICNGRkNFMDA7Cgl3aWR0aDogMCU7Cn0KI3dhc2FiZWUtbWVudS1jb25maWcgbmF2IHsKCWRpc3BsYXk6IGJsb2NrOwoJbWluLWhlaWdodDogMTUwcHg7Cgl3aWR0aDogMTUwcHg7Cglib3JkZXItcmlnaHQ6IDFweCBzb2xpZCAjMjBBOEIxOwoJdmVydGljYWwtYWxpZ246IHRvcDsKCWZsZXgtc2hyaW5rOiAwOwoJZmxleC1ncm93OiAwOwoJYm94LXNocmluazogMDsKCWJveC1ncm93OiAwOwp9CiN3YXNhYmVlLW1lbnUtY29uZmlnIC50YWJzIHsKCXBvc2l0aW9uOiByZWxhdGl2ZTsKCXBhZGRpbmc6IDEwcHg7CglmbGV4LXNocmluazogMTsKCWZsZXgtZ3JvdzogMTsKCWJveC1zaHJpbms6IDE7Cglib3gtZ3JvdzogMTsKCS8qIG1heC13aWR0aDogMzIwcHg7ICovCn0KI3dhc2FiZWUtbWVudS1jb25maWcgbmF2IGEgewoJY29sb3I6IHdoaXRlOwoJcGFkZGluZzogMC41ZW07CglkaXNwbGF5OiBibG9jazsKCXRleHQtd2VpZ2h0OiBib2xkOwoJYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICMyMEE4QjE7Cgl0ZXh0LWRlY29yYXRpb246IG5vbmU7Cn0KI3dhc2FiZWUtbWVudS1jb25maWcgbmF2IGE6bGFzdC1jaGlsZCB7Cglib3JkZXItYm90dG9tLXdpZHRoOiAwOwp9CiN3YXNhYmVlLW1lbnUtY29uZmlnIG5hdiBhOmhvdmVyIHsKCWJhY2tncm91bmQtY29sb3I6ICMwODNDNEU7Cn0KI3dhc2FiZWUtbWVudS1jb25maWcgbmF2IGEuY2xpY2tlZCB7CgliYWNrZ3JvdW5kLWNvbG9yOiAjMjBBOEIxOwp9CiN3YXNhYmVlLW1lbnUtY29uZmlnIHNlY3Rpb24gaDIgewoJZm9udC1zaXplOiAxOHB4OwoJbWFyZ2luOiAwIDAgMC40ZW0gMDsKCXBhZGRpbmc6IDA7Cn0KI3dhc2FiZWUtbWVudS1jb25maWcgc2VjdGlvbiBoMiBzbWFsbCB7Cgljb2xvcjogI0NDQ0NDQzsKCXZlcnRpY2FsLWFsaWduOiB0b3A7Cn0KI3dhc2FiZWUtbWVudS1jb25maWcgaHIgewoJYm9yZGVyOiAwOwoJaGVpZ2h0OiAxcHg7CgliYWNrZ3JvdW5kLWNvbG9yOiAjMjBBOEIxCn0KI3dhc2FiZWUtbWVudS1jb25maWcgZmllbGRzZXQgewoJYm9yZGVyOiAxcHggc29saWQgIzIwYThiMTsKCXBhZGRpbmc6IDAgMC42MjVlbTsKfQojd2FzYWJlZS1tZW51LWNvbmZpZyBsZWdlbmQgewoJY29sb3I6ICNmZmNlMDA7Cglmb250LXdlaWdodDogYm9sZDsKfQojd2FzYWJlZS1tZW51LWNvbmZpZyBwIHsKCW1hcmdpbjogMC41ZW0gMDsKfQojd2FzYWJlZS1tZW51LWNvbmZpZyBsYWJlbCB7CglkaXNwbGF5OiBibG9jazsKfQojd2FzYWJlZS1tZW51LWNvbmZpZyBsYWJlbCBpbnB1dCB7Cgl2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlOwoJbWFyZ2luOiAwIDAuMmVtOwp9CiN3YXNhYmVlLW1lbnUtY29uZmlnLXNlbGVjdCB7CglkaXNwbGF5OiBub25lOwoJZmxleC1zaHJpbms6IDA7CglmbGV4LWdyb3c6IDA7Cglib3gtc2hyaW5rOiAwOwoJYm94LWdyb3c6IDA7CglwYWRkaW5nOiA1cHggMTBweCAwOwp9CiN3YXNhYmVlLW1lbnUtY29uZmlnLXNlbGVjdCBzZWxlY3QgewoJcGFkZGluZzogN3B4Owp9CiN3YXNhYmVlLW1lbnUtY29uZmlnLXNlbGVjdCBociB7CgltYXJnaW46IDVweCAtMTBweCAwOwp9CkBtZWRpYSAobWF4LXdpZHRoOiA5NTlweCkgewoJI3dhc2FiZWUtbWVudS1jb25maWcgewoJCWZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CgkJYm94LWRpcmVjdGlvbjogY29sdW1uOwoJfQoJI3dhc2FiZWUtbWVudS1jb25maWcgbmF2IHsKCQlkaXNwbGF5OiBub25lOwoJfQoJI3dhc2FiZWUtbWVudS1jb25maWctc2VsZWN0IHsKCQlkaXNwbGF5OiBibG9jazsKCX0KfQoKLndhc2FiZWUtZGlhbG9nIC51aS1kaWFsb2ctY29udGVudCBpbnB1dCwKLndhc2FiZWUtZGlhbG9nIC51aS1kaWFsb2ctY29udGVudCB0ZXh0YXJlYSB7Cglib3JkZXI6IDFweCBzb2xpZCAjMjBhOGIxOwoJY29sb3I6ICNmZmNlMDA7CgliYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuMyk7Cn0KLndhc2FiZWUtZGlhbG9nIHAgewoJbWFyZ2luOiAwIDAgNnB4Owp9Cgoud2FzYWJlZS1kaWFsb2ctcG9ydGFscyA+IC51aS1kaWFsb2ctY29udGVudCwKLndhc2FiZWUtZGlhbG9nLWxpbmsgPiAudWktZGlhbG9nLWNvbnRlbnQsCi53YXNhYmVlLWRpYWxvZy1wb2x5Z29uID4gLnVpLWRpYWxvZy1jb250ZW50IHsKCXBhZGRpbmc6IDZweCA2cHggMDsKfQoud2FzYWJlZS1kaWFsb2ctcG9ydGFscyAubmFtZSBsYWJlbCB7CglhbGlnbi1pdGVtczogYmFzZWxpbmU7CglkaXNwbGF5OiBmbGV4Owp9Ci53YXNhYmVlLWRpYWxvZy1wb3J0YWxzIC5uYW1lIGxhYmVsID4gKnsKCWZsZXgtZ3JvdzogMTsKCW1hcmdpbi1sZWZ0OiAwLjVlbTsKfQoud2FzYWJlZS1kaWFsb2cgdGV4dGFyZWEuZGVzYywKLndhc2FiZWUtZGlhbG9nIC5kZXNjIHRleHRhcmVhIHsKCWJveC1zaXppbmc6IGJvcmRlci1ib3g7Cgl3aWR0aDogMTAwJTsKCWhlaWdodDogNC41ZW07CglwYWRkaW5nOiAzcHg7CglyZXNpemU6IHZlcnRpY2FsOwp9Ci53YXNhYmVlLWRpYWxvZy1wb3J0YWxzIC5rZXlzIGlucHV0LAoud2FzYWJlZS1kaWFsb2ctbGluayAua2V5cyBpbnB1dCB7Cgl3aWR0aDogNmVtOwoJcGFkZGluZy1yaWdodDogMDsKfQoud2FzYWJlZS1kaWFsb2ctcG9ydGFscyAua2V5cyBpbnB1dCwKLndhc2FiZWUtZGlhbG9nLWxpbmsgLmtleXMgaW5wdXQgewoJbWFyZ2luLWxlZnQ6IDZweDsKfQoud2FzYWJlZS1kaWFsb2ctcG9ydGFscyAuZGV0YWlscywKLndhc2FiZWUtZGlhbG9nLWxpbmsgLmRldGFpbHMsCi53YXNhYmVlLWRpYWxvZy1wb2x5Z29uIC5kZXRhaWxzIHsKCWRpc3BsYXk6IGJveDsKCWRpc3BsYXk6IGZsZXg7CglhbGlnbi1pdGVtczogY2VudGVyOwp9Ci53YXNhYmVlLWRpYWxvZy1wb3J0YWxzIC53YXNhYmVlLWxheWVyLAoud2FzYWJlZS1kaWFsb2ctbGluayAud2FzYWJlZS1sYXllciwKLndhc2FiZWUtZGlhbG9nLXBvbHlnb24gLndhc2FiZWUtbGF5ZXIgewoJbWFyZ2luLWxlZnQ6IDEycHg7CglmbGV4OiAxIDEgYXV0bzsKCWJveDogMSAxIGF1dG87Cn0KLndhc2FiZWUtZGlhbG9nLXBvcnRhbHMgLnBvc2l0aW9ud2FybmluZy5oaWRkZW4gewoJZGlzcGxheTogbm9uZTsKfQoud2FzYWJlZS1kaWFsb2ctcG9ydGFscyAucG9zaXRpb253YXJuaW5nIHsKCWJhY2tncm91bmQtY29sb3I6IHllbGxvdzsKCWJvcmRlcjogMnB4IHNvbGlkIHJlZDsKCWNvbG9yOiByZWQ7Cglmb250LXdlaWdodDogYm9sZDsKCXBhZGRpbmc6IDAuM2VtOwp9Cgoud2FzYWJlZS1kaWFsb2ctbGluayAubGlua3BvcnRhbHMgewoJZGlzcGxheTogYm94OwoJZGlzcGxheTogZmxleDsKCW1hcmdpbjogMCAtNnB4IDZweDsKfQoud2FzYWJlZS1kaWFsb2ctbGluayAubGlua3BvcnRhbHMgPiBzcGFuIHsKCWZsZXg6IDEgMSA1MCU7Cglib3g6IDEgMSA1MCU7CgltYXJnaW46IDAgNnB4Owp9Cgoud2FzYWJlZS1kaWFsb2ctbGlua3MgPiAudWktZGlhbG9nLWNvbnRlbnQgewoJcGFkZGluZzogMDsKfQoud2FzYWJlZS1kaWFsb2ctbGlua3MgPiAudWktZGlhbG9nLWNvbnRlbnQgPiBkaXYgewoJZGlzcGxheTogZmxleDsKCWZsZXgtZGlyZWN0aW9uOiBjb2x1bW47Cn0KLndhc2FiZWUtZGlhbG9nLWxpbmtzIHRleHRhcmVhLmRlc2MgewoJbWFyZ2luOiA2cHggNnB4IDNweDsKCWhlaWdodDogMmVtOwoJd2lkdGg6IGF1dG87CglwYWRkaW5nOiA0cHg7Cn0KLndhc2FiZWUtZGlhbG9nLWxpbmtzIHRhYmxlIHsKCWJvcmRlci1zcGFjaW5nOiAwOwp9Ci53YXNhYmVlLWRpYWxvZy1saW5rcyB0ZCB7Cgl2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlOwoJd2hpdGUtc3BhY2U6IG5vd3JhcDsKCXBhZGRpbmc6IDFweCAxcHggMCAwOwp9Ci53YXNhYmVlLWRpYWxvZy1saW5rcyB0ZDpmaXJzdC1jaGlsZCwKLndhc2FiZWUtZGlhbG9nLWxpbmtzIC5hcnJvdyB7Cgl0ZXh0LWFsaWduOiBjZW50ZXI7Cgl3aWR0aDogMjBweDsKCWRpc3BsYXk6IGlubGluZS1ibG9jazsKfQoud2FzYWJlZS1kaWFsb2ctbGlua3MgaW5wdXRbdHlwZT0iY2hlY2tib3giXSB7CgltYXJnaW46IDA7Cgl2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlOwp9Ci53YXNhYmVlLWRpYWxvZy1saW5rcyB0YWJsZSBidXR0b24gewoJZGlzcGxheTogaW5saW5lLWJsb2NrOwoJcGFkZGluZzogMXB4IDRweDsKCWZvbnQtc2l6ZTogMWVtOwoJbGluZS1oZWlnaHQ6IDEuMjVlbTsKfQoud2FzYWJlZS1kaWFsb2ctbGlua3MgYnV0dG9uLnBvcnRhbC1kcm9wZG93biB7CglwYWRkaW5nOiAxcHggMHB4OwoJbWluLXdpZHRoOiAwOwoJYm9yZGVyLWxlZnQtd2lkdGg6IDA7Cn0KLndhc2FiZWUtZGlhbG9nLWxpbmtzIC5wb3J0YWwgewoJcGFkZGluZy1yaWdodDogNnB4OwoJcGFkZGluZy1sZWZ0OiAycHg7CgltYXgtd2lkdGg6IDE1MHB4OwoJb3ZlcmZsb3c6IGhpZGRlbjsKCXRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzOwp9Ci53YXNhYmVlLWRpYWxvZy1saW5rcyAuYnV0dG9uYmFyIHsKCWRpc3BsYXk6IGJveDsKCWRpc3BsYXk6IGZsZXg7CglhbGlnbi1pdGVtczogY2VudGVyOwoJanVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOwoJYm9yZGVyLXRvcDogMXB4IHNvbGlkICMyMGE4YjE7CgltYXJnaW46IDZweCAwIDAgLTZweDsKCXBhZGRpbmc6IDZweDsKfQoud2FzYWJlZS1kaWFsb2ctbGlua3MgLmJ1dHRvbmJhciA+IGxhYmVsIHsKCXdpZHRoOiA1ZW07Cn0KCi53YXNhYmVlLWRpYWxvZy1hbGVydHMgLnVpLWRpYWxvZy1jb250ZW50IHsKCW1pbi1oZWlnaHQ6IDAgIWltcG9ydGFudDsKfQoud2FzYWJlZS1kaWFsb2ctYWxlcnRzIC51aS1kaWFsb2ctY29udGVudCA+IGRpdiB7CgltYXJnaW46IC02cHg7Cn0KLndhc2FiZWUtZGlhbG9nLWFsZXJ0cyAuZmxleCB7CglkaXNwbGF5OiBib3g7IC8qIG9sZCB2YWx1ZSwgZm9yIEFuZHJvaWQgKi8KCWRpc3BsYXk6IGZsZXg7CglhbGlnbi1pdGVtczogY2VudGVyOwoJd2hpdGUtc3BhY2U6IG5vd3JhcDsKfQoud2FzYWJlZS1kaWFsb2ctYWxlcnRzIC5mbGV4ICogewoJZmxleDogMSAwIDA7Cglib3g6IDEgMCAwOwp9Ci53YXNhYmVlLWRpYWxvZy1hbGVydHMgLmZsZXggaW5wdXQgewoJYm9yZGVyOiAxcHggc29saWQgIzIwYThiMTsKCW1hcmdpbi1sZWZ0OiAwLjJlbTsKfQoud2FzYWJlZS1kaWFsb2ctYWxlcnRzIC5mbGV4IHNlbGVjdCB7Cgl3aWR0aDogMDsgLyogQ2hyb21lIHdvdWxkIGV4cGFuZCB0byBmaXQgdGhlIGNvbnRlbnRzIG90aGVyd2lzZSAqLwp9Ci53YXNhYmVlLXRhcmdldHNlbGVjdCB7CglkaXNwbGF5OiBmbGV4OwoJYWxpZ24taXRlbXM6IGJhc2VsaW5lOwp9Ci53YXNhYmVlLXRhcmdldHNlbGVjdCA+IHN0cm9uZyB7CglmbGV4OiAxIDAgMDsKCWJveDogMSAwIDA7CgltYXJnaW46IDAgMC4yZW07CglvdmVyZmxvdzogaGlkZGVuOwoJdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7Cgl3aGl0ZS1zcGFjZTogbm93cmFwOwp9Ci53YXNhYmVlLXRhcmdldHNlbGVjdCA+IC53YXNhYmVlLW92ZXJmbG93LWJ1dHRvbiB7CglhbGlnbi1zZWxmOiBzdHJldGNoOwoJYmFja2dyb3VuZC1jb2xvcjogcmdiYSg4LCA0OCwgNzgsIDAuOSk7Cglib3JkZXI6IDFweCBzb2xpZCAjZmZjZTAwOwoJY29sb3I6ICNmZmNlMDA7CglwYWRkaW5nOiAycHg7Cn0KCi53YXNhYmVlLWRpYWxvZy1wb2x5Z29uIC5kZXRhaWxzID4gLmNvbG9yIHsKCWRpc3BsYXk6IGlubGluZS1ib3g7CglkaXNwbGF5OiBpbmxpbmUtZmxleDsKCWFsaWduLWl0ZW1zOiBjZW50ZXI7Cn0KLndhc2FiZWUtZGlhbG9nLXBvbHlnb24gLmRldGFpbHMgPiAuY29sb3IgaW5wdXQsCi53YXNhYmVlLWRpYWxvZy1wb2x5Z29uIC5kZXRhaWxzID4gLmNvbG9yIC5zcC1yZXBsYWNlciB7CgltYXJnaW4tbGVmdDogMC41ZW07Cn0KCi53YXNhYmVlLWNvbG9yLXBpY2tlciAuc3AtaW5wdXQgewoJYm9yZGVyOiAxcHggc29saWQgIzY2NjsKCWJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50OwoJY29sb3I6ICMyMjI7Cn0KLndhc2FiZWUtY29sb3ItcGlja2VyIC5zcC1jZiB7CgltaW4taGVpZ2h0OiAwLjVlbTsKfQoKLndhc2FiZWUtbGF5ZXIgewoJZGlzcGxheTogaW5saW5lLWJveDsgLyogb2xkIHZhbHVlLCBmb3IgQW5kcm9pZCAqLwoJZGlzcGxheTogaW5saW5lLWZsZXg7CglhbGlnbi1pdGVtczogY2VudGVyOwp9Ci53YXNhYmVlLWxheWVyIGxhYmVsIHsKCW1hcmdpbi1yaWdodDogMC41ZW07Cn0KLndhc2FiZWUtbGF5ZXIubm9sYWJlbCBsYWJlbCB7CglkaXNwbGF5OiBub25lOwp9Ci53YXNhYmVlLWxheWVyIC5wcmV2aWV3IHsKCWRpc3BsYXk6IGlubGluZS1ibG9jazsKCXdpZHRoOiAwLjVyZW07CgltaW4taGVpZ2h0OiAyMHB4OwoJYWxpZ24tc2VsZjogc3RyZXRjaDsKfQoud2FzYWJlZS1sYXllciBzZWxlY3QsCi53YXNhYmVlLWxheWVyIC5vdXRwdXQgewoJZmxleDogMSAxIGF1dG87Cglib3g6IDEgMSBhdXRvOwoJLyogdGhlIHNlbGVjdCBoYXMgYSBkZWZhdWx0IHdpZHRoIHdoaWNoIHdlIHdhbnQgdG8gdW5zZXQgKi8KCW1pbi13aWR0aDogNmVtOwoJd2lkdGg6IDA7Cn0KLndhc2FiZWUtbGF5ZXIgLm91dHB1dCB7CgltaW4td2lkdGg6IDRlbTsKfQoud2FzYWJlZS1sYXllciBvcHRpb24gc3BhbiB7CglkaXNwbGF5OiBpbmxpbmUtYmxvY2s7CglmbG9hdDogbGVmdDsKCXZlcnRpY2FsLWFsaWduOiB0b3A7CgloZWlnaHQ6IDFlbTsKCXdpZHRoOiAxZW07CgltYXJnaW4tcmlnaHQ6IDAuMjVlbTsKfQoud2FzYWJlZS1sYXllciAub3V0cHV0IHsKCW1hcmdpbi1sZWZ0OiA0cHg7Cn0KCi51aS1kaWFsb2ctd2FzYWJlZS1jb3B5IHRleHRhcmVhIHsgd2lkdGg6OTYlOyBoZWlnaHQ6MjUwcHg7IHJlc2l6ZTp2ZXJ0aWNhbDsgfQoKLnRlbXAtb3AtZGlhbG9nID4gYSB7IGRpc3BsYXk6YmxvY2s7IGNvbG9yOiNmZmNlMDA7IGJvcmRlcjoxcHggc29saWQgI2ZmY2UwMDsgcGFkZGluZzozcHggMDsgbWFyZ2luOjEwcHggYXV0bzsgd2lkdGg6ODAlOyB0ZXh0LWFsaWduOmNlbnRlcjsgYmFja2dyb3VuZDpyZ2JhKDgsNDgsNzgsLjkpOyB9CgovKk9QIERJQUxPRyBTVEFSVFMqLwovKk9QIERJQUxPRyBTVEFSVFMqLwoKI29wLWRpYWxvZy10YWJzIC51aS10YWJzLnVpLXRhYnMtdmVydGljYWwgewogIHBhZGRpbmc6IDA7CiAgd2lkdGg6IDQyZW07Cn0KCiNvcC1kaWFsb2ctdGFicyAudWktdGFicy51aS10YWJzLXZlcnRpY2FsIC51aS13aWRnZXQtaGVhZGVyIHsKICBib3JkZXI6IG5vbmU7Cn0KCiNvcC1kaWFsb2ctdGFicyAudWktdGFicy51aS10YWJzLXZlcnRpY2FsIC51aS10YWJzLW5hdiB7CiAgZmxvYXQ6IGxlZnQ7CiAgd2lkdGg6IDEwZW07CiAgYmFja2dyb3VuZDogIzIwYThiMTsKICBib3JkZXItcmFkaXVzOiA0cHggMCAwIDRweDsKICBib3JkZXItcmlnaHQ6IDFweCBzb2xpZCAjMjBhOGIxOwp9Cgojb3AtZGlhbG9nLXRhYnMgLnVpLXRhYnMudWktdGFicy12ZXJ0aWNhbCAudWktdGFicy1uYXYgbGkgewogIGNsZWFyOiBsZWZ0OwogIHdpZHRoOiAxMDAlOwogIG1hcmdpbjogMC4yZW0gMDsKICBib3JkZXI6IDFweCBzb2xpZCAjMjBhOGIxOwogIGJvcmRlci13aWR0aDogMXB4IDAgMXB4IDFweDsKICBib3JkZXItcmFkaXVzOiA0cHggMCAwIDRweDsKICBvdmVyZmxvdzogaGlkZGVuOwogIHBvc2l0aW9uOiByZWxhdGl2ZTsKICByaWdodDogLTJweDsKICB6LWluZGV4OiAyOwogIGJhY2tncm91bmQ6ICMyMGE4YjE7Cn0KCiNvcC1kaWFsb2ctdGFicyAudWktdGFicy51aS10YWJzLXZlcnRpY2FsIC51aS10YWJzLW5hdiBsaSBhIHsKICBkaXNwbGF5OiBibG9jazsKICB3aWR0aDogMTAwJTsKICBwYWRkaW5nOiAwLjZlbSAxZW07CiAgY29sb3I6IHdoaXRlOwp9Cgojb3AtZGlhbG9nLXRhYnMgLnVpLXRhYnMudWktdGFicy12ZXJ0aWNhbCAudWktdGFicy1uYXYgbGkgYTpob3ZlciB7CiAgY3Vyc29yOiBwb2ludGVyOwp9Cgojb3AtZGlhbG9nLXRhYnMgLnVpLXRhYnMudWktdGFicy12ZXJ0aWNhbCAudWktdGFicy1uYXYgbGkudWktdGFicy1hY3RpdmUgewogIG1hcmdpbi1ib3R0b206IDAuMmVtOwogIHBhZGRpbmctYm90dG9tOiAwOwogIGJhY2tncm91bmQ6IHJnYmEoMjUsIDYzLCA5NSwgMC43NSk7Cn0KCiNvcC1kaWFsb2ctdGFicyAudWktdGFicy51aS10YWJzLXZlcnRpY2FsIC51aS10YWJzLW5hdiBsaTpsYXN0LWNoaWxkIHsKICBtYXJnaW4tYm90dG9tOiAxMHB4Owp9Cgojb3AtZGlhbG9nLXRhYnMgLnVpLXRhYnMudWktdGFicy12ZXJ0aWNhbCAudWktdGFicy1wYW5lbCB7CiAgZmxvYXQ6IGxlZnQ7CiAgd2lkdGg6IDI4ZW07CiAgYm9yZGVyLXJhZGl1czogMDsKICBwb3NpdGlvbjogbGVmdDsKICBsZWZ0OiAtMXB4Owp9Cgojb3AtZGlhbG9nLXRhYnMgLm9wLWRpYWxvZy1jb250ZW50LXBhbmUgewogIGJhY2tncm91bmQ6IHJnYmEoMjUsIDYzLCA5NSwgMSk7CiAgY29sb3I6IHdoaXRlOwogIHBhZGRpbmc6IDIwcHg7CiAgaGVpZ2h0OiAxMDAlOwogIGRpc3BsYXk6IGJsb2NrOwp9Cgojb3BlcmF0aW9uLWRpYWxvZy10YWJzIHsKICBiYWNrZ3JvdW5kOiByZ2JhKDI1LCA2MywgOTUsIDEpOwp9Cgojb3AtZGlhbG9nLXRhYnMgdWwgewogIGhlaWdodDogMzAwcHg7CiAgb3ZlcmZsb3cteTogc2Nyb2xsOwp9Cgojb3AtZGlhbG9nLXRhYnMgOjotd2Via2l0LXNjcm9sbGJhciB7CiAgd2lkdGg6IDBweDsKICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDsKICAvKiBtYWtlIHNjcm9sbGJhciB0cmFuc3BhcmVudCAqLwp9CgovKk9QIERJQUxPRyBFTkRTKi8K"
        }(b = scope.CSS || (scope.CSS = {}));
    }(Wasabee || (Wasabee = {}));

    !function (scope) {
        var b;
        !function (a) {
            a.OP_LIST_KEY = "OP_LIST_KEY";
            a.PASTE_LIST_KEY = "PASTE_LIST_KEY";
            a.SERVER_BASE_KEY = "https://server.wasabee.rocks:8443";
            a.SERVER_BASE_TEST_KEY = "https://server.wasabee.rocks:8444";
            a.INTEL_BASE_KEY = "https://intel.ingress.com/intel"
            a.CURRENT_EXPIRE_NUMERIC = 1209600000
            a.MARKER_TYPE_DESTROY = "DestroyPortalAlert"
            a.MARKER_TYPE_VIRUS = "UseVirusPortalAlert"
            a.MARKER_TYPE_DECAY = "LetDecayPortalAlert"
            a.DEFAULT_ALERT_TYPE = "DestroyPortalAlert"
            a.DEFAULT_OPERATION_COLOR = "groupa"
            a.BREAK_EXCEPTION = {};
            a.OP_RESTRUCTURE_KEY = "OP_RESTRUCTURE_KEY22"
            a.SERVER_OP_LIST_KEY = "SERVER_OP_LIST_KEY"
            a.SERVER_OWNED_OP_LIST_KEY = "SERVER_OWNED_OP_LIST_KEY"
        }(b = scope.Constants || (scope.Constants = {}));
    }(Wasabee || (Wasabee = {}));

    !function (scope) {
        scope.alertTypes = [{
            name: Wasabee.Constants.MARKER_TYPE_DESTROY,
            label: "destroy",
            color: "#CE3B37",
            markerIcon: scope.Images.marker_alert_destroy,
        }, {
            name: Wasabee.Constants.MARKER_TYPE_VIRUS,
            label: "use virus",
            color: "#8920C3",
            markerIcon: scope.Images.marker_alert_virus,
        }, {
            name: Wasabee.Constants.MARKER_TYPE_DECAY,
            label: "let decay",
            color: "#7D7D7D",
            markerIcon: scope.Images.marker_alert_decay
        }
      /*, {
        name : "CreateLinkAlert",
        label : "link",
        color : "#5994FF",
        markerIcon : data.Images.marker_alert_link,
      }, {
        name : "GotoPortalAlert",
        label : "go to",
        color : "#EDA032",
        markerIcon : data.Images.marker_alert_goto,
      }, {
        name : "UpgradePortalAlert",
        label : "upgrade",
        color : "#3679B4",
        markerIcon : data.Images.marker_alert_upgrade,
      }, {
        name : "FarmPortalAlert",
        label : "farm",
        color : "#53AD53",
        markerIcon : data.Images.marker_alert_farm,
      }, {
        name : "MessageAlert",
        label : "message",
        color : "transparent",
        markerIcon : data.Images.marker_alert_unknown,
      }*/]
    }(Wasabee || (Wasabee = {}));

    !function (scope) {
        scope.layerTypes = [{
            name: "main",
            displayName: "Red",
            color: "#FF0000",
            link: {
                dashArray: [5, 5, 1, 5],
                sharedKeysDashArray: [5, 5],
                opacity: 1,
                weight: 2
            },
            portal: {
                iconUrl: scope.Images.marker_layer_main
            }
        }, {
            name: "groupa",
            displayName: "Orange",
            color: "#ff6600",
            link: {
                dashArray: [5, 5, 1, 5],
                sharedKeysDashArray: [5, 5],
                opacity: 1,
                weight: 2
            },
            portal: {
                iconUrl: scope.Images.marker_layer_groupa
            }
        }, {
            name: "groupb",
            displayName: "Light Orange",
            color: "#ff9900",
            link: {
                dashArray: [5, 5, 1, 5],
                sharedKeysDashArray: [5, 5],
                opacity: 1,
                weight: 2
            },
            portal: {
                iconUrl: scope.Images.marker_layer_groupb
            }
        }, {
            name: "groupc",
            displayName: "Tan",
            color: "#BB9900",
            link: {
                dashArray: [5, 5, 1, 5],
                sharedKeysDashArray: [5, 5],
                opacity: 1,
                weight: 2
            },
            portal: {
                iconUrl: scope.Images.marker_layer_groupc
            }
        }, {
            name: "groupd",
            displayName: "Purple",
            color: "#bb22cc",
            link: {
                dashArray: [5, 5, 1, 5],
                sharedKeysDashArray: [5, 5],
                opacity: 1,
                weight: 2
            },
            portal: {
                iconUrl: scope.Images.marker_layer_groupd
            }
        }, {
            name: "groupe",
            displayName: "Teal",
            color: "#33cccc",
            link: {
                dashArray: [5, 5, 1, 5],
                sharedKeysDashArray: [5, 5],
                opacity: 1,
                weight: 2
            },
            portal: {
                iconUrl: scope.Images.marker_layer_groupe
            }
        }, {
            name: "groupf",
            displayName: "Pink",
            color: "#ff55ff",
            link: {
                dashArray: [5, 5, 1, 5],
                sharedKeysDashArray: [5, 5],
                opacity: 1,
                weight: 2
            },
            portal: {
                iconUrl: scope.Images.marker_layer_groupf
            }
        }]
    }(Wasabee || (Wasabee = {}));

    !function (scope) {
        var linkDialogFunc = function () {
            function init(op) {
                var self = this;
                self.clearLocalPortalSelections()
                this._portals = {};
                this._links = [];
                this._operation = op;
                init._dialogs.push(this);
                var container = document.createElement("div");
                this._desc = container.appendChild(document.createElement("textarea"));
                this._desc.placeholder = "Description (optional)";
                this._desc.className = "desc";
                var tr;
                var node;
                var button;
                var filter;
                var rdnTable = container.appendChild(document.createElement("table"));
                [0, 1, 2].forEach(function (string) {
                    var type = 0 == string ? "src" : "dst-" + string;
                    tr = rdnTable.insertRow();
                    tr.setAttribute("data-portal", type);
                    node = tr.insertCell();
                    if (0 != string) {
                        filter = node.appendChild(document.createElement("input"));
                        filter.type = "checkbox";
                        filter.checked = true;
                        filter.value = type;
                        self._links.push(filter);
                    }
                    node = tr.insertCell();
                    node.textContent = 0 == string ? "from" : "to (#" + string + ")";
                    node = tr.insertCell();
                    button = node.appendChild(document.createElement("button"));
                    button.textContent = "set";
                    button.addEventListener("click", function (arg) {
                        return self.setPortal(arg);
                    }, false);
                    node = tr.insertCell();
                    if (0 != string) {
                        button = node.appendChild(document.createElement("button"));
                        button.textContent = "add";
                        button.addEventListener("click", function (other) {
                            return self.addLinkTo(other, self._operation);
                        }, false);
                    }
                    node = tr.insertCell();
                    node.className = "portal portal-" + type;
                    self._portals[type] = node;
                    self.updatePortal(type);
                });
                var element = container.appendChild(document.createElement("div"));
                element.className = "buttonbar";
                var div = element.appendChild(document.createElement("span"));
                var opt = div.appendChild(document.createElement("span"));
                opt.className = "arrow";
                opt.textContent = "\u21b3";
                button = div.appendChild(document.createElement("button"));
                button.textContent = "add all";
                button.addEventListener("click", function (a) {
                    return self.addAllLinks(self._operation);
                }, false);
                var cardHeader = element.appendChild(document.createElement("label"));
                this._reversed = cardHeader.appendChild(document.createElement("input"));
                this._reversed.type = "checkbox";
                cardHeader.appendChild(document.createTextNode(" reverse"));
                //var layerSelector = new scope.LayerSelector(this._layerManager, this._operation.data);
                //layerSelector.label = false;
                //element.appendChild(layerSelector.container);
                button = element.appendChild(document.createElement("button"));
                button.textContent = "close";
                button.addEventListener("click", function (a) {
                    return self._dialog.dialog("close");
                }, false);
                this._dialog = window.dialog({
                    title: this._operation.name + " - Wasabee Links",
                    width: "auto",
                    height: "auto",
                    html: container,
                    dialogClass: "wasabee-dialog wasabee-dialog-links",
                    closeCallback: function (popoverName) {
                        var paneIndex = init._dialogs.indexOf(self);
                        if (-1 !== paneIndex) {
                            init._dialogs.splice(paneIndex, 1);
                        }
                        self.clearLocalPortalSelections()
                    }
                });
                this._dialog.dialog("option", "buttons", {});
            }
            return init.update = function (operation, show) {
                var p = 0;
                var parameters = init._dialogs;
                for (; p < parameters.length; p++) {
                    var page = parameters[p];
                    if (page._operation.ID == operation.ID) {
                        page._operation = operation;
                        return page.focus(), page;
                    } else {
                        return page._dialog.dialog('close');
                    }
                }
                if (show)
                    return new init(operation);
                else
                    return;
            }, init.prototype.focus = function () {
                this._dialog.dialog("open");
            }, init.closeDialogs = function() {
                var parameters = init._dialogs;
                for (p = 0; p < parameters.length; p++) {
                    var page = parameters[p];
                    page._dialog.dialog('close');
                }
            }, init.prototype.clearLocalPortalSelections = function () {
                delete localStorage["wasabee-portal-dst-1"];
                delete localStorage["wasabee-portal-dst-2"];
                delete localStorage["wasabee-portal-dst-3"];
                delete localStorage["wasabee-portal-src"];
                //***Function to set portal -- called from 'Set' Button
            }, init.prototype.setPortal = function (event) {
                var updateID = event.currentTarget.parentNode.parentNode.getAttribute("data-portal");
                var selectedPortal = scope.UiHelper.getSelectedPortal();
                if (selectedPortal) {
                    localStorage["wasabee-portal-" + updateID] = JSON.stringify(selectedPortal);
                } else {
                    alert("No Portal Selected.")
                    delete localStorage["wasabee-portal-" + updateID];
                }
                this.updatePortal(updateID);

                //***Function to get portal -- called in updatePortal, addLinkTo, and addAllLinks
            }, init.prototype.getPortal = function (name) {
                try {
                    return JSON.parse(localStorage["wasabee-portal-" + name]);
                } catch (b) {
                    return null;
                }
                //***Function to update portal in the dialog
            }, init.prototype.updatePortal = function (key) {

                var i = this.getPortal(key);
                var viewContainer = this._portals[key];
                $(viewContainer).empty();
                if (i) {
                    viewContainer.appendChild(scope.UiHelper.getPortalLink(i));
                }

                //***Function to add link between the portals -- called from 'Add' Button next to To portals
            }, init.prototype.addLinkTo = function (instance, operation) {
                var item = this;
                var server = instance.currentTarget.parentNode.parentNode.getAttribute("data-portal");
                var linkTo = this.getPortal(server);
                var source = this.getPortal("src");
                if (!source || !linkTo) {
                    return void alert("Please select target and destination portals first!");
                }

                var isReversed = this._reversed.checked;
                if (source.id == linkTo.id) {
                    return void alert("Target and destination portals must be different.")
                } else
                    Promise.all([item.addPortal(source), item.addPortal(linkTo), isReversed ? item.addLink(linkTo, source) : item.addLink(source, linkTo)]).then(function () {
                        operation.update()
                    })["catch"](function (data) {
                        throw alert(data.message), console.log(data), data;
                    });

                //***Function to add all the links between the from and all the to portals -- called from 'Add All Links' Button
            }, init.prototype.addAllLinks = function (operation) {
                var item = this;
                var source = this.getPortal("src");
                if (!source) {
                    return void alert("Please select a target portal first!");
                }
                var resolvedSourceMapConfigs = this._links.map(function (b) {
                    return b.checked ? item.getPortal(b.value) : null;
                }).filter(function (a) {
                    return null != a;
                });
                if (0 == resolvedSourceMapConfigs.length) {
                    return void alert("Please select a destination portal first!");
                }
                var isReversedChecked = this._reversed.checked;
                var documentBodyPromise = this.addPortal(source);
                Promise.all(resolvedSourceMapConfigs.map(function (linkTo) {
                    return Promise.all([documentBodyPromise, item.addPortal(linkTo), isReversedChecked ? item.addLink(linkTo, source) : item.addLink(source, linkTo)]).then(function () {
                        operation.update()
                    });
                }))["catch"](function (data) {
                    throw alert(data.message), console.log(data), data;
                });

                //***Function to add a portal -- called in addLinkTo and addAllLinks functions
            }, init.prototype.addPortal = function (sentPortal) {
                var resolvedLocalData = Promise.resolve(this._operation.opportals)

                return sentPortal ? (this._operation.opportals.some(function (gotPortal) {
                    return gotPortal.id == sentPortal.id;
                }) ? resolvedLocalData : scope.UiCommands.addPortal(this._operation, sentPortal, "", true)) : Promise.reject("no portal given");

                //***Function to add a single link -- called in addLinkTo and addAllLinks functions
            }, init.prototype.addLink = function (fromPortal, toPortal) {
                var description = this._desc.value;
                if (!toPortal || !fromPortal) {
                    return Promise.reject("no portal given");
                }
                return this._operation.addLink(fromPortal, toPortal, description);
            }, init._dialogs = [], init;
        }();
        scope.LinkDialog = linkDialogFunc;
    }(Wasabee || (Wasabee = {}));

    !function (scope) {
        var opsDialogFunc = function () {
            function init(operationList) {
                this._operationList = operationList
                init._dialogs.push(this);
                this.container = document.createElement("article");
                this.container.id = "op-dialog-tabs";
                this.setupTabs()
                var self = this
                this._dialog = window.dialog({
                    title: "Operation List",
                    width: "auto",
                    height: "auto",
                    html: this.container,
                    dialogClass: "wasabee-dialog wasabee-dialog-ops",
                    closeCallback: function (popoverName) {
                        var paneIndex = init._dialogs.indexOf(self);
                        if (-1 !== paneIndex) {
                            init._dialogs.splice(paneIndex, 1);
                        }
                    }
                });
                var buttons = this._dialog.dialog("option", "buttons");
                this._dialog.dialog("option", "buttons", $.extend({}, {
                    "Add New Operation": function (b) {
                        var promptAction = prompt('Enter an operation name.  Must not be empty.', '');
                        if (promptAction !== null && promptAction !== '') {
                            self.addOperation(promptAction);
                        } else {
                            alert("You must enter a valid Operation name. Try again.")
                        }
                    },
                    "Import Operation": function (b) {
                        window.plugin.wasabee.importString();
                    },
                    "Clear All Operations": function (b) {
                        var confirmed = confirm("Are you sure you want to clear ALL operations?")
                        if (confirmed) {
                            window.plugin.wasabee.resetOpList();
                            window.plugin.wasabee.setupLocalStorage();
                        }                    
                    }
                }, buttons));
            }
            return init.update = function (operationList, show = true, close = false) {
                var parameters = init._dialogs;
                if (parameters.length != 0) {
                    show = false;
                    for (index in parameters) {
                        var page = parameters[index]
                        if (close) {
                            return page._dialog.dialog('close');
                        }
                        page._operationList = operationList; //doesn't update, need to manually?
                        page.setupTabs()
                        return page.focus(), page;
                    }
                }
                if (show)
                    return new init(operationList);
                else
                    return;
            }, init.closeDialogs = function() {
                var parameters = init._dialogs;
                for (p = 0; p < parameters.length; p++) {
                    var page = parameters[p];
                    page._dialog.dialog('close');
                }
            }, init.prototype.addOperation = function (name) {
                window.plugin.wasabee.updateOperationInList(new Operation(PLAYER.nickname, name, true), true)
            }, init.prototype.setupTabs = function () {
                var self = this
                this.container.innerHTML = ''
                var tabs = this.container.appendChild(document.createElement("div"));
                tabs.id = "operation-dialog-tabs";
                var baseUl = tabs.appendChild(document.createElement("ul"))
                this._operationList.forEach(function (operation) {
                    var title = operation.name;
                    var li = baseUl.appendChild(document.createElement("li"))
                    var a = li.appendChild(document.createElement("a"))
                    a.innerHTML = title
                    a.setAttribute("href", "#a")
                });
                this._tabContent = tabs.appendChild(document.createElement("div"))
                this._tabContent.className = "op-dialog-content-pane"
                this._tabContent.id = "a"
                var self = this;
                var i;
                var selectedIndex = 0;
                for (i = 0; i < this._operationList.length; i++) {
                    if (this._operationList[i].isSelected)
                        selectedIndex = i;
                }
                this.updateContentPane(this._operationList[selectedIndex], this._operationList.length)
                $(tabs).tabs({
                    active: selectedIndex,
                    beforeActivate:
                        function (e, tab) {
                            self.updateContentPane(self._operationList[tab.newTab.index()], self._operationList.length)
                        }
                }).addClass('ui-tabs-vertical ui-helper-clearfix');
            }, init.prototype.updateContentPane = function (operation, opListSize) {
                var tabContent = this._tabContent
                tabContent.innerHTML = "";
                var nameSection = tabContent.appendChild(document.createElement("p"))
                nameSection.innerHTML = "Op Name -> "
                var input = nameSection.appendChild(document.createElement("input"))
                input.type = "text"
                input.id = "op-dialog-content-nameinput"
                input.value = operation.name

                var colorSection = tabContent.appendChild(document.createElement("p"))
                colorSection.innerHTML = "Op Color -> "
                var operationColor = Wasabee.Constants.DEFAULT_OPERATION_COLOR
                if (operation.color != null)
                    operationColor = operation.color
                var opColor = colorSection.appendChild(document.createElement("select"));
                scope.layerTypes.forEach(function (a) {
                    var option = document.createElement("option")
                    if (a.name == operationColor)
                        option.setAttribute("selected", true)
                    option.setAttribute("value", a.name)
                    option.innerHTML = a.displayName
                    opColor.append(option);
                });
                $(opColor).change(function () {
                    Operation.create(operation).updateColor($(opColor).val())
                });

                var buttonSection = tabContent.appendChild(document.createElement("div"))
                buttonSection.className = "temp-op-dialog";
                /*
                var viewOpSummaryButton = buttonSection.appendChild(document.createElement("a"))
                viewOpSummaryButton.innerHTML = "View Op Summary"
                viewOpSummaryButton.addEventListener("click", function (arg) {
                    window.plugin.wasabee.viewOpSummary(operation);
                }, false);
                */
                var saveButton = buttonSection.appendChild(document.createElement("a"))
                saveButton.innerHTML = "Save Operation Name"
                saveButton.addEventListener("click", function (arg) {
                    if (input.value == null || input.value == '') {
                        alert("That is an invalid operation name")
                    } else {
                        operation.name = input.value
                        window.plugin.wasabee.updateOperationInList(Operation.create(operation))
                    }
                }, false);
                if (!operation.isSelected) {
                    var selectedButton = buttonSection.appendChild(document.createElement("a"))
                    selectedButton.innerHTML = "Set Selected"
                    selectedButton.addEventListener("click", function (arg) {
                        var confirmed = confirm("Are you sure you want to select this operation?")
                        if (confirmed) {
                            window.plugin.wasabee.updateOperationInList(Operation.create(operation), true)
                        }
                    }, false);
                }
                var exportButton = buttonSection.appendChild(document.createElement("a"));
                exportButton.innerHTML = "Export";
                exportButton.addEventListener("click", function () {
                    Wasabee.OpsDialog.update(Array(), false, true);
                    Wasabee.ExportDialog.show(operation);
                }, false);
                var clearOpButton = buttonSection.appendChild(document.createElement("a"));
                clearOpButton.innerHTML = "Clear Portals/Links/Markers";
                clearOpButton.addEventListener("click", function (arg) {
                    var confirmClear = confirm("Are you sure you want to clear all portals, links, and markers from this operation?");
                    if (confirmClear == true) {
                        Operation.create(operation).clearAllItems()
                    }
                }, false);

                var deleteButton = buttonSection.appendChild(document.createElement("a"))
                deleteButton.innerHTML = "Delete"
                deleteButton.disabled = opListSize == 0
                deleteButton.addEventListener("click", function (arg) {
                    var confirmed = confirm("Are you sure you want to *DELETE* this operation?")
                    if (confirmed == true) {
                        if (window.plugin.wasabee.opIsOwnedServerOp(operation.ID)) {
                            var confirmedDeleteServerOp = confirm("Are you sure you want to *DELETE* this operation on the *SERVER*?")
                            if (confirmedDeleteServerOp) {
                                window.plugin.wasabee.deleteOwnedServerOp(operation.ID)
                            }
                        }
                    
                        window.plugin.wasabee.removeOperationFromList(Operation.create(operation))
                    }
                }, false);
                //TODO if op is in local storage, show update
                var opIsInLocalStorage = window.plugin.wasabee.opIsServerOp(operation.ID)
                var uploadOpButton = buttonSection.appendChild(document.createElement("a"))
                if (opIsInLocalStorage) {
                    uploadOpButton.innerHTML = "Update Server Op"
                } else {
                    uploadOpButton.innerHTML = "Upload Op"
                }
                uploadOpButton.addEventListener("click", function (arg) {
                    if (opIsInLocalStorage) {
                        window.plugin.wasabee.updateSingleOp(Operation.create(operation))
                    } else {
                        window.plugin.wasabee.uploadSingleOp(Operation.create(operation))
                    }
                }, false);
                var downloadOpButton = buttonSection.appendChild(document.createElement("a"))
                downloadOpButton.innerHTML = "Download Op"
                downloadOpButton.addEventListener("click", function (arg) {
                    window.plugin.wasabee.downloadSingleOp(Operation.create(operation))
                }, false);
            }, init.prototype.saveOperation = function (operation) {
            }, init.updateOperation = function (operationList) {
                this._operationList = operationList
            }, init.prototype.focus = function () {
                this._dialog.dialog("open");
            }, init._dialogs = [], init;
        }();
        scope.OpsDialog = opsDialogFunc;
    }(Wasabee || (Wasabee = {}));

    !function (scope) {
        var Sortable = function () {
            function set() {
                this._items = [];
                this._fields = [];
                this._sortBy = 0;
                this._sortAsc = true;
                this._table = document.createElement("table");
                this._table.className = "wasabee-table";
                this._head = this._table.appendChild(document.createElement("thead"));
                this._body = this._table.appendChild(document.createElement("tbody"));
                this.renderHead();
            }
            return Object.defineProperty(set.prototype, "sortBy", {
                get: function () {
                    return this._sortBy;
                },
                set: function (property) {
                    this._sortBy = property;
                    this.sort();
                },
                enumerable: true,
                configurable: true
            }), Object.defineProperty(set.prototype, "sortAsc", {
                get: function () {
                    return this._sortAsc;
                },
                set: function (mymuted) {
                    this._sortAsc = mymuted;
                    this.sort();
                },
                enumerable: true,
                configurable: true
            }), Object.defineProperty(set.prototype, "table", {
                get: function () {
                    return this._table;
                },
                enumerable: true,
                configurable: true
            }), Object.defineProperty(set.prototype, "items", {
                get: function () {
                    return this._items.map(function (focusTable) {
                        return focusTable.obj;
                    });
                },
                set: function (a) {
                    var visitor = this;
                    this._items = a.map(function (e) {
                        var row = document.createElement("tr");
                        var data = {
                            obj: e,
                            row: row,
                            index: 0,
                            values: [],
                            sortValues: []
                        };
                        return visitor._fields.forEach(function (b) {
                            var a = b.value(e);
                            data.values.push(a);
                            data.sortValues.push(b.sortValue ? b.sortValue(a, e) : a);
                            var f = row.insertCell(-1);
                            if (b.format) {
                                b.format(f, a, e);
                            } else {
                                f.textContent = a;
                            }
                        }), data;
                    });
                    this.sort();
                },
                enumerable: true,
                configurable: true
            }), Object.defineProperty(set.prototype, "fields", {
                get: function () {
                    return this._fields;
                },
                set: function (value) {
                    this._fields = value;
                    this.renderHead();
                },
                enumerable: true,
                configurable: true
            }), set.prototype.renderHead = function () {
                var self = this;
                this.empty(this._head);
                var titleRow = this._head.insertRow(-1);
                this._fields.forEach(function (column, currentState) {
                    var editor = titleRow.appendChild(document.createElement("th"));
                    editor.textContent = column.name;
                    if (column.title) {
                        editor.title = column.title;
                    }
                    if (null !== column.sort) {
                        editor.classList.add("sortable");
                        editor.tabIndex = 0;
                        editor.addEventListener("keypress", function (event) {
                            if (13 == event.keyCode) {
                                event.target.dispatchEvent(new MouseEvent("click", {
                                    bubbles: true,
                                    cancelable: true
                                }));
                            }
                        }, false);
                        editor.addEventListener("click", function (b) {
                            if (currentState == self._sortBy) {
                                self._sortAsc = !self._sortAsc;
                            } else {
                                self._sortBy = currentState;
                                self._sortAsc = column.defaultAsc === false ? false : true;
                            }
                            self.sort();
                        }, false);
                    }
                });
            }, set.prototype.sort = function (d, method) {
                var that = this;
                this.empty(this._body);
                var self = this._fields[this._sortBy];
                this._items.forEach(function (a, b) {
                    return a.index = b;
                });
                this._items.sort(function (a, b) {
                    var value = a.sortValues[that._sortBy];
                    var i = b.sortValues[that._sortBy];
                    var length = 0;
                    return length = self.sort ? self.sort(value, i, a.obj, b.obj) : i > value ? -1 : value > i ? 1 : 0, 0 == length && (length = a.index - b.index), that._sortAsc ? length : -length;
                });
                this._items.forEach(function (tabs) {
                    return that._body.appendChild(tabs.row);
                });
                $(this._head.getElementsByClassName("sorted")).removeClass("sorted asc desc");
                var dayEle = this._head.rows[0].children[this._sortBy];
                dayEle.classList.add("sorted");
                dayEle.classList.add(this._sortAsc ? "asc" : "desc");
            }, set.prototype.empty = function (cell) {
                for (; cell.firstChild;) {
                    cell.removeChild(cell.firstChild);
                }
            }, set;
        }();
        scope.Sortable = Sortable;
    }(Wasabee || (Wasabee = {}));

    !function (scope) {
        var overFlowMenu = function () {
            function init() {
                var _this = this;
                this._button = document.createElement("a");
                this._button.href = "#";
                this._button.addEventListener("click", function (type) {
                    _this.onButtonClick(type);
                }, false);
                this._button.className = "wasabee-overflow-button";
                this._button.appendChild(document.createElement("span")).textContent = "\u22ee";
                this._handler = function (e) {
                    if ("mousedown" == e.type) {
                        var node = e.target;
                        do {
                            if (node == _this._menu) {
                                return;
                            }
                        } while (node = node.parentNode);
                    }
                    _this.hide();
                };
                this.items = [];
            }
            return Object.defineProperty(init.prototype, "button", {
                get: function () {
                    return this._button;
                },
                enumerable: true,
                configurable: true
            }), Object.defineProperty(init.prototype, "items", {
                set: function (object) {
                    var scene = this;
                    return this.hide(), object instanceof HTMLElement ? (this._menu = object, void (this._menu.tabIndex = 0)) : (this._menu = document.createElement("ul"), this._menu.tabIndex = 0, this._menu.className = "wasabee-overflow-menu", void object.forEach(function (button) {
                        var content = scene._menu.appendChild(document.createElement("li"));
                        if ("string" == typeof button.label) {
                            var btn = content.appendChild(document.createElement("a"));
                            btn.href = "#";
                            btn.textContent = button.label;
                        } else {
                            button.label(content);
                        }
                        content.addEventListener("click", function (event) {
                            event.preventDefault();
                            button.onclick(event);
                        }, false);
                    }));
                },
                enumerable: true,
                configurable: true
            }), init.prototype.onButtonClick = function (event) {
                return event.preventDefault(), event.stopPropagation(), this.show(), false;
            }, init.prototype.show = function () {
                document.body.appendChild(this._menu);
                $(this._menu).position({
                    my: "right top",
                    at: "right bottom",
                    of: this._button,
                    collision: "flipfit"
                });
                document.removeEventListener("click", this._handler, false);
                document.addEventListener("click", this._handler, false);
                document.removeEventListener("mousedown", this._handler, false);
                document.addEventListener("mousedown", this._handler, false);
                this._menu.focus();
            }, init.prototype.hide = function () {
                document.removeEventListener("click", this._handler, false);
                document.removeEventListener("mousedown", this._handler, false);
                if (this._menu && this._menu.parentNode) {
                    this._menu.parentNode.removeChild(this._menu);
                }
            }, init;
        }();
        scope.OverflowMenu = overFlowMenu;
    }(Wasabee || (Wasabee = {}));

    !function (scope) {
        var linkListDialog = function () {
            function init(operation, portal) {
                var that = this;
                this._operation = operation;
                this._portal = portal;
                this._table = new scope.Sortable;
                this._dialog = null;
                this._table.fields = [{
                    name: "Description",
                    value: function (link) {
                        return link.description;
                    },
                    sort: function (a, b) {
                        return a.localeCompare(b);
                    },
                    format: function (row, obj) {
                        row.className = "desc";
                        row.innerHTML = window.markdown.toHTML(window.escapeHtmlSpecialChars(obj));
                    }
                }, {
                    name: "From",
                    value: function (link) {
                        return that._operation.getPortal(link.fromPortal.id);
                    },
                    sortValue: function (b) {
                        return b.name;
                    },
                    sort: function (a, b) {
                        return a.localeCompare(b);
                    },
                    format: function (d, data) {
                        d.appendChild(scope.UiHelper.getPortalLink(data))
                    }
                }, {
                    name: "To",
                    value: function (link) {
                        return that._operation.getPortal(link.toPortal.id);
                    },
                    sortValue: function (b) {
                        return b.name;
                    },
                    sort: function (a, b) {
                        return a.localeCompare(b);
                    },
                    format: function (d, data) {
                        d.appendChild(scope.UiHelper.getPortalLink(data))
                    }
                }, {
                    name: "Length",
                    value: function (obj) {
                        return that.getLinkLength(obj);
                    },
                    format: function (a, m) {
                        a.classList.add("length");
                        a.textContent = m > 1E3 ? (m / 1E3).toFixed(1) + "km" : m.toFixed(1) + "m";
                    }
                }, {
                    name: "Min Lvl",
                    title: "Minimum level required on source portal",
                    value: function (obj) {
                        return that.getLinkLength(obj);
                    },
                    format: function (a, b) {
                        var s;
                        if (b > 6881280) {
                            s = "impossible";
                        } else {
                            if (b > 1966080) {
                                s = "L8+some VRLA";
                                a.title = "Depending on the number and type Link Amps used, a lower source portal level might suffice.";
                                a.classList.add("help");
                            } else {
                                if (b > 655360) {
                                    s = "L8+some LA";
                                    a.title = "Depending on the number and type Link Amps used, a lower source portal level might suffice.";
                                    a.classList.add("help");
                                } else {
                                    var d = Math.max(1, Math.ceil(8 * Math.pow(b / 160, .25)) / 8);
                                    var msd = 8 * (d - Math.floor(d));
                                    s = "L" + d;
                                    if (0 != msd) {
                                        if (!(1 & msd)) {
                                            s = s + "\u2007";
                                        }
                                        if (!(1 & msd || 2 & msd)) {
                                            s = s + "\u2007";
                                        }
                                        s = s + (" = L" + Math.floor(d) + "0\u215b\u00bc\u215c\u00bd\u215d\u00be\u215e".charAt(msd));
                                    }
                                }
                            }
                        }
                        a.textContent = s;
                    }
                }, {
                    name: "",
                    sort: null,
                    value: function (link) {
                        return link;
                    },
                    format: function (o, e) {
                        return that.makeMenu(o, e);
                    }
                }];
                this._table.sortBy = 1;
                this._setLinks();
                init._dialogs.push(this);

                if (this._table.items.length > 0) {
                    var that = this
                    this._dialog = window.dialog({
                        html: this._table.table,
                        dialogClass: "wasabee-dialog wasabee-dialog-linklist",
                        title: this._portal.name + ": Links",
                        width: "auto",
                        closeCallback: function (popoverName) {
                            init._dialogs = [];
                        }
                    });
                    var buttons = this._dialog.dialog("option", "buttons");
                    this._dialog.dialog("option", "buttons", $.extend({}, {
                        "Add links": function (b) {
                            if (that._portal) {
                                window.renderPortalDetails(that._portal.id);
                            }
                            scope.LinkDialog.update(that._operation, that._portal);
                        }
                    }, buttons));
                } else {
                    alert('No links found.')
                }
            }
            return init.update = function (operation, portal, show) {
                var p = 0;
                var parameters = init._dialogs;
                for (; p < parameters.length; p++) {
                    var page = parameters[p];
                    if (page._operation.ID == operation.ID) {
                        page._operation = operation;
                    } else {
                        return page._dialog.dialog('close');
                    }
                    if (!page._operation.containsPortal(page._portal)) {
                        return page._dialog.dialog('close');
                    }
                    page._setLinks();
                    if (portal != null) {
                        page._portal = portal;
                        page._setLinks();
                        page._dialog.dialog('option', 'title', portal.name + ": Links");
                        return page._dialog.focus(), page._dialog;
                    }
                }
                if (show)
                    return new init(operation, portal);
                else
                    return;
            }, init.prototype._setLinks = function () {
                this._table.items = this._operation.getLinkListFromPortal(this._portal);
            }, init.prototype.getLinkLength = function (link) {
                var latlngs = link.getLatLngs();
                return L.latLng(latlngs[0]).distanceTo(latlngs[1]);
            }, init.prototype.deleteLink = function (link) {
                var that = this;
                if (confirm("Do you really want to delete the link: " + link.fromPortal.name + " -> " + link.toPortal.name)) {
                    this._operation.removeLink(link.fromPortal, link.toPortal)
                }
            }, init.prototype.reverseLink = function (link) {
                this._operation.reverseLink(link.fromPortal, link.toPortal)
            }, init.prototype.addAlert = function (message) {
                /*
              window.renderPortalDetails(message.portalFrom.id);
              var s = new scope.AlertDialog(this._operation, new scope.Preferences);
              s.showDialog();
              s.setTarget(this._operation.data.getPortal(message.portalTo.id));
              */
            }, init.prototype.makeMenu = function (list, data) {

                var $scope = this;
                var state = new scope.OverflowMenu;
                state.items = [, {
                    label: "Reverse",
                    onclick: function () {
                        return $scope.reverseLink(data);
                    }
                }, {
                        label: "Delete",
                        onclick: function () {
                            return $scope.deleteLink(data);
                        }
                    }];
                list.className = "menu";
                list.appendChild(state.button);

            }, init._dialogs = [], init;
        }();
        scope.LinkListDialog = linkListDialog;
    }(Wasabee || (Wasabee = {}));

    //This function helps with commonly used UI data getting functions
    !function (data) {
        var uiHelper = function () {
            function helper() {
            }
            return helper.getPortal = function (id) {
                if (window.portals[id] && window.portals[id].options.data.title) {
                    var data = window.portals[id].options.data;
                    return {
                        id: id,
                        name: data.title,
                        lat: (data.latE6 / 1E6).toFixed(6),
                        lng: (data.lngE6 / 1E6).toFixed(6)
                    };
                }
                return null;
            }, helper.getSelectedPortal = function () {
                return window.selectedPortal ? this.getPortal(window.selectedPortal) : null;
            }, helper.toLatLng = function (data, angle) {
                return void 0 === angle && "object" == typeof data && (angle = data.lng, data = data.lat), L.latLng(parseFloat(data), parseFloat(angle));
            }, helper.getPortalLink = function (data) {
                var pt = helper.toLatLng(data);
                var v = data.lat + "," + data.lng;
                var e = document.createElement("a");
                return e.appendChild(document.createTextNode(data.name)), e.title = data.name, e.href = "/intel?ll=" + v + "&pll=" + v, e.addEventListener("click", function (event) {
                    return window.selectedPortal != data.id ? window.renderPortalDetails(data.id) : map.panTo(pt), event.preventDefault(), false;
                }, false), e.addEventListener("dblclick", function (event) {
                    return map.getBounds().contains(pt) ? (window.portals[data.id] || window.renderPortalDetails(data.id), window.zoomToAndShowPortal(data.id, pt)) : (map.panTo(pt), window.renderPortalDetails(data.id)), event.preventDefault(), false;
                }, false), e;
            }, helper;
        }();
        data.UiHelper = uiHelper;
    }(Wasabee || (Wasabee = {}));

    //This function deals with modifying objects on map layers
    !function (scope) {
        var uiCommands = function () {
            function self() {
            }
            return self.addPortal = function (operation, sentPortal, options, anyContent) {
                if (void 0 === options && (options = ""), void 0 === anyContent && (anyContent = false), !sentPortal) {
                    return void alert("Please select a portal first!");
                }

                if (operation instanceof Operation) {
                    operation.addPortal(sentPortal);
                }
                else {
                    alert("Operation Invalid");
                }
            }, self.editPortal = function (instance, obj, key, value, options) {
                //return obj.layerName = key, obj.description = value, obj.keysFarmed = options, instance.portalService.editPortal(obj, PLAYER.nickname);
            }, self.swapPortal = function (operation, portal) {
                var selectedPortal = Wasabee.UiHelper.getSelectedPortal();
                if (selectedPortal != undefined) {
                    if (confirm("Do you really want to swap these two portals?\n\n" + portal.name + "\n" + selectedPortal.name)) {
                        Promise.all([operation.swapPortal(portal, selectedPortal)]).then(function () {
                            operation.update()
                        })["catch"](function (data) {
                            throw alert(data.message), console.log(data), data;
                        });
                    }
                } else
                    alert("You must select a new portal!")
            }, self.deletePortal = function (operation, portal) {
                if (confirm("Do you really want to delete this anchor, including all incoming and outgoing links?\n\n" + portal.name)) {
                    operation.removeAnchor(portal.id);
                }
            }, self.deleteMarker = function (operation, marker, portal) {
                if (confirm("Do you really want to delete this marker? Marking it complete?\n\n" + window.plugin.wasabee.getPopupBodyWithType(portal, marker))) {
                    operation.removeMarker(marker);
                }
            }, self.showLinksDialog = function (operation, portal) {
                Wasabee.LinkListDialog.update(operation, portal, true);
            }, self;
        }();
        scope.UiCommands = uiCommands;
    }(Wasabee || (Wasabee = {}));


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
            alert(JSON.stringify(e))
        }

        /* jshint ignore:start */
        /* arc.js by Dane Springmeyer, https://github.com/springmeyer/arc.js */
        var D2R = Math.PI / 180, R2D = 180 / Math.PI, Coord = function (c, e) { this.lon = c; this.lat = e; this.x = D2R * c; this.y = D2R * e; }; Coord.prototype.view = function () { return String(this.lon).slice(0, 4) + "," + String(this.lat).slice(0, 4); }; Coord.prototype.antipode = function () { return new Coord(0 > this.lon ? 180 + this.lon : -1 * (180 - this.lon), -1 * this.lat); }; var LineString = function () { this.coords = []; this.length = 0; }; LineString.prototype.move_to = function (c) { this.length++; this.coords.push(c); };
        var Arc = function (c) { this.properties = c || {}; this.geometries = []; };
        Arc.prototype.json = function () { if (0 >= this.geometries.length) return { geometry: { type: "LineString", coordinates: null }, type: "Feature", properties: this.properties }; if (1 == this.geometries.length) return { geometry: { type: "LineString", coordinates: this.geometries[0].coords }, type: "Feature", properties: this.properties }; var c = []; for (i = 0; i < this.geometries.length; i++)c.push(this.geometries[i].coords); return { geometry: { type: "MultiLineString", coordinates: c }, type: "Feature", properties: this.properties }; };
        Arc.prototype.wkt = function () { var c = ""; for (i = 0; i < this.geometries.length; i++) { if (0 === this.geometries[i].coords.length) return "LINESTRING(empty)"; var e = "LINESTRING("; this.geometries[i].coords.forEach(function (a, c) { e += a[0] + " " + a[1] + ","; }); c += e.substring(0, e.length - 1) + ")"; } return c; };
        var GreatCircle = function (c, e, a) {
            this.start = c; this.end = e; this.properties = a || {}; a = this.start.x - this.end.x; a = Math.pow(Math.sin((this.start.y - this.end.y) / 2), 2) + Math.cos(this.start.y) * Math.cos(this.end.y) * Math.pow(Math.sin(a / 2), 2); this.g = 2 * Math.asin(Math.sqrt(a)); if (this.g == Math.PI) throw Error("it appears " + c.view() + " and " + e.view() + " are 'antipodal', e.g diametrically opposite, thus there is no single route but rather infinite"); if (isNaN(this.g)) throw Error("could not calculate great circle between " +
                c + " and " + e);
        };
        GreatCircle.prototype.interpolate = function (c) { var e = Math.sin((1 - c) * this.g) / Math.sin(this.g), a = Math.sin(c * this.g) / Math.sin(this.g); c = e * Math.cos(this.start.y) * Math.cos(this.start.x) + a * Math.cos(this.end.y) * Math.cos(this.end.x); var g = e * Math.cos(this.start.y) * Math.sin(this.start.x) + a * Math.cos(this.end.y) * Math.sin(this.end.x), e = e * Math.sin(this.start.y) + a * Math.sin(this.end.y), e = R2D * Math.atan2(e, Math.sqrt(Math.pow(c, 2) + Math.pow(g, 2))); return [R2D * Math.atan2(g, c), e]; };
        GreatCircle.prototype.Arc = function (c, e) {
            var a = []; if (2 >= c) a.push([this.start.lon, this.start.lat]), a.push([this.end.lon, this.end.lat]); else for (var g = 1 / (c - 1), b = 0; b < c; b++) { var k = this.interpolate(g * b); a.push(k) } for (var d = !1, h = 0, b = 1; b < a.length; b++) { var g = a[b - 1][0], k = a[b][0], m = Math.abs(k - g); 350 < m && (170 < k && -170 > g || 170 < g && -170 > k) ? d = !0 : m > h && (h = m) } g = []; if (d && 10 > h) for (d = [], g.push(d), b = 0; b < a.length; b++)if (k = parseFloat(a[b][0]), 0 < b && 350 < Math.abs(k - a[b - 1][0])) {
                var f = parseFloat(a[b - 1][0]), h = parseFloat(a[b - 1][1]),
                    l = parseFloat(a[b][0]), m = parseFloat(a[b][1]); if (-180 < f && -170 > f && 180 == l && b + 1 < a.length && -180 < a[b - 1][0] && -170 > a[b - 1][0]) d.push([-180, a[b][1]]), b++ , d.push([a[b][0], a[b][1]]); else if (170 < f && 180 > f && -180 == l && b + 1 < a.length && 170 < a[b - 1][0] && 180 > a[b - 1][0]) d.push([180, a[b][1]]), b++ , d.push([a[b][0], a[b][1]]); else {
                        if (-170 > f && 170 < l) var n = f, f = l, l = n, n = h, h = m, m = n; 170 < f && -170 > l && (l += 360); 180 >= f && 180 <= l && f < l ? (f = (180 - f) / (l - f), h = f * m + (1 - f) * h, d.push([170 < a[b - 1][0] ? 180 : -180, h]), d = [], d.push([170 < a[b - 1][0] ? -180 : 180, h])) : d = [];
                        g.push(d); d.push([k, a[b][1]])
                    }
            } else d.push([a[b][0], a[b][1]]); else for (d = [], g.push(d), b = 0; b < a.length; b++)d.push([a[b][0], a[b][1]]); a = new Arc(this.properties); for (b = 0; b < g.length; b++)for (k = new LineString, a.geometries.push(k), d = g[b], h = 0; h < d.length; h++)k.move_to(d[h]); return a
        }; if ("undefined" === typeof window) module.exports.Coord = Coord, module.exports.Arc = Arc, module.exports.GreatCircle = GreatCircle; else { var arc = {}; arc.Coord = Coord; arc.Arc = Arc; arc.GreatCircle = GreatCircle };
        /* jshint ignore:end */

        window.plugin.wasabee.arc = arc;
        window.plugin.wasabee.addButtons();
        Wasabee.opList = Array();
        Wasabee.pasteList = Array();
        window.plugin.wasabee.addCSS(Wasabee.CSS.ui);
        window.plugin.wasabee.addCSS(Wasabee.CSS.main);
        window.plugin.wasabee.setupLocalStorage();

        window.plugin.wasabee.portalLayerGroup = new L.LayerGroup();
        window.plugin.wasabee.linkLayerGroup = new L.LayerGroup();
        window.plugin.wasabee.targetLayerGroup = new L.LayerGroup();
        window.addLayerGroup('Wasabee Draw Portals', window.plugin.wasabee.portalLayerGroup, true);
        window.addLayerGroup('Wasabee Draw Links', window.plugin.wasabee.linkLayerGroup, true);
        window.addLayerGroup('Wasabee Draw Targets', window.plugin.wasabee.targetLayerGroup, true);
        window.plugin.wasabee.initCrossLinks();
        window.plugin.wasabee.drawThings();
        var shareKey = window.plugin.wasabee.getUrlParams("wasabeeShareKey", null)
        if (shareKey != null) {
            window.plugin.wasabee.qbin_get(shareKey)
        }
    };

    window.plugin.wasabee.getColorMarker = function (color) {
        var marker = null
        Wasabee.layerTypes.forEach(function (type) {
            if (type.name == color) {
                marker = type.portal["iconUrl"];
            }
        });
        return marker
    }

    window.plugin.wasabee.getColorHex = function (color) {
        var hex = null
        Wasabee.layerTypes.forEach(function (type) {
            if (type.name == color) {
                hex = type.color;
            }
        });
        return hex
    }

    !function (scope) {
        var markerDialogFunction = function () {
            function init(operation) {
                init._dialogs.push(this);
                var self = this;
                this._target = null;
                this._operation = operation;
                this._type = $("<select>");
                scope.alertTypes.forEach(function (a) {
                    self._type.append($("<option>").prop({
                        value: a.name,
                        text: a.label
                    }));
                });
                this._type.val(Wasabee.Constants.DEFAULT_ALERT_TYPE);
                this._comment = $("<input>").attr("placeholder", "comment");
                /*  Uncomment this when adding specific targetting to agents
                this._agent = $('<select class="wasabee-agentselect"></select>').css({
                  width : "100%",
                  boxSizing : "border-box"
                });
                */
                var $element = $("<div>").addClass("wasabee-targetselect").text("To: ");
                this._targetLink = $("<strong>").text("(not set)").appendTo($element);
                $("<button>").text("set").click(function () {
                    return self.setTarget(scope.UiHelper.getSelectedPortal());
                }).appendTo($element);
                this._targetMenu = new scope.OverflowMenu;
                this._targetMenu.button.firstElementChild.textContent = "\u25bc";
                $element.append(this._targetMenu.button);
                this._container = $("<div />").append($("<div>").addClass("flex").append(this._type).append(this._comment)).append(document.createTextNode(" ")).append(this._agent).append($element);
                $element.hide(); //TODO remove this when create link alert added

                this._type.change(function () {
                    /*
                    self._preferences.save();
                    if ("CreateLinkAlert" == self._type.val()) {
                      $element.css("display", "");
                    } else {
                      $element.hide();
                    }
                    */
                });
                this._type.change();
                this._dialog = window.dialog({
                    title: this._operation.name + " Markers",
                    dialogClass: "wasabee-dialog-alerts",
                    html: this._container,
                    width: "300",
                    height: "auto",
                    position: {
                        my: "center top",
                        at: "center center+30"
                    },
                    closeCallback: function () {
                        init._dialogs = Array()
                    }
                });
                this._dialog.dialog("option", "buttons", {
                    "add marker": function () {
                        self.sendAlert(self._type.val(), self._operation, self._comment.val());
                    },
                    close: function () {
                        init._dialogs = Array()
                        self._dialog.dialog("close");
                    }
                });
            }
            return init.update = function (operation, close = false, show = true) {
                var parameters = init._dialogs;
                if (parameters.length != 0) {
                    show = false;
                    for (index in parameters) {
                        var page = parameters[index]
                        if (operation.ID != page._operation.ID || close) {
                            return page._dialog.dialog('close');
                        } else {
                            page._operation = operation
                            return page.focus(), page;
                        }
                    }
                }
                if (show)
                    return new init(operation);
                else
                    return;
            }, init.closeDialogs = function() {
                var parameters = init._dialogs;
                for (p = 0; p < parameters.length; p++) {
                    var page = parameters[p];
                    page._dialog.dialog('close');
                }
            }, init.prototype.focus = function () {
                this._dialog.dialog("open");
            }, init.prototype.sendAlert = function (selectedType, operation, comment) {
                operation.addMarker(selectedType, scope.UiHelper.getSelectedPortal(), comment)
            }, init._dialogs = [], init;
        }();
        scope.MarkerDialog = markerDialogFunction;
    }(Wasabee || (Wasabee = {}));

    !function (scope) {
        var exportDialogFunction = function () {
            function init(operation) {
                init._dialogs.push(this);
                this._operation = operation
                this._mainContent = document.createElement("div")
                this.updateContentPane()
                var self = this
                this._dialog = window.dialog({
                    title: this._operation.name + " - Export",
                    width: "auto",
                    height: "auto",
                    html: this._mainContent,
                    dialogClass: "wasabee-dialog wasabee-dialog-ops",
                    closeCallback: function (popoverName) {
                        init._dialogs = Array()
                    }
                });
            }
            return init.show = function (operation) {
                var parameters = init._dialogs;
                if (parameters.length != 0) {
                    show = false;
                    for (index in parameters) {
                        var page = parameters[index]
                        page._operation = operation
                        page.updateContentPane()
                        return page.focus(), page;
                    }
                }
                if (show)
                    return new init(operation);
                else
                    return;
            }, init.prototype.updateContentPane = function () {
                var mainContent = this._mainContent
                var operation = this._operation
                mainContent.innerHTML = "";
                var textArea = mainContent.appendChild(document.createElement("div"))
                textArea.className = "ui-dialog-wasabee-copy"
                textArea.innerHTML = '<p><a onclick="$(\'.ui-dialog-wasabee-copy textarea\').select();">Select all</a> and press CTRL+C to copy it.</p>'
                    + '<textarea readonly onclick="$(\'.ui-dialog-wasabee-copy textarea\').select();">' + JSON.stringify(operation) + '</textarea>'

                var linkArea = mainContent.appendChild(document.createElement("div"))
                linkArea.className = "temp-op-dialog";

                var pasteLink = window.plugin.wasabee.getPasteLink(operation);
                if (pasteLink == null) {
                    var createLinkButton = linkArea.appendChild(document.createElement("a"))
                    createLinkButton.innerHTML = "Create Sharing Link"
                    createLinkButton.addEventListener("click", function (arg) {
                        var confirmedCreate = confirm("Are you sure you want to create a share link? This will make data for this Op accessable to anyone with the link.")
                        if (confirmedCreate) {
                            window.plugin.wasabee.qbin_put(btoa(JSON.stringify(operation))).then(link => window.plugin.wasabee.gotQbinLink(link, operation));
                        }
                    }, false);
                } else {
                    linkArea.appendChild(document.createElement("p"))
                    var paragraph = linkArea.appendChild(document.createElement("p"))
                    paragraph.innerHTML = "<b>Operation Share Link</b>"
                    var urlInputBox = linkArea.appendChild(document.createElement("textarea"));
                    urlInputBox.setAttribute("readonly", true)
                    urlInputBox.innerHTML = pasteLink;
                    $(urlInputBox).css("max-width", "100%");
                    $(urlInputBox).css("min-width", "100%");
                    var createLinkButton = linkArea.appendChild(document.createElement("a"))
                    createLinkButton.innerHTML = "Re-create Sharing Link"
                    createLinkButton.addEventListener("click", function (arg) {
                        var confirmedCreate = confirm("Are you sure you want to re-create a share link? The URL will differ from the original link, and the original link will still function until it expires.")
                        if (confirmedCreate) {
                            window.plugin.wasabee.qbin_put(btoa(JSON.stringify(operation))).then(link => window.plugin.wasabee.gotQbinLink(link, operation));
                        }
                    }, false);
                }
            }, init.prototype.focus = function () {
                this._dialog.dialog("open");
            }, init._dialogs = [], init;
        }();
        scope.ExportDialog = exportDialogFunction;
    }(Wasabee || (Wasabee = {}));

    /** this checks the expiration on a paste link and returns a boolean */
    window.plugin.wasabee.isPasteLinkExpired = function (expireDate) {
        return Date.now() > expireDate
    }

    /** this processes a qbin link */
    window.plugin.wasabee.gotQbinLink = function (link, operation) {
        var key = link.substring(link.lastIndexOf("/")).replace("/", "");
        operation.pasteKey = key
        operation.pasteExpireDate = Date.now() + Wasabee.Constants.CURRENT_EXPIRE_NUMERIC
        window.plugin.wasabee.updateOperationInList(operation, false, false, true)
    }

    window.plugin.wasabee.viewOpSummary = function (operation) {
        var arcForm = document.createElement("form");
        arcForm.target = "_blank";
        arcForm.method = "POST";
        arcForm.name = "form1";
        arcForm.action = "http://wasabee.rocks/opsummary?drawKey=" + operation.pasteKey;
        document.body.appendChild(arcForm);
        arcForm.submit();
    }

    //** this saves a paste and returns a link */
    window.plugin.wasabee.qbin_put = ((Q) => $.ajax({
        url: Wasabee.Constants.SERVER_BASE_KEY + "/simple",
        type: "POST",
        data: Q,
        crossDomain: true,
        async: true,
        cache: false,
        contentType: "text/plain",
        xhrFields: {
            withCredentials: true
        }
    }).done(function (response) {
        console.log("response -> " + JSON.stringify(response))
    }).fail(function (jqXHR, textStatus) {
        alert('Paste Creation Failed -> ' + textStatus + " - jqXHR -> " + JSON.stringify(jqXHR))
    }));

    //** this gets paste json raw */
    window.plugin.wasabee.qbin_get = ((pasteID) => $.ajax({
        url: Wasabee.Constants.SERVER_BASE_KEY + "/simple/" + pasteID,
        crossDomain: true,
        method: "GET",
    }).done(function (response) {
        var decodedResponse = atob(response)
        window.plugin.wasabee.saveImportString(decodedResponse)
    }).fail(function (jqXHR, textStatus) {
        alert('Paste Creation Failed -> ' + textStatus)
    }));

    window.plugin.wasabee.getUrlParams = function (parameter, defaultvalue) {
        var urlparameter = defaultvalue;
        if (window.location.href.indexOf(parameter) > -1) {
            urlparameter = window.plugin.wasabee.getUrlVars()[parameter];
        }
        return urlparameter;
    }

    window.plugin.wasabee.getUrlVars = function () {
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
            vars[key] = value;
        });
        return vars;
    }

    //** This function adds the plugin buttons on the left side of the screen */
    window.plugin.wasabee.addButtons = function () {

        window.plugin.wasabee.buttons = L.Control.extend({
            options: {
                position: 'topleft'
            },
            onAdd: function (map) {
                var container = L.DomUtil.create('div', 'leaflet-arcs leaflet-bar');
                $(container).append('<a id="wasabee_viewopsbutton" href="javascript: void(0);" class="wasabee-control" title="Manage Operations"><img src=' + Wasabee.Images.toolbar_viewOps + ' style="vertical-align:middle;align:center;" /></a>').on('click', '#wasabee_viewopsbutton', function () {
                    Wasabee.OpsDialog.update(Wasabee.opList);
                });
                $(container).append('<a id="wasabee_addlinksbutton" href="javascript: void(0);" class="wasabee-control" title="Add Links"><img src=' + Wasabee.Images.toolbar_addlinks + ' style="vertical-align:middle;align:center;" /></a>').on('click', '#wasabee_addlinksbutton', function () {
                    var selectedOp = window.plugin.wasabee.getSelectedOperation();
                    if (selectedOp != null)
                        Wasabee.LinkDialog.update(selectedOp, true);
                    else
                        alert("No selected Operation found.");
                });
                $(container).append('<a id="wasabee_addmarkersbutton" href="javascript: void(0);" class="wasabee-control" title="Add Markers"><img src=' + Wasabee.Images.toolbar_addMarkers + ' style="vertical-align:middle;align:center;" /></a>').on('click', '#wasabee_addmarkersbutton', function () {
                    var selectedOp = window.plugin.wasabee.getSelectedOperation();
                    if (selectedOp != null)
                        Wasabee.MarkerDialog.update(selectedOp)
                    else
                        alert("No selected Operation found.");
                });
                $(container).append('<a id="wasabee_syncbutton" href="javascript: void(0);" class="wasabee-control" title="Sync All Ops"><img src=' + Wasabee.Images.toolbar_sync + ' style="vertical-align:middle;align:center;" /></a>').on('click', '#wasabee_syncbutton', function () {
                    try {
                        //TODO close markers dialog and ops dialog
                        Wasabee.LinkDialog.closeDialogs();
                        Wasabee.OpsDialog.closeDialogs();
                        Wasabee.MarkerDialog.closeDialogs();
                        window.plugin.wasabee.authWithWasabee();
                    } catch (e) {
                        window.plugin.wasabee.showMustAuthAlert();
                    }
                });

                return container;
            }
        });
        map.addControl(new window.plugin.wasabee.buttons());
    };

    window.plugin.wasabee.showMustAuthAlert = function() {
        var content = document.createElement("div");
        var title = content.appendChild(document.createElement("div"));
        title.className = "desc";
        title.innerHTML = "In order to sync operations, you must log in.<br/>"
        buttonSet = content.appendChild(document.createElement("div"));
        buttonSet.className = "temp-op-dialog";
        var visitButton = buttonSet.appendChild(document.createElement("a"));
        visitButton.innerHTML = "Visit Site"
        visitButton.addEventListener("click", function () {
            window.open("https://server.wasabee.rocks")
        }, false);
        window.dialog({
            title: "You Must Authenticate",
            width: "auto",
            height: "auto",
            html: content,
            dialogClass: "wasabee-dialog-mustauth"
        });
    }

    window.plugin.wasabee.addCSS = function (content) {
        $("head").append('<link rel="stylesheet" type="text/css" href="' + content + '" />');
    }

    //*** This function iterates through the opList and returns the selected one.
    window.plugin.wasabee.getSelectedOperation = function () {
        for (let operation of Wasabee.opList) {
            if (operation.isSelected == true) {
                return Operation.create(operation);
            }
        }
        return null;
    }

    //*** This function creates an op list if one doesn't exist and sets the op list for the plugin
    window.plugin.wasabee.setupLocalStorage = function () {
        if (store.get(Wasabee.Constants.OP_RESTRUCTURE_KEY) == null) {
            window.plugin.wasabee.resetOpList();
            store.set(Wasabee.Constants.OP_RESTRUCTURE_KEY, true)
        }
        //This sets up the op list
        var opList = null;
        var opListObj = store.get(Wasabee.Constants.OP_LIST_KEY)
        if (opListObj != null) {
            opList = JSON.parse(opListObj);
        }
        
        if (opList == null) {
            var baseOp = new Operation(PLAYER.nickname, "Default Op", true);
            var listToStore = new Array();
            listToStore.push(baseOp);
            store.set(Wasabee.Constants.OP_LIST_KEY, JSON.stringify(listToStore));
            opList = JSON.parse(store.get(Wasabee.Constants.OP_LIST_KEY));
        }
        Wasabee.opList = opList;

        //This sets up the paste list
        var pasteList = null;
        var pasteListObj = store.get(Wasabee.Constants.PASTE_LIST_KEY)
        if (pasteListObj != null)
            pasteList = JSON.parse(pasteListObj);
        if (pasteList == null) {
            var emptyList = Array();
            store.set(Wasabee.Constants.PASTE_LIST_KEY, JSON.stringify(emptyList))
            pasteList = JSON.parse(store.get(Wasabee.Constants.PASTE_LIST_KEY))
        }
        Wasabee.pasteList = pasteList;
    }



    //** This function takes an operation and updates the entry in the op list that matches it */
    window.plugin.wasabee.updateOperationInList = function (operation, makeSelected = false, clearAllBut = false, showExportDialog = false) {
        var updatedArray = new Array();
        if (!(operation instanceof Operation)) {
            operation = Operation.create(operation)
        }
        operation.cleanPortalList();

        //TODO track selected thing and set it back to selected
        var selectedOpID = null;
        for (let opInList of Wasabee.opList) {
            if (!makeSelected) {
                if (opInList.isSelected) {
                    selectedOpID = opInList.ID
                }
            }
            if (opInList.ID != operation.ID && clearAllBut != true) {
                if (makeSelected)
                    opInList.isSelected = false; 
                updatedArray.push(opInList);
            }
        }

        if (makeSelected || selectedOpID == operation.ID)
            operation.isSelected = true;
        updatedArray.push(operation);

        if (updatedArray.length != 0) {
            updatedArray.sort(function (a, b) {
                if (a.name.toLowerCase() < b.name.toLowerCase()) { return -1; }
                if (a.name.toLowerCase() > b.name.toLowerCase()) { return 1; }
                return 0;
            })
            store.set(Wasabee.Constants.OP_LIST_KEY, JSON.stringify(updatedArray));
            Wasabee.opList = updatedArray;
            var selectedOp = window.plugin.wasabee.getSelectedOperation();
            Wasabee.LinkDialog.update(selectedOp, false)
            Wasabee.LinkListDialog.update(selectedOp, null, false);
            Wasabee.OpsDialog.update(Wasabee.opList, false);
            Wasabee.MarkerDialog.update(selectedOp, false, false)

            window.plugin.wasabee.drawThings();
        } else
            alert("Parse Error -> Saving Op List Failed");

        if (showExportDialog)
            Wasabee.ExportDialog.show(operation)
    }

    //** This function removes an operation from the main list */
    window.plugin.wasabee.removeOperationFromList = function (operation) {
        if (Wasabee.opList.length > 1) {
            var updatedArray = new Array();
            for (let opInList of Wasabee.opList) {
                if (opInList.ID != operation.ID) {
                    updatedArray.push(opInList);
                }
            }
            store.set(Wasabee.Constants.OP_LIST_KEY, JSON.stringify(updatedArray));
            Wasabee.opList = updatedArray;
            window.plugin.wasabee.updateOperationInList(Wasabee.opList[0], operation.isSelected)
        }
    }

    //** This function draws things on the layers */
    window.plugin.wasabee.drawThings = function () {
        window.plugin.wasabee.resetAllPortals();
        window.plugin.wasabee.resetAllTargets();
        window.plugin.wasabee.resetAllLinks();
        window.plugin.wasabee.checkAllLinks();
    }

    //** This function adds all the Targets to the layer */
    window.plugin.wasabee.addAllTargets = function () {
        var targetList = window.plugin.wasabee.getSelectedOperation().markers;
        targetList.forEach(function (target) {
            window.plugin.wasabee.addTarget(target);
        });
    }

    //** This function resets all the Targets and calls addAllTargets to add them */
    window.plugin.wasabee.resetAllTargets = function () {
        for (guid in window.plugin.wasabee.targetLayers) {
            var targetInLayer = window.plugin.wasabee.targetLayers[guid];
            window.plugin.wasabee.targetLayerGroup.removeLayer(targetInLayer);
            delete window.plugin.wasabee.targetLayers[guid];
        }
        window.plugin.wasabee.addAllTargets();
    }

    /** This function adds a Targets to the target layer group */
    window.plugin.wasabee.addTarget = function (target) {
        var targetPortal = window.plugin.wasabee.getSelectedOperation().getPortal(target.portalId)
        var latLng = new L.LatLng(targetPortal.lat, targetPortal.lng);
        var marker = L.marker(latLng, {
            title: targetPortal.name,
            icon: L.icon({
                iconUrl: window.plugin.wasabee.getImageFromMarkerType(target.type),
                shadowUrl: null,
                iconSize: L.point(25, 41),
                iconAnchor: L.point(25, 41),
                popupAnchor: L.point(-1, -48)
            })
        });

        window.registerMarkerForOMS(marker);
        marker.bindPopup(window.plugin.wasabee.getMarkerPopup(marker, target, targetPortal));
        marker.off("click", marker.togglePopup, marker);
        marker.on('spiderfiedclick', marker.togglePopup, marker);
        window.plugin.wasabee.targetLayers[target["ID"]] = marker;
        marker.addTo(window.plugin.wasabee.targetLayerGroup);
    }

    window.plugin.wasabee.getMarkerPopup = function (marker, target, portal) {
        marker.className = "wasabee-dialog wasabee-dialog-ops"
        var content = document.createElement("div");
        var title = content.appendChild(document.createElement("div"));
        title.className = "desc";
        title.innerHTML = window.markdown.toHTML(window.plugin.wasabee.getPopupBodyWithType(portal, target));
        buttonSet = content.appendChild(document.createElement("div"));
        buttonSet.className = "temp-op-dialog";
        var deleteButton = buttonSet.appendChild(document.createElement("a"));
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function () {
            Wasabee.UiCommands.deleteMarker(window.plugin.wasabee.getSelectedOperation(), target, portal)
            marker.closePopup();
        }, false);
        return content;
    }

    window.plugin.wasabee.getPopupBodyWithType = function (portal, target) {
        var title = ""
        var comment = target.comment
        switch (target.type) {
            case Wasabee.Constants.MARKER_TYPE_DESTROY:
                title = "Destroy"
                break;
            case Wasabee.Constants.MARKER_TYPE_DECAY:
                title = "Let Decay"
                break;
            case Wasabee.Constants.MARKER_TYPE_VIRUS:
                title = "Virus"
                break;
            default:
                title = "Unknown"
        }
        title = title + " - " + portal.name
        if (!comment)
            return title
        else
            return title + "\n\n" + comment
    }

    //** This function returns the appropriate image for a marker type */
    window.plugin.wasabee.getImageFromMarkerType = function (type) {
        switch (type) {
            case Wasabee.Constants.MARKER_TYPE_VIRUS:
                return Wasabee.Images.marker_alert_virus;
            case Wasabee.Constants.MARKER_TYPE_DESTROY:
                return Wasabee.Images.marker_alert_destroy;
            case Wasabee.Constants.MARKER_TYPE_DECAY:
                return Wasabee.Images.marker_alert_decay;
            default:
                return Wasabee.Images.marker_alert_unknown;
        }
    }

    //** This function adds all the Links to the layer */
    window.plugin.wasabee.addAllLinks = function () {
        var operation = window.plugin.wasabee.getSelectedOperation()
        var linkList = operation.links;
        linkList.forEach(function (link) {
            window.plugin.wasabee.addLink(link, operation.color, operation);
        });
    }

    //** This function resets all the Links and calls addAllLinks to add them */
    window.plugin.wasabee.resetAllLinks = function () {
        for (guid in window.plugin.wasabee.linkLayers) {
            var linkInLayer = window.plugin.wasabee.linkLayers[guid];
            window.plugin.wasabee.linkLayerGroup.removeLayer(linkInLayer);
            delete window.plugin.wasabee.linkLayers[guid];
        }
        window.plugin.wasabee.addAllLinks();
    }

    /** This function adds a portal to the portal layer group */
    window.plugin.wasabee.addLink = function (link, color, operation) {
        var color = window.plugin.wasabee.getColorHex(color)
        var options = {
            dashArray: [5, 5, 1, 5],
            color: color ? color : "#ff6600",
            opacity: 1,
            weight: 2
        };
        var latLngs = link.getLatLngs(operation);
        if (latLngs != null) {
            var fromPortal = operation.getPortal(link.fromPortalId)
            var toPortal = operation.getPortal(link.toPortalId)
            var startCoord = new window.plugin.wasabee.arc.Coord(latLngs[0].lng, latLngs[0].lat);
            var endCoord = new window.plugin.wasabee.arc.Coord(latLngs[1].lng, latLngs[1].lat);
            var gc = new window.plugin.wasabee.arc.GreatCircle(startCoord, endCoord);
            var distance = window.plugin.wasabee.distance(fromPortal, toPortal);
            var geojson_feature = gc.Arc(Math.round(distance)).json();

            var link_ = new L.geoJson(geojson_feature, options);

            window.plugin.wasabee.linkLayers[link["ID"]] = link_;
            link_.addTo(window.plugin.wasabee.linkLayerGroup);
        } else
            console.log("LATLNGS WAS NULL?!")
    }

    window.plugin.wasabee.authWithWasabee = (() => $.ajax({
        url: Wasabee.Constants.SERVER_BASE_KEY + "/me",
        xhrFields: {
            withCredentials: true
       },
        crossDomain: true,
        method: "GET",
    }).done(function (response) {
        if (response.Ops != null) {
            window.plugin.wasabee.updateServerOpList(response.Ops, true);
        }
    }).fail(function (jqXHR, textStatus) {
        window.plugin.wasabee.showMustAuthAlert();
    }));

    window.plugin.wasabee.uploadSingleOp = ((operation) => $.ajax({
        url: Wasabee.Constants.SERVER_BASE_KEY + "/api/v1/draw",
        xhrFields: {
            withCredentials: true
       },
        data: JSON.stringify(operation),
        crossDomain: true,
        method: "POST",
        dataType: "json",
        contentType: "application/json",
    }).done(function (response) {
        alert("Upload Complete.")
    }).fail(function (jqXHR, textStatus) {
        window.plugin.wasabee.showMustAuthAlert();
    }));

    window.plugin.wasabee.updateSingleOp = ((operation) => $.ajax({
        url: Wasabee.Constants.SERVER_BASE_KEY + "/api/v1/draw/" + operation.ID,
        xhrFields: {
            withCredentials: true
       },
        data: JSON.stringify(operation),
        crossDomain: true,
        method: "PUT",
        dataType: "json",
        contentType: "application/json",
    }).done(function (response) {
        alert("Update Complete.")
    }).fail(function (jqXHR, textStatus) {
        window.plugin.wasabee.showMustAuthAlert();
    }));

    window.plugin.wasabee.downloadSingleOp = ((operation) => $.ajax({
        url: Wasabee.Constants.SERVER_BASE_KEY + "/api/v1/draw/" + operation.ID,
        xhrFields: {
            withCredentials: true
       },
        crossDomain: true,
        method: "GET",
    }).done(function (response) {
        console.log("got response -> " + JSON.stringify(response))
    }).fail(function (jqXHR, textStatus) {
        alert("Download Failed.")
    }));

    window.plugin.wasabee.deleteOwnedServerOp = ((opID) => $.ajax({
        url: Wasabee.Constants.SERVER_BASE_KEY + "/api/v1/draw/" + opID + "/delete",
        xhrFields: {
            withCredentials: true
       },
        crossDomain: true,
        method: "GET",
    }).done(function (response) {
        console.log("got response -> " + JSON.stringify(response))
    }).fail(function (jqXHR, textStatus) {
        window.plugin.wasabee.showMustAuthAlert();
    }));

    window.plugin.wasabee.getOpDownloads = function(opList) {
        var opCalls = Array()
        opList.forEach(function (op, index) {
            opCalls.push(window.plugin.wasabee.downloadOpInList(op))
            console.log(op, index);
        });
        return opCalls
    }

    window.plugin.wasabee.downloadOpInList = ((op) => $.ajax({
        url: Wasabee.Constants.SERVER_BASE_KEY + "/api/v1/draw/" + op.ID,
        xhrFields: {
            withCredentials: true
       },
        crossDomain: true,
        method: "GET",
    }).done(function (response) {
        window.plugin.wasabee.updateOperationInList(Operation.create(response))
    }).fail(function (jqXHR, textStatus) {
        alert("Download Failed.")
    }));

    window.plugin.wasabee.updateServerOpList = function(opList, pullFullOps) {
        store.set(Wasabee.Constants.SERVER_OP_LIST_KEY, JSON.stringify(JSON.stringify(opList)));
        store.set(Wasabee.Constants.SERVER_OWNED_OP_LIST_KEY, JSON.stringify(JSON.stringify(opList)));

        if (pullFullOps) {
            Promise.all(window.plugin.wasabee.getOpDownloads(opList)).then(function () {
                alert("Sync Complete.")
            })["catch"](function (data) {
                throw alert(data.message), console.log(data), data;
            });
        }
    }

    window.plugin.wasabee.opIsOwnedServerOp = function(opID) {
        var isOwnedServerOp = false;
        var serverOwnedOpList = store.get(Wasabee.Constants.SERVER_OWNED_OP_LIST_KEY)
        if (serverOwnedOpList != null)
            for (let opInList of JSON.parse(serverOwnedOpList)) {
                if (opInList.ID != opID) {
                    isOwnedServerOp = true;
                }
            }
        return isOwnedServerOp;
    }

    window.plugin.wasabee.opIsServerOp = function(opID) {
        var isServerOp = false;
        var serverOpList = store.get(Wasabee.Constants.SERVER_OP_LIST_KEY)
        if (serverOpList != null)
            for (let opInList of JSON.parse(serverOpList)) {
                if (opInList.ID != opID) {
                    isServerOp = true;
                }
            }
        return isServerOp;
    }

    //** This function adds all the portals to the layer */
    window.plugin.wasabee.addAllPortals = function () {
        var operation = window.plugin.wasabee.getSelectedOperation()
        var portalList = operation.anchors;
        portalList.forEach(function (portalId) {
            //{"id":"b460fd49ee614b0892388272a5542696.16","name":"Outer Loop Old Road Trail Crossing","lat":"33.052057","lng":"-96.853656"}
            window.plugin.wasabee.addPortal(portalId, operation.color);
            //console.log("ADDING PORTAL: " + JSON.stringify(portal));
        });
    }

    //** This function resets all the portals and calls addAllPortals to add them */
    window.plugin.wasabee.resetAllPortals = function () {
        for (guid in window.plugin.wasabee.portalLayers) {
            var portalInLayer = window.plugin.wasabee.portalLayers[guid];
            window.plugin.wasabee.portalLayerGroup.removeLayer(portalInLayer);
            delete window.plugin.wasabee.portalLayers[guid];
        }
        window.plugin.wasabee.addAllPortals();
    }

    /** This function adds a portal to the portal layer group */
    window.plugin.wasabee.addPortal = function (portalId, color) {
        var portal = window.plugin.wasabee.getSelectedOperation().getPortal([portalId])
        var colorMarker = window.plugin.wasabee.getColorMarker(color)
        var latLng = new L.LatLng(portal.lat, portal.lng);
        var marker = L.marker(latLng, {
            title: portal["name"],
            icon: L.icon({
                iconUrl: colorMarker ? colorMarker : Wasabee.Images.marker_layer_groupa,
                iconAnchor: [12, 41],
                iconSize: [25, 41],
                popupAnchor: [0, -35]
            })
        });

        window.registerMarkerForOMS(marker);
        marker.bindPopup(window.plugin.wasabee.getPortalPopup(marker, portal, latLng));
        marker.off("click", marker.togglePopup, marker);
        marker.on('spiderfiedclick', marker.togglePopup, marker);
        window.plugin.wasabee.portalLayers[portal["id"]] = marker;
        marker.addTo(window.plugin.wasabee.portalLayerGroup);
    }

    //** This function gets the portal popup content */
    window.plugin.wasabee.getPortalPopup = function (marker, portal, latLng) {
        marker.className = "wasabee-dialog wasabee-dialog-ops"
        var content = document.createElement("div");
        var title = content.appendChild(document.createElement("div"));
        title.className = "desc";
        title.innerHTML = window.markdown.toHTML(portal.name);
        buttonSet = content.appendChild(document.createElement("div"));
        buttonSet.className = "temp-op-dialog";
        var linksButton = buttonSet.appendChild(document.createElement("a"));
        linksButton.textContent = "Links";
        linksButton.addEventListener("click", function () {
            Wasabee.UiCommands.showLinksDialog(window.plugin.wasabee.getSelectedOperation(), portal)
            marker.closePopup();
        }, false);
        var swapButton = buttonSet.appendChild(document.createElement("a"));
        swapButton.textContent = "Swap";
        swapButton.addEventListener("click", function () {
            Wasabee.UiCommands.swapPortal(window.plugin.wasabee.getSelectedOperation(), portal)
            marker.closePopup();
        }, false);
        var deleteButton = buttonSet.appendChild(document.createElement("a"));
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function () {
            Wasabee.UiCommands.deletePortal(window.plugin.wasabee.getSelectedOperation(), portal)
            marker.closePopup();
        }, false);
        var popup = L.popup().setLatLng(latLng).setContent(content)
        return popup;
    }

    //** This function opens a dialog with a text field to copy */
    window.plugin.wasabee.importString = function () {
        var promptAction = prompt('Press CTRL+V to paste (Wasabee data only).', '');
        if (promptAction !== null && promptAction !== '') {
            window.plugin.wasabee.saveImportString(promptAction)
        }
    }

    window.plugin.wasabee.saveImportString = function (string) {
        try {
            var keyIdentifier = "wasabeeShareKey="
            if (string.match(new RegExp("^(https?:\/\/)?(www\\.)?intel.ingress.com\/intel.*")) && string.includes(keyIdentifier)) {
                var key = string.substring(string.lastIndexOf(keyIdentifier) + keyIdentifier.length)
                console.log("KEY IS: " + key)
                window.plugin.wasabee.qbin_get(key)

            } else if (string.match(new RegExp("^(https?:\/\/)?(www\\.)?intel.ingress.com\/intel.*"))) {
                alert('Wasabee doesn\'t support stock intel draw imports')
            } else {
                var data = JSON.parse(string);
                var importedOp = Operation.create(data);
                window.plugin.wasabee.updateOperationInList(importedOp, true)
                console.log('WasabeeTools: reset and imported drawn items');
                alert('Imported Operation: ' + importedOp.name + ' Successfuly.');
            }
        } catch (e) {
            console.warn('WasabeeTools: failed to import data: ' + e);
            alert('Import Failed.');
        }
    }

    //** This function copies whatever value is sent into the function to the clipboard */
    //** Also, this is very hacky, find some better way? (ALSO IT DOESN'T WORK!? */
    window.plugin.wasabee.copyToClipboard = function (val) {
        var dummy = document.createElement("input");
        document.body.appendChild(dummy);
        $(dummy).css('display', 'none');
        dummy.setAttribute("id", "dummy_id");
        document.getElementById("dummy_id").value = val;
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
        alert("Copied to clipboard.")
    }

    //*** This function resets the local op list
    window.plugin.wasabee.resetOpList = function () {
        store.set(Wasabee.Constants.OP_LIST_KEY, null);
    }

    //** This function does something for the generate ID function */
    window.plugin.wasabee.dec2hex = function (dec) {
        return ('0' + dec.toString(16)).substr(-2)
    }

    //** This function generates a unique ID for an object */
    window.plugin.wasabee.generateId = function (len) {
        var arr = new Uint8Array((len || 40) / 2)
        window.crypto.getRandomValues(arr)
        return Array.from(arr, window.plugin.wasabee.dec2hex).join('')
    }

    /** This function gets a usable paste link from an operation */
    window.plugin.wasabee.getPasteLink = function (operation) {
        if (operation.pasteKey != null) {
            return Wasabee.Constants.INTEL_BASE_KEY + "?wasabeeShareKey=" + operation.pasteKey
        } else {
            return null
        }
    }
    class Operation {
        //ID <- randomly generated alpha-numeric ID for the operation
        //name <- name of operation
        //creator <- agent who created it
        //isSelected <- if true, this operation is the one that's currently displayed
        //portals <- List of Portals
        //links <- List of Links
        constructor(creator, name, isSelected) {
            this.ID = window.plugin.wasabee.generateId();
            this.name = name;
            this.creator = creator;
            this.isSelected = isSelected;
            this.opportals = Array();
            this.anchors = Array();
            this.links = Array();
            this.markers = Array();
            this.pasteKey = null;
            this.pasteExpireDate = 0;
            this.color = Wasabee.Constants.DEFAULT_OPERATION_COLOR
        }

        getColor() {
            if (this.color == null) return Wasabee.Constants.DEFAULT_OPERATION_COLOR
            else {
                return this.color
            }
        }

        updateColor(color) {
            if (this.color != color) {
                this.color = color
                this.update()
            }
        }

        containsPortal(portal) {
            if (portal) {
                if (this.opportals.length == 0)
                    return false;
                else {
                    for (let portal_ in this.opportals) {
                        if (portal_ && portal.id == portal_.id) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        containsLink(link) {
            if (this.links.length == 0)
                return false;
            else {
                for (let link_ in this.links) {
                    //THIS TESTS IF ITS THE SAME LINK
                    if ((this.links[link_].fromPortal["id"] == link.fromPortal["id"] && this.links[link_].toPortal["id"] == link.toPortal["id"]) ||
                        ((this.links[link_].toPortal["id"] == link.fromPortal["id"] && this.links[link_].fromPortal["id"] == link.toPortal["id"]))) {
                        return true;
                    }
                }
            }
            return false;
        }

        containsMarker(portal, markerType) {
            if (this.markers.length == 0)
                return false;
            else {
                for (let marker in this.markers) {
                    if (this.markers[marker].portalId == portal.id && this.markers[marker].type == markerType) {
                        return true;
                    }
                }
            }
            return false;
        }

        getLinkListFromPortal(portal) {
            var links = this.links.filter(function (listLink) {
                return listLink.fromPortal.id == portal.id || listLink.toPortal.id == portal.id;
            });
            return links;
        }

        getPortal(portalID) {
            for (let portal_ in this.opportals) {
                if (portalID == this.opportals[portal_].id) {
                    return this.opportals[portal_];
                }
            }
            return null;
        }

        removeAnchor(portalId) {
            this.anchors = this.anchors.filter(function (anchor) {
                return anchor !== portalId;
            });
            this.links = this.links.filter(function (listLink) {
                return listLink.fromPortalId !== portalId && listLink.toPortalId !== portalId;
            });
            this.cleanPortalList()
            this.update()
        }

        removeMarker(marker) {
            this.markers = this.markers.filter(function (listMarker) {
                return listMarker.ID !== marker.ID;
            });
            this.update();
        }

        //Passed in are the start, end, and portal the link is being removed from(so the other portal can be removed if no more links exist to it)
        removeLink(startPortal, endPortal) {
            var newLinks = [];
            for (let link_ in this.links) {
                if (!(this.links[link_].fromPortalId == startPortal.id && this.links[link_].toPortalId == endPortal.id)) {
                    newLinks.push(this.links[link_])
                }
            }
            this.links = newLinks;
            this.cleanPortalList()
            this.update()
        }

        reverseLink(startPortalID, endPortalID) {
            var newLinks = [];
            for (let link_ in this.links) {
                if (this.links[link_].fromPortalId == startPortalID && this.links[link_].toPortalId == endPortalID) {
                    this.links[link_].fromPortalId = endPortalID;
                    this.links[link_].toPortalId = startPortalID;
                }
                newLinks.push(this.links[link_])
            }
            this.links = newLinks;
            this.update()
        }

        //This removes opportals with no links and removes duplicates
        cleanPortalList() {
            var newPortals = [];
            for (let portal_ in this.opportals) {
                var foundPortal = false;
                for (let link_ in this.links) {
                    if (this.opportals[portal_]["id"] == this.links[link_].fromPortalId || this.opportals[portal_]["id"] == this.links[link_].toPortalId) {
                        foundPortal = true;
                    }
                }
                for (let marker_ in this.markers) {
                    if (this.opportals[portal_]["id"] == this.markers[marker_].portalId) {
                        foundPortal = true;
                    }
                }
                for (let anchor_ in this.anchors) {
                    if (this.opportals[portal_]["id"] == this.anchors[anchor_]) {
                        foundPortal = true;
                    }
                }
                if (foundPortal) {
                    newPortals.push(this.opportals[portal_])
                }
            }

            var finalPortals = [];
            for (let portal_ in newPortals) {
                if (finalPortals.length == 0) {
                    finalPortals.push(newPortals[portal_])
                } else {
                    var foundFinalPortal = false;
                    for (let finalPortal_ in finalPortals) {
                        if (newPortals[portal_]["id"] == finalPortals[finalPortal_]["id"]) {
                            foundFinalPortal = true;
                        }
                    }
                    if (foundFinalPortal == false) {
                        finalPortals.push(newPortals[portal_]);
                    }
                }
            }
            this.opportals = finalPortals;
        }

        addPortal(portal) {
            if (!this.containsPortal(portal)) {
                this.opportals.push(portal);
            } else
                console.log("Portal Already Exists In Operation -> " + JSON.stringify(sentPortal));
        }

        addLink(fromPortal, toPortal, description) {
            this.addAnchor(fromPortal)
            this.addAnchor(toPortal)

            var link = new Link(Operation.create(this), fromPortal.id, toPortal.id, description)
            if (!this.containsLink(link)) {
                this.links.push(link)
            } else
                console.log("Link Already Exists In Operation -> " + JSON.stringify(link));
        }

        containsAnchor(portalId) {
            if (this.anchors.length == 0)
                return false;
            else {
                for (let anchor_ in this.anchors) {
                    if (this.anchors[anchor_] == portalId) {
                        return true;
                    }
                }
            }
            return false;
        }

        addAnchor(portal) {
            if (!this.containsAnchor(portal.id)) {
                this.anchors.push(portal.id)
            }

            this.addPortal(portal)
        }

        swapPortal(originalPortal, newPortal) {
            this.opportals = this.opportals.filter(function (listPortal) {
                return listPortal.id !== originalPortal.id;
            });
            this.addPortal(newPortal)
            for (let link_ in this.links) {
                if (this.links[link_].fromPortal["id"] == originalPortal["id"]) {
                    this.links[link_].fromPortal = newPortal;
                } else if (this.links[link_].toPortal["id"] == originalPortal["id"]) {
                    this.links[link_].toPortal = newPortal;
                }
            }
        }

        addMarker(markerType, portal, comment) {
            if (portal) {
                if (!this.containsMarker(portal, markerType)) {
                    if (!this.containsPortal(portal)) {
                        this.addPortal(portal)
                    }
                    var marker = new Marker(markerType, portal.id, comment);
                    this.markers.push(marker);
                    this.update();
                } else {
                    alert("This portal already has a marker. Chose a different portal.")
                }
            }
        }

        clearAllItems() {
            this.opportals = Array();
            this.links = Array();
            this.markers = Array();
            this.update();
        }

        update() {
            window.plugin.wasabee.updateOperationInList(this);
        }

        static convertLinksToObjs(links) {
            var tempLinks = Array();
            for (let link_ in links) {
                if (links[link_] instanceof Link) {
                    tempLinks.push(links[link_]);
                } else {
                    tempLinks.push(Link.create(links[link_], this));
                }
            }
            return tempLinks;
        }

        static create(obj) {
            var operation = new Operation();
            for (var prop in obj) {
                if (operation.hasOwnProperty(prop)) {
                    if (prop == "links")
                        operation[prop] = Operation.convertLinksToObjs(obj[prop]);
                    else
                        operation[prop] = obj[prop];
                }
            }
            return operation;
        }
    }

    class Marker {
        constructor(type, portalId, comment) {
            this.ID = window.plugin.wasabee.generateId();
            this.portalId = portalId;
            this.type = type;
            this.comment = comment;
        }

        static create(obj) {
            var marker = new Marker();
            for (var prop in obj) {
                if (marker.hasOwnProperty(prop)) {
                    marker[prop] = obj[prop];
                }
            }
            return marker;
        }
    }

    class Link {
        //ID <- randomly generated alpha-numeric ID for the link
        //fromPortal <- portal the link is from
        //toPortal <- portal the link is to
        //description <- user entered description of link
        constructor(operation, fromPortalId, toPortalId, description) {
            this.ID = window.plugin.wasabee.generateId();
            this.fromPortalId = fromPortalId;
            this.toPortalId = toPortalId;
            this.description = description;
            this.assignedTo = null;
            this.throwOrderPos = null;
            this.populatePortals(operation)
        }

        populatePortals(operation) {

            this.fromPortal = operation.getPortal(this.fromPortalId)
            this.toPortal = operation.getPortal(this.toPortalId)
        }

        getLatLngs(operation) {
        var fromPortal = operation.getPortal(this.fromPortalId)
        var toPortal = operation.getPortal(this.toPortalId)
            if (fromPortal != null && toPortal != null) {
                var returnArray = Array();
                returnArray.push(new L.LatLng(fromPortal.lat, fromPortal.lng))
                returnArray.push(new L.LatLng(toPortal.lat, toPortal.lng))
                return returnArray
            } else
                return null;
        }

        static create(obj, operation) {
            var link = new Link(Operation.create(operation));
            for (var prop in obj) {
                if (link.hasOwnProperty(prop)) {
                    link[prop] = obj[prop];
                }
            }
            return link;
        }

    }

    /*** ARC THINGS */
    window.plugin.wasabee.distance = function (fromPortal, toPortal) {
        //How far between portals.
        var R = 6367; // km

        lat1 = fromPortal.lat;
        lon1 = fromPortal.lng;
        lat2 = toPortal.lat;
        lon2 = toPortal.lng;

        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var lat1 = lat1 * Math.PI / 180;
        var lat2 = lat2 * Math.PI / 180;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        d = Math.round(d * 1000) / 1000;
        return d;
    };
    //*** END ARC THINGS */

    //*** CROSSLINK THINGS */
    window.plugin.wasabee.greatCircleArcIntersect = function (ta0, ta1, tb0, tb1) {
        // based on the formula at http://williams.best.vwh.net/avform.htm#Int

        // method:
        // check to ensure no line segment is zero length - if so, cannot cross
        // check to see if either of the lines start/end at the same point. if so, then they cannot cross
        // check to see if the line segments overlap in longitude. if not, no crossing
        // if overlap, clip each line to the overlapping longitudes, then see if latitudes cross

        // anti-meridian handling. this code will not sensibly handle a case where one point is
        // close to -180 degrees and the other +180 degrees. unwrap coordinates in this case, so one point
        // is beyond +-180 degrees. this is already true in IITC
        // FIXME? if the two lines have been 'unwrapped' differently - one positive, one negative - it will fail

        //Dimand: Lets fix the date line issue.
        //always work in the eastern hemisphere. so += 360

        //fuck this object scope

        a0 = {};
        a1 = {};
        b0 = {};
        b1 = {};
        a0.lng = ta0.lng;
        a0.lat = ta0.lat;
        a1.lng = ta1.lng;
        a1.lat = ta1.lat;
        b0.lng = tb0.lng;
        b0.lat = tb0.lat;
        b1.lng = tb1.lng;
        b1.lat = tb1.lat;
        //debugger;
        // zero length line tests
        if ((a0.lat == a1.lat) && (a0.lng == a1.lng)) return false;
        if ((b0.lat == b1.lat) && (b0.lng == b1.lng)) return false;

        // lines have a common point
        if ((a0.lat == b0.lat) && (a0.lng == b0.lng)) return false;
        if ((a0.lat == b1.lat) && (a0.lng == b1.lng)) return false;
        if ((a1.lat == b0.lat) && (a1.lng == b0.lng)) return false;
        if ((a1.lat == b1.lat) && (a1.lng == b1.lng)) return false;

        // a0.lng<=-90 && a1.lng>=90 dosent suffice... a link from -70 to 179 still crosses
        //if a0.lng-a1.lng >180 or <-180 there is a cross!
        var aCross = false;
        var bCross = false;
        //this is the real link
        if ((a0.lng - a1.lng) < -180 || (a0.lng - a1.lng) > 180) {	//we have a dateline cross
            //console.log('DateLine Cross!');
            //move everything in the eastern hemisphere to the extended eastern one
            aCross = true;
            if (a0.lng < 0) {
                a0.lng += 360;
            }
            if (a1.lng < 0) {
                a1.lng += 360;
            }
        }
        //this is the arc
        if ((b0.lng - b1.lng) < -180 || (b0.lng - b1.lng) > 180) {
            //console.log('DateLine Cross!');
            bCross = true;
            if (b0.lng < 0) {
                b0.lng += 360;
            }
            if (b1.lng < 0) {
                b1.lng += 360;
            }
        }
        //now corrected both a and b for date line crosses.
        //now if link is entirely in the west we need to move it to the east.
        if (bCross && aCross) {
            //both got moved. all should be good.
            //do nothing
        }
        else if (aCross) {
            //now we need to move any links in the west of the main one
            if (Math.max(b0.lng, b1.lng) < Math.min(a0.lng, a1.lng)) {
                //console.log('arc shift');
                b0.lng += 360;
                b1.lng += 360;
            }
        }
        else if (bCross) {
            //now we need to move any links in the west of the main one
            if (Math.max(a0.lng, a1.lng) < Math.min(b0.lng, b1.lng)) {
                //console.log('link shift');
                a0.lng += 360;
                a1.lng += 360;
                //console.log(a0);
                //console.log(a1);
                //console.log(b0);
                //console.log(b1);
            }
        }

        // check for 'horizontal' overlap in longitude
        if (Math.min(a0.lng, a1.lng) > Math.max(b0.lng, b1.lng)) return false;
        if (Math.max(a0.lng, a1.lng) < Math.min(b0.lng, b1.lng)) return false;

        // ok, our two lines have some horizontal overlap in longitude
        // 1. calculate the overlapping min/max longitude
        // 2. calculate each line latitude at each point
        // 3. if latitudes change place between overlapping range, the lines cross

        // class to hold the pre-calculated maths for a geodesic line
        // TODO: move this outside this function, so it can be pre-calculated once for each line we test
        var GeodesicLine = function (start, end) {
            var d2r = Math.PI / 180.0;
            var r2d = 180.0 / Math.PI;

            // maths based on http://williams.best.vwh.net/avform.htm#Int

            if (start.lng == end.lng) {
                throw 'Error: cannot calculate latitude for meridians';
            }

            // only the variables needed to calculate a latitude for a given longitude are stored in 'this'
            this.lat1 = start.lat * d2r;
            this.lat2 = end.lat * d2r;
            this.lng1 = start.lng * d2r;
            this.lng2 = end.lng * d2r;

            var dLng = this.lng1 - this.lng2;

            var sinLat1 = Math.sin(this.lat1);
            var sinLat2 = Math.sin(this.lat2);
            var cosLat1 = Math.cos(this.lat1);
            var cosLat2 = Math.cos(this.lat2);

            this.sinLat1CosLat2 = sinLat1 * cosLat2;
            this.sinLat2CosLat1 = sinLat2 * cosLat1;

            this.cosLat1CosLat2SinDLng = cosLat1 * cosLat2 * Math.sin(dLng);
        };

        GeodesicLine.prototype.isMeridian = function () {
            return this.lng1 == this.lng2;
        };

        GeodesicLine.prototype.latAtLng = function (lng) {
            lng = lng * Math.PI / 180; //to radians

            var lat;
            // if we're testing the start/end point, return that directly rather than calculating
            // 1. this may be fractionally faster, no complex maths
            // 2. there's odd rounding issues that occur on some browsers (noticed on IITC MObile) for very short links - this may help
            if (lng == this.lng1) {
                lat = this.lat1;
            } else if (lng == this.lng2) {
                lat = this.lat2;
            } else {
                lat = Math.atan((this.sinLat1CosLat2 * Math.sin(lng - this.lng2) - this.sinLat2CosLat1 * Math.sin(lng - this.lng1)) / this.cosLat1CosLat2SinDLng);
            }
            return lat * 180 / Math.PI; // return value in degrees
        };



        // calculate the longitude of the overlapping region
        var leftLng = Math.max(Math.min(a0.lng, a1.lng), Math.min(b0.lng, b1.lng));
        var rightLng = Math.min(Math.max(a0.lng, a1.lng), Math.max(b0.lng, b1.lng));
        //console.log(leftLng);
        //console.log(rightLng);

        // calculate the latitudes for each line at left + right longitudes
        // NOTE: need a special case for meridians - as GeodesicLine.latAtLng method is invalid in that case
        var aLeftLat, aRightLat;
        if (a0.lng == a1.lng) {
            // 'left' and 'right' now become 'top' and 'bottom' (in some order) - which is fine for the below intersection code
            aLeftLat = a0.lat;
            aRightLat = a1.lat;
        } else {
            var aGeo = new GeodesicLine(a0, a1);
            aLeftLat = aGeo.latAtLng(leftLng);
            aRightLat = aGeo.latAtLng(rightLng);
        }

        var bLeftLat, bRightLat;
        if (b0.lng == b1.lng) {
            // 'left' and 'right' now become 'top' and 'bottom' (in some order) - which is fine for the below intersection code
            bLeftLat = b0.lat;
            bRightLat = b1.lat;
        } else {
            var bGeo = new GeodesicLine(b0, b1);
            bLeftLat = bGeo.latAtLng(leftLng);
            bRightLat = bGeo.latAtLng(rightLng);
        }
        //console.log(aLeftLat);
        //console.log(aRightLat);
        //console.log(bLeftLat);
        //console.log(bRightLat);
        // if both a are less or greater than both b, then lines do not cross

        if (aLeftLat < bLeftLat && aRightLat < bRightLat) return false;
        if (aLeftLat > bLeftLat && aRightLat > bRightLat) return false;

        // latitudes cross between left and right - so geodesic lines cross
        //console.log('Xlink!');
        return true;
    };

    window.plugin.wasabee.testPolyLine = function (drawnLink, link, markers, operation) {
        var a = link.getLatLngs(operation);
        var start = {};
        var end = {};
        var fromPortal = operation.getPortal(drawnLink.fromPortalId)
        var toPortal = operation.getPortal(drawnLink.toPortalId)
        start.lat = fromPortal.lat;
        start.lng = fromPortal.lng;
        end.lat = toPortal.lat;
        end.lng = toPortal.lng;

        if (window.plugin.wasabee.greatCircleArcIntersect(a[0], a[1], start, end)) {
            for (i = 0; i < markers.length; i++) {
                var marker = markers[i];
                if (marker.type == Wasabee.Constants.MARKER_TYPE_DESTROY || marker.type == Wasabee.Constants.MARKER_TYPE_VIRUS || marker.type == Wasabee.Constants.MARKER_TYPE_DECAY) {
                    if (window.plugin.wasabee.checkMarkerAgainstLink(marker, link, operation)) {
                        console.log("FOUND MARKER TO NOT SHOW CROSSLINK -> " + marker.ID)
                        return false;
                    }
                }
            }
            return true;
        }
        return false;
    };

    /** This checks if a marker is on either side of a link */
    window.plugin.wasabee.checkMarkerAgainstLink = function (marker, link, operation) {
        var latlngs = link.getLatLngs(operation);
        var markerPortal = operation.getPortal(marker.portalId)
        var v = latlngs[0];
        var center = latlngs[1];
        var view = markerPortal;
        return view ? view.lng == v.lng && view.lat == v.lat ? true : view.lng == center.lng && view.lat == center.lat ? true : false : false;
    }

    window.plugin.wasabee.showCrossLink = function (link, operation) {

        var blocked = L.geodesicPolyline(link.getLatLngs(operation), {
            color: '#d22',
            opacity: 0.7,
            weight: 5,
            clickable: false,
            dashArray: [8, 8],
            guid: link.options.guid
        });

        blocked.addTo(window.plugin.wasabee.crossLinkLayers);
        window.plugin.wasabee.crossLinkLayerGroup[link.options.guid] = blocked;
    }

    window.plugin.wasabee.testLink = function (drawnLinks, drawnMarkers, link, operation) {
        if (window.plugin.wasabee.crossLinkLayerGroup[link.options.guid]) return;
        try {
            drawnLinks.forEach(function (drawnLink) {
                var shouldShowCrosslink = plugin.wasabee.testPolyLine(drawnLink, link, drawnMarkers, operation);
                if (shouldShowCrosslink) {
                    plugin.wasabee.showCrossLink(link, operation);
                    throw Wasabee.Constants.BREAK_EXCEPTION;
                }
            });
        } catch (e) {
            if (e !== Wasabee.Constants.BREAK_EXCEPTION) throw e;
        }
    };

    window.plugin.wasabee.checkAllLinks = function () {
        window.plugin.wasabee.crossLinkLayers.clearLayers();
        plugin.wasabee.crossLinkLayerGroup = {};

        var operation = window.plugin.wasabee.getSelectedOperation();
        var drawnLinks = operation.links;
        var drawnMarkers = operation.markers;
        
        $.each(window.links, function (guid, link) {
            window.plugin.wasabee.doLinkTest(link, drawnLinks, drawnMarkers, operation);
        });
    }

    window.plugin.wasabee.onLinkAdded = function (data) {
        var operation = window.plugin.wasabee.getSelectedOperation();
        var drawnLinks = operation.links;
        var drawnMarkers = operation.markers;
        plugin.wasabee.doLinkTest(data.link, drawnLinks, drawnMarkers, operation);
    }

    window.plugin.wasabee.doLinkTest = function (finalLink, drawnLinks, drawnMarkers, operation) {
        plugin.wasabee.testLink(drawnLinks, drawnMarkers, finalLink, operation);
    }

    window.plugin.wasabee.testForDeletedLinks = function () {
        window.plugin.wasabee.crossLinkLayers.eachLayer(function (layer) {
            var guid = layer.options.guid;
            if (!window.links[guid]) {
                plugin.wasabee.crossLinkLayers.removeLayer(layer);
                delete plugin.wasabee.crossLinkLayerGroup[guid];
            }
        });
    }

    window.plugin.wasabee.onMapDataRefreshEnd = function () {
        window.plugin.wasabee.crossLinkLayers.bringToFront();
        window.plugin.wasabee.testForDeletedLinks();
    }

    window.plugin.wasabee.initCrossLinks = function () {
        window.plugin.wasabee.crossLinkLayers = new L.FeatureGroup();
        window.plugin.wasabee.crossLinkLayerGroup = {};
        window.addLayerGroup('Wasabee Cross Links', window.plugin.wasabee.crossLinkLayers, true);

        map.on('layeradd', function (obj) {
            if (obj.layer === window.plugin.wasabee.crossLinkLayers) {
                window.plugin.wasabee.checkAllLinks();
            }
        });
        map.on('layerremove', function (obj) {
            if (obj.layer === window.plugin.wasabee.crossLinkLayers) {
                window.plugin.wasabee.crossLinkLayers.clearLayers();
                window.plugin.wasabee.crossLinkLayerGroup = {};
            }
        });

        window.addHook('linkAdded', window.plugin.wasabee.onLinkAdded);
        window.addHook('mapDataRefreshEnd', window.plugin.wasabee.onMapDataRefreshEnd);
    }

    //*** END CROSSLINK THINGS */

    //PLUGIN END
    var setup = window.plugin.wasabee.loadExternals;

    setup.info = plugin_info; //add the script info data to the function as a property
    if (!window.bootPlugins)
        window.bootPlugins = [];
    window.bootPlugins.push(setup);
    // if IITC has already booted, immediately run the 'setup' function
    if (window.iitcLoaded && typeof setup === 'function')
        setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
script.appendChild(document.createTextNode('(' + wrapper + ')();'));
(document.body || document.head || document.documentElement).appendChild(script);
