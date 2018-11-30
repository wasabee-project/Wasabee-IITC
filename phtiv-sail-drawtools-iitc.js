// ==UserScript==
// @name         PhtivSail Draw Tools
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Less terrible draw tools, hopefully.
// @author       PhtivSail
// @include      https://*.ingress.com/intel*
// @include      http://*.ingress.com/intel*
// @match        https://*.ingress.com/intel*
// @match        http://*.ingress.com/intel*
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
        window.plugin = function () {};


    //PLUGIN START
    window.plugin.phtivsaildraw = function () {};
    window.plugin.phtivsaildraw.loadExternals = function () {
        try {
            console.log('Loading PhtivSailDraw now');
        } catch (e) {
        }

    };

    var PhtivSailDraw;
    !function (data) {
        var b;
        !function (a) {
            a.toolbar_addlinks = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAAASAAAAEgARslrPgAAALZJREFUOMvt0b1tAkEQhuEHQYZjSOjCQgIicA/0gc7UgUQb1wg4oYpLyJ2YwBAwB8sKhC4g45NGq9nd+XuHt1qZ38cnuuFv4hzH+Ysd9veSLXHAMbF5WHr3h+88+Av/WCTV76mLIv5O0xHWGGISfoFRFrzFKhntB4tOQ2ZlxuSiWbRV4ONJgvLRYxGAcoh14DGzMmVQq+e8xrqLDapoeRBFBIvKdc2NGNyM0G6YoHLeRtW08ut0AlmCLOTqNNpMAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE4LTExLTI5VDE5OjE3OjUwKzAwOjAwCdB9iwAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOC0xMS0yOVQxOToxNzo1MCswMDowMHiNxTcAAAAodEVYdHN2ZzpiYXNlLXVyaQBmaWxlOi8vL3RtcC9tYWdpY2steWVVelVwNFNNj+slAAAAAElFTkSuQmCC";
        }(b = data.Images || (data.Images = {}));
    }(PhtivSailDraw || (PhtivSailDraw = {}));

    !function (s) {
        var b;
        !function (es) {
            es.main = "data:text/css;base64,LnJlc3d1ZS10YWJsZSB7Cglib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOwoJZW1wdHktY2VsbHM6IHNob3c7Cgl3aWR0aDogMTAwJTsKCWNsZWFyOiBib3RoOwp9Ci5yZXN3dWUtdGFibGUgdGQsIC5yZXN3dWUtdGFibGUgdGggewoJYm9yZGVyLXdpZHRoOiAwIDFweDsKCWJvcmRlci1zdHlsZTogc29saWQ7Cglib3JkZXItY29sb3I6IHJnYmEoOCwgNDgsIDc4LCAwLjc1KTsKCXBhZGRpbmc6IDNweCA0cHg7Cgl0ZXh0LWFsaWduOiBsZWZ0Owp9Ci5yZXN3dWUtdGFibGUgdGQ6Zmlyc3QtY2hpbGQsIC5yZXN3dWUtdGFibGUgdGg6Zmlyc3QtY2hpbGQgeyBib3JkZXItbGVmdC13aWR0aDogMDsgfQoucmVzd3VlLXRhYmxlIHRkOmxhc3QtY2hpbGQsICAucmVzd3VlLXRhYmxlIHRoOmxhc3QtY2hpbGQgeyBib3JkZXItcmlnaHQtd2lkdGg6IDA7IH0KLnJlc3d1ZS10YWJsZSB0Ym9keSB0cjpudGgtY2hpbGQoMm4rMSkgdGQgewoJYm9yZGVyLWNvbG9yOiByZ2JhKDI1LCA2MywgOTUsIDAuNzUpOwp9Ci5yZXN3dWUtdGFibGUgdHIgewoJYmFja2dyb3VuZDogcmdiYSgyNSwgNjMsIDk1LCAwLjc1KTsKfQoucmVzd3VlLXRhYmxlIHRib2R5IHRyOm50aC1jaGlsZCgybisxKSB7CgliYWNrZ3JvdW5kOiByZ2JhKDgsIDQ4LCA3OCwgMC43NSk7Cn0KLnJlc3d1ZS10YWJsZSA+IHRoZWFkIC5zb3J0YWJsZSB7CgljdXJzb3I6IHBvaW50ZXI7Cn0KLnJlc3d1ZS10YWJsZSA+IHRoZWFkIC5zb3J0ZWQgewoJY29sb3I6ICNmZmNlMDA7Cn0KLnJlc3d1ZS10YWJsZSA+IHRoZWFkIC5zb3J0YWJsZTpiZWZvcmUgewoJY29udGVudDogIiAiOwoJZGlzcGxheTogaW5saW5lLWJsb2NrOwoJZmxvYXQ6IHJpZ2h0OwoJbWluLXdpZHRoOiAxZW07Cgl0ZXh0LWFsaWduOiByaWdodDsKfQoucmVzd3VlLXRhYmxlID4gdGhlYWQgLnNvcnRhYmxlLmFzYzpiZWZvcmUgewoJY29udGVudDogIlwyNWIyIjsKfQoucmVzd3VlLXRhYmxlID4gdGhlYWQgLnNvcnRhYmxlLmRlc2M6YmVmb3JlIHsKCWNvbnRlbnQ6ICJcMjViYyI7Cn0KLnJlc3d1ZS10YWJsZSB0ZC5tZW51IHsKCXBvc2l0aW9uOiByZWxhdGl2ZTsKCW1pbi1oZWlnaHQ6IDIwcHg7CgltaW4td2lkdGg6IDI0cHg7Cn0KLnJlc3d1ZS10YWJsZSB0ZC5tZW51ID4gLnJlc3d1ZS1vdmVyZmxvdy1idXR0b24gewoJcG9zaXRpb246IGFic29sdXRlOwoJdG9wOiAwOwoJbGVmdDogMDsKCXJpZ2h0OiAwOwoJYm90dG9tOiAwOwoJZGlzcGxheTogZmxleDsKfQoKLnJlc3d1ZS1kaWFsb2ctcG9ydGFsbGlzdCAua2V5cywKLnJlc3d1ZS1kaWFsb2ctcG9ydGFsbGlzdCAubGlua3MgewoJd2lkdGg6IDMuNWVtOyAvKiB3aWxsIGV4cGFuZCB0byBmaXQgY29udGVudCAqLwoJdGV4dC1hbGlnbjogcmlnaHQ7Cn0KLnJlc3d1ZS1kaWFsb2ctcG9ydGFsbGlzdCAud2FybiB7Cgljb2xvcjogI2ZmMDsKCWZsb2F0OiBsZWZ0OwoJZm9udC1zaXplOiAxLjVlbTsKCWZvbnQtd2VpZ2h0OiBib2xkOwp9Ci5yZXN3dWUtZGlhbG9nLXBvcnRhbGxpc3QgLndhcm4uZXJyb3IgewoJY29sb3I6ICNmMDA7Cn0KCi8qIHN0eWxlLmNzcyBzZXRzIGRpYWxvZyBtYXgtd2lkdGggdG8gNzAwcHggLSBvdmVycmlkZSB0aGF0IGhlcmUgKi8KLnJlc3d1ZS1kaWFsb2ctbGlua2xpc3QgewoJbWF4LXdpZHRoOiAxMDAwcHggIWltcG9ydGFudDsKfQoucmVzd3VlLWRpYWxvZy1wb3J0YWxsaXN0ID4gLnVpLWRpYWxvZy1jb250ZW50LAoucmVzd3VlLWRpYWxvZy1saW5rbGlzdCA+IC51aS1kaWFsb2ctY29udGVudCwKLnJlc3d1ZS1kaWFsb2ctYWxlcnRsaXN0ID4gLnVpLWRpYWxvZy1jb250ZW50IHsKCXBhZGRpbmc6IDA7Cn0KLnJlc3d1ZS1kaWFsb2ctbGlua2xpc3QgLnJlc3d1ZS1sYXllciB7CgltYXJnaW46IC00cHggMCAtNHB4IC00cHg7Cn0KLnJlc3d1ZS1kaWFsb2ctbGlua2xpc3QgdGQua2V5cywKLnJlc3d1ZS1kaWFsb2ctbGlua2xpc3QgdGQubGVuZ3RoIHsKCXRleHQtYWxpZ246IHJpZ2h0Owp9CgoucmVzd3VlLWRpYWxvZy1hbGVydGxpc3QgdGQgewoJdmVydGljYWwtYWxpZ246IGJhc2VsaW5lOwp9Ci5yZXN3dWUtZGlhbG9nLWFsZXJ0bGlzdCAuYXNzaWduZWUgewoJd2hpdGUtc3BhY2U6IG5vd3JhcDsKCW92ZXJmbG93OiBoaWRkZW47Cgl0ZXh0LW92ZXJmbG93OiBlbGxpcHNpczsKCW1heC13aWR0aDogMTBlbTsKfQoucmVzd3VlLWRpYWxvZy1hbGVydGxpc3QgLnJlc29sdmVkIGJ1dHRvbiB7CgltYXJnaW46IC0zcHggMDsKCXBhZGRpbmc6IDAgMC41ZW0gMXB4Owp9CgojcmVzd3VlLWZha2UtYnV0dG9uIHsKCXBvc2l0aW9uOiBhYnNvbHV0ZTsKCXRvcDogLTk5OTllbTsKCWxlZnQ6IC05OTk5ZW07Cn0KCi5yZXN3dWUtYWxlcnRzLW51bSB7Cgljb2xvcjogIzAwRkYwMDsKfQoucmVzd3VlLWFsZXJ0cy1udW0ubmV3IHsKCWNvbG9yOiAjZmYwMDAwOwoJZm9udC13ZWlnaHQ6IGJvbGQ7Cn0KCi5yZXN3dWUtYWdlbnRzZWxlY3QgLnJlc3d1ZS1ncm91cC1pbmRpY2F0b3IgewoJZmxvYXQ6IHJpZ2h0OwoJbWFyZ2luLWxlZnQ6IDAuMjVlbTsKfQoKLnJlc3d1ZS1ncm91cC1jb250YWluZXIgewoJYm9yZGVyOiAxcHggc29saWQgY3VycmVudENvbG9yOwoJZGlzcGxheTogaW5saW5lLWJsb2NrOwoJaGVpZ2h0OiAxLjJlbTsKCWxpbmUtaGVpZ2h0OiAxLjJlbTsKCW1hcmdpbjogMXB4IDAuMjVlbSAxcHggMDsKCXBhZGRpbmc6IDAgMC4yNWVtOwp9Ci5yZXN3dWUtZ3JvdXAtY29udGFpbmVyID4gLnJlc3d1ZS1ncm91cC1pbmRpY2F0b3IgewoJbWFyZ2luLWxlZnQ6IC0wLjI1ZW07CgltYXJnaW4tcmlnaHQ6IDAuMjVlbTsKCWhlaWdodDogMS4yZW07Cgl3aWR0aDogMS4yZW07Cn0KCi5yZXN3dWUtZ3JvdXAtaW5kaWNhdG9yIHsKCWRpc3BsYXk6IGlubGluZS1ibG9jazsKCXBvc2l0aW9uOiByZWxhdGl2ZTsKCXdpZHRoOiAxZW07CgloZWlnaHQ6IDFlbTsKCXZlcnRpY2FsLWFsaWduOiB0b3A7Cn0KLnJlc3d1ZS1ncm91cC1pbmRpY2F0b3IgPiBkaXYgewoJaGVpZ2h0OiAxZW07CglmbG9hdDogbGVmdDsKfQoKLnJlc3d1ZS1wb3B1cCB7CgltYXgtd2lkdGg6IDMwMHB4Owp9Ci5yZXN3dWUtZGlhbG9nIC5kZXNjIHAsCi5yZXN3dWUtZGlhbG9nIC5kZXNjIHVsLAoucmVzd3VlLXBvcHVwIHAsCi5yZXN3dWUtcG9wdXAgdWwgewoJbWFyZ2luOiAwOwp9Ci5yZXN3dWUtcG9wdXAgYSB7Cgljb2xvcjogIzAwOTlDQzsKfQoucmVzd3VlLWRpYWxvZyAuZGVzYyB1bCwKLnJlc3d1ZS1wb2x5Z29uLWxhYmVsIHVsLAoucmVzd3VlLXBvcHVwIC5kZXNjIHVsIHsKCXBhZGRpbmctbGVmdDogMS41ZW07Cn0KLnJlc3d1ZS1kaWFsb2cgLmRlc2MgZW0sCi5yZXN3dWUtcG9seWdvbi1sYWJlbCBlbSwKLnJlc3d1ZS1wb3B1cCAuZGVzYyBlbSB7Cgljb2xvcjogaW5oZXJpdDsKCWZvbnQtc3R5bGU6IGl0YWxpYzsKfQoucmVzd3VlLXBvcHVwLnBvcnRhbCAudWktZGlhbG9nLWJ1dHRvbnNldCB7CglkaXNwbGF5OiBib3g7CglkaXNwbGF5OiBmbGV4OwoJbWFyZ2luLXRvcDogNnB4Owp9Ci5yZXN3dWUtcG9wdXAucG9ydGFsIC51aS1kaWFsb2ctYnV0dG9uc2V0IGJ1dHRvbiB7CglmbGV4LWdyb3c6IDE7Cglib3gtZ3JvdzogMTsKfQoucmVzd3VlLXBvcHVwIGltZy5hdmF0YXIgewoJbWF4LXdpZHRoOiA5NnB4OwoJbWF4LWhlaWdodDogOTZweDsKCW1hcmdpbi1sZWZ0OiA0cHg7CglmbG9hdDogcmlnaHQ7Cn0KCi5yZXN3dWUta2V5cy1vdmVybGF5LCAucmVzd3VlLWFnZW50LWxhYmVsLCAucmVzd3VlLXBvbHlnb24tbGFiZWwgewoJY29sb3I6ICNGRkZGQkI7Cglmb250LXNpemU6IDEycHg7CglsaW5lLWhlaWdodDogMTZweDsKCXRleHQtYWxpZ246IGNlbnRlcjsKCXBhZGRpbmc6IDJweDsKCW92ZXJmbG93OiBoaWRkZW47Cgl3aGl0ZS1zcGFjZTogbm93cmFwOwoJdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7Cgl0ZXh0LXNoYWRvdzogMXB4IDFweCAjMDAwLCAxcHggLTFweCAjMDAwLCAtMXB4IDFweCAjMDAwLCAtMXB4IC0xcHggIzAwMCwgMCAwIDVweCAjMDAwOwoJcG9pbnRlci1ldmVudHM6bm9uZTsKfQoucmVzd3VlLWtleXMtb3ZlcmxheSB7CglsaW5lLWhlaWdodDogMjFweDsKCXZlcnRpY2FsLWFsaWduOiBtaWRkbGU7Cglmb250LXNpemU6IDE0cHg7Cglmb250LXdlaWdodDogYm9sZDsKfQoucmVzd3VlLXBvbHlnb24tbGFiZWwgewoJdmVydGljYWwtYWxpZ246IG1pZGRsZTsKCWZvbnQtd2VpZ2h0OiBib2xkZXI7Cgl0ZXh0LXNoYWRvdzogMCAwIDFweCB3aGl0ZTsKfQoucmVzd3VlLXBvbHlnb24tbGFiZWwgcCwKLnJlc3d1ZS1wb2x5Z29uLWxhYmVsIHVsIHsKCW1hcmdpbjogMDsKCW92ZXJmbG93OiBoaWRkZW47Cgl0ZXh0LW92ZXJmbG93OiBlbGxpcHNpczsKfQoKLnJlc3d1ZS1vdmVyZmxvdy1idXR0b24gewoJZGlzcGxheTogaW5saW5lLWJveDsKCWRpc3BsYXk6IGlubGluZS1mbGV4OwoJbWluLXdpZHRoOiAyNHB4OwoJbWluLWhlaWdodDogMjBweDsKCXRleHQtYWxpZ246IGNlbnRlcjsKCXZlcnRpY2FsLWFsaWduOiBtaWRkbGU7Cglmb250LXdlaWdodDogYm9sZDsKCXRleHQtZGVjb3JhdGlvbjogbm9uZSAhaW1wb3J0YW50OwoJY29sb3I6ICNmZmNlMDA7CgljdXJzb3I6IHBvaW50ZXI7CglhbGlnbi1pdGVtczogY2VudGVyOwoJanVzdGlmeS1jb250ZW50OiBjZW50ZXI7Cn0KLnJlc3d1ZS1vdmVyZmxvdy1idXR0b24gc3BhbiB7CglmbGV4OiAwIDAgYXV0bzsKCWJveDogMCAwIGF1dG87Cn0KLnJlc3d1ZS1vdmVyZmxvdy1tZW51IHsKCWJvcmRlcjogMXB4IHNvbGlkICMyMGE4YjE7CgliYWNrZ3JvdW5kOiByZ2JhKDgsIDQ4LCA3OCwgMC45KTsKCWNvbG9yOiAjZmZjZTAwOwoJcGFkZGluZzogMDsKCW1hcmdpbjogMDsKCXBvc2l0aW9uOiBhYnNvbHV0ZTsKCWxpc3Qtc3R5bGU6IG5vbmU7Cgl6LWluZGV4OiAzMDAwMDsKCW1heC1oZWlnaHQ6IDcwJTsKCW1heC13aWR0aDogMjVlbTsKCW92ZXJmbG93LXk6IGF1dG87CglvdmVyZmxvdy14OiBoaWRkZW47Cn0KLnJlc3d1ZS1vdmVyZmxvdy1tZW51IGEgewoJZGlzcGxheTogYmxvY2s7CglwYWRkaW5nOiAwLjVlbTsKCW1pbi13aWR0aDogOGVtOwoJdGV4dC1kZWNvcmF0aW9uOiBub25lOwoJb3V0bGluZTogMCB0cmFuc3BhcmVudCBub25lICFpbXBvcnRhbnQ7Cn0KLnJlc3d1ZS1vdmVyZmxvdy1tZW51IGE6aG92ZXIgewoJdGV4dC1kZWNvcmF0aW9uOiBub25lOwoJYmFja2dyb3VuZC1jb2xvcjogcmdiYSgzMiwgMTY4LCAxNzcsIDAuNyk7Cn0KLnJlc3d1ZS1vdmVyZmxvdy1tZW51IGE6Zm9jdXMsCi5yZXN3dWUtb3ZlcmZsb3ctbWVudSBhOmFjdGl2ZSB7Cgl0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTsKfQoK";
            es.ui = "data:text/css;base64,Ym9keS5wcml2YWN5X2FjdGl2ZSAucmVzd3VlLXRvb2xiYXIgewoJZGlzcGxheTogbm9uZTsKfQoKI3Jlc3d1ZS1idG4tc3luYy5ydW5uaW5nIHsKCS13ZWJraXQtYW5pbWF0aW9uLWR1cmF0aW9uOiAxczsKCSAgICAgICAgYW5pbWF0aW9uLWR1cmF0aW9uOiAxczsKCS13ZWJraXQtYW5pbWF0aW9uLW5hbWU6IHJlc3d1ZS1zeW5jLXJ1bm5pbmc7CgkgICAgICAgIGFuaW1hdGlvbi1uYW1lOiByZXN3dWUtc3luYy1ydW5uaW5nOwoJLXdlYmtpdC1hbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uOiBsaW5lYXI7CgkgICAgICAgIGFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb246IGxpbmVhcjsKCS13ZWJraXQtYW5pbWF0aW9uLWl0ZXJhdGlvbi1jb3VudDogaW5maW5pdGU7CgkgICAgICAgIGFuaW1hdGlvbi1pdGVyYXRpb24tY291bnQ6IGluZmluaXRlOwp9CkAtd2Via2l0LWtleWZyYW1lcyByZXN3dWUtc3luYy1ydW5uaW5nIHsKCTAlIHsKCQktd2Via2l0LXRyYW5zZm9ybTogcm90YXRlKDBkZWcpOwoJCSAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7Cgl9CgkxMDAlIHsKCQktd2Via2l0LXRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7CgkJICAgICAgICB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpOwoJfQp9CkBrZXlmcmFtZXMgcmVzd3VlLXN5bmMtcnVubmluZyB7CgkwJSB7CgkJLXdlYmtpdC10cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTsKCQkgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpOwoJfQoJMTAwJSB7CgkJLXdlYmtpdC10cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpOwoJCSAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTsKCX0KfQoKI3Jlc3d1ZS1tZW51LWNvbmZpZyB7CglkaXNwbGF5OiBib3g7IC8qIG9sZCB2YWx1ZSwgZm9yIEFuZHJvaWQgKi8KCWRpc3BsYXk6IGZsZXg7CgltYXJnaW46IC0xMnB4OwoJcG9zaXRpb246IHJlbGF0aXZlOwp9CiNyZXN3dWUtbWVudS1jb25maWcubW9iaWxlIHsKCWJhY2tncm91bmQ6IHRyYW5zcGFyZW50OwoJcGFkZGluZzogMDsKCWJvcmRlcjogMCBub25lOwoJbWFyZ2luOiAwOwoJaGVpZ2h0OiAxMDAlOwoJd2lkdGg6IDEwMCU7CglsZWZ0OiAwOwoJdG9wOiAwOwoJcG9zaXRpb246IGFic29sdXRlOwoJb3ZlcmZsb3c6IGF1dG87Cn0KI3Jlc3d1ZS1tZW51LWNvbmZpZyAucHJvZ3Jlc3MgewoJcG9zaXRpb246IGFic29sdXRlOwoJdG9wOiAwOwoJbGVmdDogMDsKCXJpZ2h0OiAwOwoJaGVpZ2h0OiAzcHg7CgliYWNrZ3JvdW5kLWNvbG9yOiAjRUVFRUVFOwoJZGlzcGxheTogbm9uZTsKfQojcmVzd3VlLW1lbnUtY29uZmlnLnNob3dwcm9ncmVzcyAucHJvZ3Jlc3MgewoJZGlzcGxheTogYmxvY2s7Cn0KI3Jlc3d1ZS1tZW51LWNvbmZpZyAucHJvZ3Jlc3MgLnByb2dyZXNzLXZhbHVlIHsKCXBvc2l0aW9uOiBhYnNvbHV0ZTsKCXRvcDogMDsKCWxlZnQ6IDA7CgloZWlnaHQ6IDEwMCU7CgliYWNrZ3JvdW5kLWNvbG9yOiAjRkZDRTAwOwoJd2lkdGg6IDAlOwp9CiNyZXN3dWUtbWVudS1jb25maWcgbmF2IHsKCWRpc3BsYXk6IGJsb2NrOwoJbWluLWhlaWdodDogMTUwcHg7Cgl3aWR0aDogMTUwcHg7Cglib3JkZXItcmlnaHQ6IDFweCBzb2xpZCAjMjBBOEIxOwoJdmVydGljYWwtYWxpZ246IHRvcDsKCWZsZXgtc2hyaW5rOiAwOwoJZmxleC1ncm93OiAwOwoJYm94LXNocmluazogMDsKCWJveC1ncm93OiAwOwp9CiNyZXN3dWUtbWVudS1jb25maWcgLnRhYnMgewoJcG9zaXRpb246IHJlbGF0aXZlOwoJcGFkZGluZzogMTBweDsKCWZsZXgtc2hyaW5rOiAxOwoJZmxleC1ncm93OiAxOwoJYm94LXNocmluazogMTsKCWJveC1ncm93OiAxOwoJLyogbWF4LXdpZHRoOiAzMjBweDsgKi8KfQojcmVzd3VlLW1lbnUtY29uZmlnIG5hdiBhIHsKCWNvbG9yOiB3aGl0ZTsKCXBhZGRpbmc6IDAuNWVtOwoJZGlzcGxheTogYmxvY2s7Cgl0ZXh0LXdlaWdodDogYm9sZDsKCWJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjMjBBOEIxOwoJdGV4dC1kZWNvcmF0aW9uOiBub25lOwp9CiNyZXN3dWUtbWVudS1jb25maWcgbmF2IGE6bGFzdC1jaGlsZCB7Cglib3JkZXItYm90dG9tLXdpZHRoOiAwOwp9CiNyZXN3dWUtbWVudS1jb25maWcgbmF2IGE6aG92ZXIgewoJYmFja2dyb3VuZC1jb2xvcjogIzA4M0M0RTsKfQojcmVzd3VlLW1lbnUtY29uZmlnIG5hdiBhLmNsaWNrZWQgewoJYmFja2dyb3VuZC1jb2xvcjogIzIwQThCMTsKfQojcmVzd3VlLW1lbnUtY29uZmlnIHNlY3Rpb24gaDIgewoJZm9udC1zaXplOiAxOHB4OwoJbWFyZ2luOiAwIDAgMC40ZW0gMDsKCXBhZGRpbmc6IDA7Cn0KI3Jlc3d1ZS1tZW51LWNvbmZpZyBzZWN0aW9uIGgyIHNtYWxsIHsKCWNvbG9yOiAjQ0NDQ0NDOwoJdmVydGljYWwtYWxpZ246IHRvcDsKfQojcmVzd3VlLW1lbnUtY29uZmlnIGhyIHsKCWJvcmRlcjogMDsKCWhlaWdodDogMXB4OwoJYmFja2dyb3VuZC1jb2xvcjogIzIwQThCMQp9CiNyZXN3dWUtbWVudS1jb25maWcgZmllbGRzZXQgewoJYm9yZGVyOiAxcHggc29saWQgIzIwYThiMTsKCXBhZGRpbmc6IDAgMC42MjVlbTsKfQojcmVzd3VlLW1lbnUtY29uZmlnIGxlZ2VuZCB7Cgljb2xvcjogI2ZmY2UwMDsKCWZvbnQtd2VpZ2h0OiBib2xkOwp9CiNyZXN3dWUtbWVudS1jb25maWcgcCB7CgltYXJnaW46IDAuNWVtIDA7Cn0KI3Jlc3d1ZS1tZW51LWNvbmZpZyBsYWJlbCB7CglkaXNwbGF5OiBibG9jazsKfQojcmVzd3VlLW1lbnUtY29uZmlnIGxhYmVsIGlucHV0IHsKCXZlcnRpY2FsLWFsaWduOiBtaWRkbGU7CgltYXJnaW46IDAgMC4yZW07Cn0KI3Jlc3d1ZS1tZW51LWNvbmZpZy1zZWxlY3QgewoJZGlzcGxheTogbm9uZTsKCWZsZXgtc2hyaW5rOiAwOwoJZmxleC1ncm93OiAwOwoJYm94LXNocmluazogMDsKCWJveC1ncm93OiAwOwoJcGFkZGluZzogNXB4IDEwcHggMDsKfQojcmVzd3VlLW1lbnUtY29uZmlnLXNlbGVjdCBzZWxlY3QgewoJcGFkZGluZzogN3B4Owp9CiNyZXN3dWUtbWVudS1jb25maWctc2VsZWN0IGhyIHsKCW1hcmdpbjogNXB4IC0xMHB4IDA7Cn0KQG1lZGlhIChtYXgtd2lkdGg6IDk1OXB4KSB7CgkjcmVzd3VlLW1lbnUtY29uZmlnIHsKCQlmbGV4LWRpcmVjdGlvbjogY29sdW1uOwoJCWJveC1kaXJlY3Rpb246IGNvbHVtbjsKCX0KCSNyZXN3dWUtbWVudS1jb25maWcgbmF2IHsKCQlkaXNwbGF5OiBub25lOwoJfQoJI3Jlc3d1ZS1tZW51LWNvbmZpZy1zZWxlY3QgewoJCWRpc3BsYXk6IGJsb2NrOwoJfQp9CgoucmVzd3VlLWRpYWxvZyAudWktZGlhbG9nLWNvbnRlbnQgaW5wdXQsCi5yZXN3dWUtZGlhbG9nIC51aS1kaWFsb2ctY29udGVudCB0ZXh0YXJlYSB7Cglib3JkZXI6IDFweCBzb2xpZCAjMjBhOGIxOwoJY29sb3I6ICNmZmNlMDA7CgliYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuMyk7Cn0KLnJlc3d1ZS1kaWFsb2cgcCB7CgltYXJnaW46IDAgMCA2cHg7Cn0KCi5yZXN3dWUtZGlhbG9nLXBvcnRhbHMgPiAudWktZGlhbG9nLWNvbnRlbnQsCi5yZXN3dWUtZGlhbG9nLWxpbmsgPiAudWktZGlhbG9nLWNvbnRlbnQsCi5yZXN3dWUtZGlhbG9nLXBvbHlnb24gPiAudWktZGlhbG9nLWNvbnRlbnQgewoJcGFkZGluZzogNnB4IDZweCAwOwp9Ci5yZXN3dWUtZGlhbG9nLXBvcnRhbHMgLm5hbWUgbGFiZWwgewoJYWxpZ24taXRlbXM6IGJhc2VsaW5lOwoJZGlzcGxheTogZmxleDsKfQoucmVzd3VlLWRpYWxvZy1wb3J0YWxzIC5uYW1lIGxhYmVsID4gKnsKCWZsZXgtZ3JvdzogMTsKCW1hcmdpbi1sZWZ0OiAwLjVlbTsKfQoucmVzd3VlLWRpYWxvZyB0ZXh0YXJlYS5kZXNjLAoucmVzd3VlLWRpYWxvZyAuZGVzYyB0ZXh0YXJlYSB7Cglib3gtc2l6aW5nOiBib3JkZXItYm94OwoJd2lkdGg6IDEwMCU7CgloZWlnaHQ6IDQuNWVtOwoJcGFkZGluZzogM3B4OwoJcmVzaXplOiB2ZXJ0aWNhbDsKfQoucmVzd3VlLWRpYWxvZy1wb3J0YWxzIC5rZXlzIGlucHV0LAoucmVzd3VlLWRpYWxvZy1saW5rIC5rZXlzIGlucHV0IHsKCXdpZHRoOiA2ZW07CglwYWRkaW5nLXJpZ2h0OiAwOwp9Ci5yZXN3dWUtZGlhbG9nLXBvcnRhbHMgLmtleXMgaW5wdXQsCi5yZXN3dWUtZGlhbG9nLWxpbmsgLmtleXMgaW5wdXQgewoJbWFyZ2luLWxlZnQ6IDZweDsKfQoucmVzd3VlLWRpYWxvZy1wb3J0YWxzIC5kZXRhaWxzLAoucmVzd3VlLWRpYWxvZy1saW5rIC5kZXRhaWxzLAoucmVzd3VlLWRpYWxvZy1wb2x5Z29uIC5kZXRhaWxzIHsKCWRpc3BsYXk6IGJveDsKCWRpc3BsYXk6IGZsZXg7CglhbGlnbi1pdGVtczogY2VudGVyOwp9Ci5yZXN3dWUtZGlhbG9nLXBvcnRhbHMgLnJlc3d1ZS1sYXllciwKLnJlc3d1ZS1kaWFsb2ctbGluayAucmVzd3VlLWxheWVyLAoucmVzd3VlLWRpYWxvZy1wb2x5Z29uIC5yZXN3dWUtbGF5ZXIgewoJbWFyZ2luLWxlZnQ6IDEycHg7CglmbGV4OiAxIDEgYXV0bzsKCWJveDogMSAxIGF1dG87Cn0KLnJlc3d1ZS1kaWFsb2ctcG9ydGFscyAucG9zaXRpb253YXJuaW5nLmhpZGRlbiB7CglkaXNwbGF5OiBub25lOwp9Ci5yZXN3dWUtZGlhbG9nLXBvcnRhbHMgLnBvc2l0aW9ud2FybmluZyB7CgliYWNrZ3JvdW5kLWNvbG9yOiB5ZWxsb3c7Cglib3JkZXI6IDJweCBzb2xpZCByZWQ7Cgljb2xvcjogcmVkOwoJZm9udC13ZWlnaHQ6IGJvbGQ7CglwYWRkaW5nOiAwLjNlbTsKfQoKLnJlc3d1ZS1kaWFsb2ctbGluayAubGlua3BvcnRhbHMgewoJZGlzcGxheTogYm94OwoJZGlzcGxheTogZmxleDsKCW1hcmdpbjogMCAtNnB4IDZweDsKfQoucmVzd3VlLWRpYWxvZy1saW5rIC5saW5rcG9ydGFscyA+IHNwYW4gewoJZmxleDogMSAxIDUwJTsKCWJveDogMSAxIDUwJTsKCW1hcmdpbjogMCA2cHg7Cn0KCi5yZXN3dWUtZGlhbG9nLWxpbmtzID4gLnVpLWRpYWxvZy1jb250ZW50IHsKCXBhZGRpbmc6IDA7Cn0KLnJlc3d1ZS1kaWFsb2ctbGlua3MgPiAudWktZGlhbG9nLWNvbnRlbnQgPiBkaXYgewoJZGlzcGxheTogZmxleDsKCWZsZXgtZGlyZWN0aW9uOiBjb2x1bW47Cn0KLnJlc3d1ZS1kaWFsb2ctbGlua3MgdGV4dGFyZWEuZGVzYyB7CgltYXJnaW46IDZweCA2cHggM3B4OwoJaGVpZ2h0OiAyZW07Cgl3aWR0aDogYXV0bzsKCXBhZGRpbmc6IDRweDsKfQoucmVzd3VlLWRpYWxvZy1saW5rcyB0YWJsZSB7Cglib3JkZXItc3BhY2luZzogMDsKfQoucmVzd3VlLWRpYWxvZy1saW5rcyB0ZCB7Cgl2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlOwoJd2hpdGUtc3BhY2U6IG5vd3JhcDsKCXBhZGRpbmc6IDFweCAxcHggMCAwOwp9Ci5yZXN3dWUtZGlhbG9nLWxpbmtzIHRkOmZpcnN0LWNoaWxkLAoucmVzd3VlLWRpYWxvZy1saW5rcyAuYXJyb3cgewoJdGV4dC1hbGlnbjogY2VudGVyOwoJd2lkdGg6IDIwcHg7CglkaXNwbGF5OiBpbmxpbmUtYmxvY2s7Cn0KLnJlc3d1ZS1kaWFsb2ctbGlua3MgaW5wdXRbdHlwZT0iY2hlY2tib3giXSB7CgltYXJnaW46IDA7Cgl2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlOwp9Ci5yZXN3dWUtZGlhbG9nLWxpbmtzIHRhYmxlIGJ1dHRvbiB7CglkaXNwbGF5OiBpbmxpbmUtYmxvY2s7CglwYWRkaW5nOiAxcHggNHB4OwoJZm9udC1zaXplOiAxZW07CglsaW5lLWhlaWdodDogMS4yNWVtOwp9Ci5yZXN3dWUtZGlhbG9nLWxpbmtzIGJ1dHRvbi5wb3J0YWwtZHJvcGRvd24gewoJcGFkZGluZzogMXB4IDBweDsKCW1pbi13aWR0aDogMDsKCWJvcmRlci1sZWZ0LXdpZHRoOiAwOwp9Ci5yZXN3dWUtZGlhbG9nLWxpbmtzIC5wb3J0YWwgewoJcGFkZGluZy1yaWdodDogNnB4OwoJcGFkZGluZy1sZWZ0OiAycHg7CgltYXgtd2lkdGg6IDE1MHB4OwoJb3ZlcmZsb3c6IGhpZGRlbjsKCXRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzOwp9Ci5yZXN3dWUtZGlhbG9nLWxpbmtzIC5idXR0b25iYXIgewoJZGlzcGxheTogYm94OwoJZGlzcGxheTogZmxleDsKCWFsaWduLWl0ZW1zOiBjZW50ZXI7CglqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47Cglib3JkZXItdG9wOiAxcHggc29saWQgIzIwYThiMTsKCW1hcmdpbjogNnB4IDAgMCAtNnB4OwoJcGFkZGluZzogNnB4Owp9Ci5yZXN3dWUtZGlhbG9nLWxpbmtzIC5idXR0b25iYXIgPiBsYWJlbCB7Cgl3aWR0aDogNWVtOwp9CgoucmVzd3VlLWRpYWxvZy1hbGVydHMgLnVpLWRpYWxvZy1jb250ZW50IHsKCW1pbi1oZWlnaHQ6IDAgIWltcG9ydGFudDsKfQoucmVzd3VlLWRpYWxvZy1hbGVydHMgLnVpLWRpYWxvZy1jb250ZW50ID4gZGl2IHsKCW1hcmdpbjogLTZweDsKfQoucmVzd3VlLWRpYWxvZy1hbGVydHMgLmZsZXggewoJZGlzcGxheTogYm94OyAvKiBvbGQgdmFsdWUsIGZvciBBbmRyb2lkICovCglkaXNwbGF5OiBmbGV4OwoJYWxpZ24taXRlbXM6IGNlbnRlcjsKCXdoaXRlLXNwYWNlOiBub3dyYXA7Cn0KLnJlc3d1ZS1kaWFsb2ctYWxlcnRzIC5mbGV4ICogewoJZmxleDogMSAwIDA7Cglib3g6IDEgMCAwOwp9Ci5yZXN3dWUtZGlhbG9nLWFsZXJ0cyAuZmxleCBpbnB1dCB7Cglib3JkZXI6IDFweCBzb2xpZCAjMjBhOGIxOwoJbWFyZ2luLWxlZnQ6IDAuMmVtOwp9Ci5yZXN3dWUtZGlhbG9nLWFsZXJ0cyAuZmxleCBzZWxlY3QgewoJd2lkdGg6IDA7IC8qIENocm9tZSB3b3VsZCBleHBhbmQgdG8gZml0IHRoZSBjb250ZW50cyBvdGhlcndpc2UgKi8KfQoucmVzd3VlLXRhcmdldHNlbGVjdCB7CglkaXNwbGF5OiBmbGV4OwoJYWxpZ24taXRlbXM6IGJhc2VsaW5lOwp9Ci5yZXN3dWUtdGFyZ2V0c2VsZWN0ID4gc3Ryb25nIHsKCWZsZXg6IDEgMCAwOwoJYm94OiAxIDAgMDsKCW1hcmdpbjogMCAwLjJlbTsKCW92ZXJmbG93OiBoaWRkZW47Cgl0ZXh0LW92ZXJmbG93OiBlbGxpcHNpczsKCXdoaXRlLXNwYWNlOiBub3dyYXA7Cn0KLnJlc3d1ZS10YXJnZXRzZWxlY3QgPiAucmVzd3VlLW92ZXJmbG93LWJ1dHRvbiB7CglhbGlnbi1zZWxmOiBzdHJldGNoOwoJYmFja2dyb3VuZC1jb2xvcjogcmdiYSg4LCA0OCwgNzgsIDAuOSk7Cglib3JkZXI6IDFweCBzb2xpZCAjZmZjZTAwOwoJY29sb3I6ICNmZmNlMDA7CglwYWRkaW5nOiAycHg7Cn0KCi5yZXN3dWUtZGlhbG9nLXBvbHlnb24gLmRldGFpbHMgPiAuY29sb3IgewoJZGlzcGxheTogaW5saW5lLWJveDsKCWRpc3BsYXk6IGlubGluZS1mbGV4OwoJYWxpZ24taXRlbXM6IGNlbnRlcjsKfQoucmVzd3VlLWRpYWxvZy1wb2x5Z29uIC5kZXRhaWxzID4gLmNvbG9yIGlucHV0LAoucmVzd3VlLWRpYWxvZy1wb2x5Z29uIC5kZXRhaWxzID4gLmNvbG9yIC5zcC1yZXBsYWNlciB7CgltYXJnaW4tbGVmdDogMC41ZW07Cn0KCi5yZXN3dWUtY29sb3ItcGlja2VyIC5zcC1pbnB1dCB7Cglib3JkZXI6IDFweCBzb2xpZCAjNjY2OwoJYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7Cgljb2xvcjogIzIyMjsKfQoucmVzd3VlLWNvbG9yLXBpY2tlciAuc3AtY2YgewoJbWluLWhlaWdodDogMC41ZW07Cn0KCi5yZXN3dWUtbGF5ZXIgewoJZGlzcGxheTogaW5saW5lLWJveDsgLyogb2xkIHZhbHVlLCBmb3IgQW5kcm9pZCAqLwoJZGlzcGxheTogaW5saW5lLWZsZXg7CglhbGlnbi1pdGVtczogY2VudGVyOwp9Ci5yZXN3dWUtbGF5ZXIgbGFiZWwgewoJbWFyZ2luLXJpZ2h0OiAwLjVlbTsKfQoucmVzd3VlLWxheWVyLm5vbGFiZWwgbGFiZWwgewoJZGlzcGxheTogbm9uZTsKfQoucmVzd3VlLWxheWVyIC5wcmV2aWV3IHsKCWRpc3BsYXk6IGlubGluZS1ibG9jazsKCXdpZHRoOiAwLjVyZW07CgltaW4taGVpZ2h0OiAyMHB4OwoJYWxpZ24tc2VsZjogc3RyZXRjaDsKfQoucmVzd3VlLWxheWVyIHNlbGVjdCwKLnJlc3d1ZS1sYXllciAub3V0cHV0IHsKCWZsZXg6IDEgMSBhdXRvOwoJYm94OiAxIDEgYXV0bzsKCS8qIHRoZSBzZWxlY3QgaGFzIGEgZGVmYXVsdCB3aWR0aCB3aGljaCB3ZSB3YW50IHRvIHVuc2V0ICovCgltaW4td2lkdGg6IDZlbTsKCXdpZHRoOiAwOwp9Ci5yZXN3dWUtbGF5ZXIgLm91dHB1dCB7CgltaW4td2lkdGg6IDRlbTsKfQoucmVzd3VlLWxheWVyIG9wdGlvbiBzcGFuIHsKCWRpc3BsYXk6IGlubGluZS1ibG9jazsKCWZsb2F0OiBsZWZ0OwoJdmVydGljYWwtYWxpZ246IHRvcDsKCWhlaWdodDogMWVtOwoJd2lkdGg6IDFlbTsKCW1hcmdpbi1yaWdodDogMC4yNWVtOwp9Ci5yZXN3dWUtbGF5ZXIgLm91dHB1dCB7CgltYXJnaW4tbGVmdDogNHB4Owp9Cgo=";
        }(b = s.CSS || (s.CSS = {}));
    }(PhtivSailDraw || (PhtivSailDraw = {}));

    !function (scope) {
        var Core = function () {

            function coreHolder(team, nickname) {
                /** @type {!Array} */
                this.operations = [];
                /** @type {null} */
                this.selectedOperation = null;
                this._team = team;
                this._agentName = nickname;
            }
            return Object.defineProperty(coreHolder.prototype, "selectedOperation", {
                get: function () {
                    return this._selectedOperation;
                },
                enumerable: true,
                configurable: true
            }), coreHolder.prototype.setSelectedOperation = function (id, cb) {
                var query = this.getOperation(id, cb);
                this._selectedOperation = query;
            }, coreHolder.prototype.getOperation = function (type, name) {
                var dtObj = this.operations.filter(function (rootScope) {
                    return rootScope.data.environment === type && rootScope.getOperationName() === name;
                });
                /** @type {null} */
                var d = null;
                return 1 === dtObj.length && (d = dtObj[0]), d;
            }, coreHolder.version = "2.0", coreHolder;
        }();
        scope.Core = Core;
    }(PhtivSailDraw || (PhtivSailDraw = {}));

    !function (a) {
        var dashboardDialog = function () {
            /**
             * @param {string} version
             * @return {undefined}
             */
            function init(version) {
                var ObjectOperation = this;
                /** @type {!Array} */
                this.extensions = [];
                /** @type {string} */
                this.selectedTab = "phtivsaildraw-section-operation";
                /** @type {null} */
                this.tabs = null;
                /** @type {null} */
                this.nav = null;
                /** @type {null} */
                this.selectNav = null;
                /** @type {null} */
                this.container = null;
                /** @type {null} */
                this.dialog = null;
                /** @type {string} */
                this._version = version;
                if (window.useAndroidPanes()) {
                    android.addPane("plugin-phtivsaildraw", "PHTIVSAILDRAW", "ic_action_place");
                    window.addHook("paneChanged", function (a) {
                        return ObjectOperation.onPaneChanged(a);
                    });
                }
            }
            return init.prototype.extend = function (id, name, callback, ext) {
                this.extensions = this.extensions.filter(function (immigration) {
                    return immigration.id != id;
                });
                this.extensions.push({
                    id: id,
                    isActive: callback,
                    title: name,
                    extension: ext
                });
            }, init.prototype.onPaneChanged = function (strip1) {
                return null != this.container && (this.container.remove(), this.close()), "plugin-phtivsaildraw" == strip1 && (this.showDialog(), this.container.addClass("mobile").appendTo(document.body)), true;
            }, init.prototype.showDialog = function (name) {
                var self = this;
                return void 0 === name && (name = null), window.useAndroidPanes() && "plugin-phtivsaildraw" != window.currentPane ? (null != name && (this.selectedTab = name), void window.show("plugin-phtivsaildraw")) : (null != this.dialog && this.dialog.dialog("close"), this.createExtensionMenu(), this.extensions.forEach(function (job) {
                    if (job.isActive()) {
                        self.buildExtension(job.id, job.title, job.extension);
                    }
                }), this.selectTab(this.container, null != name ? name : this.selectedTab), void(window.useAndroidPanes() || (this.dialog = window.dialog({
                    title: "PhtivSailDraw v" + this._version,
                    html: this.container,
                    id: "phtivsaildraw-dashboard",
                    width: "500px",
                    height: "auto",
                    closeCallback: function () {
                        return self.close();
                    }
                }), this.dialog.on("dialogdragstop", function () {
                    return self.dialog.dialog("option", "height", "auto");
                }))));
            }, init.prototype.close = function () {
                if (null != this.container) {
                    /** @type {null} */
                    this.dialog = null;
                    /** @type {null} */
                    this.container = null;
                    /** @type {null} */
                    this.tabs = null;
                    /** @type {null} */
                    this.nav = null;
                    /** @type {null} */
                    this.selectNav = null;
                    this.extensions.filter(function (galleryitem) {
                        return void 0 != $(galleryitem).data("closeCallback");
                    }).forEach(function (galleryitem) {
                        return $(galleryitem).data("closeCallback")();
                    });
                }
            }, init.prototype.buildExtension = function (path, index, isObject) {
                var base = this;
                var item = $("<section />");
                item.attr("id", path);
                item.hide();
                this.tabs.append(item);
                var t = $('<a href="#" />');
                t.attr("data-section", path);
                t.html(index);
                var target = this.container;
                t.on("click", function (event) {
                    var page = $(t).data("section");
                    base.selectTab(target, page);
                    event.preventDefault();
                });
                this.nav.append(t);
                this.selectNav.append($("<option />").prop("value", path).text(index.replace(/&nbsp;/g, ">")));
                isObject(item);
            }, init.prototype.selectTab = function (parent, name) {
                parent.find("nav a").removeClass("clicked");
                parent.find('nav a[data-section="' + name + '"]').addClass("clicked");
                parent.find("section").hide();
                parent.find("#" + name).show();
                $(this.selectNav).val(name);
                /** @type {!Object} */
                this.selectedTab = name;
            }, init.prototype.setProgress = function (curShift, perShift) {
                if (0 == perShift) {
                    $("#phtivsaildraw-menu-config").removeClass("showprogress");
                } else {
                    $("#phtivsaildraw-menu-config").addClass("showprogress");
                    $("#phtivsaildraw-menu-config .progress .progress-value").css("width", 100 * curShift / perShift + "%");
                }
            }, init.prototype.createExtensionMenu = function () {
                var base = this;
                var target = $('<div id="phtivsaildraw-menu-config">');
                this.nav = $("<nav />");
                var filterInput = $("<select />").on("change", function () {
                    var callback = $(filterInput).val();
                    base.selectTab(target, callback);
                });
                this.selectNav = filterInput;
                this.tabs = $('<div class="tabs" />');
                target.append('<div class="progress"><div class="progress-value"></div></div>').append(this.nav).append($('<div id="phtivsaildraw-menu-config-select" />').append("Menu: ").append(this.selectNav).append("<hr />")).append(this.tabs);
                this.container = target;
            }, init;
        }();
        a.DashboardDialog = dashboardDialog;
    }(PhtivSailDraw || (PhtivSailDraw = {}));

    !function (root) {
        var Preferences = function () {
            /**
             * @return {undefined}
             */
            function MockSave() {
                /** @type {boolean} */
                this.agentsInAlertTargetList = true;
                /** @type {boolean} */
                this.showAgentSortedByDistance = true;
                /** @type {boolean} */
                this.showAgentNames = true;
                /** @type {boolean} */
                this.showPolygonLabels = true;
                /** @type {string} */
                this.showKeys = "false";
                /** @type {boolean} */
                this.targetCrossLinks = true;
                /** @type {boolean} */
                this.uploadDrawToolsPolygons = true;
                /** @type {boolean} */
                this.disablePolygonPopups = false;
                /** @type {boolean} */
                this.groupAgentsOnMap = false;
                /** @type {number} */
                this.fastSyncMode = 0;
                /** @type {string} */
                this.defaultAlertType = "DestroyPortalAlert";
            }
            return MockSave.prototype.loadOrInit = function () {
                var userConfig;
                try {
                    /** @type {*} */
                    userConfig = JSON.parse(localStorage["phtivsaildraw-preferences"]);
                } catch (b) {
                    userConfig = {};
                }
                if ("showAgentSortedByDistance" in userConfig) {
                    this.showAgentSortedByDistance = userConfig.showAgentSortedByDistance;
                }
                if ("agentsInAlertTargetList" in userConfig) {
                    this.agentsInAlertTargetList = userConfig.agentsInAlertTargetList;
                }
                if ("showAgentNames" in userConfig) {
                    this.showAgentNames = userConfig.showAgentNames;
                }
                if ("groupAgentsOnMap" in userConfig) {
                    this.groupAgentsOnMap = userConfig.groupAgentsOnMap;
                }
                if ("showPolygonLabels" in userConfig) {
                    this.showPolygonLabels = userConfig.showPolygonLabels;
                }
                if ("disablePolygonPopups" in userConfig) {
                    this.disablePolygonPopups = userConfig.disablePolygonPopups;
                }
                if ("showKeys" in userConfig) {
                    this.showKeys = userConfig.showKeys;
                }
                if ("targetCrossLinks" in userConfig) {
                    this.targetCrossLinks = userConfig.targetCrossLinks;
                }
                if ("uploadDrawToolsPolygons" in userConfig) {
                    this.uploadDrawToolsPolygons = userConfig.uploadDrawToolsPolygons;
                }
                if ("fastSyncMode" in userConfig) {
                    this.fastSyncMode = userConfig.fastSyncMode;
                }
                if ("defaultAlertType" in userConfig) {
                    this.defaultAlertType = userConfig.defaultAlertType;
                }
            }, MockSave.prototype.save = function () {
                /** @type {number} */
                this.fastSyncMode = Math.min(this.fastSyncMode, Date.now() + 216e5);
                /** @type {string} */
                localStorage["phtivsaildraw-preferences"] = JSON.stringify(this);
            }, MockSave;
        }();
        root.Preferences = Preferences;
    }(PhtivSailDraw || (PhtivSailDraw = {}));

    !function (scope) {
        var uiHelper = function () {
            /**
             * @return {undefined}
             */
            function ref() {
            }
            return ref.getPortal = function (id) {
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
            }, ref.getSelectedPortal = function () {
                return window.selectedPortal ? this.getPortal(window.selectedPortal) : null;
            }, ref.formatAgentDetails = function (records, b) {
                var o = $("<div>");
                if (b.length > 0) {
                    o.append(document.createTextNode("Groups: "));
                    b.forEach(function (options) {
                        var node = $('<div class="phtivsaildraw-group-container" />').appendTo(o).text(options.groupName).attr("title", options.description);
                        if (options.color) {
                            $('<div class="phtivsaildraw-group-indicator" />').css("background-color", options.color).prependTo(node);
                            node.css("border-color", options.color);
                        }
                    });
                    o.append("<br>");
                }
                /** @type {!Date} */
                var time = new Date(1E3 * records.lastKnownLocation.lastSeenTimeStamp);
                var i = time.toDateString() !== (new Date).toDateString() ? window.unixTimeToDateTimeString(time) : window.unixTimeToString(time);
                return o.append("Last seen: " + i), o;
            }, ref.createButtonLeafletControl = function (container, buttons) {
                var button = new ref.EasyButtons;
                return button.options.buttons = buttons, container && container.addControl(button), button;
            }, ref.extendLeaflet = function () {
                ref.ColoredDivIcon = L.DivIcon.extend({
                    createIcon: function () {
                        var a = L.DivIcon.prototype.createIcon.apply(this, arguments);
                        return this.options.color && (a.style.color = this.options.color), a;
                    }
                });
                ref.AgentIcon = L.Icon.extend({
                    options: {
                        shadowUrl: null,
                        iconSize: [26, 42],
                        iconAnchor: [13, 42],
                        popupAnchor: [0, -36],
                        groups: [],
                        picture: null
                    },
                    createIcon: function (oldIcon) {
                        var div = oldIcon && "DIV" === oldIcon.tagName ? oldIcon : document.createElement("div");
                        var o = this.options;
                        /** @type {!Array} */
                        var client_ids = [];
                        if (div.innerHTML = atob(scope.Images.marker_agent.split(/,/)[1]), client_ids = o.groups.filter(function (consideration) {
                            return !!consideration.color;
                        }), client_ids.length > 0) {
                            var tilesetContainer = div.getElementsByClassName("groupColors")[0];
                            /** @type {string} */
                            tilesetContainer.innerHTML = "";
                            var n = client_ids.length;
                            client_ids.forEach(function (styles, i) {
                                /** @type {number} */
                                var c = 0 === i ? -.1 : i / n;
                                /** @type {number} */
                                var d = i === n - 1 ? 1.1 : (i + 1) / n;
                                /** @type {!Element} */
                                var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
                                p.setAttribute("d", "M " + c + ",0 " + d + ",0 0.5,1");
                                p.style.fill = styles.color;
                                /** @type {string} */
                                p.style.stroke = "none";
                                tilesetContainer.appendChild(p);
                            });
                        }
                        return o.picture && div.getElementsByClassName("avatar")[0].setAttribute("xlink:href", o.picture), this._setIconStyles(div, "icon"), div;
                    },
                    createShadow: function () {
                        return null;
                    }
                });
                ref.EasyButtons = L.Control.extend({
                    options: {
                        position: "topleft",
                        buttons: [{
                                btnId: "",
                                btnTitle: "",
                                btnIcon: "fa-circle-o",
                                btnFunction: null
                            }]
                    },
                    onAdd: function () {
                        var me = this;
                        var body = L.DomUtil.create("div", "leaflet-bar leaflet-control phtivsaildraw-toolbar");
                        return this.options.buttons.forEach(function (module) {
                            var result = L.DomUtil.create("a", "leaflet-bar-part", body);
                            me._addImage(result, module.btnIcon, module.btnId);
                            /** @type {string} */
                            result.href = "#";
                            result.title = module.btnTitle;
                            L.DomEvent.on(result, "click", function (e) {
                                L.DomEvent.stopPropagation(e);
                                L.DomEvent.preventDefault(e);
                                module.btnFunction();
                            }, me);
                        }), body;
                    },
                    _addImage: function (data, c, r) {
                        if (null != c) {
                            var d = L.DomUtil.create("img", "", data);
                            /** @type {string} */
                            d.id = r;
                            /** @type {string} */
                            d.src = c;
                            /** @type {number} */
                            d.width = 16;
                            /** @type {number} */
                            d.height = 16;
                            d.setAttribute("style", "vertical-align:middle;align:center;");
                        }
                    }
                });
            }, ref.lookupEnvironmentName = function (environment) {
                try {
                    /** @type {*} */
                    var config = JSON.parse(localStorage["phtivsaildraw-environment-data"]);
                    if (config.environments[environment]) {
                        return config.environments[environment];
                    }
                } catch (c) {
                }
                try {
                    if (environment === localStorage["phtivsaildraw-environment-extra"]) {
                        return "DEV Env LocalStorage";
                    }
                } catch (c) {
                }
                return "";
            }, ref.toLatLng = function (data, angle) {
                return void 0 === angle && "object" == typeof data && (angle = data.lng, data = data.lat), L.latLng(parseFloat(data), parseFloat(angle));
            }, ref.getPortalLink = function (data) {
                var pt = ref.toLatLng(data);
                /** @type {string} */
                var v = data.lat + "," + data.lng;
                /** @type {!Element} */
                var e = document.createElement("a");
                return e.appendChild(document.createTextNode(data.name)), e.title = data.name, e.href = "/intel?ll=" + v + "&pll=" + v, e.addEventListener("click", function (event) {
                    return window.selectedPortal !== data.id ? window.renderPortalDetails(data.id) : map.panTo(pt), event.preventDefault(), false;
                }, false), e.addEventListener("dblclick", function (event) {
                    return map.getBounds().contains(pt) ? (window.portals[data.id] || window.renderPortalDetails(data.id), window.zoomToAndShowPortal(data.id, pt)) : (map.panTo(pt), window.renderPortalDetails(data.id)), event.preventDefault(), false;
                }, false), e;
            }, ref;
        }();
        scope.UiHelper = uiHelper;
    }(PhtivSailDraw || (PhtivSailDraw = {}));

    !function (scope) {
        var pluginTemplate = function () {

            function holder(core, prefs, dashDialog) {
                this.mapBinders = [];
                this.localConfig = null;
                this.core = core;
                //this.layerManager = layoutManager;
                this.preferences = prefs;
                this.dashboard = dashDialog;
            }

            return holder.setupAfterIitc = function (pluginVersion) {
                scope.Core.version = pluginVersion;
                scope.UiHelper.extendLeaflet();
                var core = new scope.Core(window.PLAYER.team, window.PLAYER.nickname);
                var prefs = new scope.Preferences;
                var dashboardDialog = new scope.DashboardDialog(pluginVersion);
                //var layoutManager = new scope.LayerManager(window.map);
                prefs.loadOrInit();
                var iitcPluginHolder = new holder(core, prefs, dashboardDialog);
                iitcPluginHolder.version = pluginVersion;
                window.plugin.phtivsaildraw = iitcPluginHolder;
                iitcPluginHolder.publishApiToWindow();
                holder.addCss(scope.CSS.main);
                holder.addCss(scope.CSS.ui);
                iitcPluginHolder.setupAddons();
                iitcPluginHolder.loadLocalStorageOperations();
                iitcPluginHolder.setupUi();
            }, holder.addCss = function (url) {
                $("head").append('<link rel="stylesheet" type="text/css" href="' + url + '" />');
            }, holder.prototype.setupAddons = function () {
                //this._drawToolAddon = new scope.DrawToolAddon(this.core, this.layerManager, this.preferences);
                //this._drawToolAddon.init();
                //this._crossLinkAddon = new scope.CrossLinksAddon(this.core, this.layerManager, this.preferences, window.map);
                //this._crossLinkAddon.init();
                //var BDA = new scope.LinkShowDirectionAddon(this.layerManager);
                //BDA.init();
                //new scope.PrivacyViewAddon(this.layerManager);
            }, holder.prototype.setupUi = function () {
                var basePlugin = this;
                /*
                this.dashboard.extend("phtivsaildraw-section-preferences", "Preferences", function () {
                    return true;
                }, function (expr) {
                    //return scope.PreferencesDialog.create(basePlugin.core, basePlugin.preferences, basePlugin._crossLinkAddon, expr);
                });
                this.dashboard.extend("phtivsaildraw-section-drawtool-addon", "Drawtool Integration", scope.DrawToolAddon.isLoaded, function (searchDefinition) {
                    //return scope.DrawToolAddonDialog.create(basePlugin.core, basePlugin._drawToolAddon, searchDefinition);
                });
                */
                var firmList = scope.UiHelper.createButtonLeafletControl(window.map, [
                    /*{
                     btnId: "phtivsaildraw-btn-addportal",
                     btnTitle: "Add/edit portal",
                     btnIcon: scope.Images.toolbar_portal,
                     btnFunction: function () {
                     response.addPortalDialog();
                     }
                     },*/
                    {
                        btnId: "phtivsaildraw-btn-addlinks",
                        btnTitle: "Add links",
                        btnIcon: scope.Images.toolbar_addlinks,
                        btnFunction: function () {
                            basePlugin.addLinkDialog();
                        }
                    }/*,
                     {
                     btnId: "phtivsaildraw-btn-addalert",
                     btnTitle: "Add alerts",
                     btnIcon: scope.Images.toolbar_alert,
                     btnFunction: function () {
                     response.addAlertDialog();
                     }
                     }*/]);
                var element = document.body.appendChild(document.createElement("a"));
                /** @type {number} */
                element.tabIndex = -1;
                /** @type {string} */
                element.accessKey = "r";
                /** @type {string} */
                element.id = "phtivsaildraw-fake-button";
                element.addEventListener("click", function (a) {
                    var b = firmList.getContainer().querySelector("a");
                    b.focus();
                }, false);
            }, holder.prototype.addAlertDialog = function () {
                //(new scope.AlertDialog(this.core.selectedOperation, this.preferences)).showDialog();
            }, holder.prototype.addPortalDialog = function () {
                //scope.PortalDialog.show(this.core.selectedOperation, this.dashboard, this.layerManager);
            }, holder.prototype.addLinkDialog = function () {
                alert("Tapped the thing");
                //scope.LinkDialog.show(this.core.selectedOperation, this.dashboard, this.layerManager);
            }, holder.prototype.loadLocalStorageOperations = function () {
                try {
                    /** @type {*} */
                    this.localConfig = JSON.parse(localStorage["phtivsaildraw-data"]);
                } catch (b) {
                }
                if (null === this.localConfig || this.localConfig.nickname !== window.PLAYER.nickname) {
                    this.localConfig = {
                        nickname: window.PLAYER.nickname,
                        operations: [],
                        selectedEnvironment: null,
                        selectedOperationName: null
                    };
                }
                if (0 === this.localConfig.operations.length) {
                    console.log("PHTIVSAILDRAW: no operation in local storage to add.");
                }
            }, holder.prototype.publishApiToWindow = function () {
                window.PhtivSailDraw = scope;
            }, holder;
        }();
        scope.IITCPlugin = pluginTemplate;
    }(PhtivSailDraw || (PhtivSailDraw = {}));


    //PLUGIN END
    var setup = function () {
        PhtivSailDraw.IITCPlugin.setupAfterIitc("0.0.1");
    };

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