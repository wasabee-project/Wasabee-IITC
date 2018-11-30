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

        window.plugin.phtivsaildraw.addLeftButtons();

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



    window.plugin.phtivsaildraw.addLeftButtons = function () {
        window.plugin.phtivsaildraw.psDrawButtons = L.Control.extend({
            options: {
                position: 'topleft'
            },
            onAdd: function (map) {
                var container = L.DomUtil.create('div', 'leaflet-phtivsaildraw leaflet-bar');
                $(container).append('<a id="phtivsaildraw_addlinksbutton" href="javascript: void(0);" class="phtivsaildraw-control" title="Add Links"><img src=' + PhtivSailDraw.Images.toolbar_addlinks + ' style="vertical-align:middle;align:center;" /></a>').on('click', '#phtivsaildraw_addlinksbutton', function () {
                    window.plugin.phtivsaildraw.tappedAddLinks();
                });
                return container;
            }
        });
        map.addControl(new window.plugin.phtivsaildraw.psDrawButtons());
    };

    window.plugin.phtivsaildraw.tappedAddLinks = function () {
        var container = document.createElement("div");
        var tr;
        var node;
        var button;
        var checkbox;
        var rdnTable = container.appendChild(document.createElement("table"));
        [0, 1, 2].forEach(function (string) {
            var type = 0 == string ? "src" : "dst-" + string;
            tr = rdnTable.insertRow();
            tr.setAttribute("data-portal", type);
            node = tr.insertCell();
            if (0 != string) {
                checkbox = node.appendChild(document.createElement("input"));
                checkbox.type = "checkbox";
                checkbox.checked = true;
                checkbox.value = type;
                //self._links.push(checkbox);
            }
            node = tr.insertCell();
            node.textContent = 0 == string ? "from" : "to (#" + string + ")";
            node = tr.insertCell();
            button = node.appendChild(document.createElement("button"));
            button.textContent = "set";
            button.addEventListener("click", function (arg) {
                if (window.selectedPortal == null)
                    window.alert("Nothing Selected!");
                else
                    window.alert(window.portals[window.selectedPortal].options.data.title + " - " + arg);
                //return self.setPortal(arg);
            }, false);
            node = tr.insertCell();
            node = tr.insertCell();
            node.className = "portal portal-" + type;
            //self._portals[type] = node;
            //self.updatePortal(type);
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
            //return self.addAllLinks();
        }, false);
        
        window.dialog({
            title: "PhtivSail: Add Links",
            width: "auto",
            height: "auto",
            html: container,
            dialogClass: "reswue-dialog reswue-dialog-links",
            closeCallback: function (popoverName) {
                //alert("closed");
            }
        });
    };

    //PLUGIN END
    var setup = window.plugin.phtivsaildraw.loadExternals;

    if (window.iitcLoaded && typeof setup === 'function') {
        setup();
    } else {
        if (window.bootPlugins)
            window.bootPlugins.push(setup);
        else
            window.bootPlugins = [setup];
    }
} // wrapper end
// inject code into site context
var script = document.createElement('script');
script.appendChild(document.createTextNode('(' + wrapper + ')();'));
(document.body || document.head || document.documentElement).appendChild(script);