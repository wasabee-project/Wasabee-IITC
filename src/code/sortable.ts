interface SortableItem<T> {
  obj: T;
  row: HTMLTableRowElement;
  index: number;
  values: unknown[];
  sortValues: unknown[];
  filtered: boolean;
}

export interface SortableField<T> {
  name: string;
  className?: string;
  value: (thing: T) => unknown;
  sortValue?: (value: unknown, thing: T) => unknown;
  sort?: (a: unknown, b: unknown, aobj?: T, bobj?: T) => number;
  format?: (cell: HTMLTableCellElement, value: unknown, thing?: T) => void;
  smallScreenHide?: boolean;
  foot?: (cell: HTMLTableCellElement) => void,
  filter?: (thing: T, value: unknown, filterValue: string) => boolean;
  filterValue?: string;
}

export default class Sortable<T> {
  _items: Array<SortableItem<T>>;
  _fields: Array<SortableField<T>>;
  _sortBy: number;
  _sortAsc: boolean;
  _table: HTMLTableElement;
  _head: HTMLTableSectionElement;
  _body: HTMLTableSectionElement;
  _foot: HTMLTableSectionElement;
  _smallScreen: boolean;
  _done: Promise<boolean | void> | boolean;
  _sortByStoreKey: string;
  _sortAscStoreKey: string;

  _filterEnable: boolean;

  constructor() {
    this._items = [];
    this._fields = [];
    this._sortBy = 0; // which field/column number to sort by
    this._sortAsc = true; // ascending or descending
    this._table = L.DomUtil.create("table", "wasabee-table");

    // create this once for all
    this._head = L.DomUtil.create("thead", null, this._table);
    this._body = L.DomUtil.create("tbody", null, this._table);
    this._foot = L.DomUtil.create("tfoot", null, this._table);

    // if IITC-Mobile is detected... this is a kludge
    this._smallScreen = window.plugin.userLocation ? true : false;

    this._sortByStoreKey = "";
    this._sortAscStoreKey = "";
    
    this._filterEnable = false;

    this._done = true;
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
    this.renderHead();
    this.sort();
  }

  get sortAsc() {
    return this._sortAsc;
  }

  set sortAsc(b) {
    if (b !== true) b = false;
    this._sortAsc = b;
    this.renderHead();
    this.sort();
  }

  set sortByStoreKey(b) {
    this._sortByStoreKey = b;
    if (localStorage[this._sortByStoreKey] == null) {
      localStorage[this._sortByStoreKey] = 0;
    }
    this.sortBy = localStorage[this._sortByStoreKey];
  }

  set sortAscStoreKey(b) {
    this._sortAscStoreKey = b;
    if (localStorage[this._sortAscStoreKey] == null) {
      localStorage[this._sortAscStoreKey] = "true";
    }
    this.sortAsc = localStorage[this._sortAscStoreKey] == "true";
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

    // class getters and setter's can't be async,
    // this lets us build each row as a promise, then resolve them all together
    const instantValues = [];
    const promises = incoming.map(async (obj) => {
      const row = L.DomUtil.create("tr");
      const data = {
        obj: obj, // the raw value passed in
        row: row, // the complete DOM for the row -- drawn by sort()
        index: index, // the position in the list, set & used by sort()
        values: [], // the computed values for this row
        sortValues: [], // the computed sort values for this row
        filtered: true, // match current filter
      };
      index++;
      for (const field of this._fields) {
        // calculate the value using the field's rules
        let value = field.value(obj);
        if (value != null && value instanceof Promise) value = await value; // resolve promises
        data.values.push(value);

        // calculate sortValue using the field's rules if required
        let sortValue = value;
        if (field.sortValue) {
          sortValue = field.sortValue(value, obj);
          if (sortValue != null && sortValue instanceof Promise)
            sortValue = await sortValue; // resolve promises
        }
        data.sortValues.push(sortValue);

        const cell = row.insertCell(-1);
        if (field.className) cell.classList.add(field.className);

        if (field.format) {
          field.format(cell, value, obj);
        } else {
          cell.textContent = value as string;
        }
        if (field.smallScreenHide && this._smallScreen) {
          cell.style.display = "none";
        }
      }
      instantValues.push(data);
      return data;
    });

    // resolve all rows at once
    // XXX convert to allSettled and check for individual errors rather than failing hard if any row fails
    // console.log(promises);
    if (instantValues.length === promises.length) {
      // all promises are already fulfilled, dont use async Promise.all
      this._items = instantValues;
      this.sort();
      this._done = true;
    } else {
      // always async
      this._done = Promise.all(promises).then(
        (values) => {
          this._items = values;
          this.sort();
          this.applyFilters();
          return true;
        },
        (reject) => {
          console.log("rejected", reject);
          this._done = false;
        }
      );
    }
  }

