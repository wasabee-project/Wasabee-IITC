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
                    /*if (page._operation == selector) {
                        return page.focus(), page;
                    }*/
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
