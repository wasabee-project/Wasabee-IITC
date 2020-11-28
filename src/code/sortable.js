export default class Sortable {
  constructor() {
    this._items = [];
    this._fields = [];
    this._sortBy = 0; // which field/column number to sort by
    this._sortAsc = false; // ascending or descending
    this._table = L.DomUtil.create("table", "wasabee-table");

    // create this once for all
    this._head = L.DomUtil.create("thead", null, this._table);
    this._body = L.DomUtil.create("tbody", null, this._table);

    // if IITC-Mobile is detected... this is a kludge
    this._smallScreen = window.plugin.userLocation ? true : false;
  }

  /* How to use this:
   *
   * const s = new Sortable();
   * s.fields = [ {...}, {...} ];
   * s.items = [ {...}, {...} ];
   * domobj.appendChild(s.table);
   *
   * field { } format:
   * value(obj) - use the incoming object to calculate the value (displayed if no formatting is required)
   * sort(a, b, aobj, bobj) - compare two objects for sorting ; the column is not sortable if sort() is not defined; does anything take advantage of aobj/bobj sorting?
   * sortValue(value, obj) - determine the value to sort by, which may differ from the primary value - obj is optional and can be null if not needed ; value is used if sortValue() is not defined -- almost completely unused
   * format(cell, value, obj) - cell is the DOM table td into which the value is written, obj is optional and can be null if not needed; value is used if format() is not defined
   * smallScreenHide -- boolean, if true the cell is hidden on smaller screens
   */

  get sortBy() {
    return this._sortBy;
  }

  set sortBy(property) {
    this._sortBy = Number(property);
    this.sort();
  }

  get sortAsc() {
    return this._sortAsc;
  }

  set sortAsc(b) {
    if (b !== true) b = false;
    this._sortAsc = b;
    this.sort();
  }

  get table() {
    return this._table;
  }

  get items() {
    return this._items.map((a) => {
      return a.obj;
    });
  }

  set items(incoming) {
    // clear body
    this._body.textContent = "";
    let index = 0;
    this._items = incoming.map((obj) => {
      const row = L.DomUtil.create("tr");
      const data = {
        obj: obj, // the raw value passed in
        row: row, // the complete DOM for the row -- drawn by sort()
        index: index, // the position in the list, set & used by sort()
        values: [], // the computed values for this row
        sortValues: [], // the computed sort values for this row
      };
      index++;
      for (const field of this._fields) {
        // calculate the value using the field's rules
        const value = field.value(obj);
        // data.values.push(value);

        if (value != null && typeof obj.then === "function") {
          console.log("testing resolving promises", obj);
          obj.then(
            (resolve) => {
              data.value.push(resolve);
            },
            (reject) => {
              console.log(reject);
              data.value.push("rejected");
            }
          );
        } else {
          // not a promise, just use it directly
          data.values.push(value);
        }

        // calculate sortValue using the field's rules if required
        let sortValue = value;
        if (field.sortValue) sortValue = field.sortValue(value, obj);
        data.sortValues.push(sortValue);

        const cell = row.insertCell(-1);
        if (field.format) {
          field.format(cell, value, obj);
        } else {
          cell.textContent = value;
        }
        if (field.smallScreenHide && this._smallScreen) {
          cell.style.display = "none";
        }
      }
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
    // clear header
    this._head.textContent = "";
    const titleRow = this._head.insertRow(-1);
    for (const [index, field] of this._fields.entries()) {
      const cell = L.DomUtil.create("th", null, titleRow);
      cell.textContent = field.name;
      if (field.smallScreenHide && this._smallScreen)
        cell.style.display = "none";
      if (field.sort !== null) {
        L.DomUtil.addClass(cell, "sortable");
        L.DomEvent.on(
          cell,
          "click",
          (ev) => {
            L.DomEvent.stop(ev);
            for (const element of titleRow.children) {
              L.DomUtil.removeClass(element, "sorted");
              L.DomUtil.removeClass(element, "asc");
              L.DomUtil.removeClass(element, "desc");
            }
            if (index == this._sortBy) {
              this._sortAsc = !this._sortAsc;
              L.DomUtil.addClass(cell, "sorted");
              L.DomUtil.addClass(cell, this._sortAsc ? "asc" : "desc");
            }
            this._sortBy = index;
            this.sort();
          },
          false
        );
      }
    }
  }

  sort() {
    const sortfield = this._fields[this._sortBy];

    this._items.sort((a, b) => {
      const aval = a.sortValues[this._sortBy];
      const bval = b.sortValues[this._sortBy];

      let l = 0;
      // if the field defined a sort function, use that
      if (sortfield.sort) {
        l = sortfield.sort(aval, bval, a.obj, b.obj);
      } else {
        // otherwise use simple sort
        if (aval > bval) l = 1;
        if (bval > aval) l = -1;
      }
      // if two values are the same, preserve previous order
      if (l == 0) l = a.index - b.index;
      return this._sortAsc ? -l : l;
    });

    for (const [index, item] of this._items.entries()) {
      item.index = index;
      this._body.appendChild(item.row);
    }
  }
}
