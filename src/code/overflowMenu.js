
var Wasabee = window.plugin.Wasabee;
export default function (scope) {
    Wasabee.OverflowMenu = function () {
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
}