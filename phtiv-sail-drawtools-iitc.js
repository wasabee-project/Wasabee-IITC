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
            console.log('Loading arc.js now');
        } catch (e) {
        }

        window.plugin.phtivsaildraw.addLeftButtons();

    };


    window.plugin.phtivsaildraw.addLeftButtons = function(){
        window.plugin.phtivsaildraw.psDrawButtons = L.Control.extend({
                options:{
                        position: 'topleft'
                },
                onAdd: function (map) {
                        var container = L.DomUtil.create('div', 'leaflet-phtivsaildraw leaflet-bar');
                        $(container).append('<a id="phtivsaildraw_addlinksbutton" href="javascript: void(0);" class="phtivsaildraw-control" title="Add Links">A</a>').on('click', '#phtivsaildraw_addlinksbutton' , function() {
                                window.plugin.phtivsaildraw.tappedAddLinks();
                            });
                        return container;
                }
        });
        map.addControl(new window.plugin.phtivsaildraw.psDrawButtons());
    };

    window.plugin.phtivsaildraw.tappedAddLinks = function() {
        alert('Tapped Add Links');
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