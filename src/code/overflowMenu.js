export default class OverflowMenu {
  constructor() {
    this._button = L.DomUtil.create("a", "wasabee-overflow-button");
    this._button.href = "#";
    L.DomEvent.on(this._button, "click", event => {
      event.preventDefault();
      this._show(event);
    });

    L.DomEvent.on(this._button, "touchstart", event => {
      event.preventDefault();
      this._show(event);
    });

    L.DomEvent.on(this._button, "touchend", event => {
      event.preventDefault();
      this._hide();
    });

    this._buttonText = L.DomUtil.create("span", null, this._button);
    this._buttonText.textContent = "\u22ee";
    this._button.role = "button";

    this._menu = L.DomUtil.create("span", "wasabee-overflow-menu");
    this._menu.role = "list";

    // put the menu items here
    this.items = []; // { Label: "x", "onclick" () => { y; }}

    this._opened = false;
  }

  get button() {
    return this._button;
  }

  _show(event) {
    if (this._opened) {
      this._hide();
      return;
    }

    const menu = L.DomUtil.create(
      "ul",
      "wasabee-overflow-menuFIXME",
      this._menu
    );
    menu.role = "list";
    for (const l of this.items) {
      const menuitem = L.DomUtil.create(
        "li",
        "wasabee-overflow-menuitem",
        menu
      );
      menuitem.innerHTML = `<a href="#" role="button">${l.label}</a>`;
      L.DomEvent.on(menuitem, "click", event => {
        event.preventDefault();
        l.onclick(event);
        this._hide();
      });
      L.DomEvent.on(menu, "mouseleave", () => {
        event.preventDefault();
        this._hide();
      });
      L.DomEvent.on(menu, "touchend", () => {
        event.preventDefault();
        l.onclick(event);
        this._hide();
      });
      L.DomEvent.on(menu, "touchleave", () => {
        event.preventDefault();
        this._hide();
      });
    }

    event.preventDefault();
    event.stopPropagation();
    $(this._menu).position({
      my: "bottom right",
      at: "bottom right",
      of: this._button,
      collision: "flipfit"
    });

    document.body.appendChild(this._menu);
    this._menu.focus();
    this._opened = true;
  }

  _hide() {
    this._opened = false;
    if (this._menu) {
      for (const c of this._menu.children) {
        this._menu.removeChild(c);
      }
    }
  }
}