  get fields() {
    return this._fields;
  }

  set fields(value) {
    this._fields = value;
    this.renderHead();
    this.renderFoot();
    this.applyFilters();
  }

  get done() {
    return this._done;
  }

  set filter(value: boolean) {
    this._filterEnable = value;
    this.renderHead();
    this.applyFilters();
  }

  get filter() {
    return this._filterEnable;
  }

  renderHead() {
    // clear header
    this._head.textContent = "";
    const titleRow = this._head.insertRow(-1);
    for (const [index, field] of this._fields.entries()) {
      const cell = L.DomUtil.create("th", field.className, titleRow);
      cell.textContent = field.name;
      if (field.smallScreenHide && this._smallScreen)
        cell.style.display = "none";
      if (field.sort !== null) {
        L.DomUtil.addClass(cell, "sortable");
        if (index == this._sortBy) {
          L.DomUtil.addClass(cell, this._sortAsc ? "asc" : "desc");
        }
        L.DomEvent.on(
          cell,
          "click",
          (ev) => {
            L.DomEvent.stop(ev);
            for (const element of titleRow.children) {
              L.DomUtil.removeClass(element as HTMLElement, "asc");
              L.DomUtil.removeClass(element as HTMLElement, "desc");
            }
            if (index == this._sortBy) {
              this._sortAsc = !this._sortAsc;
            }
            L.DomUtil.addClass(cell, this._sortAsc ? "asc" : "desc");

            this._sortBy = index;
            if (this._sortByStoreKey != null)
              localStorage[this._sortByStoreKey] = this._sortBy;
            if (this._sortAscStoreKey != null)
              localStorage[this._sortAscStoreKey] = this._sortAsc.toString();
            this.sort();
          },
          false
        );
      }
      if (field.filter) {
        if (!this._filterEnable) delete field.filterValue;
        else {
          cell.textContent = "";
          const input = L.DomUtil.create("input", "filter", cell);
          input.placeholder = field.name;
          if (field.filterValue) input.value = field.filterValue;
          L.DomEvent.on(input, "change", () => {
            field.filterValue = input.value;
            this.applyFilters();
          });
        }
      }
    }
  }

  renderFoot() {
    this._foot.textContent = "";
    if (this._fields.every((f) => !f.foot)) return;
    const footerRow = this._foot.insertRow(-1);
    for (const field of this._fields) {
      const cell = L.DomUtil.create("td", field.className, footerRow);
      if (field.foot) field.foot(cell);
    }
  }

  sort() {
    const sortfield = this._fields[this._sortBy];

    this._items.sort((a, b) => {
      const aval = a.sortValues[this._sortBy];
      const bval = b.sortValues[this._sortBy];

      // figure out why these are undefined
      if (aval === undefined && bval == undefined) return 0;
      if (aval == undefined) return -1;
      if (bval == undefined) return 1;

      let l = 0;
      // if the field defined a sort function, use that
      if (typeof sortfield.sort === "function") {
        l = sortfield.sort(aval, bval, a.obj, b.obj);
      } else {
        // otherwise use simple sort
        if (aval > bval) l = 1;
        if (bval > aval) l = -1;
      }
      // if two values are the same, preserve previous order
      if (l == 0) l = a.index - b.index;
      return this._sortAsc ? l : -l;
    });

    for (const [index, item] of this._items.entries()) {
      item.index = index;
      this._body.appendChild(item.row);
    }
  }

  applyFilters() {
    for (const item of this._items) {
      if (!this._filterEnable) item.row.style.display = null;
      else {
        item.filtered = true;
        for (let i = 0; i < this._fields.length; ++i) {
          const field = this._fields[i];
          if (
            field.filter &&
            field.filterValue &&
            !field.filter(item.obj, item.values[i], field.filterValue)
          ) {
            item.filtered = false;
            break;
          }
        }
        if (item.filtered) item.row.style.display = null;
        else item.row.style.display = "none";
      }
    }
  }

  getFiltered() {
    return this._items
      .filter((it) => !this._filterEnable || it.filtered)
      .map((it) => it.obj);
  }

  importFilterFrom(sortable: Sortable<T>) {
    if (!sortable._filterEnable) return;
    for (const field of sortable.fields) {
      if (field.filter) {
        const f = this.fields.find((f) => f.name === field.name);
        if (f) {
          f.filterValue = field.filterValue;
        }
      }
    }
    this.filter = true;
  }
}
