export default class OverflowMenu {
  constructor() {
    this._button = L.DomUtil.create("a", "wasabee-overflow-button");
    this._button.href = "#";
    L.DomEvent.on(this._button, "click", event => {
      this._show(event);
    });

    this._buttonText = L.DomUtil.create("span", "", this._button);
    this._buttonText.textContent = "\u22ee";

    this._menu = L.DomUtil.create("span", "wasabee-overflow-button");
    this._button.role = "buton";

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

    const menu = L.DomUtil.create("ul", "wasabee-overflow-menu", this._menu); // wasabee-overflow-menu
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

    this._button.parentNode.parentNode.appendChild(this._menu);
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
    if (this._menu && this._menu.parentNode) {
      this._menu.parentNode.removeChild(this._menu);
    }
  }
}
