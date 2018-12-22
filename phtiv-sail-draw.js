 // ==UserScript==
// @name         PhtivSail Draw Tools
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Less terrible draw tools, hopefully.
// @author       PhtivSail
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
        window.plugin = function () {};

    //adds Base64 Strings for images used in the script
    var PhtivSailDraw;
    !function (data) {
        var b;
        !function (a) {
            a.toolbar_addlinks = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAAASAAAAEgARslrPgAAALZJREFUOMvt0b1tAkEQhuEHQYZjSOjCQgIicA/0gc7UgUQb1wg4oYpLyJ2YwBAwB8sKhC4g45NGq9nd+XuHt1qZ38cnuuFv4hzH+Ysd9veSLXHAMbF5WHr3h+88+Av/WCTV76mLIv5O0xHWGGISfoFRFrzFKhntB4tOQ2ZlxuSiWbRV4ONJgvLRYxGAcoh14DGzMmVQq+e8xrqLDapoeRBFBIvKdc2NGNyM0G6YoHLeRtW08ut0AlmCLOTqNNpMAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE4LTExLTI5VDE5OjE3OjUwKzAwOjAwCdB9iwAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOC0xMS0yOVQxOToxNzo1MCswMDowMHiNxTcAAAAodEVYdHN2ZzpiYXNlLXVyaQBmaWxlOi8vL3RtcC9tYWdpY2steWVVelVwNFNNj+slAAAAAElFTkSuQmCC";
            a.toolbar_viewOps = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAAASAAAAEgARslrPgAAAIJJREFUOMvF0rENwkAQRNGHER1YrgCJMhAB5AR2MQQkJK7BJUBIEbRAATRARmaSk4xI0C3B/WQ22dXMaCnN7GNukz5wixwYk17Q4fxjt4OqeIRv1v842GPAEs/cDhboUeMQcVBjk+YXrpH8DXaYRzu4Y4UTjrkdMD3SKEiDbW6E8rwBF5gTIsXCVDcAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTgtMTItMTdUMjE6NDY6MDYrMDA6MDBKWVyZAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE4LTEyLTE3VDIxOjQ2OjA2KzAwOjAwOwTkJQAAACh0RVh0c3ZnOmJhc2UtdXJpAGZpbGU6Ly8vdG1wL21hZ2ljay1pZ1pvenF3TFAypWwAAAAASUVORK5CYII="
        }(b = data.Images || (data.Images = {}));
    }(PhtivSailDraw || (PhtivSailDraw = {}));

    !function (s) {
        var b;
        !function (es) {
            es.main = "data:text/css;base64,LnBodGl2c2FpbGRyYXctdGFibGUgewoJYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsKCWVtcHR5LWNlbGxzOiBzaG93OwoJd2lkdGg6IDEwMCU7CgljbGVhcjogYm90aDsKfQoucGh0aXZzYWlsZHJhdy10YWJsZSB0ZCwgLnBodGl2c2FpbGRyYXctdGFibGUgdGggewoJYm9yZGVyLXdpZHRoOiAwIDFweDsKCWJvcmRlci1zdHlsZTogc29saWQ7Cglib3JkZXItY29sb3I6IHJnYmEoOCwgNDgsIDc4LCAwLjc1KTsKCXBhZGRpbmc6IDNweCA0cHg7Cgl0ZXh0LWFsaWduOiBsZWZ0Owp9Ci5waHRpdnNhaWxkcmF3LXRhYmxlIHRkOmZpcnN0LWNoaWxkLCAucGh0aXZzYWlsZHJhdy10YWJsZSB0aDpmaXJzdC1jaGlsZCB7IGJvcmRlci1sZWZ0LXdpZHRoOiAwOyB9Ci5waHRpdnNhaWxkcmF3LXRhYmxlIHRkOmxhc3QtY2hpbGQsICAucGh0aXZzYWlsZHJhdy10YWJsZSB0aDpsYXN0LWNoaWxkIHsgYm9yZGVyLXJpZ2h0LXdpZHRoOiAwOyB9Ci5waHRpdnNhaWxkcmF3LXRhYmxlIHRib2R5IHRyOm50aC1jaGlsZCgybisxKSB0ZCB7Cglib3JkZXItY29sb3I6IHJnYmEoMjUsIDYzLCA5NSwgMC43NSk7Cn0KLnBodGl2c2FpbGRyYXctdGFibGUgdHIgewoJYmFja2dyb3VuZDogcmdiYSgyNSwgNjMsIDk1LCAwLjc1KTsKfQoucGh0aXZzYWlsZHJhdy10YWJsZSB0Ym9keSB0cjpudGgtY2hpbGQoMm4rMSkgewoJYmFja2dyb3VuZDogcmdiYSg4LCA0OCwgNzgsIDAuNzUpOwp9Ci5waHRpdnNhaWxkcmF3LXRhYmxlID4gdGhlYWQgLnNvcnRhYmxlIHsKCWN1cnNvcjogcG9pbnRlcjsKfQoucGh0aXZzYWlsZHJhdy10YWJsZSA+IHRoZWFkIC5zb3J0ZWQgewoJY29sb3I6ICNmZmNlMDA7Cn0KLnBodGl2c2FpbGRyYXctdGFibGUgPiB0aGVhZCAuc29ydGFibGU6YmVmb3JlIHsKCWNvbnRlbnQ6ICIgIjsKCWRpc3BsYXk6IGlubGluZS1ibG9jazsKCWZsb2F0OiByaWdodDsKCW1pbi13aWR0aDogMWVtOwoJdGV4dC1hbGlnbjogcmlnaHQ7Cn0KLnBodGl2c2FpbGRyYXctdGFibGUgPiB0aGVhZCAuc29ydGFibGUuYXNjOmJlZm9yZSB7Cgljb250ZW50OiAiXDI1YjIiOwp9Ci5waHRpdnNhaWxkcmF3LXRhYmxlID4gdGhlYWQgLnNvcnRhYmxlLmRlc2M6YmVmb3JlIHsKCWNvbnRlbnQ6ICJcMjViYyI7Cn0KLnBodGl2c2FpbGRyYXctdGFibGUgdGQubWVudSB7Cglwb3NpdGlvbjogcmVsYXRpdmU7CgltaW4taGVpZ2h0OiAyMHB4OwoJbWluLXdpZHRoOiAyNHB4Owp9Ci5waHRpdnNhaWxkcmF3LXRhYmxlIHRkLm1lbnUgPiAucGh0aXZzYWlsZHJhdy1vdmVyZmxvdy1idXR0b24gewoJcG9zaXRpb246IGFic29sdXRlOwoJdG9wOiAwOwoJbGVmdDogMDsKCXJpZ2h0OiAwOwoJYm90dG9tOiAwOwoJZGlzcGxheTogZmxleDsKfQoKLnBodGl2c2FpbGRyYXctZGlhbG9nLXBvcnRhbGxpc3QgLmtleXMsCi5waHRpdnNhaWxkcmF3LWRpYWxvZy1wb3J0YWxsaXN0IC5saW5rcyB7Cgl3aWR0aDogMy41ZW07IC8qIHdpbGwgZXhwYW5kIHRvIGZpdCBjb250ZW50ICovCgl0ZXh0LWFsaWduOiByaWdodDsKfQoucGh0aXZzYWlsZHJhdy1kaWFsb2ctcG9ydGFsbGlzdCAud2FybiB7Cgljb2xvcjogI2ZmMDsKCWZsb2F0OiBsZWZ0OwoJZm9udC1zaXplOiAxLjVlbTsKCWZvbnQtd2VpZ2h0OiBib2xkOwp9Ci5waHRpdnNhaWxkcmF3LWRpYWxvZy1wb3J0YWxsaXN0IC53YXJuLmVycm9yIHsKCWNvbG9yOiAjZjAwOwp9CgovKiBzdHlsZS5jc3Mgc2V0cyBkaWFsb2cgbWF4LXdpZHRoIHRvIDcwMHB4IC0gb3ZlcnJpZGUgdGhhdCBoZXJlICovCi5waHRpdnNhaWxkcmF3LWRpYWxvZy1saW5rbGlzdCB7CgltYXgtd2lkdGg6IDEwMDBweCAhaW1wb3J0YW50Owp9Ci5waHRpdnNhaWxkcmF3LWRpYWxvZy1wb3J0YWxsaXN0ID4gLnVpLWRpYWxvZy1jb250ZW50LAoucGh0aXZzYWlsZHJhdy1kaWFsb2ctbGlua2xpc3QgPiAudWktZGlhbG9nLWNvbnRlbnQsCi5waHRpdnNhaWxkcmF3LWRpYWxvZy1hbGVydGxpc3QgPiAudWktZGlhbG9nLWNvbnRlbnQgewoJcGFkZGluZzogMDsKfQoucGh0aXZzYWlsZHJhdy1kaWFsb2ctbGlua2xpc3QgLnBodGl2c2FpbGRyYXctbGF5ZXIgewoJbWFyZ2luOiAtNHB4IDAgLTRweCAtNHB4Owp9Ci5waHRpdnNhaWxkcmF3LWRpYWxvZy1saW5rbGlzdCB0ZC5rZXlzLAoucGh0aXZzYWlsZHJhdy1kaWFsb2ctbGlua2xpc3QgdGQubGVuZ3RoIHsKCXRleHQtYWxpZ246IHJpZ2h0Owp9CgoucGh0aXZzYWlsZHJhdy1kaWFsb2ctYWxlcnRsaXN0IHRkIHsKCXZlcnRpY2FsLWFsaWduOiBiYXNlbGluZTsKfQoucGh0aXZzYWlsZHJhdy1kaWFsb2ctYWxlcnRsaXN0IC5hc3NpZ25lZSB7Cgl3aGl0ZS1zcGFjZTogbm93cmFwOwoJb3ZlcmZsb3c6IGhpZGRlbjsKCXRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzOwoJbWF4LXdpZHRoOiAxMGVtOwp9Ci5waHRpdnNhaWxkcmF3LWRpYWxvZy1hbGVydGxpc3QgLnJlc29sdmVkIGJ1dHRvbiB7CgltYXJnaW46IC0zcHggMDsKCXBhZGRpbmc6IDAgMC41ZW0gMXB4Owp9CgojcGh0aXZzYWlsZHJhdy1mYWtlLWJ1dHRvbiB7Cglwb3NpdGlvbjogYWJzb2x1dGU7Cgl0b3A6IC05OTk5ZW07CglsZWZ0OiAtOTk5OWVtOwp9CgoucGh0aXZzYWlsZHJhdy1hbGVydHMtbnVtIHsKCWNvbG9yOiAjMDBGRjAwOwp9Ci5waHRpdnNhaWxkcmF3LWFsZXJ0cy1udW0ubmV3IHsKCWNvbG9yOiAjZmYwMDAwOwoJZm9udC13ZWlnaHQ6IGJvbGQ7Cn0KCi5waHRpdnNhaWxkcmF3LWFnZW50c2VsZWN0IC5waHRpdnNhaWxkcmF3LWdyb3VwLWluZGljYXRvciB7CglmbG9hdDogcmlnaHQ7CgltYXJnaW4tbGVmdDogMC4yNWVtOwp9CgoucGh0aXZzYWlsZHJhdy1ncm91cC1jb250YWluZXIgewoJYm9yZGVyOiAxcHggc29saWQgY3VycmVudENvbG9yOwoJZGlzcGxheTogaW5saW5lLWJsb2NrOwoJaGVpZ2h0OiAxLjJlbTsKCWxpbmUtaGVpZ2h0OiAxLjJlbTsKCW1hcmdpbjogMXB4IDAuMjVlbSAxcHggMDsKCXBhZGRpbmc6IDAgMC4yNWVtOwp9Ci5waHRpdnNhaWxkcmF3LWdyb3VwLWNvbnRhaW5lciA+IC5waHRpdnNhaWxkcmF3LWdyb3VwLWluZGljYXRvciB7CgltYXJnaW4tbGVmdDogLTAuMjVlbTsKCW1hcmdpbi1yaWdodDogMC4yNWVtOwoJaGVpZ2h0OiAxLjJlbTsKCXdpZHRoOiAxLjJlbTsKfQoKLnBodGl2c2FpbGRyYXctZ3JvdXAtaW5kaWNhdG9yIHsKCWRpc3BsYXk6IGlubGluZS1ibG9jazsKCXBvc2l0aW9uOiByZWxhdGl2ZTsKCXdpZHRoOiAxZW07CgloZWlnaHQ6IDFlbTsKCXZlcnRpY2FsLWFsaWduOiB0b3A7Cn0KLnBodGl2c2FpbGRyYXctZ3JvdXAtaW5kaWNhdG9yID4gZGl2IHsKCWhlaWdodDogMWVtOwoJZmxvYXQ6IGxlZnQ7Cn0KCi5waHRpdnNhaWxkcmF3LXBvcHVwIHsKCW1heC13aWR0aDogMzAwcHg7Cn0KLnBodGl2c2FpbGRyYXctZGlhbG9nIC5kZXNjIHAsCi5waHRpdnNhaWxkcmF3LWRpYWxvZyAuZGVzYyB1bCwKLnBodGl2c2FpbGRyYXctcG9wdXAgcCwKLnBodGl2c2FpbGRyYXctcG9wdXAgdWwgewoJbWFyZ2luOiAwOwp9Ci5waHRpdnNhaWxkcmF3LXBvcHVwIGEgewoJY29sb3I6ICMwMDk5Q0M7Cn0KLnBodGl2c2FpbGRyYXctZGlhbG9nIC5kZXNjIHVsLAoucGh0aXZzYWlsZHJhdy1wb2x5Z29uLWxhYmVsIHVsLAoucGh0aXZzYWlsZHJhdy1wb3B1cCAuZGVzYyB1bCB7CglwYWRkaW5nLWxlZnQ6IDEuNWVtOwp9Ci5waHRpdnNhaWxkcmF3LWRpYWxvZyAuZGVzYyBlbSwKLnBodGl2c2FpbGRyYXctcG9seWdvbi1sYWJlbCBlbSwKLnBodGl2c2FpbGRyYXctcG9wdXAgLmRlc2MgZW0gewoJY29sb3I6IGluaGVyaXQ7Cglmb250LXN0eWxlOiBpdGFsaWM7Cn0KLnBodGl2c2FpbGRyYXctcG9wdXAucG9ydGFsIC51aS1kaWFsb2ctYnV0dG9uc2V0IHsKCWRpc3BsYXk6IGJveDsKCWRpc3BsYXk6IGZsZXg7CgltYXJnaW4tdG9wOiA2cHg7Cn0KLnBodGl2c2FpbGRyYXctcG9wdXAucG9ydGFsIC51aS1kaWFsb2ctYnV0dG9uc2V0IGJ1dHRvbiB7CglmbGV4LWdyb3c6IDE7Cglib3gtZ3JvdzogMTsKfQoucGh0aXZzYWlsZHJhdy1wb3B1cCBpbWcuYXZhdGFyIHsKCW1heC13aWR0aDogOTZweDsKCW1heC1oZWlnaHQ6IDk2cHg7CgltYXJnaW4tbGVmdDogNHB4OwoJZmxvYXQ6IHJpZ2h0Owp9CgoucGh0aXZzYWlsZHJhdy1rZXlzLW92ZXJsYXksIC5waHRpdnNhaWxkcmF3LWFnZW50LWxhYmVsLCAucGh0aXZzYWlsZHJhdy1wb2x5Z29uLWxhYmVsIHsKCWNvbG9yOiAjRkZGRkJCOwoJZm9udC1zaXplOiAxMnB4OwoJbGluZS1oZWlnaHQ6IDE2cHg7Cgl0ZXh0LWFsaWduOiBjZW50ZXI7CglwYWRkaW5nOiAycHg7CglvdmVyZmxvdzogaGlkZGVuOwoJd2hpdGUtc3BhY2U6IG5vd3JhcDsKCXRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzOwoJdGV4dC1zaGFkb3c6IDFweCAxcHggIzAwMCwgMXB4IC0xcHggIzAwMCwgLTFweCAxcHggIzAwMCwgLTFweCAtMXB4ICMwMDAsIDAgMCA1cHggIzAwMDsKCXBvaW50ZXItZXZlbnRzOm5vbmU7Cn0KLnBodGl2c2FpbGRyYXcta2V5cy1vdmVybGF5IHsKCWxpbmUtaGVpZ2h0OiAyMXB4OwoJdmVydGljYWwtYWxpZ246IG1pZGRsZTsKCWZvbnQtc2l6ZTogMTRweDsKCWZvbnQtd2VpZ2h0OiBib2xkOwp9Ci5waHRpdnNhaWxkcmF3LXBvbHlnb24tbGFiZWwgewoJdmVydGljYWwtYWxpZ246IG1pZGRsZTsKCWZvbnQtd2VpZ2h0OiBib2xkZXI7Cgl0ZXh0LXNoYWRvdzogMCAwIDFweCB3aGl0ZTsKfQoucGh0aXZzYWlsZHJhdy1wb2x5Z29uLWxhYmVsIHAsCi5waHRpdnNhaWxkcmF3LXBvbHlnb24tbGFiZWwgdWwgewoJbWFyZ2luOiAwOwoJb3ZlcmZsb3c6IGhpZGRlbjsKCXRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzOwp9CgoucGh0aXZzYWlsZHJhdy1vdmVyZmxvdy1idXR0b24gewoJZGlzcGxheTogaW5saW5lLWJveDsKCWRpc3BsYXk6IGlubGluZS1mbGV4OwoJbWluLXdpZHRoOiAyNHB4OwoJbWluLWhlaWdodDogMjBweDsKCXRleHQtYWxpZ246IGNlbnRlcjsKCXZlcnRpY2FsLWFsaWduOiBtaWRkbGU7Cglmb250LXdlaWdodDogYm9sZDsKCXRleHQtZGVjb3JhdGlvbjogbm9uZSAhaW1wb3J0YW50OwoJY29sb3I6ICNmZmNlMDA7CgljdXJzb3I6IHBvaW50ZXI7CglhbGlnbi1pdGVtczogY2VudGVyOwoJanVzdGlmeS1jb250ZW50OiBjZW50ZXI7Cn0KLnBodGl2c2FpbGRyYXctb3ZlcmZsb3ctYnV0dG9uIHNwYW4gewoJZmxleDogMCAwIGF1dG87Cglib3g6IDAgMCBhdXRvOwp9Ci5waHRpdnNhaWxkcmF3LW92ZXJmbG93LW1lbnUgewoJYm9yZGVyOiAxcHggc29saWQgIzIwYThiMTsKCWJhY2tncm91bmQ6IHJnYmEoOCwgNDgsIDc4LCAwLjkpOwoJY29sb3I6ICNmZmNlMDA7CglwYWRkaW5nOiAwOwoJbWFyZ2luOiAwOwoJcG9zaXRpb246IGFic29sdXRlOwoJbGlzdC1zdHlsZTogbm9uZTsKCXotaW5kZXg6IDMwMDAwOwoJbWF4LWhlaWdodDogNzAlOwoJbWF4LXdpZHRoOiAyNWVtOwoJb3ZlcmZsb3cteTogYXV0bzsKCW92ZXJmbG93LXg6IGhpZGRlbjsKfQoucGh0aXZzYWlsZHJhdy1vdmVyZmxvdy1tZW51IGEgewoJZGlzcGxheTogYmxvY2s7CglwYWRkaW5nOiAwLjVlbTsKCW1pbi13aWR0aDogOGVtOwoJdGV4dC1kZWNvcmF0aW9uOiBub25lOwoJb3V0bGluZTogMCB0cmFuc3BhcmVudCBub25lICFpbXBvcnRhbnQ7Cn0KLnBodGl2c2FpbGRyYXctb3ZlcmZsb3ctbWVudSBhOmhvdmVyIHsKCXRleHQtZGVjb3JhdGlvbjogbm9uZTsKCWJhY2tncm91bmQtY29sb3I6IHJnYmEoMzIsIDE2OCwgMTc3LCAwLjcpOwp9Ci5waHRpdnNhaWxkcmF3LW92ZXJmbG93LW1lbnUgYTpmb2N1cywKLnBodGl2c2FpbGRyYXctb3ZlcmZsb3ctbWVudSBhOmFjdGl2ZSB7Cgl0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTsKfQoKesmad1pe3LLasS5waHRpdnNhaWxkcmF3LXRhYmxlIHsKCWJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7CgllbXB0eS1jZWxsczogc2hvdzsKCXdpZHRoOiAxMDAlOwoJY2xlYXI6IGJvdGg7Cn0KLnBodGl2c2FpbGRyYXctdGFibGUgdGQsIC5waHRpdnNhaWxkcmF3LXRhYmxlIHRoIHsKCWJvcmRlci13aWR0aDogMCAxcHg7Cglib3JkZXItc3R5bGU6IHNvbGlkOwoJYm9yZGVyLWNvbG9yOiByZ2JhKDgsIDQ4LCA3OCwgMC43NSk7CglwYWRkaW5nOiAzcHggNHB4OwoJdGV4dC1hbGlnbjogbGVmdDsKfQoucGh0aXZzYWlsZHJhdy10YWJsZSB0ZDpmaXJzdC1jaGlsZCwgLnBodGl2c2FpbGRyYXctdGFibGUgdGg6Zmlyc3QtY2hpbGQgeyBib3JkZXItbGVmdC13aWR0aDogMDsgfQoucGh0aXZzYWlsZHJhdy10YWJsZSB0ZDpsYXN0LWNoaWxkLCAgLnBodGl2c2FpbGRyYXctdGFibGUgdGg6bGFzdC1jaGlsZCB7IGJvcmRlci1yaWdodC13aWR0aDogMDsgfQoucGh0aXZzYWlsZHJhdy10YWJsZSB0Ym9keSB0cjpudGgtY2hpbGQoMm4rMSkgdGQgewoJYm9yZGVyLWNvbG9yOiByZ2JhKDI1LCA2MywgOTUsIDAuNzUpOwp9Ci5waHRpdnNhaWxkcmF3LXRhYmxlIHRyIHsKCWJhY2tncm91bmQ6IHJnYmEoMjUsIDYzLCA5NSwgMC43NSk7Cn0KLnBodGl2c2FpbGRyYXctdGFibGUgdGJvZHkgdHI6bnRoLWNoaWxkKDJuKzEpIHsKCWJhY2tncm91bmQ6IHJnYmEoOCwgNDgsIDc4LCAwLjc1KTsKfQoucGh0aXZzYWlsZHJhdy10YWJsZSA+IHRoZWFkIC5zb3J0YWJsZSB7CgljdXJzb3I6IHBvaW50ZXI7Cn0KLnBodGl2c2FpbGRyYXctdGFibGUgPiB0aGVhZCAuc29ydGVkIHsKCWNvbG9yOiAjZmZjZTAwOwp9Ci5waHRpdnNhaWxkcmF3LXRhYmxlID4gdGhlYWQgLnNvcnRhYmxlOmJlZm9yZSB7Cgljb250ZW50OiAiICI7CglkaXNwbGF5OiBpbmxpbmUtYmxvY2s7CglmbG9hdDogcmlnaHQ7CgltaW4td2lkdGg6IDFlbTsKCXRleHQtYWxpZ246IHJpZ2h0Owp9Ci5waHRpdnNhaWxkcmF3LXRhYmxlID4gdGhlYWQgLnNvcnRhYmxlLmFzYzpiZWZvcmUgewoJY29udGVudDogIlwyNWIyIjsKfQoucGh0aXZzYWlsZHJhdy10YWJsZSA+IHRoZWFkIC5zb3J0YWJsZS5kZXNjOmJlZm9yZSB7Cgljb250ZW50OiAiXDI1YmMiOwp9Ci5waHRpdnNhaWxkcmF3LXRhYmxlIHRkLm1lbnUgewoJcG9zaXRpb246IHJlbGF0aXZlOwoJbWluLWhlaWdodDogMjBweDsKCW1pbi13aWR0aDogMjRweDsKfQoucGh0aXZzYWlsZHJhdy10YWJsZSB0ZC5tZW51ID4gLnBodGl2c2FpbGRyYXctb3ZlcmZsb3ctYnV0dG9uIHsKCXBvc2l0aW9uOiBhYnNvbHV0ZTsKCXRvcDogMDsKCWxlZnQ6IDA7CglyaWdodDogMDsKCWJvdHRvbTogMDsKCWRpc3BsYXk6IGZsZXg7Cn0KCi5waHRpdnNhaWxkcmF3LWRpYWxvZy1wb3J0YWxsaXN0IC5rZXlzLAoucGh0aXZzYWlsZHJhdy1kaWFsb2ctcG9ydGFsbGlzdCAubGlua3MgewoJd2lkdGg6IDMuNWVtOyAvKiB3aWxsIGV4cGFuZCB0byBmaXQgY29udGVudCAqLwoJdGV4dC1hbGlnbjogcmlnaHQ7Cn0KLnBodGl2c2FpbGRyYXctZGlhbG9nLXBvcnRhbGxpc3QgLndhcm4gewoJY29sb3I6ICNmZjA7CglmbG9hdDogbGVmdDsKCWZvbnQtc2l6ZTogMS41ZW07Cglmb250LXdlaWdodDogYm9sZDsKfQoucGh0aXZzYWlsZHJhdy1kaWFsb2ctcG9ydGFsbGlzdCAud2Fybi5lcnJvciB7Cgljb2xvcjogI2YwMDsKfQoKLyogc3R5bGUuY3NzIHNldHMgZGlhbG9nIG1heC13aWR0aCB0byA3MDBweCAtIG92ZXJyaWRlIHRoYXQgaGVyZSAqLwoucGh0aXZzYWlsZHJhdy1kaWFsb2ctbGlua2xpc3QgewoJbWF4LXdpZHRoOiAxMDAwcHggIWltcG9ydGFudDsKfQoucGh0aXZzYWlsZHJhdy1kaWFsb2ctcG9ydGFsbGlzdCA+IC51aS1kaWFsb2ctY29udGVudCwKLnBodGl2c2FpbGRyYXctZGlhbG9nLWxpbmtsaXN0ID4gLnVpLWRpYWxvZy1jb250ZW50LAoucGh0aXZzYWlsZHJhdy1kaWFsb2ctYWxlcnRsaXN0ID4gLnVpLWRpYWxvZy1jb250ZW50IHsKCXBhZGRpbmc6IDA7Cn0KLnBodGl2c2FpbGRyYXctZGlhbG9nLWxpbmtsaXN0IC5waHRpdnNhaWxkcmF3LWxheWVyIHsKCW1hcmdpbjogLTRweCAwIC00cHggLTRweDsKfQoucGh0aXZzYWlsZHJhdy1kaWFsb2ctbGlua2xpc3QgdGQua2V5cywKLnBodGl2c2FpbGRyYXctZGlhbG9nLWxpbmtsaXN0IHRkLmxlbmd0aCB7Cgl0ZXh0LWFsaWduOiByaWdodDsKfQoKLnBodGl2c2FpbGRyYXctZGlhbG9nLWFsZXJ0bGlzdCB0ZCB7Cgl2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7Cn0KLnBodGl2c2FpbGRyYXctZGlhbG9nLWFsZXJ0bGlzdCAuYXNzaWduZWUgewoJd2hpdGUtc3BhY2U6IG5vd3JhcDsKCW92ZXJmbG93OiBoaWRkZW47Cgl0ZXh0LW92ZXJmbG93OiBlbGxpcHNpczsKCW1heC13aWR0aDogMTBlbTsKfQoucGh0aXZzYWlsZHJhdy1kaWFsb2ctYWxlcnRsaXN0IC5yZXNvbHZlZCBidXR0b24gewoJbWFyZ2luOiAtM3B4IDA7CglwYWRkaW5nOiAwIDAuNWVtIDFweDsKfQoKI3BodGl2c2FpbGRyYXctZmFrZS1idXR0b24gewoJcG9zaXRpb246IGFic29sdXRlOwoJdG9wOiAtOTk5OWVtOwoJbGVmdDogLTk5OTllbTsKfQoKLnBodGl2c2FpbGRyYXctYWxlcnRzLW51bSB7Cgljb2xvcjogIzAwRkYwMDsKfQoucGh0aXZzYWlsZHJhdy1hbGVydHMtbnVtLm5ldyB7Cgljb2xvcjogI2ZmMDAwMDsKCWZvbnQtd2VpZ2h0OiBib2xkOwp9CgoucGh0aXZzYWlsZHJhdy1hZ2VudHNlbGVjdCAucGh0aXZzYWlsZHJhdy1ncm91cC1pbmRpY2F0b3IgewoJZmxvYXQ6IHJpZ2h0OwoJbWFyZ2luLWxlZnQ6IDAuMjVlbTsKfQoKLnBodGl2c2FpbGRyYXctZ3JvdXAtY29udGFpbmVyIHsKCWJvcmRlcjogMXB4IHNvbGlkIGN1cnJlbnRDb2xvcjsKCWRpc3BsYXk6IGlubGluZS1ibG9jazsKCWhlaWdodDogMS4yZW07CglsaW5lLWhlaWdodDogMS4yZW07CgltYXJnaW46IDFweCAwLjI1ZW0gMXB4IDA7CglwYWRkaW5nOiAwIDAuMjVlbTsKfQoucGh0aXZzYWlsZHJhdy1ncm91cC1jb250YWluZXIgPiAucGh0aXZzYWlsZHJhdy1ncm91cC1pbmRpY2F0b3IgewoJbWFyZ2luLWxlZnQ6IC0wLjI1ZW07CgltYXJnaW4tcmlnaHQ6IDAuMjVlbTsKCWhlaWdodDogMS4yZW07Cgl3aWR0aDogMS4yZW07Cn0KCi5waHRpdnNhaWxkcmF3LWdyb3VwLWluZGljYXRvciB7CglkaXNwbGF5OiBpbmxpbmUtYmxvY2s7Cglwb3NpdGlvbjogcmVsYXRpdmU7Cgl3aWR0aDogMWVtOwoJaGVpZ2h0OiAxZW07Cgl2ZXJ0aWNhbC1hbGlnbjogdG9wOwp9Ci5waHRpdnNhaWxkcmF3LWdyb3VwLWluZGljYXRvciA+IGRpdiB7CgloZWlnaHQ6IDFlbTsKCWZsb2F0OiBsZWZ0Owp9CgoucGh0aXZzYWlsZHJhdy1wb3B1cCB7CgltYXgtd2lkdGg6IDMwMHB4Owp9Ci5waHRpdnNhaWxkcmF3LWRpYWxvZyAuZGVzYyBwLAoucGh0aXZzYWlsZHJhdy1kaWFsb2cgLmRlc2MgdWwsCi5waHRpdnNhaWxkcmF3LXBvcHVwIHAsCi5waHRpdnNhaWxkcmF3LXBvcHVwIHVsIHsKCW1hcmdpbjogMDsKfQoucGh0aXZzYWlsZHJhdy1wb3B1cCBhIHsKCWNvbG9yOiAjMDA5OUNDOwp9Ci5waHRpdnNhaWxkcmF3LWRpYWxvZyAuZGVzYyB1bCwKLnBodGl2c2FpbGRyYXctcG9seWdvbi1sYWJlbCB1bCwKLnBodGl2c2FpbGRyYXctcG9wdXAgLmRlc2MgdWwgewoJcGFkZGluZy1sZWZ0OiAxLjVlbTsKfQoucGh0aXZzYWlsZHJhdy1kaWFsb2cgLmRlc2MgZW0sCi5waHRpdnNhaWxkcmF3LXBvbHlnb24tbGFiZWwgZW0sCi5waHRpdnNhaWxkcmF3LXBvcHVwIC5kZXNjIGVtIHsKCWNvbG9yOiBpbmhlcml0OwoJZm9udC1zdHlsZTogaXRhbGljOwp9Ci5waHRpdnNhaWxkcmF3LXBvcHVwLnBvcnRhbCAudWktZGlhbG9nLWJ1dHRvbnNldCB7CglkaXNwbGF5OiBib3g7CglkaXNwbGF5OiBmbGV4OwoJbWFyZ2luLXRvcDogNnB4Owp9Ci5waHRpdnNhaWxkcmF3LXBvcHVwLnBvcnRhbCAudWktZGlhbG9nLWJ1dHRvbnNldCBidXR0b24gewoJZmxleC1ncm93OiAxOwoJYm94LWdyb3c6IDE7Cn0KLnBodGl2c2FpbGRyYXctcG9wdXAgaW1nLmF2YXRhciB7CgltYXgtd2lkdGg6IDk2cHg7CgltYXgtaGVpZ2h0OiA5NnB4OwoJbWFyZ2luLWxlZnQ6IDRweDsKCWZsb2F0OiByaWdodDsKfQoKLnBodGl2c2FpbGRyYXcta2V5cy1vdmVybGF5LCAucGh0aXZzYWlsZHJhdy1hZ2VudC1sYWJlbCwgLnBodGl2c2FpbGRyYXctcG9seWdvbi1sYWJlbCB7Cgljb2xvcjogI0ZGRkZCQjsKCWZvbnQtc2l6ZTogMTJweDsKCWxpbmUtaGVpZ2h0OiAxNnB4OwoJdGV4dC1hbGlnbjogY2VudGVyOwoJcGFkZGluZzogMnB4OwoJb3ZlcmZsb3c6IGhpZGRlbjsKCXdoaXRlLXNwYWNlOiBub3dyYXA7Cgl0ZXh0LW92ZXJmbG93OiBlbGxpcHNpczsKCXRleHQtc2hhZG93OiAxcHggMXB4ICMwMDAsIDFweCAtMXB4ICMwMDAsIC0xcHggMXB4ICMwMDAsIC0xcHggLTFweCAjMDAwLCAwIDAgNXB4ICMwMDA7Cglwb2ludGVyLWV2ZW50czpub25lOwp9Ci5waHRpdnNhaWxkcmF3LWtleXMtb3ZlcmxheSB7CglsaW5lLWhlaWdodDogMjFweDsKCXZlcnRpY2FsLWFsaWduOiBtaWRkbGU7Cglmb250LXNpemU6IDE0cHg7Cglmb250LXdlaWdodDogYm9sZDsKfQoucGh0aXZzYWlsZHJhdy1wb2x5Z29uLWxhYmVsIHsKCXZlcnRpY2FsLWFsaWduOiBtaWRkbGU7Cglmb250LXdlaWdodDogYm9sZGVyOwoJdGV4dC1zaGFkb3c6IDAgMCAxcHggd2hpdGU7Cn0KLnBodGl2c2FpbGRyYXctcG9seWdvbi1sYWJlbCBwLAoucGh0aXZzYWlsZHJhdy1wb2x5Z29uLWxhYmVsIHVsIHsKCW1hcmdpbjogMDsKCW92ZXJmbG93OiBoaWRkZW47Cgl0ZXh0LW92ZXJmbG93OiBlbGxpcHNpczsKfQoKLnBodGl2c2FpbGRyYXctb3ZlcmZsb3ctYnV0dG9uIHsKCWRpc3BsYXk6IGlubGluZS1ib3g7CglkaXNwbGF5OiBpbmxpbmUtZmxleDsKCW1pbi13aWR0aDogMjRweDsKCW1pbi1oZWlnaHQ6IDIwcHg7Cgl0ZXh0LWFsaWduOiBjZW50ZXI7Cgl2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlOwoJZm9udC13ZWlnaHQ6IGJvbGQ7Cgl0ZXh0LWRlY29yYXRpb246IG5vbmUgIWltcG9ydGFudDsKCWNvbG9yOiAjZmZjZTAwOwoJY3Vyc29yOiBwb2ludGVyOwoJYWxpZ24taXRlbXM6IGNlbnRlcjsKCWp1c3RpZnktY29udGVudDogY2VudGVyOwp9Ci5waHRpdnNhaWxkcmF3LW92ZXJmbG93LWJ1dHRvbiBzcGFuIHsKCWZsZXg6IDAgMCBhdXRvOwoJYm94OiAwIDAgYXV0bzsKfQoucGh0aXZzYWlsZHJhdy1vdmVyZmxvdy1tZW51IHsKCWJvcmRlcjogMXB4IHNvbGlkICMyMGE4YjE7CgliYWNrZ3JvdW5kOiByZ2JhKDgsIDQ4LCA3OCwgMC45KTsKCWNvbG9yOiAjZmZjZTAwOwoJcGFkZGluZzogMDsKCW1hcmdpbjogMDsKCXBvc2l0aW9uOiBhYnNvbHV0ZTsKCWxpc3Qtc3R5bGU6IG5vbmU7Cgl6LWluZGV4OiAzMDAwMDsKCW1heC1oZWlnaHQ6IDcwJTsKCW1heC13aWR0aDogMjVlbTsKCW92ZXJmbG93LXk6IGF1dG87CglvdmVyZmxvdy14OiBoaWRkZW47Cn0KLnBodGl2c2FpbGRyYXctb3ZlcmZsb3ctbWVudSBhIHsKCWRpc3BsYXk6IGJsb2NrOwoJcGFkZGluZzogMC41ZW07CgltaW4td2lkdGg6IDhlbTsKCXRleHQtZGVjb3JhdGlvbjogbm9uZTsKCW91dGxpbmU6IDAgdHJhbnNwYXJlbnQgbm9uZSAhaW1wb3J0YW50Owp9Ci5waHRpdnNhaWxkcmF3LW92ZXJmbG93LW1lbnUgYTpob3ZlciB7Cgl0ZXh0LWRlY29yYXRpb246IG5vbmU7CgliYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDMyLCAxNjgsIDE3NywgMC43KTsKfQoucGh0aXZzYWlsZHJhdy1vdmVyZmxvdy1tZW51IGE6Zm9jdXMsCi5waHRpdnNhaWxkcmF3LW92ZXJmbG93LW1lbnUgYTphY3RpdmUgewoJdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7Cn0KCg==";
            es.ui = "data:text/css;base64,Ym9keS5wcml2YWN5X2FjdGl2ZSAucGh0aXZzYWlsZHJhdy10b29sYmFyIHsKCWRpc3BsYXk6IG5vbmU7Cn0KCiNwaHRpdnNhaWxkcmF3LWJ0bi1zeW5jLnJ1bm5pbmcgewoJLXdlYmtpdC1hbmltYXRpb24tZHVyYXRpb246IDFzOwoJICAgICAgICBhbmltYXRpb24tZHVyYXRpb246IDFzOwoJLXdlYmtpdC1hbmltYXRpb24tbmFtZTogcGh0aXZzYWlsZHJhdy1zeW5jLXJ1bm5pbmc7CgkgICAgICAgIGFuaW1hdGlvbi1uYW1lOiBwaHRpdnNhaWxkcmF3LXN5bmMtcnVubmluZzsKCS13ZWJraXQtYW5pbWF0aW9uLXRpbWluZy1mdW5jdGlvbjogbGluZWFyOwoJICAgICAgICBhbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uOiBsaW5lYXI7Cgktd2Via2l0LWFuaW1hdGlvbi1pdGVyYXRpb24tY291bnQ6IGluZmluaXRlOwoJICAgICAgICBhbmltYXRpb24taXRlcmF0aW9uLWNvdW50OiBpbmZpbml0ZTsKfQpALXdlYmtpdC1rZXlmcmFtZXMgcGh0aXZzYWlsZHJhdy1zeW5jLXJ1bm5pbmcgewoJMCUgewoJCS13ZWJraXQtdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7CgkJICAgICAgICB0cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTsKCX0KCTEwMCUgewoJCS13ZWJraXQtdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTsKCQkgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7Cgl9Cn0KQGtleWZyYW1lcyBwaHRpdnNhaWxkcmF3LXN5bmMtcnVubmluZyB7CgkwJSB7CgkJLXdlYmtpdC10cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTsKCQkgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpOwoJfQoJMTAwJSB7CgkJLXdlYmtpdC10cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpOwoJCSAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTsKCX0KfQoKI3BodGl2c2FpbGRyYXctbWVudS1jb25maWcgewoJZGlzcGxheTogYm94OyAvKiBvbGQgdmFsdWUsIGZvciBBbmRyb2lkICovCglkaXNwbGF5OiBmbGV4OwoJbWFyZ2luOiAtMTJweDsKCXBvc2l0aW9uOiByZWxhdGl2ZTsKfQojcGh0aXZzYWlsZHJhdy1tZW51LWNvbmZpZy5tb2JpbGUgewoJYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7CglwYWRkaW5nOiAwOwoJYm9yZGVyOiAwIG5vbmU7CgltYXJnaW46IDA7CgloZWlnaHQ6IDEwMCU7Cgl3aWR0aDogMTAwJTsKCWxlZnQ6IDA7Cgl0b3A6IDA7Cglwb3NpdGlvbjogYWJzb2x1dGU7CglvdmVyZmxvdzogYXV0bzsKfQojcGh0aXZzYWlsZHJhdy1tZW51LWNvbmZpZyAucHJvZ3Jlc3MgewoJcG9zaXRpb246IGFic29sdXRlOwoJdG9wOiAwOwoJbGVmdDogMDsKCXJpZ2h0OiAwOwoJaGVpZ2h0OiAzcHg7CgliYWNrZ3JvdW5kLWNvbG9yOiAjRUVFRUVFOwoJZGlzcGxheTogbm9uZTsKfQojcGh0aXZzYWlsZHJhdy1tZW51LWNvbmZpZy5zaG93cHJvZ3Jlc3MgLnByb2dyZXNzIHsKCWRpc3BsYXk6IGJsb2NrOwp9CiNwaHRpdnNhaWxkcmF3LW1lbnUtY29uZmlnIC5wcm9ncmVzcyAucHJvZ3Jlc3MtdmFsdWUgewoJcG9zaXRpb246IGFic29sdXRlOwoJdG9wOiAwOwoJbGVmdDogMDsKCWhlaWdodDogMTAwJTsKCWJhY2tncm91bmQtY29sb3I6ICNGRkNFMDA7Cgl3aWR0aDogMCU7Cn0KI3BodGl2c2FpbGRyYXctbWVudS1jb25maWcgbmF2IHsKCWRpc3BsYXk6IGJsb2NrOwoJbWluLWhlaWdodDogMTUwcHg7Cgl3aWR0aDogMTUwcHg7Cglib3JkZXItcmlnaHQ6IDFweCBzb2xpZCAjMjBBOEIxOwoJdmVydGljYWwtYWxpZ246IHRvcDsKCWZsZXgtc2hyaW5rOiAwOwoJZmxleC1ncm93OiAwOwoJYm94LXNocmluazogMDsKCWJveC1ncm93OiAwOwp9CiNwaHRpdnNhaWxkcmF3LW1lbnUtY29uZmlnIC50YWJzIHsKCXBvc2l0aW9uOiByZWxhdGl2ZTsKCXBhZGRpbmc6IDEwcHg7CglmbGV4LXNocmluazogMTsKCWZsZXgtZ3JvdzogMTsKCWJveC1zaHJpbms6IDE7Cglib3gtZ3JvdzogMTsKCS8qIG1heC13aWR0aDogMzIwcHg7ICovCn0KI3BodGl2c2FpbGRyYXctbWVudS1jb25maWcgbmF2IGEgewoJY29sb3I6IHdoaXRlOwoJcGFkZGluZzogMC41ZW07CglkaXNwbGF5OiBibG9jazsKCXRleHQtd2VpZ2h0OiBib2xkOwoJYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICMyMEE4QjE7Cgl0ZXh0LWRlY29yYXRpb246IG5vbmU7Cn0KI3BodGl2c2FpbGRyYXctbWVudS1jb25maWcgbmF2IGE6bGFzdC1jaGlsZCB7Cglib3JkZXItYm90dG9tLXdpZHRoOiAwOwp9CiNwaHRpdnNhaWxkcmF3LW1lbnUtY29uZmlnIG5hdiBhOmhvdmVyIHsKCWJhY2tncm91bmQtY29sb3I6ICMwODNDNEU7Cn0KI3BodGl2c2FpbGRyYXctbWVudS1jb25maWcgbmF2IGEuY2xpY2tlZCB7CgliYWNrZ3JvdW5kLWNvbG9yOiAjMjBBOEIxOwp9CiNwaHRpdnNhaWxkcmF3LW1lbnUtY29uZmlnIHNlY3Rpb24gaDIgewoJZm9udC1zaXplOiAxOHB4OwoJbWFyZ2luOiAwIDAgMC40ZW0gMDsKCXBhZGRpbmc6IDA7Cn0KI3BodGl2c2FpbGRyYXctbWVudS1jb25maWcgc2VjdGlvbiBoMiBzbWFsbCB7Cgljb2xvcjogI0NDQ0NDQzsKCXZlcnRpY2FsLWFsaWduOiB0b3A7Cn0KI3BodGl2c2FpbGRyYXctbWVudS1jb25maWcgaHIgewoJYm9yZGVyOiAwOwoJaGVpZ2h0OiAxcHg7CgliYWNrZ3JvdW5kLWNvbG9yOiAjMjBBOEIxCn0KI3BodGl2c2FpbGRyYXctbWVudS1jb25maWcgZmllbGRzZXQgewoJYm9yZGVyOiAxcHggc29saWQgIzIwYThiMTsKCXBhZGRpbmc6IDAgMC42MjVlbTsKfQojcGh0aXZzYWlsZHJhdy1tZW51LWNvbmZpZyBsZWdlbmQgewoJY29sb3I6ICNmZmNlMDA7Cglmb250LXdlaWdodDogYm9sZDsKfQojcGh0aXZzYWlsZHJhdy1tZW51LWNvbmZpZyBwIHsKCW1hcmdpbjogMC41ZW0gMDsKfQojcGh0aXZzYWlsZHJhdy1tZW51LWNvbmZpZyBsYWJlbCB7CglkaXNwbGF5OiBibG9jazsKfQojcGh0aXZzYWlsZHJhdy1tZW51LWNvbmZpZyBsYWJlbCBpbnB1dCB7Cgl2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlOwoJbWFyZ2luOiAwIDAuMmVtOwp9CiNwaHRpdnNhaWxkcmF3LW1lbnUtY29uZmlnLXNlbGVjdCB7CglkaXNwbGF5OiBub25lOwoJZmxleC1zaHJpbms6IDA7CglmbGV4LWdyb3c6IDA7Cglib3gtc2hyaW5rOiAwOwoJYm94LWdyb3c6IDA7CglwYWRkaW5nOiA1cHggMTBweCAwOwp9CiNwaHRpdnNhaWxkcmF3LW1lbnUtY29uZmlnLXNlbGVjdCBzZWxlY3QgewoJcGFkZGluZzogN3B4Owp9CiNwaHRpdnNhaWxkcmF3LW1lbnUtY29uZmlnLXNlbGVjdCBociB7CgltYXJnaW46IDVweCAtMTBweCAwOwp9CkBtZWRpYSAobWF4LXdpZHRoOiA5NTlweCkgewoJI3BodGl2c2FpbGRyYXctbWVudS1jb25maWcgewoJCWZsZXgtZGlyZWN0aW9uOiBjb2x1bW47CgkJYm94LWRpcmVjdGlvbjogY29sdW1uOwoJfQoJI3BodGl2c2FpbGRyYXctbWVudS1jb25maWcgbmF2IHsKCQlkaXNwbGF5OiBub25lOwoJfQoJI3BodGl2c2FpbGRyYXctbWVudS1jb25maWctc2VsZWN0IHsKCQlkaXNwbGF5OiBibG9jazsKCX0KfQoKLnBodGl2c2FpbGRyYXctZGlhbG9nIC51aS1kaWFsb2ctY29udGVudCBpbnB1dCwKLnBodGl2c2FpbGRyYXctZGlhbG9nIC51aS1kaWFsb2ctY29udGVudCB0ZXh0YXJlYSB7Cglib3JkZXI6IDFweCBzb2xpZCAjMjBhOGIxOwoJY29sb3I6ICNmZmNlMDA7CgliYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuMyk7Cn0KLnBodGl2c2FpbGRyYXctZGlhbG9nIHAgewoJbWFyZ2luOiAwIDAgNnB4Owp9CgoucGh0aXZzYWlsZHJhdy1kaWFsb2ctcG9ydGFscyA+IC51aS1kaWFsb2ctY29udGVudCwKLnBodGl2c2FpbGRyYXctZGlhbG9nLWxpbmsgPiAudWktZGlhbG9nLWNvbnRlbnQsCi5waHRpdnNhaWxkcmF3LWRpYWxvZy1wb2x5Z29uID4gLnVpLWRpYWxvZy1jb250ZW50IHsKCXBhZGRpbmc6IDZweCA2cHggMDsKfQoucGh0aXZzYWlsZHJhdy1kaWFsb2ctcG9ydGFscyAubmFtZSBsYWJlbCB7CglhbGlnbi1pdGVtczogYmFzZWxpbmU7CglkaXNwbGF5OiBmbGV4Owp9Ci5waHRpdnNhaWxkcmF3LWRpYWxvZy1wb3J0YWxzIC5uYW1lIGxhYmVsID4gKnsKCWZsZXgtZ3JvdzogMTsKCW1hcmdpbi1sZWZ0OiAwLjVlbTsKfQoucGh0aXZzYWlsZHJhdy1kaWFsb2cgdGV4dGFyZWEuZGVzYywKLnBodGl2c2FpbGRyYXctZGlhbG9nIC5kZXNjIHRleHRhcmVhIHsKCWJveC1zaXppbmc6IGJvcmRlci1ib3g7Cgl3aWR0aDogMTAwJTsKCWhlaWdodDogNC41ZW07CglwYWRkaW5nOiAzcHg7CglyZXNpemU6IHZlcnRpY2FsOwp9Ci5waHRpdnNhaWxkcmF3LWRpYWxvZy1wb3J0YWxzIC5rZXlzIGlucHV0LAoucGh0aXZzYWlsZHJhdy1kaWFsb2ctbGluayAua2V5cyBpbnB1dCB7Cgl3aWR0aDogNmVtOwoJcGFkZGluZy1yaWdodDogMDsKfQoucGh0aXZzYWlsZHJhdy1kaWFsb2ctcG9ydGFscyAua2V5cyBpbnB1dCwKLnBodGl2c2FpbGRyYXctZGlhbG9nLWxpbmsgLmtleXMgaW5wdXQgewoJbWFyZ2luLWxlZnQ6IDZweDsKfQoucGh0aXZzYWlsZHJhdy1kaWFsb2ctcG9ydGFscyAuZGV0YWlscywKLnBodGl2c2FpbGRyYXctZGlhbG9nLWxpbmsgLmRldGFpbHMsCi5waHRpdnNhaWxkcmF3LWRpYWxvZy1wb2x5Z29uIC5kZXRhaWxzIHsKCWRpc3BsYXk6IGJveDsKCWRpc3BsYXk6IGZsZXg7CglhbGlnbi1pdGVtczogY2VudGVyOwp9Ci5waHRpdnNhaWxkcmF3LWRpYWxvZy1wb3J0YWxzIC5waHRpdnNhaWxkcmF3LWxheWVyLAoucGh0aXZzYWlsZHJhdy1kaWFsb2ctbGluayAucGh0aXZzYWlsZHJhdy1sYXllciwKLnBodGl2c2FpbGRyYXctZGlhbG9nLXBvbHlnb24gLnBodGl2c2FpbGRyYXctbGF5ZXIgewoJbWFyZ2luLWxlZnQ6IDEycHg7CglmbGV4OiAxIDEgYXV0bzsKCWJveDogMSAxIGF1dG87Cn0KLnBodGl2c2FpbGRyYXctZGlhbG9nLXBvcnRhbHMgLnBvc2l0aW9ud2FybmluZy5oaWRkZW4gewoJZGlzcGxheTogbm9uZTsKfQoucGh0aXZzYWlsZHJhdy1kaWFsb2ctcG9ydGFscyAucG9zaXRpb253YXJuaW5nIHsKCWJhY2tncm91bmQtY29sb3I6IHllbGxvdzsKCWJvcmRlcjogMnB4IHNvbGlkIHJlZDsKCWNvbG9yOiByZWQ7Cglmb250LXdlaWdodDogYm9sZDsKCXBhZGRpbmc6IDAuM2VtOwp9CgoucGh0aXZzYWlsZHJhdy1kaWFsb2ctbGluayAubGlua3BvcnRhbHMgewoJZGlzcGxheTogYm94OwoJZGlzcGxheTogZmxleDsKCW1hcmdpbjogMCAtNnB4IDZweDsKfQoucGh0aXZzYWlsZHJhdy1kaWFsb2ctbGluayAubGlua3BvcnRhbHMgPiBzcGFuIHsKCWZsZXg6IDEgMSA1MCU7Cglib3g6IDEgMSA1MCU7CgltYXJnaW46IDAgNnB4Owp9CgoucGh0aXZzYWlsZHJhdy1kaWFsb2ctbGlua3MgPiAudWktZGlhbG9nLWNvbnRlbnQgewoJcGFkZGluZzogMDsKfQoucGh0aXZzYWlsZHJhdy1kaWFsb2ctbGlua3MgPiAudWktZGlhbG9nLWNvbnRlbnQgPiBkaXYgewoJZGlzcGxheTogZmxleDsKCWZsZXgtZGlyZWN0aW9uOiBjb2x1bW47Cn0KLnBodGl2c2FpbGRyYXctZGlhbG9nLWxpbmtzIHRleHRhcmVhLmRlc2MgewoJbWFyZ2luOiA2cHggNnB4IDNweDsKCWhlaWdodDogMmVtOwoJd2lkdGg6IGF1dG87CglwYWRkaW5nOiA0cHg7Cn0KLnBodGl2c2FpbGRyYXctZGlhbG9nLWxpbmtzIHRhYmxlIHsKCWJvcmRlci1zcGFjaW5nOiAwOwp9Ci5waHRpdnNhaWxkcmF3LWRpYWxvZy1saW5rcyB0ZCB7Cgl2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlOwoJd2hpdGUtc3BhY2U6IG5vd3JhcDsKCXBhZGRpbmc6IDFweCAxcHggMCAwOwp9Ci5waHRpdnNhaWxkcmF3LWRpYWxvZy1saW5rcyB0ZDpmaXJzdC1jaGlsZCwKLnBodGl2c2FpbGRyYXctZGlhbG9nLWxpbmtzIC5hcnJvdyB7Cgl0ZXh0LWFsaWduOiBjZW50ZXI7Cgl3aWR0aDogMjBweDsKCWRpc3BsYXk6IGlubGluZS1ibG9jazsKfQoucGh0aXZzYWlsZHJhdy1kaWFsb2ctbGlua3MgaW5wdXRbdHlwZT0iY2hlY2tib3giXSB7CgltYXJnaW46IDA7Cgl2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlOwp9Ci5waHRpdnNhaWxkcmF3LWRpYWxvZy1saW5rcyB0YWJsZSBidXR0b24gewoJZGlzcGxheTogaW5saW5lLWJsb2NrOwoJcGFkZGluZzogMXB4IDRweDsKCWZvbnQtc2l6ZTogMWVtOwoJbGluZS1oZWlnaHQ6IDEuMjVlbTsKfQoucGh0aXZzYWlsZHJhdy1kaWFsb2ctbGlua3MgYnV0dG9uLnBvcnRhbC1kcm9wZG93biB7CglwYWRkaW5nOiAxcHggMHB4OwoJbWluLXdpZHRoOiAwOwoJYm9yZGVyLWxlZnQtd2lkdGg6IDA7Cn0KLnBodGl2c2FpbGRyYXctZGlhbG9nLWxpbmtzIC5wb3J0YWwgewoJcGFkZGluZy1yaWdodDogNnB4OwoJcGFkZGluZy1sZWZ0OiAycHg7CgltYXgtd2lkdGg6IDE1MHB4OwoJb3ZlcmZsb3c6IGhpZGRlbjsKCXRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzOwp9Ci5waHRpdnNhaWxkcmF3LWRpYWxvZy1saW5rcyAuYnV0dG9uYmFyIHsKCWRpc3BsYXk6IGJveDsKCWRpc3BsYXk6IGZsZXg7CglhbGlnbi1pdGVtczogY2VudGVyOwoJanVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOwoJYm9yZGVyLXRvcDogMXB4IHNvbGlkICMyMGE4YjE7CgltYXJnaW46IDZweCAwIDAgLTZweDsKCXBhZGRpbmc6IDZweDsKfQoucGh0aXZzYWlsZHJhdy1kaWFsb2ctbGlua3MgLmJ1dHRvbmJhciA+IGxhYmVsIHsKCXdpZHRoOiA1ZW07Cn0KCi5waHRpdnNhaWxkcmF3LWRpYWxvZy1hbGVydHMgLnVpLWRpYWxvZy1jb250ZW50IHsKCW1pbi1oZWlnaHQ6IDAgIWltcG9ydGFudDsKfQoucGh0aXZzYWlsZHJhdy1kaWFsb2ctYWxlcnRzIC51aS1kaWFsb2ctY29udGVudCA+IGRpdiB7CgltYXJnaW46IC02cHg7Cn0KLnBodGl2c2FpbGRyYXctZGlhbG9nLWFsZXJ0cyAuZmxleCB7CglkaXNwbGF5OiBib3g7IC8qIG9sZCB2YWx1ZSwgZm9yIEFuZHJvaWQgKi8KCWRpc3BsYXk6IGZsZXg7CglhbGlnbi1pdGVtczogY2VudGVyOwoJd2hpdGUtc3BhY2U6IG5vd3JhcDsKfQoucGh0aXZzYWlsZHJhdy1kaWFsb2ctYWxlcnRzIC5mbGV4ICogewoJZmxleDogMSAwIDA7Cglib3g6IDEgMCAwOwp9Ci5waHRpdnNhaWxkcmF3LWRpYWxvZy1hbGVydHMgLmZsZXggaW5wdXQgewoJYm9yZGVyOiAxcHggc29saWQgIzIwYThiMTsKCW1hcmdpbi1sZWZ0OiAwLjJlbTsKfQoucGh0aXZzYWlsZHJhdy1kaWFsb2ctYWxlcnRzIC5mbGV4IHNlbGVjdCB7Cgl3aWR0aDogMDsgLyogQ2hyb21lIHdvdWxkIGV4cGFuZCB0byBmaXQgdGhlIGNvbnRlbnRzIG90aGVyd2lzZSAqLwp9Ci5waHRpdnNhaWxkcmF3LXRhcmdldHNlbGVjdCB7CglkaXNwbGF5OiBmbGV4OwoJYWxpZ24taXRlbXM6IGJhc2VsaW5lOwp9Ci5waHRpdnNhaWxkcmF3LXRhcmdldHNlbGVjdCA+IHN0cm9uZyB7CglmbGV4OiAxIDAgMDsKCWJveDogMSAwIDA7CgltYXJnaW46IDAgMC4yZW07CglvdmVyZmxvdzogaGlkZGVuOwoJdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7Cgl3aGl0ZS1zcGFjZTogbm93cmFwOwp9Ci5waHRpdnNhaWxkcmF3LXRhcmdldHNlbGVjdCA+IC5waHRpdnNhaWxkcmF3LW92ZXJmbG93LWJ1dHRvbiB7CglhbGlnbi1zZWxmOiBzdHJldGNoOwoJYmFja2dyb3VuZC1jb2xvcjogcmdiYSg4LCA0OCwgNzgsIDAuOSk7Cglib3JkZXI6IDFweCBzb2xpZCAjZmZjZTAwOwoJY29sb3I6ICNmZmNlMDA7CglwYWRkaW5nOiAycHg7Cn0KCi5waHRpdnNhaWxkcmF3LWRpYWxvZy1wb2x5Z29uIC5kZXRhaWxzID4gLmNvbG9yIHsKCWRpc3BsYXk6IGlubGluZS1ib3g7CglkaXNwbGF5OiBpbmxpbmUtZmxleDsKCWFsaWduLWl0ZW1zOiBjZW50ZXI7Cn0KLnBodGl2c2FpbGRyYXctZGlhbG9nLXBvbHlnb24gLmRldGFpbHMgPiAuY29sb3IgaW5wdXQsCi5waHRpdnNhaWxkcmF3LWRpYWxvZy1wb2x5Z29uIC5kZXRhaWxzID4gLmNvbG9yIC5zcC1yZXBsYWNlciB7CgltYXJnaW4tbGVmdDogMC41ZW07Cn0KCi5waHRpdnNhaWxkcmF3LWNvbG9yLXBpY2tlciAuc3AtaW5wdXQgewoJYm9yZGVyOiAxcHggc29saWQgIzY2NjsKCWJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50OwoJY29sb3I6ICMyMjI7Cn0KLnBodGl2c2FpbGRyYXctY29sb3ItcGlja2VyIC5zcC1jZiB7CgltaW4taGVpZ2h0OiAwLjVlbTsKfQoKLnBodGl2c2FpbGRyYXctbGF5ZXIgewoJZGlzcGxheTogaW5saW5lLWJveDsgLyogb2xkIHZhbHVlLCBmb3IgQW5kcm9pZCAqLwoJZGlzcGxheTogaW5saW5lLWZsZXg7CglhbGlnbi1pdGVtczogY2VudGVyOwp9Ci5waHRpdnNhaWxkcmF3LWxheWVyIGxhYmVsIHsKCW1hcmdpbi1yaWdodDogMC41ZW07Cn0KLnBodGl2c2FpbGRyYXctbGF5ZXIubm9sYWJlbCBsYWJlbCB7CglkaXNwbGF5OiBub25lOwp9Ci5waHRpdnNhaWxkcmF3LWxheWVyIC5wcmV2aWV3IHsKCWRpc3BsYXk6IGlubGluZS1ibG9jazsKCXdpZHRoOiAwLjVyZW07CgltaW4taGVpZ2h0OiAyMHB4OwoJYWxpZ24tc2VsZjogc3RyZXRjaDsKfQoucGh0aXZzYWlsZHJhdy1sYXllciBzZWxlY3QsCi5waHRpdnNhaWxkcmF3LWxheWVyIC5vdXRwdXQgewoJZmxleDogMSAxIGF1dG87Cglib3g6IDEgMSBhdXRvOwoJLyogdGhlIHNlbGVjdCBoYXMgYSBkZWZhdWx0IHdpZHRoIHdoaWNoIHdlIHdhbnQgdG8gdW5zZXQgKi8KCW1pbi13aWR0aDogNmVtOwoJd2lkdGg6IDA7Cn0KLnBodGl2c2FpbGRyYXctbGF5ZXIgLm91dHB1dCB7CgltaW4td2lkdGg6IDRlbTsKfQoucGh0aXZzYWlsZHJhdy1sYXllciBvcHRpb24gc3BhbiB7CglkaXNwbGF5OiBpbmxpbmUtYmxvY2s7CglmbG9hdDogbGVmdDsKCXZlcnRpY2FsLWFsaWduOiB0b3A7CgloZWlnaHQ6IDFlbTsKCXdpZHRoOiAxZW07CgltYXJnaW4tcmlnaHQ6IDAuMjVlbTsKfQoucGh0aXZzYWlsZHJhdy1sYXllciAub3V0cHV0IHsKCW1hcmdpbi1sZWZ0OiA0cHg7Cn0KCg==";
        }(b = s.CSS || (s.CSS = {}));
    }(PhtivSailDraw || (PhtivSailDraw = {}));


    !function (scope) {
        var linkDialogFunc = function () {
            /**
             * @param {string} filterArray
             * @param {?} dashboard
             * @param {!Object} options
             * @return {undefined}
             */
             //***Draws dialog box
            function init() { //op, dashboard, layerManager) {
                var self = this;
                //this._broadcast = new BroadcastChannel("phtivsaildraw-linkdialog");
                this._portals = {};
                this._links = [];
                //this._operation = op;
                //this._dashboard = dashboard;
                //this._layerManager = layerManager;
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
                [0, 1, 2, 3].forEach(function (string) {
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
                            return self.addLinkTo(other);
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
                    return self.addAllLinks();
                }, false);
                var cardHeader = element.appendChild(document.createElement("label"));
                this._reversed = cardHeader.appendChild(document.createElement("input"));
                this._reversed.type = "checkbox";
                cardHeader.appendChild(document.createTextNode(" reverse"));
                //var style = new scope.LayerSelector(this._layerManager, this._operation.data);
                //style.label = false;
                //element.appendChild(style.container);
                button = element.appendChild(document.createElement("button"));
                button.textContent = "close";
                button.addEventListener("click", function (a) {
                    return self._dialog.dialog("close");
                }, false);
                var sendMessage = function (name) {
                    return self.onMessage(name);
                };
                //this._broadcast.addEventListener("message", sendMessage, false);
                this._dialog = window.dialog({
                    title: "PhtivSail Draw Links", //this._operation.data.operationName + " Links",
                    width: "auto",
                    height: "auto",
                    html: container,
                    dialogClass: "phtivsaildraw-dialog phtivsaildraw-dialog-links",
                    closeCallback: function (popoverName) {
                       // self._broadcast.removeEventListener("message", sendMessage, false);
                        var paneIndex = init._dialogs.indexOf(self);
                        if (-1 !== paneIndex) {
                            init._dialogs.splice(paneIndex, 1);
                        }
                    }
                });
                this._dialog.dialog("option", "buttons", {});
            }
            return init.show = function () {//(selector, context, d) {
                var p = 0;
                var parameters = init._dialogs;
                for (; p < parameters.length; p++) {
                    var page = parameters[p];
                    if (page._operation == selector) {
                        return page.focus(), page;
                    }
                }
                return new init();//selector, context, d);
            }, init.prototype.focus = function () {
                this._dialog.dialog("open");
            }, init.prototype.onMessage = function (command) {
                if ("setPortal" === command.data.type) {
                    this.updatePortal(command.data.name);
                }
                //***Function to set portal -- called from 'Set' Button
            }, init.prototype.setPortal = function (event) {
                 var newName = event.currentTarget.parentNode.parentNode.getAttribute("data-portal");
                 alert("setPortal: "+newName);
                 /*
                 var existing_urls = scope.UiHelper.getSelectedPortal();
                 if (existing_urls) {
                    localStorage["phtivsaildraw-portal-" + newName] = JSON.stringify(existing_urls);
                 } else {
                    delete localStorage["phtivsaildraw-portal-" + newName];
                 }
                 
                 this.updatePortal(newName);
                 this._broadcast.postMessage({
                 type: "setPortal",
                 name: newName
                 });
                 */
                //***Function to get portal -- called in updatePortal, addLinkTo, and addAllLinks
            }, init.prototype.getPortal = function (name) {
                try {
                    return JSON.parse(localStorage["phtivsaildraw-portal-" + name]);
                } catch (b) {
                    return null;
                }
                //***Function to update portal
            }, init.prototype.updatePortal = function (key) {
                /*
                 var i = this.getPortal(key);
                 var viewContainer = this._portals[key];
                 $(viewContainer).empty();
                 if (i) {
                 viewContainer.appendChild(scope.UiHelper.getPortalLink(i));
                 }
                 */
                //***Function to add link between the portals -- called from 'Add' Button next to To portals
            }, init.prototype.addLinkTo = function (instance) {
                alert("addLinkTo: "+this.getPortal(instance.currentTarget.parentNode.parentNode.getAttribute("data-portal")));
                /*
                 var item = this;
                 var server = instance.currentTarget.parentNode.parentNode.getAttribute("data-portal");
                 var link = this.getPortal(server);
                 var m = this.getPortal("src");
                 if (!m || !link) {
                 return void alert("Please select target and destination portals first!");
                 }
                 var n = this._reversed.checked;
                 Promise.all([this.addPortal(m), this.addPortal(link)]).then(function () {
                 return n ? item.addLink(link, m) : item.addLink(m, link);
                 })["catch"](function (data) {
                 throw alert(data.message), console.log(data), data;
                 });
                 */
                //***Function to add all the links between the from and all the to portals -- called from 'Add All Links' Button
            }, init.prototype.addAllLinks = function () {
                alert("addAllLinks:" + this.getPortal("src"));
                /*
                 var self = this;
                 var url = this.getPortal("src");
                 if (!url) {
                 return void alert("Please select a target portal first!");
                 }
                 var resolvedSourceMapConfigs = this._links.map(function (b) {
                 return b.checked ? self.getPortal(b.value) : null;
                 }).filter(function (a) {
                 return null != a;
                 });
                 if (0 == resolvedSourceMapConfigs.length) {
                 return void alert("Please select a destination portal first!");
                 }
                 var apiKey = this._reversed.checked;
                 var documentBodyPromise = this.addPortal(url);
                 Promise.all(resolvedSourceMapConfigs.map(function (link) {
                 return Promise.all([documentBodyPromise, self.addPortal(link)]).then(function () {
                 return apiKey ? self.addLink(link, url) : self.addLink(url, link);
                 });
                 }))["catch"](function (data) {
                 throw alert(data.message), console.log(data), data;
                 });
                 */
                //***Function to add a portal -- called in addLinkTo and addAllLinks functions
            }, init.prototype.addPortal = function (a) {
                alert("addPortal: "+a);
                /*
                 return a ? this._operation.data.portals.some(function (b) {
                 return b.id == a.id;
                 }) ? Promise.resolve(this._operation.data.portals) : scope.UiCommands.addPortal(this._operation, this._layerManager, a, "", true) : Promise.reject("no portal given");
                 */
                //***Function to add a single link -- called in addLinkTo and addAllLinks functions
            }, init.prototype.addLink = function (value, data) {
                alert("addLink: "+value);
                /*
                 var selectLayersValue = this._desc.value;
                 if (!value || !data) {
                 return Promise.reject("no portal given");
                 }
                 var link = this._layerManager.activeLayer;
                 var e = !this._operation.data.operation.isAgentOperator;
                 return this._operation.linkService.addLink(value.id, data.id, link, e, PLAYER.nickname, selectLayersValue);
                 */
            }, init._dialogs = [], init;
        }();
        scope.LinkDialog = linkDialogFunc;
    }(PhtivSailDraw || (PhtivSailDraw = {}));

    //TODO still need to decipher wtf this does.
    !function (scope) {
        var layerSelector = function () {
            /**
             * @param {!Object} p1
             * @param {string} p2
             * @param {number} p
             * @return {undefined}
             */
            function init(p1, p2, p) {
                var that = this;
                if (void 0 === p) {
                    /** @type {boolean} */
                    p = true;
                }
                this.onchange = void 0;
                /** @type {!Object} */
                this._layerManager = p1;
                /** @type {number} */
                this._active = p;
                /** @type {string} */
                this._operation = p2;
                /** @type {!Element} */
                this._container = document.createElement("span");
                /** @type {string} */
                this._container.className = "phtivsaildraw-layer";
                /** @type {!Node} */
                var script = this._container.appendChild(document.createElement("label"));
                script.appendChild(document.createTextNode("Layer: "));
                /** @type {!Node} */
                this._preview = this._container.appendChild(document.createElement("span"));
                /** @type {string} */
                this._preview.className = "preview";
                /** @type {!Node} */
                this._select = this._container.appendChild(document.createElement("select"));
                /** @type {string} */
                this._select.id = "phtivsaildraw-layer-selector-" + init._count++;
                /** @type {string} */
                script.htmlFor = this._select.id;
                p1.getAllLayerConfigs().forEach(function (args) {
                    var t = that._select.appendChild(document.createElement("option"));
                    t.text = that.getLayerDisplayName(args);
                    t.value = args.name;
                    var hueSquare = t.insertBefore(document.createElement("span"), t.firstChild);
                    hueSquare.style.backgroundColor = args.color;
                });
                this._select.addEventListener("change", function (ids) {
                    return that._onChange(ids);
                }, false);
                /** @type {!Element} */
                this._output = document.createElement("span");
                /** @type {string} */
                this._output.className = "output";
                /** @type {!BroadcastChannel} */
                this._broadcast = new BroadcastChannel("phtivsaildraw-active-layer");
                this._broadcast.addEventListener("message", function (messageData) {
                    if (that._active) {
                        that.setActiveLayer();
                    }
                }, false);
                this.setActiveLayer();
            }
            return Object.defineProperty(init.prototype, "disabled", {
                get: function () {
                    return this._output.parentNode == this._container;
                },
                set: function (d) {
                    if (d != this.disabled) {
                        if (d) {
                            this._container.replaceChild(this._output, this._select);
                        } else {
                            this._container.replaceChild(this._select, this._output);
                        }
                    }
                },
                enumerable: true,
                configurable: true
            }), Object.defineProperty(init.prototype, "layerName", {
                get: function () {
                    return $(this._select).val();
                },
                set: function (a) {
                    if (this._active) {
                        throw "Setting the layer is not supported for active layer selectors";
                    }
                    $(this._select).val(a);
                    this.update();
                },
                enumerable: true,
                configurable: true
            }), Object.defineProperty(init.prototype, "value", {
                get: function () {
                    return this._layerManager.getLayerConfig(this.layerName);
                },
                set: function (options) {
                    this.layerName = options.name;
                },
                enumerable: true,
                configurable: true
            }), Object.defineProperty(init.prototype, "active", {
                get: function () {
                    return this._active;
                },
                set: function (value) {
                    /** @type {number} */
                    this._active = value;
                    if (value) {
                        this.setActiveLayer();
                    }
                },
                enumerable: true,
                configurable: true
            }), Object.defineProperty(init.prototype, "container", {
                get: function () {
                    return this._container;
                },
                enumerable: true,
                configurable: true
            }), Object.defineProperty(init.prototype, "label", {
                get: function () {
                    return !this._container.classList.contains("nolabel");
                },
                set: function (mymuted) {
                    if (mymuted) {
                        this._container.classList.remove("nolabel");
                    } else {
                        this._container.classList.add("nolabel");
                    }
                },
                enumerable: true,
                configurable: true
            }), init.prototype.getLayerDisplayName = function (displayNameData) {
                return this._operation ? this._layerManager.getLayerDisplayName(this._operation, displayNameData) : displayNameData.displayName;
            }, init.prototype.setActiveLayer = function () {
                $(this._select).val(this._layerManager.activeLayer);
                this.update();
            }, init.prototype._onChange = function (onChangeData) {
                this.update();
                if (this._active) {
                    this._layerManager.activeLayer = this.layerName;
                }
                if (this.onchange) {
                    this.onchange(this.value);
                }
            }, init.prototype.update = function () {
                var data = this.value;
                this._preview.style.backgroundColor = data.color;
                this._output.textContent = this.getLayerDisplayName(data);
            }, init._count = 0, init;
        }();
        scope.LayerSelector = layerSelector;
    }(PhtivSailDraw || (PhtivSailDraw = {}));

    //PLUGIN START
    window.plugin.phtivsaildraw = function () {};
    window.plugin.phtivsaildraw.loadExternals = function () {
        try {
            console.log('Loading PhtivSailDraw now');
        } catch (e) {
        }



        window.plugin.phtivsaildraw.addButtons();
        window.plugin.phtivsaildraw.addCSS(PhtivSailDraw.CSS.ui)
        window.plugin.phtivsaildraw.addCSS(PhtivSailDraw.CSS.main)
    };

    window.plugin.phtivsaildraw.addButtons = function () {
        window.plugin.phtivsaildraw.buttons = L.Control.extend({
            options: {
                position: 'topleft'
            },
            onAdd: function (map) {
                var container = L.DomUtil.create('div', 'leaflet-arcs leaflet-bar');
                $(container).append('<a id="phtivsaildraw_viewopsbutton" href="javascript: void(0);" class="phtivsaildraw-control" title="Manage Operations"><img src=' + PhtivSailDraw.Images.toolbar_viewOps + ' style="vertical-align:middle;align:center;" /></a>').on('click', '#phtivsaildraw_viewopsbutton', function () {
                    alert("Eventually a list of operations will go here!");
                    });
                $(container).append('<a id="phtivsaildraw_addlinksbutton" href="javascript: void(0);" class="phtivsaildraw-control" title="Add Links"><img src=' + PhtivSailDraw.Images.toolbar_addlinks + ' style="vertical-align:middle;align:center;" /></a>').on('click', '#phtivsaildraw_addlinksbutton', function () {
                    PhtivSailDraw.LinkDialog.show();
                });
                return container;
            }
        });
        map.addControl(new window.plugin.phtivsaildraw.buttons());
    };

    window.plugin.phtivsaildraw.addCSS = function(content) {
        $("head").append('<link rel="stylesheet" type="text/css" href="' + content + '" />');
    }

    //PLUGIN END
    var setup = window.plugin.phtivsaildraw.loadExternals;


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
