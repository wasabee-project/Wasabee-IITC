interface SortableItem<T> {
    obj: T;
    row: HTMLTableRowElement;
    index: number;
    values: unknown[];
    sortValues: unknown[];
}
export interface SortableField<T> {
    name: string;
    className?: string;
    value: (thing: T) => unknown;
    sortValue?: (value: unknown, thing: T) => unknown;
    sort?: (a: unknown, b: unknown, aobj?: T, bobj?: T) => number;
    format?: (cell: HTMLTableCellElement, value: unknown, thing?: T) => void;
    smallScreenHide?: boolean;
}
export default class Sortable<T> {
    _items: Array<SortableItem<T>>;
    _fields: Array<SortableField<T>>;
    _sortBy: number;
    _sortAsc: boolean;
    _table: HTMLTableElement;
    _head: HTMLTableSectionElement;
    _body: HTMLTableSectionElement;
    _smallScreen: boolean;
    _done: Promise<boolean | void> | boolean;
    constructor();
    get sortBy(): number;
    set sortBy(property: number);
    get sortAsc(): boolean;
    set sortAsc(b: boolean);
    get table(): HTMLTableElement;
    get items(): T[];
    set items(incoming: T[]);
    get fields(): SortableField<T>[];
    set fields(value: SortableField<T>[]);
    get done(): boolean | Promise<boolean | void>;
    renderHead(): void;
    sort(): void;
}
export {};
