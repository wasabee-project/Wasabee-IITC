export default class Sortable {
  constructor() {
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

  get sortBy() {
    return this._sortBy;
  }

  set sortBy(property) {
    this._sortBy = property;
    this.sort();
  }

  get sortAsc() {
    return this._sortBy;
  }

  set sortAsc(property) {
    this._sortAsc = property;
    this.sort();
  }

  get table() {
    return this._table;
  }

  get items() {
    return this._items.map(function(focusTable) {
      return focusTable.obj;
    });
  }

  set items(a) {
    var visitor = this;
    this._items = a.map(function(e) {
      var row = document.createElement("tr");
      var data = {
        obj: e,
        row: row,
        index: 0,
        values: [],
        sortValues: []
      };
      visitor._fields.forEach(function(b) {
        var a = b.value(e);
        data.values.push(a);
        data.sortValues.push(b.sortValue ? b.sortValue(a, e) : a);
        var f = row.insertCell(-1);
        if (b.format) {
          b.format(f, a, e);
        } else {
          f.textContent = a;
        }
      });
      return data;
    });
    this.sort();
  }

  get fields() {
    return this._fields;
  }

  set fields(value) {
    this._fields = value;
    this.renderHead();
  }

  renderHead() {
    var self = this;
    this.empty(this._head);
    var titleRow = this._head.insertRow(-1);
    this._fields.forEach(function(column, currentState) {
      var editor = titleRow.appendChild(document.createElement("th"));
      editor.textContent = column.name;
      if (column.title) {
        editor.title = column.title;
      }
      if (column.sort !== null) {
        editor.classList.add("sortable");
        editor.tabIndex = 0;
        editor.addEventListener(
          "keypress",
          function(event) {
            if (event.keyCode === 13) {
              event.target.dispatchEvent(
                new MouseEvent("click", {
                  bubbles: true,
                  cancelable: true
                })
              );
            }
          },
          false
        );
        editor.addEventListener(
          "click",
          function() {
            if (currentState === self._sortBy) {
              self._sortAsc = !self._sortAsc;
            } else {
              self._sortBy = currentState;
              self._sortAsc = column.defaultAsc;
            }
            self.sort();
          },
          false
        );
      }
    });
  }

  sort() {
    var that = this;
    this.empty(this._body);
    var self = this._fields[this._sortBy];
    this._items.forEach(function(a, b) {
      return (a.index = b);
    });
    this._items.sort(function(a, b) {
      var value = a.sortValues[that._sortBy];
      var i = b.sortValues[that._sortBy];
      var length = 0;
      return (
        (length = self.sort
          ? self.sort(value, i, a.obj, b.obj)
          : i > value
          ? -1
          : value > i
          ? 1
          : 0),
        length === 0 && (length = a.index - b.index),
        that._sortAsc ? length : -length
      );
    });
    this._items.forEach(function(tabs) {
      return that._body.appendChild(tabs.row);
    });
    $(this._head.getElementsByClassName("sorted")).removeClass(
      "sorted asc desc"
    );
    var dayEle = this._head.rows[0].children[this._sortBy];
    dayEle.classList.add("sorted");
    dayEle.classList.add(this._sortAsc ? "asc" : "desc");
  }

  empty(cell) {
    for (; cell.firstChild; ) {
      cell.removeChild(cell.firstChild);
    }
  }
}
