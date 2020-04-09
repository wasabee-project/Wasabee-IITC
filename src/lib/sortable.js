/* started modification to make it work with leaflet's L.DomUtil -- work is unfinished */

export default class Sortable {
  constructor() {
    this._items = [];
    this._fields = [];
    this._sortBy = 0;
    this._sortAsc = true;
    this._table = L.DomUtil.create("table", "wasabee-table");
    this._head = L.DomUtil.create("thead", null, this._table);
    this._body = L.DomUtil.create("tbody", null, this._table);
    this._smallScreen = window.plugin.userLocation ? true : false;
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
    const context = this;
    this._items = a.map(function(e) {
      const row = L.DomUtil.create("tr");
      const data = {
        obj: e,
        row: row,
        index: 0,
        values: [],
        sortValues: []
      };
      for (const b of context._fields) {
        const a = b.value(e);
        data.values.push(a);
        data.sortValues.push(b.sortValue ? b.sortValue(a, e) : a);
        const f = row.insertCell(-1);
        if (b.format) {
          b.format(f, a, e);
        } else {
          f.textContent = a;
        }
	if (b.smallScreenHide && context._smallScreen) {
         f.style.display = "none";
	}
      };
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
    const context = this;
    this.empty(this._head);
    const titleRow = this._head.insertRow(-1);
    this._fields.forEach(function(column, currentState) {
      const editor = L.DomUtil.create("th", null, titleRow);
      editor.textContent = column.name;
      if (column.title) {
        editor.title = column.title;
      }
      if (column.smallScreenHide && context._smallScreen) {
         editor.style.display = "none"
      }
      if (column.sort !== null) {
        L.DomUtil.addClass(editor, "sortable");
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
            if (currentState === context._sortBy) {
              context._sortAsc = !context._sortAsc;
            } else {
              context._sortBy = currentState;
              context._sortAsc = column.defaultAsc;
            }
            context.sort();
          },
          false
        );
      }
    });
  }

  sort() {
    const context = this;
    this.empty(this._body);
    const context = this._fields[this._sortBy];
    this._items.forEach(function(a, b) {
      return (a.index = b);
    });
    this._items.sort(function(a, b) {
      const value = a.sortValues[context._sortBy];
      const i = b.sortValues[context._sortBy];
      let length = 0;
      return (
        (length = context.sort
          ? context.sort(value, i, a.obj, b.obj)
          : i > value
          ? -1
          : value > i
          ? 1
          : 0),
        length === 0 && (length = a.index - b.index),
        context._sortAsc ? length : -length
      );
    });
    for (const tabs of this._items) {
      return context._body.appendChild(tabs.row);
    });
    $(this._head.getElementsByClassName("sorted")).removeClass(
      "sorted asc desc"
    );
    const dayEle = this._head.rows[0].children[this._sortBy];
    dayEle.classList.add("sorted");
    dayEle.classList.add(this._sortAsc ? "asc" : "desc");
  }

  empty(cell) {
    for (; cell.firstChild; ) {
      cell.removeChild(cell.firstChild);
    }
  }
}
