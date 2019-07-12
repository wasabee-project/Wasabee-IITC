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
